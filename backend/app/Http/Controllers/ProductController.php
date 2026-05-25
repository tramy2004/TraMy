<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\UserBehavior;
use App\Services\GeminiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // GET /products
    public function index(Request $request)
    {
        // 🔥 Đã thêm 'category' vào đây để React lấy được tên danh mục
        $query = Product::with(['variants', 'images', 'category']);

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });

            // Lưu vết hành vi tìm kiếm (search) của User phục vụ AI gợi ý
            if ($request->user()) {
                UserBehavior::create([
                    'user_id'      => $request->user()->id,
                    'product_id'   => null,
                    'type'         => 'search',
                    'search_query' => $searchTerm
                ]);
            }
        }

        return $query->latest()->get(); 
    }

    // GET /products/{id}
    public function show(Request $request, $id)
    {
        // 🔥 Đã thêm 'category' vào đây
        $product = Product::with(['variants', 'images', 'category'])->findOrFail($id);

        // tracking AI khi xem chi tiết sản phẩm (view)
        if ($request->user()) {
            UserBehavior::create([
                'user_id'    => $request->user()->id,
                'product_id' => $id,
                'type'       => 'view'
            ]);
        }

        return $product;
    }

    // POST /products
    public function store(Request $request, GeminiService $gemini)
    {
        // Validate thông tin cơ bản
        $data = $request->validate([
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'price'       => 'required|numeric',
            'category_id' => 'required|exists:categories,id', // 🔥 Ép buộc phải chọn danh mục hợp lệ
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:9000', 
            'variants'    => 'required', 
            'images'      => 'nullable|array', 
            'images.*'    => 'image|mimes:jpeg,png,jpg,gif|max:9000',
            'image_colors'=> 'nullable' 
        ]);

        // Xử lý tạo text embedding cho AI gợi ý
        $text = $data['name'] . ' ' . ($data['description'] ?? '');
        $embedding = $gemini->embedding($text);
        $data['embedding'] = $embedding;

        return DB::transaction(function () use ($request, $data) {
            // Handle Ảnh Đại Diện Chính
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            // Lưu sản phẩm chính
            $product = Product::create($data);

            // Lưu danh sách Biến thể (Size / Màu)
            $variants = is_string($request->variants) ? json_decode($request->variants, true) : $request->variants;
            if (is_array($variants)) {
                foreach ($variants as $variant) {
                    $product->variants()->create([
                        'color' => $variant['color'] ?? '',
                        'size'  => $variant['size'] ?? '',
                        'sku'   => $variant['sku'] ?? null,
                        'stock' => $variant['stock'] ?? 0,
                        'price' => $variant['price'] ?? null, 
                    ]);
                }
            }

            // Lưu danh sách Nhiều Ảnh Chi Tiết
            if ($request->hasFile('images')) {
                $imageColors = is_string($request->image_colors) ? json_decode($request->image_colors, true) : $request->image_colors;
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('products/details', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'color'      => $imageColors[$index] ?? null 
                    ]);
                }
            }

            // 🔥 Trả về sản phẩm vừa tạo kèm luôn danh mục
            return $product->load(['variants', 'images', 'category']);
        });
    }

    // NÂNG CẤP TOÀN DIỆN: PUT /products/{id} (Xử lý sửa mượt mà ảnh chính + album ảnh)
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // 1. Mở rộng bộ validate nghiêm ngặt cho file ảnh gửi lên khi sửa
        $data = $request->validate([
            'name'         => 'sometimes|required|string',
            'price'        => 'sometimes|numeric',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:9000', 
            'description'  => 'nullable|string',
            'category_id'  => 'nullable|exists:categories,id', // 🔥 Validate an toàn nếu có đổi danh mục
            'variants'     => 'sometimes', 
            'old_images'   => 'nullable|string', 
            'images'       => 'nullable|array', 
            'images.*'     => 'image|mimes:jpeg,png,jpg,gif|max:9000',
        ]);

        DB::transaction(function () use ($request, $product, $data) {
            
            // HÀM XỬ LÝ 1: Cập nhật Ảnh Đại Diện Chính nếu Admin chọn file mới
            if ($request->hasFile('image')) {
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $data['image'] = $request->file('image')->store('products', 'public');
            } else {
                unset($data['image']);
            }

            // Cập nhật thông tin gốc sản phẩm
            $product->update($data);

            // HÀM XỬ LÝ 2: Đồng bộ Album ảnh chi tiết (Xóa ảnh bị Admin bỏ - Thêm ảnh mới chọn)
            if ($request->has('old_images')) {
                $oldImages = json_decode($request->old_images, true); 
                if (is_array($oldImages)) {
                    $imagesToDelete = $product->images()->whereNotIn('image_path', $oldImages)->get();
                    foreach ($imagesToDelete as $img) {
                        Storage::disk('public')->delete($img->image_path); 
                        $img->delete(); 
                    }
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = $file->store('products/details', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'color'      => null
                    ]);
                }
            }

            // HÀM XỬ LÝ 3: Cập nhật danh sách Biến thể (Màu / Size)
            if ($request->has('variants')) {
                $variants = is_string($request->variants) ? json_decode($request->variants, true) : $request->variants;
                
                if (is_array($variants)) {
                    $product->variants()->delete();
                    
                    foreach ($variants as $variant) {
                        $product->variants()->create([
                            'color' => $variant['color'],
                            'size'  => $variant['size'],
                            'sku'   => $variant['sku'] ?? null,
                            'stock' => $variant['stock'] ?? 0,
                            'price' => $variant['price'] ?? null,
                        ]);
                    }
                }
            }
        });

        // 🔥 Trả về thông tin đầy đủ kèm danh mục sau khi update
        return response()->json($product->load(['variants', 'images', 'category']));
    }

    // DELETE /products/{id}
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Xóa ảnh vật lý trong folder storage trước khi xóa DB
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            foreach ($product->images as $img) {
                Storage::disk('public')->delete($img->image_path);
            }

            // Xóa cứng sản phẩm
            $product->delete();

            return response()->json([
                'message' => 'Đã xóa sản phẩm và toàn bộ biến thể thành công'
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'Không thể xóa! Sản phẩm này đang tồn tại trong đơn hàng hoặc lịch sử của người dùng.'
            ], 400);
        }
    }
}
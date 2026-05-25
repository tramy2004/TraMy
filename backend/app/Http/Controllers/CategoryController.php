<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Lấy tất cả danh mục. Bạn cũng có thể dùng Category::with('products')->get() 
        // nếu muốn trả về luôn danh sách sản phẩm của từng danh mục.
        $categories = Category::all();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Phương thức này thường chỉ dùng cho Blade view (để hiển thị form).
        // Đối với API, bạn có thể bỏ qua phương thức này.
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name', 
        ]);

        // Tạo danh mục mới nhờ $fillable đã cấu hình trong Model
        $category = Category::create($request->only('name'));

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thành công!',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        // Load thêm danh sách products thuộc về category này (dựa vào hàm products() trong Model)
        $category->load('products');

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        // Tương tự create(), thường chỉ dùng để trả về form HTML (Blade)
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        // Validate dữ liệu, bỏ qua kiểm tra unique cho chính ID của category hiện tại
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        // Cập nhật thông tin
        $category->update($request->only('name'));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công!',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Tùy chọn: Kiểm tra xem category có product nào không trước khi xóa
        // if ($category->products()->count() > 0) {
        //     return response()->json(['message' => 'Không thể xóa danh mục đang có sản phẩm'], 400);
        // }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa danh mục thành công!'
        ]);
    }
}
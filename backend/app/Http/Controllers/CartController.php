<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\UserBehavior;

class CartController extends Controller
{
    // Lấy giỏ hàng
    public function index(Request $request)
    {
        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id
        ]);

        // 🔥 NÂNG CẤP 1: Load kèm cả 'product' và 'variant' (để React lấy được Màu/Size hiển thị ra giao diện)
        return $cart->load(['items.product', 'items.variant']);
    }

    // Thêm vào giỏ
    public function add(Request $request)
    {
        // Validate dữ liệu từ React gửi lên
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'color'      => 'required|string',
            'size'       => 'required|string',
        ]);

        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id
        ]);

        // 🔥 NÂNG CẤP 2: Tìm chính xác ID biến thể dựa vào product_id, color, và size khách chọn
        $variant = ProductVariant::where('product_id', $request->product_id)
            ->where('color', $request->color)
            ->where('size', $request->size)
            ->first();

        if (!$variant) {
            return response()->json([
                'message' => 'Phiên bản sản phẩm (Màu/Size) này không tồn tại hoặc đã bị xóa!'
            ], 404);
        }

        // Kiểm tra xem trong giỏ đã có CHÍNH XÁC cặp sản phẩm + biến thể này chưa
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $variant->id) // Tìm theo ID biến thể
            ->first();

        if ($item) {
            // Có rồi thì tăng số lượng lên 1
            $item->increment('quantity');
        } else {
            // Chưa có thì tạo mới item kèm theo product_variant_id
            CartItem::create([
                'cart_id'            => $cart->id,
                'product_id'         => $request->product_id,
                'product_variant_id' => $variant->id, // Đã có ID biến thể, hết lo lỗi General error 1364!
                'quantity'           => 1
            ]);
        }

        // lưu hành vi AI
        UserBehavior::create([
            'user_id'    => $request->user()->id,
            'product_id' => $request->product_id,
            'type'       => 'add_to_cart'
        ]);

        return response()->json([
            'message' => 'Added to cart'
        ]);
    }

    // CẬP NHẬT SỐ LƯỢNG KHI BẤM NÚT (+), (-) Ở GIỎ HÀNG
    public function updateQuantity(Request $request, $id)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);
        
        // Chống hack: Đảm bảo item này nằm trong giỏ hàng của user đang đăng nhập
        $cartItem = CartItem::where('id', $id)
            ->whereHas('cart', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })->firstOrFail();

        // Cập nhật lại số lượng
        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'Đã cập nhật số lượng!']);
    }

    // Xoá item
    public function remove($id)
    {
        CartItem::destroy($id);

        return response()->json([
            'message' => 'Removed'
        ]);
    }
}
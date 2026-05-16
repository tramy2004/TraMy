<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem; 
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        // Check địa chỉ 3 tầng mới
        if (empty($user->phone) || empty($user->address_detail) || empty($user->ward) || empty($user->province)) {
            return response()->json([
                'message' => 'Vui lòng cập nhật đầy đủ Số điện thoại và Địa chỉ giao hàng trong Profile trước khi đặt hàng!'
            ], 400);
        }

        $request->validate([
            'payment_method' => 'required|in:cod,online',
            'item_ids'       => 'required|array|min:1' 
        ]);

        $selectedItems = CartItem::with(['product', 'variant'])
            ->whereIn('id', $request->item_ids)
            ->whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id); 
            })->get();

        if ($selectedItems->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm nào để thanh toán!'], 400);
        }

        DB::beginTransaction();
        try {
            $total = 0;

            // Check hàng tồn kho của từng biến thể Màu/Size
            foreach ($selectedItems as $item) {
                if (!$item->variant) {
                    return response()->json(['message' => "Sản phẩm {$item->product->name} không có phân loại hợp lệ!"], 400);
                }
                if ($item->variant->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Sản phẩm {$item->product->name} (Màu: {$item->variant->color} - Size: {$item->variant->size}) chỉ còn {$item->variant->stock} sản phẩm, không đủ số lượng!"
                    ], 400);
                }
                $total += $item->product->price * $item->quantity;
            }

            // Tạo hóa đơn đơn hàng
            $order = Order::create([
                'user_id'        => $user->id,
                'total'          => $total,
                'status'         => 'pending',
                'payment_method' => $request->payment_method,
                'phone'          => $user->phone,
                'address_detail' => $user->address_detail,
                'ward'           => $user->ward,
                'province'       => $user->province,
            ]);

            foreach ($selectedItems as $item) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'price'              => $item->product->price,
                    'quantity'           => $item->quantity
                ]);
                
                // Trừ số lượng kho của chính xác biến thể đó
                $item->variant->decrement('stock', $item->quantity);
                $item->delete(); // Xóa khỏi giỏ hàng
            }

            DB::commit();
            return response()->json($order);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xử lý đơn hàng', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $orders = Order::with(['items.product', 'items.variant'])
            ->where('user_id', $request->user()->id)
            ->latest() 
            ->get();
            
        return response()->json($orders);
    }
}
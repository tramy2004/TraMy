<?php

namespace App\Http\Controllers; 

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Setting; 

class AdminController extends Controller
{
    public function getStats()
    {
        try {
            // 1. Doanh thu thực tế: Chỉ tính những đơn đã 'completed'
            $totalRevenue = Order::where('status', 'completed')->sum('total');

            // 2. Doanh thu tháng này
            $monthlyRevenue = Order::where('status', 'completed')
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('total');

            // 3. Đơn hàng mới: Các đơn ở trạng thái 'pending'
            $pendingOrders = Order::where('status', 'pending')->count();

            // 4. Tổng số sản phẩm đang kinh doanh
            $totalProducts = Product::count();

            // 5. Tổng số khách hàng
            $totalCustomers = User::where('role', 'user')->count();

            // 6. Hoạt động gần đây: Lấy 5 đơn hàng mới nhất
            $recentActivities = Order::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'customer' => $order->user ? $order->user->name : 'Khách vãng lai (Đã xóa)',
                        'total' => $order->total,
                        'status' => $order->status,
                        'time' => $order->created_at->diffForHumans(),
                    ];
                });

            // TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ (7 NGÀY GẦN NHẤT)
            $chartLabels = [];
            $chartData = [];

            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                
                $chartLabels[] = $date->format('d/m');
                
                $dayRevenue = Order::where('status', 'completed')
                    ->whereDate('created_at', $date->toDateString())
                    ->sum('total');
                
                $chartData[] = $dayRevenue;
            }

            return response()->json([
                'revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'pending_orders' => $pendingOrders,
                'products' => $totalProducts,
                'customers' => $totalCustomers,
                'recent_activities' => $recentActivities,
                'chart_data' => [
                    'labels' => $chartLabels,
                    'data' => $chartData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi Backend: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Lấy danh sách toàn bộ đơn hàng cho Admin
    public function getOrders()
    {
        // Lấy đơn hàng kèm thông tin user, xếp mới nhất lên đầu
        $orders = Order::with('user')->latest()->get();
        return response()->json($orders);
    }

    // 🔥 NÂNG CẤP CHÍ MẠNG: Cập nhật trạng thái đơn hàng & Lưu vết lý do hủy đơn
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status'        => 'required|in:pending,accepted,shipping,completed,cancelled',
            'cancel_reason' => 'nullable|string|max:1000' 
        ]);

        $order = Order::findOrFail($id);
        $user = $request->user();

        // Bảo mật phân quyền chống Hack
        if ($user->role !== 'admin') {
            if ($order->user_id !== $user->id) {
                return response()->json(['message' => 'Bạn không có thẩm quyền xử lý đơn hàng này!'], 403);
            }
            if ($request->status === 'cancelled' && in_array($order->status, ['shipping', 'completed'])) {
                return response()->json(['message' => 'Đơn hàng đang đi giao hoặc đã hoàn thành, không thể huỷ ngang!'], 400);
            }
            if ($request->status !== 'cancelled') {
                return response()->json(['message' => 'Hành vi thay đổi trạng thái trái phép!'], 403);
            }
        }

        $updateData = ['status' => $request->status];

        // Nếu chuyển trạng thái sang hủy và có lý do, lưu lại vào DB
        if ($request->status === 'cancelled' && $request->has('cancel_reason')) {
            $updateData['cancel_reason'] = $request->cancel_reason;
        } else {
            $updateData['cancel_reason'] = null; // Khôi phục lại trạng thái khác thì xóa trắng lý do cũ
        }

        $order->update($updateData);

        return response()->json(['message' => 'Cập nhật trạng thái thành công!', 'order' => $order]);
    }

    // API lấy cấu hình (Khách và Admin đều gọi được)
    public function getSettings()
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json($settings);
    }

    // API Cập nhật (Chỉ Admin)
    public function updateSettings(Request $request)
    {
        // Up Tên
        if ($request->has('store_name')) {
            Setting::updateOrCreate(['key' => 'store_name'], ['value' => $request->store_name]);
        }

        // Up Logo
        if ($request->hasFile('store_logo')) {
            $path = $request->file('store_logo')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'store_logo'], ['value' => $path]);
        }

        // Up Banner
        if ($request->hasFile('home_banner')) {
            $path = $request->file('home_banner')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'home_banner'], ['value' => $path]);
        }

        return response()->json(['message' => 'Cập nhật nhận diện thương hiệu thành công!']);
    }
}
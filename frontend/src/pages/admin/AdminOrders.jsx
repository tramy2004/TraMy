import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/api/axios";
import { ClipboardList } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/admin/orders");
      setOrders(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosClient.put(`/admin/orders/${id}/status`, {
        status: newStatus,
      });
      toast.success("✅ Đã cập nhật trạng thái đơn hàng!");

      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "accepted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipping":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        ⏳ Đang tải danh sách đơn hàng...
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-0">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
        <ClipboardList className="text-blue-600" size={32} /> Quản lý Đơn hàng
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Mã Đơn</th>
                <th className="p-4 font-semibold">Khách Hàng</th>
                <th className="p-4 font-semibold">Tổng Tiền</th>
                <th className="p-4 font-semibold">Thanh Toán</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold">Ngày Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="p-4 font-medium text-gray-700">
                      {order.user ? order.user.name : "Khách vãng lai"}
                    </td>
                    <td className="p-4 font-black text-red-600">
                      {new Intl.NumberFormat("vi-VN").format(order.total)} đ
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600 uppercase">
                      {order.payment_method === "cod" ? "Tiền mặt" : "Online"}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer border-2 transition ${getStatusClass(order.status)}`}
                      >
                        <option value="pending">⏳ Chờ xử lý</option>
                        <option value="accepted">📦 Đã tiếp nhận</option>
                        <option value="shipping">🚚 Đang giao hàng</option>
                        <option value="completed">✅ Hoàn thành</option>
                        <option value="cancelled">❌ Đã huỷ</option>
                      </select>

                      {/* 🔥 Hiển thị lý do hủy đơn hàng của khách cho Admin đọc */}
                      {order.status === "cancelled" && order.cancel_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100 max-w-[220px]">
                          <p className="text-xs text-red-600 italic font-medium break-words">
                            💬 Lý do: {order.cancel_reason}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axiosClient from "@/api/axios";
import { Package, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner"; // Đã chuẩn bị sẵn Sonner
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // 🔥 NÂNG CẤP: Tách bạch 3 trạng thái (Tải lần đầu, Tải ngầm tự động, Tải thủ công)
  const fetchMyOrders = async (
    isInitialLoad = false,
    isManualRefresh = false,
  ) => {
    if (isInitialLoad) setLoading(true);

    let toastId;
    if (isManualRefresh) {
      setRefreshing(true);
      // Hiện toast chờ nếu user tự bấm nút cập nhật
      toastId = toast.loading("⏳ Đang làm mới trạng thái đơn hàng...");
    }

    try {
      const res = await axiosClient.get("/orders");
      setOrders(res.data);

      if (isManualRefresh) {
        // Báo thành công khi user tự làm mới
        toast.success("✅ Đã cập nhật trạng thái mới nhất!", { id: toastId });
      }
    } catch (error) {
      if (isInitialLoad || isManualRefresh) {
        toast.error("Không thể tải danh sách đơn hàng!", { id: toastId });
      }
    } finally {
      if (isInitialLoad) setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyOrders(true, false); // Tải lần đầu: Bật chữ Loading giữa màn hình

    // Mỗi 10 giây tự động gọi ngầm API 1 lần (Không hiện loading, không hiện toast)
    const interval = setInterval(() => {
      fetchMyOrders(false, false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    // Gọi hàm fetch với cờ isManualRefresh = true để kích hoạt Sonner Toast
    fetchMyOrders(false, true);
  };

  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold">
            <Clock size={16} /> Chờ xử lý
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-green-200">
            <CheckCircle size={16} /> Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold">
            <XCircle size={16} /> Đã hủy
          </span>
        );
      default:
        return status;
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        ⏳ Đang tải lịch sử đơn hàng...
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Package className="text-blue-600" size={32} /> Lịch sử đơn hàng
        </h1>

        {/* Nút Làm mới thủ công */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing} // Khóa nút khi đang làm mới tránh click spam
          className={`flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border px-4 py-2 rounded-xl transition w-fit ${refreshing ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50 active:scale-95"}`}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin text-blue-600" : ""}
          />
          {refreshing ? "Đang làm mới..." : "Làm mới trạng thái"}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center">
          <p className="text-gray-500 text-lg">
            Bạn chưa có đơn hàng nào cả 😢
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 font-semibold hover:underline mt-2"
          >
            &larr; Đi mua sắm ngay!
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
            >
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Đơn hàng{" "}
                  <span className="text-gray-900 font-black">#{order.id}</span>
                </p>
                <p className="text-gray-400 text-xs">
                  Đặt lúc: {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="flex flex-col gap-2 items-start md:items-center">
                {renderStatus(order.status)}
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Thanh toán:{" "}
                  {order.payment_method === "cod" ? "Tiền mặt" : "Online"}
                </span>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0">
                <p className="text-gray-500 text-sm font-medium">
                  Tổng thanh toán
                </p>
                <p className="text-xl font-black text-red-600">
                  {new Intl.NumberFormat("vi-VN").format(order.total)} đ
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

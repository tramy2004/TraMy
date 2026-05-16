import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 🔥 NÂNG CẤP: Import luôn hàm cancelOrder tập trung từ orderApi cho chuyên nghiệp
import { getOrders, cancelOrder } from "@/api/orderApi";
import { toast } from "sonner";
import { AlertCircle, X } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ MODAL HỦY ĐƠN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      toast.error("Không thể tải lịch sử đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 MỞ MODAL VÀ LƯU LẠI ID ĐƠN MUỐN HỦY
  const openCancelModal = (id) => {
    setSelectedOrderId(id);
    setCancelReason(""); // Reset lại ô input trống
    setIsModalOpen(true);
  };

  // 🔥 HÀM XỬ LÝ GỬI FORM HỦY ĐƠN LÊN BACKEND
  const handleConfirmCancel = async (e) => {
    e.preventDefault(); // Chặn reload trang của form mặc định

    if (!cancelReason.trim()) {
      toast.warning("Vui lòng điền lý do cụ thể để hoàn tất hủy đơn nha fen!");
      return;
    }

    setSubmitLoading(true);
    try {
      // 🔥 SỬA TẠI ĐÂY: Sử dụng trực tiếp hàm cancelOrder đã đóng gói sạch sẽ
      await cancelOrder(selectedOrderId, {
        status: "cancelled",
        cancel_reason: cancelReason.trim(),
      });

      toast.success("🗑️ Đã huỷ đơn hàng thành công!");
      setIsModalOpen(false); // Đóng modal

      // Cập nhật lại state cục bộ ngay lập tức để UI đổi màu/badge sang Đã hủy
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: "cancelled" }
            : order,
        ),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể huỷ đơn hàng vào lúc này!",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            🕒 Chờ xử lý
          </span>
        );
      case "accepted":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            📦 Đã tiếp nhận
          </span>
        );
      case "shipping":
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            🚚 Đang giao hàng
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✅ Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            ❌ Đã huỷ
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-xl font-medium text-gray-600">
        ⏳ Đang tải lịch sử đơn hàng...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 relative">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        📦 Lịch sử Đơn hàng
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed">
          <p className="text-gray-500 text-lg mb-4">
            Bạn chưa có đơn hàng nào.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Bắt đầu mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    Mã đơn hàng: #{order.id}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ngày đặt:{" "}
                    {new Date(order.created_at).toLocaleDateString("vi-VN")} lúc{" "}
                    {new Date(order.created_at).toLocaleTimeString("vi-VN")}
                  </p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="space-y-4 mb-4">
                {order.items &&
                  order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border flex-shrink-0">
                        {item.product?.image ? (
                          <img
                            src={`http://tramy.test/storage/${item.product.image}`}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                          onClick={() =>
                            navigate(`/product/${item.product?.id}`)
                          }
                        >
                          {item.product?.name || "Sản phẩm"}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Phân loại: {item.variant.color} -{" "}
                            {item.variant.size}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                          Số lượng:{" "}
                          <span className="font-medium text-gray-800">
                            {item.quantity}
                          </span>
                        </p>
                      </div>
                      <div className="font-medium text-gray-800">
                        {(item.price * item.quantity).toLocaleString()} đ
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-4 border-t flex flex-row justify-between sm:justify-end items-center gap-6">
                <span className="text-xs font-medium text-gray-400 uppercase sm:hidden">
                  Thanh toán:{" "}
                  {order.payment_method === "cod" ? "Tiền mặt" : "Online"}
                </span>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-600 text-sm hidden sm:inline mr-2">
                      Tổng thanh toán:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {Number(order.total).toLocaleString()} đ
                    </span>
                  </div>

                  {(order.status === "pending" ||
                    order.status === "accepted") && (
                    <button
                      type="button"
                      onClick={() => openCancelModal(order.id)}
                      className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition active:scale-95 shadow-sm whitespace-nowrap"
                    >
                      ❌ Huỷ đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* BOX CUSTOM MODAL INPUT FORM TÌM LÝ DO HỦY ĐƠN (ĐÃ FIX ĐƠ) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 relative">
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>

            {/* Tiêu đề Modal */}
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold">
                Lý do hủy đơn hàng #{selectedOrderId}
              </h3>
            </div>

            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Fen vui lòng cho <strong>Tramy Store</strong> biết lý do hủy đơn
              hàng này để hệ thống cải tiến chất lượng phục vụ tốt hơn nhé!
            </p>

            {/* Form Input chính thức */}
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <textarea
                  required
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Mình đặt nhầm phân loại, muốn đổi địa chỉ, hết tiền..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none text-sm focus:border-black focus:ring-1 focus:ring-black transition resize-none placeholder-gray-400 bg-gray-50/50 text-gray-800"
                ></textarea>
              </div>

              {/* Bộ nút lưu hành động */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition active:scale-95"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !cancelReason.trim()}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition active:scale-95 ${
                    submitLoading || !cancelReason.trim()
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-100"
                  }`}
                >
                  {submitLoading ? "⏳ Đang xử lý..." : "Xác nhận hủy đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

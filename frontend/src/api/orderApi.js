import axios from "./axios";

// Hàm đặt đơn hàng mới
export const createOrder = (data) => axios.post("/orders", data);

// Hàm lấy danh sách lịch sử đơn hàng của user đang log
export const getOrders = () => axios.get("/orders");

// 🔥 NÂNG CẤP CHÍ MẠNG: Hàm hủy đơn hàng dùng chung (User gửi kèm cancel_reason)
export const cancelOrder = (id, data) =>
  axios.put(`/admin/orders/${id}/status`, data);

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeCart } from "@/api/cartApi";
import { createOrder } from "@/api/orderApi";
import { getMe } from "@/api/authApi";
import axiosClient from "@/api/axios";
import { toast } from "sonner"; // Thư viện Sonner
import { Wallet, Banknote, MapPin, Phone, Plus, Minus, X } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedIds, setSelectedIds] = useState([]);

  // State quản lý Modal QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [cartRes, userRes] = await Promise.all([getCart(), getMe()]);
      setCartItems(cartRes.data.items || []);
      setUser(userRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải thông tin giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((item) => item.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const updateQuantity = async (id, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item,
      ),
    );

    try {
      await axiosClient.put(`/cart/update/${id}`, { quantity: newQty });
      window.dispatchEvent(new Event("CartUpdated"));
    } catch (error) {
      toast.error("Lỗi cập nhật số lượng!");
      fetchData();
    }
  };

  const handleRemove = async (itemId) => {
    // 🔥 Hiển thị loading khi đang gọi API xóa
    const toastId = toast.loading("🗑️ Đang xoá sản phẩm...");
    
    try {
      await removeCart(itemId);
      // 🔥 Cập nhật toast báo thành công
      toast.success("Đã xoá sản phẩm khỏi giỏ hàng!", { id: toastId });
      
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedIds((prev) => prev.filter((id) => id !== itemId));
      window.dispatchEvent(new Event("CartUpdated"));
    } catch (error) {
      // 🔥 Cập nhật toast báo lỗi
      toast.error("Xoá thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  const handleCheckout = async () => {
    if (isMissingInfo) {
      toast.warning("⚠️ Vui lòng cập nhật đầy đủ Số điện thoại và Địa chỉ!");
      navigate("/profile");
      return;
    }

    if (selectedIds.length === 0) {
      toast.warning("🛒 Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    // 🔥 Hiển thị loading chờ đặt hàng
    const toastId = toast.loading("⏳ Đang xử lý đơn hàng của bạn...");

    try {
      setLoading(true);
      const res = await createOrder({
        payment_method: paymentMethod,
        item_ids: selectedIds,
      });

      if (paymentMethod === "online") {
        setCurrentOrder(res.data);
        setShowQRModal(true);
        toast.success("Tạo đơn hàng thành công! Vui lòng quét mã QR.", { id: toastId });
      } else {
        // Trạng thái COD
        toast.success("🎉 Đặt hàng thành công! Đang chuyển trang...", { id: toastId });
        
        // 🔥 Đợi 1 giây để user kịp đọc thông báo rồi mới nhảy trang
        setTimeout(() => {
          window.dispatchEvent(new Event("CartUpdated"));
          navigate("/my-orders");
        }, 1000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi đặt hàng, vui lòng thử lại!",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const isMissingInfo =
    !user?.phone || !user?.address_detail || !user?.ward || !user?.province;

  const renderFullAddress = () => {
    if (!user) return "";
    const parts = [user.address_detail, user.ward, user.province].filter(
      Boolean,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  };

  if (loading && !showQRModal) {
    return (
      <div className="p-20 text-center text-xl font-medium text-gray-600">
        ⏳ Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ================= CỘT TRÁI: DANH SÁCH GIỎ HÀNG ================= */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🛒 Giỏ hàng của bạn
        </h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500 text-lg mb-4">Giỏ hàng đang trống.</p>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 font-semibold hover:underline"
            >
              &larr; Quay lại trang chủ mua sắm
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 py-4 border-b border-gray-200 bg-gray-50/50 px-4 rounded-t-xl">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600 cursor-pointer"
                checked={
                  selectedIds.length === cartItems.length &&
                  cartItems.length > 0
                }
                onChange={toggleSelectAll}
              />
              <span className="font-semibold text-gray-700">
                Chọn tất cả ({cartItems.length} sản phẩm)
              </span>
            </div>

            <div className="divide-y border-b">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-6 px-2 md:px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600 cursor-pointer flex-shrink-0"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL || "http://tramy.test/storage"}/${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg text-gray-800 cursor-pointer hover:text-blue-600 transition line-clamp-2"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      >
                        {item.product.name}
                      </h3>

                      {item.variant && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            Màu: {item.variant.color}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            Size: {item.variant.size}
                          </span>
                        </div>
                      )}

                      <p className="text-red-600 font-bold mt-1">
                        {Number(item.product.price).toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 ml-9 md:ml-0">
                    <div className="flex items-center bg-white border rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity, -1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition active:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold border-x py-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity, 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition active:bg-gray-200"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm text-gray-400 hover:text-red-600 font-medium whitespace-nowrap"
                    >
                      Xoá bỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= CỘT PHẢI: THANH TOÁN ================= */}
      {cartItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Tổng Đơn Hàng
          </h2>
          {/* Thông tin giao hàng */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Giao tới:</h3>
              <button
                onClick={() => navigate("/profile")}
                className="text-blue-600 text-sm hover:underline"
              >
                Thay đổi
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border">
              <p className="font-bold text-gray-800 mb-2">{user?.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Phone size={14} />
                {user?.phone || (
                  <span className="text-red-500 italic">Chưa cập nhật SĐT</span>
                )}
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={14} className="mt-1 flex-shrink-0" />
                <span className="leading-snug">
                  {renderFullAddress() || (
                    <span className="text-red-500 italic">
                      Chưa cập nhật Địa chỉ
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          {/* Phương thức thanh toán */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Phương thức thanh toán:
            </h3>
            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "cod" ? "border-blue-600 bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <Banknote className="text-green-600" size={20} />
                <span className="text-sm font-medium text-gray-800">
                  Thanh toán khi nhận hàng
                </span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "online" ? "border-blue-600 bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <Wallet className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-gray-800">
                  Thanh toán Online
                </span>
              </label>
            </div>
          </div>

          <div className="border-t pt-4 mb-2 flex justify-between text-sm text-gray-600">
            <span>Đã chọn:</span>{" "}
            <span className="font-bold text-gray-800">
              {selectedIds.length} sản phẩm
            </span>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Tổng tiền:</span>
            <span className="text-3xl font-black text-red-600">
              {totalPrice.toLocaleString()} đ
            </span>
          </div>

          {isMissingInfo && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
              <span>⚠️</span>{" "}
              <p>
                Bạn cần cập nhật đầy đủ <b>Số điện thoại</b> và{" "}
                <b>Địa chỉ giao hàng</b> để đặt hàng.
              </p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={isMissingInfo || selectedIds.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md ${isMissingInfo || selectedIds.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" : "bg-black text-white hover:bg-gray-800 active:scale-95"}`}
          >
            {isMissingInfo
              ? "🔒 Nhập thông tin để Đặt Hàng"
              : selectedIds.length === 0
                ? "🔒 Chọn món để Đặt Hàng"
                : "🚀 Đặt Hàng Ngay"}
          </button>
        </div>
      )}

      {/* ================= MODAL QUÉT MÃ QR (HIỆN KHI THANH TOÁN ONLINE) ================= */}
      {showQRModal && currentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => navigate("/my-orders")}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Quét mã thanh toán
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Sử dụng ứng dụng Ngân hàng để quét mã
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200 mb-6">
              <img
                src={`https://img.vietqr.io/image/970422-0348700000-compact2.jpg?amount=${currentOrder.total}&addInfo=TRAMY%20DH%20${currentOrder.id}&accountName=TRAMY%20STORE`}
                alt="Mã QR Thanh Toán"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-red-600">
                  {Number(currentOrder.total).toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nội dung:</span>
                <span className="font-bold text-blue-600 uppercase">
                  TRAMY DH {currentOrder.id}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success("Hệ thống đang kiểm tra thanh toán...");
                navigate("/my-orders");
              }}
              className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
            >
              Tôi đã chuyển khoản xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
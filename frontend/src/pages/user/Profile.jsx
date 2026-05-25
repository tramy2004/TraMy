import React, { useEffect, useState } from "react";
import axios from "@/api/axios";
import { toast } from "sonner"; // Đã chuẩn bị Sonner
import { User, Mail, Calendar, MapPin, Phone } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái bật/tắt form sửa
  
  // State quản lý block submit form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State lưu dữ liệu form ứng với 3 trường địa chỉ mới
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address_detail: "", // Số nhà, tên đường
    ward: "", // Xã / Phường
    province: "", // Tỉnh / Thành phố
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/me");
      const data = res.data;
      setUser(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address_detail: data.address_detail || "",
        ward: data.ward || "",
        province: data.province || "",
      });
    } catch (error) {
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Xử lý khi bấm Lưu thay đổi
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Kiểm tra sơ bộ: Nếu đang ở form edit mà để trống tên thì chặn lại
    if (!formData.name.trim()) {
      toast.warning("Họ và tên không được để trống!");
      return;
    }

    setIsSubmitting(true);
    
    // 🔥 TẠO TOAST LOADING: Báo hiệu hệ thống đang lưu thông tin
    const toastId = toast.loading("⏳ Đang lưu thông tin cá nhân của bạn...");

    try {
      const res = await axios.put("/me", formData);
      setUser(res.data.user); // Cập nhật lại UI bằng data mới từ Laravel trả về
      setIsEditing(false); // Tắt form sửa
      
      // 🔥 CẬP NHẬT TOAST THÀNH CÔNG
      toast.success("✅ Cập nhật thông tin thành công!", { id: toastId });
    } catch (error) {
      // 🔥 CẬP NHẬT TOAST THẤT BẠI
      toast.error(
        error.response?.data?.message || "Cập nhật thất bại, vui lòng kiểm tra lại.", 
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm tự động ghép chuỗi địa chỉ đầy đủ để hiển thị ở giao diện xem
  const renderFullAddress = () => {
    if (!user) return null;
    const parts = [user.address_detail, user.ward, user.province].filter(
      Boolean,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  };

  if (loading && !user)
    return (
      <div className="text-center mt-20 text-gray-500 font-medium">⏳ Đang tải hồ sơ...</div>
    );
  if (!user)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">Lỗi tải dữ liệu. Vui lòng F5 lại trang.</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          👤 Thông tin tài khoản
        </h1>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            // Nếu hủy chỉnh sửa, tự động reset form về data cũ của user
            if (isEditing) {
              setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address_detail: user.address_detail || "",
                ward: user.ward || "",
                province: user.province || "",
              });
            }
          }}
          disabled={isSubmitting} // Khóa nút hủy nếu đang lưu
          className="text-blue-600 font-medium hover:underline disabled:opacity-50"
        >
          {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa thông tin"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        {isEditing ? (
          /* ================= FORM CHỈNH SỬA ================= */
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isSubmitting} // Khóa input khi đang lưu
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 disabled:bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isSubmitting} // Khóa input khi đang lưu
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60 disabled:bg-gray-50"
                placeholder="Nhập số điện thoại..."
              />
            </div>

            {/* PHẦN ĐỊA CHỈ PHÂN TÁCH LÀM 3 Ô */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">
                📍 Địa chỉ nhận hàng
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Số nhà, tên đường, thôn/xóm
                </label>
                <input
                  type="text"
                  value={formData.address_detail}
                  onChange={(e) =>
                    setFormData({ ...formData, address_detail: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full border bg-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-60 disabled:bg-gray-100"
                  placeholder="Ví dụ: 123 Đường ABC"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Xã / Phường / Thị trấn
                  </label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) =>
                      setFormData({ ...formData, ward: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="w-full border bg-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-60 disabled:bg-gray-100"
                    placeholder="Ví dụ: Phường Láng Hạ"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="w-full border bg-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-60 disabled:bg-gray-100"
                    placeholder="Ví dụ: Hà Nội"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-3 px-6 rounded-lg w-full transition active:scale-95 ${
                isSubmitting 
                  ? "bg-blue-400 text-white cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
              }`}
            >
              {isSubmitting ? "⏳ Đang lưu thông tin..." : "Lưu thay đổi"}
            </button>
          </form>
        ) : (
          /* ================= GIAO DIỆN XEM THÔNG TIN ================= */
          <div className="space-y-6">
            <div className="flex items-center gap-6 border-b pb-8 mb-8">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md uppercase">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-lg">
                    {user.phone || (
                      <span className="text-red-500 text-sm italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-700 md:col-span-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium text-lg leading-snug">
                    {renderFullAddress() || (
                      <span className="text-red-500 text-sm italic">
                        Chưa cập nhật địa chỉ chi tiết
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày tham gia</p>
                  <p className="font-medium text-lg">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
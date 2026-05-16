import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    // 🔥 flex flex-col và min-h-screen giúp ép Footer luôn nằm ở đáy màn hình
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* ================= NAVBAR CỐ ĐỊNH Ở TRÊN ================= */}
      <Navbar />

      {/* ================= NỘI DUNG CHÍNH (TỰ ĐỘNG CO GIÃN) ================= */}
      {/* flex-1 giúp khu vực này đẩy Footer xuống dưới cùng */}
      {/* max-w-7xl mx-auto giúp web không bị bè ra quá to trên màn hình máy tính rộng */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      {/* Tạm thời mình code cứng một cái Footer đơn giản ở đây, fen có thể tách ra component riêng sau */}
      <footer className="bg-white border-t py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-black text-xl text-gray-900 mb-4">
              TraMy <span className="text-blue-600">Shop</span>
            </h3>
            <p className="text-gray-500 text-sm">
              Chuyên cung cấp các sản phẩm thời trang chất lượng cao với giá cả
              hợp lý nhất.
            </p>n
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Chính sách</h4>
            <ul className="text-gray-500 text-sm space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách bảo mật
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Chính sách đổi trả
              </li>
              <li className="hover:text-blue-600 cursor-pointer transition">
                Điều khoản dịch vụ
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Liên hệ</h4>
            <ul className="text-gray-500 text-sm space-y-2">
              <li>📍 Thái Nguyên, Việt Nam</li>
              <li>📞 Hotline: 1900 xxxx</li>
              <li>✉️ Email: support@tramy.test</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-400 text-sm mt-8 border-t pt-6">
          &copy; {new Date().getFullYear()} TRAMY Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

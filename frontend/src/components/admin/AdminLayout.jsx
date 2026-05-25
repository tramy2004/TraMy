import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  List,
  Home,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/api/axios";

export default function AdminLayout() {
  const navigate = useNavigate();

  // 🔥 STATE LƯU TÊN CỬA HÀNG ĐỘNG
  const [storeName, setStoreName] = useState("TRAMY");

  // 🔥 GỌI API LẤY CẤU HÌNH TÊN SHOP TỪ DATABASE KHI LOAD LAYOUT
  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const res = await axiosClient.get("/settings");
        if (res.data.store_name) {
          setStoreName(res.data.store_name);
        }
      } catch (error) {
        console.error("Lỗi lấy cấu hình tên shop cho Admin Layout:", error);
      }
    };
    fetchStoreName();
  }, []);

  // 🔥 NÂNG CẤP: Xử lý Đăng xuất mượt mà với Sonner
  const handleLogout = async () => {
    const toastId = toast.loading("⏳ Đang xử lý đăng xuất...");
    try {
      await axiosClient.post("/logout");
    } catch (e) {
      console.error(e);
    } finally {
      // Dù API thành công hay lỗi (do token hết hạn trước đó), vẫn xóa token local
      localStorage.removeItem("token");
      toast.success("👋 Đã đăng xuất an toàn!", { id: toastId });

      // Delay một chút để user kịp đọc lời chào tạm biệt
      setTimeout(() => {
        navigate("/login");
      }, 800);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <div className="w-64 flex-shrink-0 bg-white border-r shadow-sm flex flex-col justify-between h-full z-10">
        <div>
          {/* Logo Admin */}
          <div className="h-16 flex items-center px-6 border-b">
            <div
              className="text-2xl font-black text-gray-900 tracking-tight cursor-pointer flex items-baseline gap-1.5 select-none transition hover:opacity-80"
              onClick={() => navigate("/admin")}
            >
              {/* 🔥 HIỂN THỊ TÊN ĐỘNG */}
              <span className="truncate max-w-[120px]" title={storeName}>
                {storeName}
              </span>
              <span className="text-blue-600 text-lg font-bold">ADMIN</span>
            </div>
          </div>

          {/* Danh sách Menu */}
          <nav className="p-4 space-y-2 overflow-y-auto">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <LayoutDashboard size={20} />
              Tổng quan
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <ClipboardList size={20} />
              Quản lý Đơn hàng
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Package size={20} />
              Quản lý Sản phẩm
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <List size={20} />
              Danh mục SP
            </NavLink>
          </nav>
        </div>

        {/* Nút Footer Sidebar */}
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition active:scale-95"
          >
            <Home size={20} />
            Xem trang User
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition active:scale-95"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* ================= KHU VỰC NỘI DUNG CHÍNH ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Admin */}
        <header className="h-16 flex-shrink-0 bg-white border-b flex items-center justify-end px-8 shadow-sm z-0">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <span className="text-sm font-semibold text-gray-700">
              Quản trị viên
            </span>
            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* Khung chứa các trang con */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

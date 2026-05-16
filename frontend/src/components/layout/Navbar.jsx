import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LogOut,
  User,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import useAuth from "@/hooks/userAuth";
import { logoutApi } from "@/api/authApi";
import { getCart } from "@/api/cartApi";
import axiosClient from "@/api/axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const [cartCount, setCartCount] = useState(0);

  // STATE LƯU THÔNG TIN LOGO VÀ TÊN CỬA HÀNG ĐỘNG
  const [storeInfo, setStoreInfo] = useState({
    name: "TRAMY Store",
    logo: null,
  });

  // GỌI API LẤY LOGO & TÊN TỪ DATABASE
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosClient.get("/settings");
        setStoreInfo({
          name: res.data.store_name || "TRAMY Store",
          logo: res.data.store_logo || null,
        });
      } catch (error) {
        console.error("Lỗi lấy thông tin cửa hàng");
      }
    };
    fetchSettings();
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await getCart();
      const items = res.data.items || [];
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
    } catch (error) {
      console.log("Không thể lấy số lượng giỏ hàng");
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
    const handleCartUpdate = () => {
      if (user) fetchCartCount();
    };
    window.addEventListener("CartUpdated", handleCartUpdate);
    return () => window.removeEventListener("CartUpdated", handleCartUpdate);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {}

    localStorage.removeItem("token");
    toast.success("Đã logout 👋");

    navigate("/login");
    window.location.reload();
  };

  return (
    // 🔥 SỬA: Giảm py-4 xuống py-2 để ép dẹp thanh điều hướng ngay lập tức
    <div className="flex items-center justify-between px-6 py-2 bg-white shadow-sm sticky top-0 z-50 gap-4 h-18">
      {/* 1. LOGO VÀ TÊN ĐỘNG */}
      <div
        className="cursor-pointer hover:opacity-80 transition flex items-center gap-2 flex-shrink-0"
        onClick={() => navigate("/")}
      >
        {/* 🔥 SỬA: Hạ chiều cao logo xuống h-7 cho thanh thoát */}
        {storeInfo.logo && (
          <img
            src={`http://tramy.test/storage/${storeInfo.logo}`}
            alt="Store Logo"
            className="h-7 w-auto object-contain"
          />
        )}

        {/* 🔥 SỬA: Giảm kích thước text từ text-2xl xuống text-xl để tương xứng chiều cao mới */}
        <h1 className="text-xl font-black tracking-tight text-gray-900 select-none">
          {storeInfo.name}
        </h1>
      </div>

      {/* 2. THANH TÌM KIẾM Ở GIỮA */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 max-w-xl mx-8 relative"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        {/* 🔥 SỬA: Thay py-2.5 bằng h-9 để kiểm soát chiều cao cứng cho ô input */}
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-gray-100 border-none pl-11 pr-4 h-9 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button type="submit" className="hidden">
          Search
        </button>
      </form>

      {/* 3. MENU BÊN PHẢI */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 🔥 SỬA: Ép size h-9 cho nút search mobile */}
        <Button variant="ghost" className="md:hidden w-9 h-9 p-0 rounded-full">
          <Search size={18} />
        </Button>

        {/* CART */}
        {/* 🔥 SỬA: Ép size h-9 w-9 để nút tròn vo, cân đối với tổng thể */}
        <Button
          variant="ghost"
          className="relative w-9 h-9 p-0 hover:bg-gray-100 rounded-full"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            // 🔥 SỬA: Giảm size badge giỏ hàng một xíu cho vừa vặn (w-4 h-4)
            <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Button>

        {/* USER */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* 🔥 SỬA: Ép cứng h-9 cho nút bấm tài khoản user */}
              <Button
                variant="outline"
                className="font-medium rounded-full h-9 px-4 border-gray-200 text-sm"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {user.name || user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 rounded-xl shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer py-2.5 rounded-lg text-sm"
              >
                <User className="mr-2 h-4 w-4" /> Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/my-orders")}
                className="cursor-pointer py-2.5 rounded-lg text-sm"
              >
                <Package className="mr-2 h-4 w-4 text-blue-600" /> Đơn hàng của
                tôi
              </DropdownMenuItem>

              {user.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer py-2.5 rounded-lg text-sm"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4 text-amber-600" />{" "}
                    Quản trị hệ thống (Admin)
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer py-2.5 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* 🔥 SỬA: Ép cứng h-9 cho nút Đăng nhập khi chưa login */
          <Button
            onClick={() => navigate("/login")}
            className="rounded-full h-9 px-5 text-sm"
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}

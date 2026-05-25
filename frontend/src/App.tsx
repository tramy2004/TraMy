import { Routes, Route } from "react-router-dom";

// USER
import HomePage from "@/pages/user/HomePage";
import Cart from "@/pages/user/Cart";
import Orders from "@/pages/user/Orders";
import ProductDetail from "@/pages/user/ProductDetail";
import Profile from "@/pages/user/Profile";

// ADMIN
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import ProductForm from "@/pages/admin/ProductForm";
import AdminOrders from "@/pages/admin/AdminOrders";
// 🔥 BỔ SUNG: Import component AdminCategory chúng ta vừa tạo
import AdminCategory from "@/pages/admin/AdminCategory";

// AUTH
import { LoginForm } from "@/pages/auth/login-form";
import { SignupForm } from "@/pages/auth/signup-form";

// ROUTE GUARD
import ProtectedRoute from "@/routers/ProtectedRoute";
import RoleRoute from "@/routers/RoleRoute";

// LAYOUT
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* USER LAYOUT */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="product/:id" element={<ProductDetail />} />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ADMIN LAYOUT */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Quản lý sản phẩm */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />

        {/* Quản lý đơn hàng */}
        <Route path="orders" element={<AdminOrders />} />

        {/* 🔥 BỔ SUNG: Khai báo Route cho Quản lý danh mục */}
        <Route path="categories" element={<AdminCategory />} />
      </Route>
    </Routes>
  );
}

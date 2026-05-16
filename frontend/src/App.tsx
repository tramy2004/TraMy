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
// 🔥 BƯỚC 1: Import thêm trang Quản lý đơn hàng của Admin
import AdminOrders from "@/pages/admin/AdminOrders";

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

        {/* 🔥 BƯỚC 2: Sửa "orders" thành "my-orders" cho khớp với URL */}
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
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        {/* 🔥 BƯỚC 3: Thêm Route cho Quản lý đơn hàng Admin */}
        <Route path="orders" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner"; // 🔥 Import Toaster từ sonner

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 🔥 Khai báo Toaster ở đây để nó có thể bao phủ toàn bộ App */}
      {/* Thêm richColors để toast lỗi có màu đỏ, thành công có màu xanh cho đẹp */}
      <Toaster richColors position="top-right" duration={3000} />

      <App />
    </BrowserRouter>
  </StrictMode>,
);

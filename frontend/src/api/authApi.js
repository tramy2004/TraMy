import axiosClient from "./axios";

export const loginApi = (data) => axiosClient.post("/login", data);

export const registerApi = (data) => axiosClient.post("/register", data);

export const getMe = () => axiosClient.get("/me");

export const logoutApi = () => axiosClient.post("/logout");

// 🔥 BỔ SUNG: Hàm cập nhật thông tin cá nhân (Địa chỉ 3 tầng mới)
export const updateProfileApi = (data) => axiosClient.put("/me", data);

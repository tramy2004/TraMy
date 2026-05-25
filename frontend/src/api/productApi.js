// src/api/productApi.js
import axios from "./axios";

export const getProducts = (params) => axios.get("/products", { params });

export const getProduct = (id) => axios.get(`/products/${id}`);

//  FIX CREATE
export const createProduct = (data) =>
  axios.post("/products", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

//  FIX UPDATE (Laravel cần trick)
export const updateProduct = (id, data) =>
  axios.post(`/products/${id}?_method=PUT`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCategories = () => axios.get("/categories");

export const deleteProduct = (id) => axios.delete(`/products/${id}`);

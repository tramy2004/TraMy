// src/api/cartApi.js
import axios from "./axios";

export const getCart = () => axios.get("/cart");

export const addToCart = (data) => axios.post("/cart/add", data);

export const removeCart = (id) => axios.delete(`/cart/remove/${id}`);

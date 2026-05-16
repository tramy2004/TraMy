import React, { useEffect, useState } from "react";
import axiosClient from "@/api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Flame, Sparkles } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // State lưu đường dẫn ảnh Banner
  const [bannerUrl, setBannerUrl] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      }
    };

    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axiosClient.get("/recommendations");
        setRecommendations(res.data);
      } catch (error) {
        console.error("Chưa thể lấy gợi ý AI:", error);
      }
    };

    // Hàm gọi API lấy cấu hình Banner do Admin up
    const fetchSettings = async () => {
      try {
        const res = await axiosClient.get("/settings");
        if (res.data.home_banner) {
          setBannerUrl(`http://tramy.test/storage/${res.data.home_banner}`);
        }
      } catch (error) {
        console.error("Lỗi lấy cấu hình banner:", error);
      }
    };

    fetchProducts();
    fetchRecommendations();
    fetchSettings(); // Gọi lúc trang vừa load
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* BANNER ĐỘNG TỪ ADMIN */}
      <div
        className="rounded-3xl p-12 mb-12 text-center shadow-lg relative overflow-hidden bg-cover bg-center"
        style={{
          // Nếu có ảnh thì ghép ảnh, không thì để nền đen mặc định
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none",
          backgroundColor: bannerUrl ? "transparent" : "black",
        }}
      >
        {/* Lớp phủ đen mờ (Overlay) để chữ luôn dễ đọc dù ảnh có sáng chói */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Nội dung chữ nổi lên trên */}
        <div className="relative z-10 text-white">
          <Sparkles className="mx-auto mb-4 text-yellow-400" size={40} />
          <h2 className="text-3xl font-bold mb-4 drop-shadow-md">
            Khám phá bộ sưu tập thời trang mới nhất.
          </h2>
          <p className="text-gray-200 mb-6 font-medium drop-shadow-md">
            Định hình phong cách của riêng bạn với hàng ngàn ưu đãi cực hot!
          </p>
          <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition shadow-lg active:scale-95">
            Mua sắm ngay ↓
          </button>
        </div>
      </div>

      {/* ================= KHU VỰC 1: SẢN PHẨM GỢI Ý ================= */}
      {recommendations.length > 0 && !searchQuery && (
        <div className="mb-12 border-b border-gray-100 pb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> Gợi ý dành riêng cho bạn
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {recommendations.map((product) => (
              <div
                key={product.id}
                className="snap-start flex-shrink-0 w-64 bg-white rounded-2xl p-4 shadow-sm border border-amber-100 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                    Phù hợp
                  </div>
                  <img
                    src={
                      product.image
                        ? `http://tramy.test/storage/${product.image}`
                        : "https://placehold.co/300x300?text=Tramy+Store"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x300?text=Error+Img";
                    }}
                  />
                </div>
                <h3 className="font-bold text-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2 truncate">
                  {product.category || "Thời trang"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-600 font-black">
                    {Number(product.price).toLocaleString()}đ
                  </span>
                  <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= KHU VỰC 2: KẾT QUẢ / TẤT CẢ SẢN PHẨM ================= */}
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Flame className="text-red-500" />
          {searchQuery
            ? `Kết quả tìm kiếm cho "${searchQuery}"`
            : "Sản phẩm nổi bật"}
        </h2>

        {searchQuery && (
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed text-gray-500">
          Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn 😢
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition cursor-pointer group"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                <img
                  src={
                    product.image
                      ? `http://tramy.test/storage/${product.image}`
                      : "https://placehold.co/300x300?text=Tramy+Store"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/300x300?text=Error+Img";
                  }}
                />
              </div>
              <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2 mt-1 truncate">
                {product.category || "Thời trang"}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-red-600 font-black">
                  {Number(product.price).toLocaleString()}đ
                </span>
                <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg group-hover:bg-blue-600 transition">
                  Mua
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

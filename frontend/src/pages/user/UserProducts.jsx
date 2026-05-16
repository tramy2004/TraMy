import { useEffect, useState } from "react";
import { getProducts } from "@/api/productApi";
import ProductCard from "@/components/products/ProductCard";
import ProductSkeleton from "@/components/products/ProductSkeleton";

export default function UserProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Tự động fetch data và xử lý debounce 400ms khi người dùng nhập ô search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ search });

      // Khớp dữ liệu từ mọi kiểu trả về của Backend (Laravel Laravel Resource hoặc Response thô)
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm: ", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* TIÊU ĐỀ KHU VỰC */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            👕 Bộ sưu tập mới nhất
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Khám phá các thiết kế đa dạng kích cỡ và màu sắc
          </p>
        </div>
        {!loading && (
          <span className="text-sm font-medium text-gray-500">
            Tìm thấy {products.length} sản phẩm
          </span>
        )}
      </div>

      {/* SEARCH INPUT */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm mẫu quần áo, váy vóc bạn yêu thích..."
          className="w-full border border-gray-200 px-4 py-3.5 pl-11 rounded-xl shadow-xs focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition bg-white text-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {/* Có thể đặt icon kính lúp ở đây nếu đổi placeholder bỏ emoji */}
        </div>
      </div>

      {/* GRID PRODUCTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                // Fen truyền thẳng object xuống, component ProductCard con sẽ bóc tách `variants` bên trong ra xử lý nhé
              />
            ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && products.length === 0 && (
        <div className="text-center mt-12 p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-md mx-auto">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-gray-600 font-medium text-lg mb-1">
            Không tìm thấy sản phẩm nào
          </p>
          <p className="text-gray-400 text-sm">
            Fen thử tìm bằng từ khóa khác xem sao nhé!
          </p>
        </div>
      )}
    </div>
  );
}

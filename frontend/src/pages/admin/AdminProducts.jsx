import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "@/api/productApi";
import { useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ search });
      setProducts(res.data.data || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id) => {
    if (
      !confirm(
        "⚠️ Bạn có chắc chắn muốn xoá sản phẩm này và toàn bộ biến thể của nó không?",
      )
    )
      return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa sản phẩm này!");
    }
  };

  // Hàm tính tổng kho từ các biến thể (variants) của sản phẩm
  const calculateTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + parseInt(v.stock || 0), 0);
  };

  // Hàm gom các màu/size độc nhất để hiển thị tag lọc nhanh
  const getUniqueAttributes = (variants, key) => {
    if (!variants) return [];
    return [...new Set(variants.map((v) => v[key]).filter(Boolean))];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            📦 Quản lý sản phẩm
          </h1>
          <p className="text-sm text-gray-500">
            Hệ thống thời trang đa biến thể (Màu sắc & Kích thước)
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/products/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 shadow-sm"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc mô tả sản phẩm..."
          className="border border-gray-200 px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              <tr>
                <th className="p-4 w-16 text-center">ID</th>
                <th className="p-4 w-24">Ảnh</th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="p-4">Biến thể đang có</th>
                <th className="p-4 text-center">Tổng Kho</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const colors = getUniqueAttributes(p.variants, "color");
                const sizes = getUniqueAttributes(p.variants, "size");
                const totalStock = calculateTotalStock(p.variants);

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/80 transition duration-150"
                  >
                    <td className="p-4 text-center font-medium text-gray-500">
                      {p.id}
                    </td>

                    {/* 1. HIỂN THỊ ẢNH THUMBNAIL (ĐÃ ĐỒNG BỘ DOMAIN TRAMY.TEST) */}
                    <td className="p-4">
                      <img
                        src={
                          p.image
                            ? `${import.meta.env.VITE_STORAGE_URL || "http://tramy.test/storage"}/${p.image}`
                            : "/placeholder-image.png"
                        }
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100 shadow-sm"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=Error+Img";
                        }}
                      />
                    </td>

                    {/* 2. TÊN VÀ ĐÃ BÁN */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 mb-1">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Đã bán:{" "}
                        <span className="font-medium text-gray-600">
                          {p.sold_count || 0}
                        </span>{" "}
                        sp
                      </div>
                    </td>

                    {/* 3. HIỂN THỊ BADGES BIẾN THỂ */}
                    <td className="p-4">
                      {p.variants && p.variants.length > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                              Màu:
                            </span>
                            {colors.map((c) => (
                              <span
                                key={c}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                              Size:
                            </span>
                            {sizes.map((s) => (
                              <span
                                key={s}
                                className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 font-medium italic">
                          Chưa cấu hình biến thể
                        </span>
                      )}
                    </td>

                    {/* 4. HIỂN THỊ TỔNG KHO */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block font-semibold px-2.5 py-1 rounded-lg text-sm ${totalStock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                      >
                        {totalStock}
                      </span>
                    </td>

                    {/* 5. FORMAT GIÁ TIỀN */}
                    <td className="p-4 font-bold text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(p.price)}
                    </td>

                    {/* 6. HÀNH ĐỘNG */}
                    <td className="p-4 text-center space-x-4">
                      <button
                        onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 bg-white">
            <span className="text-4xl">🔍</span>
            <p className="mt-2 text-gray-500 font-medium">
              Không tìm thấy sản phẩm hợp lệ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

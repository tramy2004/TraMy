import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // 1. Lấy danh sách các màu sắc độc nhất từ đống biến thể (variants)
  const uniqueColors = product.variants
    ? [...new Set(product.variants.map((v) => v.color).filter(Boolean))]
    : [];

  // 2. Tính tổng kho của tất cả các biến thể xem sản phẩm này còn hàng không
  const totalStock = product.variants
    ? product.variants.reduce((sum, v) => sum + parseInt(v.stock || 0), 0)
    : 0;

  const isFullyOutOfStock = totalStock === 0;

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col h-full relative group">
      {/* NHÃN BÁO HẾT HÀNG (OVERLAY) */}
      {isFullyOutOfStock && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded-md z-10 shadow-sm uppercase tracking-wider">
          Hết hàng
        </div>
      )}

      {/* Hình ảnh sản phẩm */}
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="h-48 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border cursor-pointer relative"
      >
        {product.image ? (
          <img
            src={`http://tramy.test/storage/${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.src = "https://placehold.co/300x300?text=No+Image";
            }}
          />
        ) : (
          <span className="text-gray-400 text-sm">Chưa có ảnh</span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-grow mb-3 flex flex-col justify-start">
        {/* Tên sản phẩm */}
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          className="font-bold text-gray-800 text-base line-clamp-2 hover:text-red-600 cursor-pointer transition"
        >
          {product.name}
        </h3>

        {/* Mô tả ngắn */}
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
          {product.description || "Thiết kế thời trang xu hướng mới"}
        </p>

        {/* HIỂN THỊ BIẾN THỂ MÀU SẮC DẠNG BADGE / DOTS */}
        {uniqueColors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-medium">
              🎨 {uniqueColors.length} màu:
            </span>
            <div className="flex gap-1 max-w-[120px] overflow-hidden truncate">
              {uniqueColors.slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 truncate font-medium"
                  title={color}
                >
                  {color}
                </span>
              ))}
              {uniqueColors.length > 3 && (
                <span className="text-[10px] text-gray-400 font-bold self-center">
                  +{uniqueColors.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Giá & Nút hành động */}
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-red-600 font-bold text-base">
            {Number(product.price).toLocaleString()}đ
          </span>
        </div>

        {/* Nút chuyển sang trang chi tiết */}
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition active:scale-95 ${
            isFullyOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#1a1a1a] text-white hover:bg-black"
          }`}
          disabled={isFullyOutOfStock}
        >
          {isFullyOutOfStock ? "Xem" : "View"}
        </button>
      </div>
    </div>
  );
}

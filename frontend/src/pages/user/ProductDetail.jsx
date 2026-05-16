import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/api/productApi";
import { addToCart } from "@/api/cartApi";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ BIẾN THỂ & ALBUM ---
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState(""); // Lưu ảnh đang hiển thị to ở Box trái

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await getProduct(id);
        const data = res.data.data || res.data;
        setProduct(data);

        // Mặc định ban đầu lấy ảnh đại diện chính làm ảnh hiển thị
        if (data.image) {
          setCurrentImage(`http://tramy.test/storage/${data.image}`);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        toast.error("Không tìm thấy sản phẩm!");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, navigate]);

  // --- HÀM TRÍCH XUẤT THUỘC TÍNH DUY NHẤT ĐỂ RENDER NÚT BẤM ---
  const getUniqueAttributes = (key) => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v[key]).filter(Boolean))];
  };

  const availableColors = getUniqueAttributes("color");
  const availableSizes = getUniqueAttributes("size");

  // --- LOGIC KHI KHÁCH CLICK CHỌN MÀU ---
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    // Tìm xem trong album product.images có ảnh nào được Admin gán cho màu này không
    const colorImage = product.images?.find((img) => img.color === color);
    if (colorImage) {
      setCurrentImage(`http://tramy.test/storage/${colorImage.image_path}`);
    } else if (product.image) {
      // Nếu màu đó không có ảnh riêng, trả về ảnh chính ban đầu
      setCurrentImage(`http://tramy.test/storage/${product.image}`);
    }
  };

  // --- KIỂM TRA THÔNG TIN BIẾN THỂ ĐÃ CHỌN (TỒN KHO & GIÁ) ---
  const getCurrentVariant = () => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize,
    );
  };

  const currentVariant = getCurrentVariant();

  // 🔥 ĐỊNH NGHĨA BIẾN DISABLED CHO NÚT BẤM DỰA TRÊN 3 TRƯỜNG HỢP LOGIC
  // Nút bấm sẽ bị khoá khi: Chưa chọn đủ thuộc tính, phân loại không tồn tại (Không bán) hoặc hết hàng (stock <= 0)
  const isButtonDisabled =
    selectedColor &&
    selectedSize &&
    (!currentVariant || parseInt(currentVariant.stock || 0) <= 0);

  // --- HÀM THÊM VÀO GIỎ HÀNG ---
  const handleAddToCart = async (isBuyNow = false) => {
    if (availableColors.length > 0 && !selectedColor) {
      toast.warning("Vui lòng chọn Màu sắc!");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.warning("Vui lòng chọn Kích thước!");
      return;
    }
    if (isButtonDisabled) {
      toast.error("Phân loại này hiện không thể mua sắm!");
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        color: selectedColor,
        size: selectedSize,
      });

      toast.success("🛒 Đã thêm sản phẩm vào giỏ hàng!");

      if (isBuyNow) {
        navigate("/cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.warning("Vui lòng đăng nhập để mua hàng!");
        navigate("/login");
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      }
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-xl">⏳ Đang tải dữ liệu...</div>
    );
  if (!product)
    return (
      <div className="p-20 text-center text-xl text-red-500">
        Sản phẩm không tồn tại.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:underline font-medium flex items-center gap-1"
      >
        &larr; Quay lại
      </button>

      <div className="flex flex-col md:flex-row gap-10 bg-white p-8 rounded-2xl shadow-sm border">
        {/* KHU VỰC ALBUM ẢNH (BÊN TRÁI) */}
        <div className="md:w-1/2 space-y-4">
          <div className="flex justify-center items-center bg-gray-50 rounded-2xl overflow-hidden border aspect-square">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <span className="text-gray-400 text-lg">🖼️ Chưa có hình ảnh</span>
            )}
          </div>

          {/* Danh sách ảnh con (Thumbnails Album) */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.image && (
                <img
                  src={`http://tramy.test/storage/${product.image}`}
                  alt="thumbnail main"
                  onClick={() =>
                    setCurrentImage(
                      `http://tramy.test/storage/${product.image}`,
                    )
                  }
                  className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${currentImage === `http://tramy.test/storage/${product.image}` ? "border-black ring-1 ring-black" : "border-gray-200"}`}
                />
              )}
              {product.images.map((img) => {
                const imgUrl = `http://tramy.test/storage/${img.image_path}`;
                return (
                  <img
                    key={img.id}
                    src={imgUrl}
                    alt="thumbnail detail"
                    onClick={() => setCurrentImage(imgUrl)}
                    className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${currentImage === imgUrl ? "border-black ring-1 ring-black" : "border-gray-200"}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* KHU VỰC THÔNG TIN VÀ CHỌN BIẾN THỂ (BÊN PHẢI) */}
        <div className="md:w-1/2 flex flex-col justify-start">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {product.name}
          </h1>

          <p className="text-3xl text-red-600 font-bold mb-6">
            {currentVariant && currentVariant.price
              ? Number(currentVariant.price).toLocaleString()
              : Number(product.price).toLocaleString()}{" "}
            đ
          </p>

          <hr className="mb-6" />

          {/* 1. BỘ CHỌN MÀU SẮC */}
          {availableColors.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Màu sắc:
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedColor === color
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. BỘ CHỌN KÍCH THƯỚC (SIZE) */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Kích thước:
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 min-w-[48px] px-3 rounded-xl text-sm font-medium border transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🔥 SỬA LOGIC HIỂN THỊ KHO HÀNG 3 TRƯỜNG HỢP CHUẨN ĐẸP */}
          {selectedColor && selectedSize && (
            <div className="mb-6 text-sm">
              {!currentVariant ? (
                // Trường hợp 3: Không tồn tại bản ghi tương ứng trong DB (Không bán / lỗi cấu hình)
                <span className="text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  ⚠️ Phân loại này tạm thời ngừng bán
                </span>
              ) : parseInt(currentVariant.stock || 0) <= 0 ? (
                // Trường hợp 2: Có biến thể nhưng stock bằng 0 hoặc trống
                <span className="text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  ❌ Phiên bản này đã hết hàng
                </span>
              ) : (
                // Trường hợp 1: Có hàng và tồn kho lớn hơn 0
                <span className="text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  ✓ Còn hàng (Kho: {currentVariant.stock} sản phẩm)
                </span>
              )}
            </div>
          )}

          <div className="mb-8 mt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-1">
              Mô tả sản phẩm:
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>
          </div>

          {/* HÀNH ĐỘNG MUA HÀNG */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isButtonDisabled}
              className={`font-semibold px-6 py-4 rounded-xl flex-1 transition active:scale-95 ${
                isButtonDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              🛒 Thêm vào giỏ
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={isButtonDisabled}
              className={`font-semibold px-6 py-4 rounded-xl flex-1 transition active:scale-95 ${
                isButtonDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              💳 Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

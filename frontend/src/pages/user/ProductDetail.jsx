import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/api/productApi";
import { addToCart } from "@/api/cartApi";
import { toast } from "sonner"; // Đã chuẩn Sonner

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ BIẾN THỂ & ALBUM ---
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState(""); // Lưu ảnh đang hiển thị to ở Box trái

  // --- CONFIG ĐƯỜNG DẪN ẢNH THỐNG NHẤT ---
  const storageUrl =
    import.meta.env.VITE_STORAGE_URL || "http://tramy.test/storage";

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await getProduct(id);
        const data = res.data.data || res.data;
        setProduct(data);

        // Mặc định ban đầu lấy ảnh đại diện chính làm ảnh hiển thị
        if (data.image) {
          setCurrentImage(`${storageUrl}/${data.image}`);
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
  }, [id, navigate, storageUrl]);

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
      setCurrentImage(`${storageUrl}/${colorImage.image_path}`);
    } else if (product.image) {
      // Nếu màu đó không có ảnh riêng, trả về ảnh chính ban đầu
      setCurrentImage(`${storageUrl}/${product.image}`);
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
  const isButtonDisabled =
    selectedColor &&
    selectedSize &&
    (!currentVariant || parseInt(currentVariant.stock || 0) <= 0);

  // --- HÀM THÊM VÀO GIỎ HÀNG (ĐÃ NÂNG CẤP SONNER) ---
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

    // 🔥 BẬT TOAST LOADING
    const toastId = toast.loading("⏳ Đang xử lý...");

    try {
      await addToCart({
        product_id: product.id,
        color: selectedColor,
        size: selectedSize,
      });

      // 🔥 THÔNG BÁO THÀNH CÔNG
      toast.success("🛒 Đã thêm sản phẩm vào giỏ hàng!", { id: toastId });

      // Cập nhật số lượng item trên Header (nếu có)
      window.dispatchEvent(new Event("CartUpdated"));

      // Nếu bấm nút "Mua ngay" thì chuyển trang sau 1 giây
      if (isBuyNow) {
        setTimeout(() => {
          navigate("/cart");
        }, 1000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.warning("Vui lòng đăng nhập để tiếp tục!", { id: toastId });
        // Chuyển hướng đến trang login sau khi đọc xong thông báo
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng!", { id: toastId });
      }
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-xl font-medium text-gray-500">
        ⏳ Đang tải dữ liệu sản phẩm...
      </div>
    );
  if (!product)
    return (
      <div className="p-20 text-center text-xl text-red-500 font-bold">
        Sản phẩm không tồn tại.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 transition font-medium flex items-center gap-1"
      >
        &larr; Quay lại
      </button>

      <div className="flex flex-col md:flex-row gap-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* KHU VỰC ALBUM ẢNH (BÊN TRÁI) */}
        <div className="md:w-1/2 space-y-4">
          <div className="flex justify-center items-center bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 aspect-square">
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
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.image && (
                <img
                  src={`${storageUrl}/${product.image}`}
                  alt="thumbnail main"
                  onClick={() =>
                    setCurrentImage(`${storageUrl}/${product.image}`)
                  }
                  className={`w-16 h-16 object-cover rounded-xl border-2 cursor-pointer transition ${currentImage === `${storageUrl}/${product.image}` ? "border-black shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                />
              )}
              {product.images.map((img) => {
                const imgUrl = `${storageUrl}/${img.image_path}`;
                return (
                  <img
                    key={img.id}
                    src={imgUrl}
                    alt="thumbnail detail"
                    onClick={() => setCurrentImage(imgUrl)}
                    className={`w-16 h-16 object-cover rounded-xl border-2 cursor-pointer transition ${currentImage === imgUrl ? "border-black shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* KHU VỰC THÔNG TIN VÀ CHỌN BIẾN THỂ (BÊN PHẢI) */}
        <div className="md:w-1/2 flex flex-col justify-start">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl text-red-600 font-bold mb-6">
            {currentVariant && currentVariant.price
              ? Number(currentVariant.price).toLocaleString()
              : Number(product.price).toLocaleString()}{" "}
            đ
          </p>

          <hr className="mb-6 border-gray-100" />

          {/* 1. BỘ CHỌN MÀU SẮC */}
          {availableColors.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Màu sắc:
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
                      selectedColor === color
                        ? "border-black bg-black text-white shadow-md"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
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
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Kích thước:
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 min-w-[56px] px-3 rounded-xl text-sm font-medium border-2 transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white shadow-md"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🔥 LOGIC HIỂN THỊ KHO HÀNG */}
          {selectedColor && selectedSize && (
            <div className="mb-6 text-sm">
              {!currentVariant ? (
                <span className="text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  ⚠️ Phân loại này tạm thời ngừng bán
                </span>
              ) : parseInt(currentVariant.stock || 0) <= 0 ? (
                <span className="text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  ❌ Phiên bản này đã hết hàng
                </span>
              ) : (
                <span className="text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  ✓ Còn hàng (Kho: {currentVariant.stock} sản phẩm)
                </span>
              )}
            </div>
          )}

          <div className="mb-8 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
              Mô tả chi tiết:
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
              className={`font-semibold px-6 py-4 rounded-2xl flex-1 transition active:scale-95 ${
                isButtonDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-white text-gray-900 border-2 border-black hover:bg-gray-100 shadow-sm"
              }`}
            >
              🛒 Thêm vào giỏ
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={isButtonDisabled}
              className={`font-semibold px-6 py-4 rounded-2xl flex-1 transition active:scale-95 shadow-md ${
                isButtonDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
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

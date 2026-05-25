import React, { useEffect, useState } from "react";
import { createProduct, getProduct, updateProduct } from "@/api/productApi";
// Giả sử bạn đã có api lấy danh mục, nếu chưa hãy tạo file categoryApi.js
import { getCategories } from "@/api/categoryApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, X } from "lucide-react";

export default function ProductForm() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    category_id: "",
  });

  const [categories, setCategories] = useState([]); // State lưu danh mục
  const [variants, setVariants] = useState([{ color: "", size: "", stock: 0 }]);
  const [oldImages, setOldImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  // Load danh mục ngay khi mở form
  useEffect(() => {
    // Gọi API lấy categories (bạn nhớ điều chỉnh lại đường dẫn hoặc cấu trúc res cho đúng dự án)
    getCategories()
      .then((res) => {
        setCategories(res.data.data || res.data || []);
      })
      .catch(() => toast.error("Không thể tải danh sách danh mục!"));
  }, []);

  // Load data khi ở chế độ Edit
  useEffect(() => {
    if (id) {
      getProduct(id).then((res) => {
        const data = res.data.data || res.data;

        setForm({
          name: data.name || "",
          price: data.price || "",
          description: data.description || "",
          image: data.image || null,
          category_id: data.category_id || "",
        });

        if (data.variants && data.variants.length > 0) {
          setVariants(
            data.variants.map((v) => ({
              color: v.color || "",
              size: v.size || "",
              stock: v.stock || 0,
            })),
          );
        }

        if (data.images && data.images.length > 0) {
          setOldImages(data.images.map((img) => img.image_path || img));
        }
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const addVariantRow = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const removeVariantRow = (index) => {
    if (variants.length === 1) {
      toast.warning("Sản phẩm biến thể phải có ít nhất 1 tùy chọn màu/size");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setDetailImages([...detailImages, ...files]);
  };

  const removeDetailImage = (index) => {
    setDetailImages(detailImages.filter((_, i) => i !== index));
  };

  const removeOldImage = (index) => {
    setOldImages(oldImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category_id) {
      toast.error("Vui lòng chọn danh mục cho sản phẩm!");
      return;
    }

    const hasInvalidVariant = variants.some((v) => !v.color || !v.size);
    if (hasInvalidVariant) {
      toast.error(
        "Vui lòng điền đầy đủ Màu sắc và Kích thước cho tất cả các biến thể!",
      );
      return;
    }

    // 🔥 TẠO TOAST LOADING: Thông báo cho user biết hệ thống đang up ảnh
    const toastId = toast.loading("⏳ Đang xử lý và tải ảnh lên server...");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description || "");
    formData.append("category_id", form.category_id);

    if (form.image && typeof form.image !== "string") {
      formData.append("image", form.image);
    }

    formData.append("variants", JSON.stringify(variants));

    if (id) {
      formData.append("old_images", JSON.stringify(oldImages));
    }

    if (detailImages.length > 0) {
      detailImages.forEach((file) => {
        formData.append("images[]", file);
      });
    }

    try {
      if (id) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }

      // 🔥 CẬP NHẬT TOAST THÀNH CÔNG (Tắt vòng xoay loading)
      toast.success("✅ Lưu sản phẩm biến thể thành công!", { id: toastId });
      navigate("/admin/products");
    } catch (err) {
      console.log("ERROR:", err.response?.data);
      // 🔥 CẬP NHẬT TOAST THẤT BẠI
      toast.error(err.response?.data?.message || "❌ Lỗi rồi fen ơi", {
        id: toastId,
      });
    }
  };

  return (
    <div className="max-w-4xl bg-white p-6 rounded-xl shadow border border-gray-100 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {id ? "✏️ Sửa sản phẩm biến thể" : "➕ Thêm sản phẩm biến thể"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* THÔNG TIN CƠ BẢN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              name="name"
              placeholder="Ví dụ: Áo thun Oversize"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán gốc (VND) *
            </label>
            <input
              name="price"
              type="number"
              placeholder="Giá tiền chính"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 🔥 THAY ĐỔI: Chuyển Input ID thành Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm *
            </label>
            <select
              name="category_id"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Vui lòng chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* QUẢN LÝ ẢNH ĐẠI DIỆN CHÍNH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh đại diện chính (Thumbnail)
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full border p-2.5 rounded-xl text-gray-500"
              onChange={handleChange}
            />
            {form.image && (
              <div className="mt-2">
                <img
                  src={
                    typeof form.image === "string"
                      ? `${import.meta.env.VITE_STORAGE_URL || "http://tramy.test/storage"}/${form.image}`
                      : URL.createObjectURL(form.image)
                  }
                  alt="preview main"
                  className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- KHU VỰC QUẢN LÝ BIẾN THỂ (MÀU SẮC & KÍCH THƯỚC) --- */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-bold text-gray-800 flex items-center gap-1">
              🎨 Cấu hình biến thể (Màu sắc & Kích thước)
            </h3>
            <button
              type="button"
              onClick={addVariantRow}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 text-sm font-semibold rounded-lg border border-blue-200 transition"
            >
              + Thêm dòng biến thể
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="text"
                    placeholder="Màu sắc (ví dụ: Đen)"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={variant.color}
                    onChange={(e) =>
                      handleVariantChange(index, "color", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="flex-1 min-w-[10px]">
                  <input
                    type="text"
                    placeholder="Kích thước (ví dụ: M)"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={variant.size}
                    onChange={(e) =>
                      handleVariantChange(index, "size", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    placeholder="Số lượng kho"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(index, "stock", e.target.value)
                    }
                    min="0"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariantRow(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- KHU VỰC QUẢN LÝ ALBUM NHIỀU ẢNH CHI TIẾT --- */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="text-md font-bold text-gray-800 mb-3">
            🖼️ Album ảnh chi tiết sản phẩm
          </h3>
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full border p-2.5 rounded-xl bg-white text-gray-500 mb-3"
            onChange={handleDetailImagesChange}
          />

          {oldImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ảnh đang có trên hệ thống:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 bg-white p-3 rounded-xl border border-gray-100">
                {oldImages.map((path, index) => (
                  <div
                    key={`old-${index}`}
                    className="relative group rounded-lg overflow-hidden border shadow-xs aspect-square"
                  >
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL || "http://tramy.test/storage"}/${path}`}
                      alt="old detail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeOldImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailImages.length > 0 && (
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                Ảnh mới chọn chuẩn bị tải lên:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 bg-white p-3 rounded-xl border border-gray-100">
                {detailImages.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group rounded-lg overflow-hidden border shadow-xs aspect-square"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview detail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MÔ TẢ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả sản phẩm
          </label>
          <textarea
            name="description"
            placeholder="Viết nội dung mô tả chi tiết sản phẩm tại đây..."
            rows={4}
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* NÚT SUBMIT */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition shadow-sm duration-150"
        >
          💾 Lưu thông tin sản phẩm và biến thể
        </button>
      </form>
    </div>
  );
}

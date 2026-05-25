import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categoryApi";
import { toast } from "sonner";
import { Tags, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Thêm mới, có ID = Cập nhật
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      // Tùy theo cấu trúc JSON Laravel trả về (có bọc trong 'data' hay không)
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- HÀM MỞ MODAL THÊM MỚI ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  // --- HÀM MỞ MODAL CẬP NHẬT ---
  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  // --- HÀM SUBMIT FORM (VỪA THÊM VỪA SỬA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Tên danh mục không được để trống!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      editingId ? "⏳ Đang cập nhật..." : "⏳ Đang thêm danh mục mới...",
    );

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success("✅ Đã cập nhật danh mục!", { id: toastId });
      } else {
        await createCategory(formData);
        toast.success("✅ Đã thêm danh mục mới!", { id: toastId });
      }

      setIsModalOpen(false); // Đóng modal
      fetchCategories(); // Render lại danh sách
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HÀM XÓA DANH MỤC ---
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm bên trong có thể bị ảnh hưởng!",
      )
    )
      return;

    const toastId = toast.loading("🗑️ Đang xóa danh mục...");
    try {
      await deleteCategory(id);
      toast.success("Đã xóa danh mục thành công!", { id: toastId });
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa danh mục đang có sản phẩm!",
        { id: toastId },
      );
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        ⏳ Đang tải danh sách...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tags className="text-blue-600" /> Quản lý danh mục
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 shadow-sm active:scale-95"
        >
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              <tr>
                <th className="p-4 w-20 text-center">ID</th>
                <th className="p-4">Tên danh mục</th>
                <th className="p-4 w-48 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    Chưa có danh mục nào trên hệ thống.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50/80 transition duration-150"
                  >
                    <td className="p-4 text-center font-medium text-gray-500">
                      {cat.id}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                        {cat.name}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                      >
                        <Edit size={14} /> Sửa
                      </button>

                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA DANH MỤC ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>

            {/* Header Modal */}
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {editingId
                ? "Thay đổi tên của danh mục hiện tại."
                : "Tạo phân loại mới cho kho sản phẩm."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="Ví dụ: Áo thun, Quần Jean..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-400 bg-gray-50 disabled:opacity-60"
                />
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition active:scale-95 ${
                    isSubmitting || !formData.name.trim()
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
                  }`}
                >
                  {isSubmitting ? "⏳ Đang lưu..." : "Lưu danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

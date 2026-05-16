export default function ProductSkeleton() {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col h-full animate-pulse">
      {/* Khung ảnh giả lập (Tăng chiều cao lên h-48 cho khớp với card thật) */}
      <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>

      {/* Thông tin nội dung */}
      <div className="flex-grow mb-3 space-y-2">
        {/* Tên sản phẩm giả lập (2 dòng) */}
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>

        {/* Mô tả ngắn giả lập */}
        <div className="h-3 bg-gray-100 rounded-md w-1/2 mt-1"></div>

        {/* Giả lập phần hiển thị Biến thể màu sắc (Mới thêm) */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <div className="h-3 bg-gray-100 rounded w-10"></div>{" "}
          {/* Chữ "🎨 3 màu:" */}
          <div className="flex gap-1">
            <div className="h-4 bg-gray-200 rounded w-10"></div>{" "}
            {/* Khối màu 1 */}
            <div className="h-4 bg-gray-200 rounded w-10"></div>{" "}
            {/* Khối màu 2 */}
          </div>
        </div>
      </div>

      {/* Phần Chân Card: Giá & Nút bấm */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
        {/* Giá tiền giả lập */}
        <div className="h-5 bg-gray-200 rounded-md w-20"></div>

        {/* Nút bấm View giả lập */}
        <div className="h-8 bg-gray-200 rounded-xl w-16"></div>
      </div>
    </div>
  );
}

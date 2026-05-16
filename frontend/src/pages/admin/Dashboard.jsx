import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Activity,
  Settings,
} from "lucide-react";
import axiosClient from "@/api/axios";
import { toast } from "sonner";

// 🔥 Import thêm các thành phần của Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Đăng ký các plugin cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosClient.get("/admin/stats");
        setData(res.data);
      } catch (err) {
        console.error("Lỗi Dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (storeName) formData.append("store_name", storeName);
    const logoFile = document.getElementById("logoInput").files[0];
    if (logoFile) formData.append("store_logo", logoFile);
    const bannerFile = document.getElementById("bannerInput").files[0];
    if (bannerFile) formData.append("home_banner", bannerFile);

    try {
      await axiosClient.post("/admin/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Đã cập nhật Nhận diện thương hiệu!");
      document.getElementById("logoInput").value = "";
      document.getElementById("bannerInput").value = "";
      setStoreName("");
    } catch (error) {
      toast.error("Lỗi cập nhật nhận diện thương hiệu!");
    }
  };

  // 🔥 Cấu hình dữ liệu cho Biểu đồ
  const chartData = {
    labels: data?.chart_data?.labels || [],
    datasets: [
      {
        fill: true,
        label: "Doanh thu (đ)",
        data: data?.chart_data?.data || [],
        borderColor: "rgb(16, 185, 129)", // Màu xanh Emerald (giống nút Doanh thu)
        backgroundColor: "rgba(16, 185, 129, 0.1)", // Màu nền mờ bên dưới đường kẻ
        tension: 0.4, // Tạo độ cong mượt cho đường kẻ
        pointRadius: 4,
        pointBackgroundColor: "rgb(16, 185, 129)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ẩn chú thích cho gọn
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) =>
            `Doanh thu: ${new Intl.NumberFormat("vi-VN").format(context.raw)} đ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 11 }, color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#9ca3af" },
      },
    },
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium">⏳ Đang lấy dữ liệu...</div>
    );
  if (error || !data)
    return (
      <div className="p-10 text-center text-red-600 bg-red-50 m-6 rounded-2xl border">
        Lỗi kết nối Backend
      </div>
    );

  const stats = [
    {
      title: "Tổng doanh thu",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(data.revenue || 0),
      icon: <DollarSign size={24} />,
      color: "bg-emerald-500",
      desc: `Tháng này: ${new Intl.NumberFormat("vi-VN").format(data.monthly_revenue || 0)} đ`,
    },
    {
      title: "Đơn chờ xử lý",
      value: data.pending_orders || 0,
      icon: <ShoppingBag size={24} />,
      color: "bg-amber-500",
      desc: "Cần duyệt ngay",
    },
    {
      title: "Sản phẩm",
      value: data.products || 0,
      icon: <Package size={24} />,
      color: "bg-indigo-500",
      desc: "Đang kinh doanh",
    },
    {
      title: "Khách hàng",
      value: data.customers || 0,
      icon: <Users size={24} />,
      color: "bg-rose-500",
      desc: "Tài khoản người dùng",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
        <Activity className="text-blue-600" /> Tổng quan hệ thống
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4"
          >
            <div
              className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-inherit/20`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                {stat.title}
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stat.value}
              </h3>
              <p className="text-xs text-gray-400 mt-2 font-medium">
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/*  BIỂU ĐỒ DOANH THU THỰC TẾ */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">
            Biểu đồ doanh thu (7 ngày gần nhất)
          </h2>
          <div className="h-72">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Đơn hàng mới nhất</h2>
          <div className="space-y-6">
            {data.recent_activities?.map((order) => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs">
                  #{order.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {order.customer}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{order.time}</p>
                </div>
                <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                  <p className="text-sm font-black text-green-600">
                    +{new Intl.NumberFormat("vi-VN").format(order.total)}đ
                  </p>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 rounded-md text-gray-500">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Khu vực cài đặt thương hiệu */}
      <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <Settings className="text-blue-600" /> Cài đặt Nhận diện Thương hiệu
        </h2>
        <form
          onSubmit={handleUpdateBrand}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tên cửa hàng mới
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="VD: TRAMY Store..."
              className="w-full border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Upload Logo
            </label>
            <input
              id="logoInput"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-white rounded-xl shadow-sm"
            />
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Upload Banner
            </label>
            <input
              id="bannerInput"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-white rounded-xl shadow-sm"
            />
          </div>
          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-md shadow-black/20"
            >
              Lưu thay đổi giao diện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

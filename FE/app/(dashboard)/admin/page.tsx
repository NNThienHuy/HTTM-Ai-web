"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import React, { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import apiClient from "@/lib/api"; // Đảm bảo bạn đã có file này cấu hình fetch

// Định nghĩa kiểu dữ liệu trả về từ API
interface StatData {
  value: number;
  growth: number;
  label: string;
}

interface DashboardStats {
  revenue: StatData;
  orders: StatData;
  products: StatData;
  visitors: StatData;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Gọi API Backend bạn vừa tạo
        const res = await apiClient.get("/api/admin/stats"); 
        if (res.ok) {
            const data = await res.json();
            setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col min-h-screen">
      <DashboardSidebar />
      
      <div className="flex flex-col items-center ml-5 gap-y-6 w-full max-xl:ml-0 max-xl:px-4 max-xl:mt-5 p-5">
        <h2 className="text-3xl font-bold w-full text-left text-gray-800">Tổng quan</h2>

        {/* 3 KHỐI THỐNG KÊ NHỎ */}
        <div className="flex justify-between w-full gap-5 max-md:flex-col">
          <StatsElement 
            title="Doanh thu tháng" 
            value={stats ? `${stats.revenue.value.toLocaleString()} đ` : 0} 
            growth={stats?.revenue.growth || 0}
            loading={loading}
            color="bg-indigo-600"
          />
          <StatsElement 
            title="Đơn hàng mới" 
            value={stats?.orders.value || 0} 
            growth={stats?.orders.growth || 0}
            loading={loading}
            color="bg-orange-500"
          />
          <StatsElement 
            title="Sản phẩm mới" 
            value={stats?.products.value || 0} 
            growth={stats?.products.growth || 0}
            loading={loading}
            color="bg-teal-500"
          />
        </div>

        {/* KHỐI LỚN: KHÁCH TRUY CẬP (VISITORS) */}
        <div className="w-full bg-blue-600 text-white h-48 rounded-xl shadow-lg flex flex-col justify-center items-center gap-y-3 transition-transform hover:scale-[1.01]">
          {loading ? (
             <span className="loading loading-spinner loading-lg text-white"></span>
          ) : (
            <>
                <h4 className="text-3xl text-gray-100 max-[400px]:text-2xl">
                    Lượt xem sản phẩm hôm nay
                </h4>
                <p className="text-5xl font-extrabold tracking-wider">
                    {stats?.visitors.value.toLocaleString() || 0}
                </p>
                <p className={`flex gap-x-2 items-center text-lg ${stats && stats.visitors.growth >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {stats && stats.visitors.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="font-bold">{Math.abs(stats?.visitors.growth || 0)}%</span> 
                    so với hôm qua
                </p>
            </>
          )}
        </div>

        {/* Có thể chèn thêm biểu đồ hoặc bảng đơn hàng mới nhất ở đây */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
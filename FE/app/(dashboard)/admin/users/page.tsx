"use client";

import { CustomButton, DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  role: string;
}

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch users failed");
        
        const data = await res.json();
        // Đảm bảo data là mảng
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete user handler
  const deleteUser = async (id: string) => {
    if (!id) return;
    const ok = confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await apiClient.delete(`/api/users/${id}`);
      
      if (res.status === 204 || res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("Đã xóa người dùng thành công");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xóa người dùng");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full p-6">
        <h1 className="text-3xl font-semibold text-center mb-5">Quản lý người dùng</h1>
        
        <div className="flex justify-end mb-5">
          <Link href="/admin/users/new">
            <CustomButton
              buttonType="button"
              customWidth="160px" // Tăng độ rộng để vừa text tiếng Việt nếu cần
              paddingX={10}
              paddingY={5}
              textSize="base"
              text="Thêm người dùng"
            />
          </Link>
        </div>

        <div className="w-full overflow-auto border rounded-xl shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Chưa có người dùng nào.</div>
          ) : (
            <table className="table table-md w-full">
              {/* head */}
              <thead className="bg-gray-100">
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th className="text-right pr-10">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="font-mono text-xs text-gray-500">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td>
                      <div className="font-semibold">{user.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary text-white' : 'badge-ghost'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="btn btn-sm btn-outline btn-info"
                      >
                        Chi tiết
                      </Link>
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;
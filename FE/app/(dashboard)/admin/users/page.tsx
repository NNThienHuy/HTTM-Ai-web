"use client";
import { CustomButton, DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type UserRole = "admin" | "customer" | string;

interface User {
  id: string | number;
  email: string;
  role: UserRole;
  username?: string;
  name?: string | null;
}

function normalizeUsers(payload: any): User[] {
  // BE có thể trả:
  // 1) { success: true, data: User[] }
  // 2) { success: true, data: { data: User[] } } (paginate cũ)
  // 3) User[] (fallback)
  const root = payload?.data ?? payload;
  const arr = Array.isArray(root) ? root : root?.data;

  if (!Array.isArray(arr)) return [];

  return arr.map((u: any) => ({
    id: u?.id ?? u?.account_id,
    email: u?.email,
    role: u?.role ?? u?.user_type,
    username: u?.username,
    name: u?.name ?? u?.full_name ?? null,
  }));
}

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/admin/users");
      const json = await res.json();

      if (!res.ok || json?.success === false) {
        console.error("Fetch users failed:", json);
        setUsers([]);
        return;
      }

      setUsers(normalizeUsers(json));
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (user: User) => {
    const id = user?.id;
    if (!id) return;

    // BE đang chặn xoá admin (403) => FE disable luôn để "match"
    if (String(user.role) === "admin") return;

    const ok = window.confirm(`Xoá account: ${user.email}?`);
    if (!ok) return;

    try {
      const res = await apiClient.delete(`/api/admin/users/${id}`);
      const json = await res.json();

      if (!res.ok || json?.success === false) {
        window.alert(json?.message ?? "Xoá thất bại");
        return;
      }

      setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
      window.alert(json?.message ?? "Đã xoá thành công");
    } catch (e) {
      console.error(e);
      window.alert("Xoá thất bại");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center mb-5">All users</h1>

        <div className="flex justify-between items-center mb-5">
          <div className="text-sm opacity-70">
            {loading ? "Loading..." : `Total: ${users.length}`}
          </div>

          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={fetchUsers}>
              Reload
            </button>

            <Link href="/admin/users/new">
              <CustomButton
                buttonType="button"
                customWidth="110px"
                paddingX={10}
                paddingY={5}
                textSize="base"
                text="Add new user"
              />
            </Link>
          </div>
        </div>

        <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
          <table className="table table-md table-pin-cols">
            <thead>
              <tr>
                <th>Email</th>
                <th>Vai trò người dùng</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={String(user.id)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{user.email}</p>
                      {user.username ? (
                        <span className="badge badge-ghost">{user.username}</span>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        user.role === "admin" ? "badge-info" : "badge-success"
                      }`}
                    >
                      {String(user.role)}
                    </span>
                  </td>

                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Chi tiết
                      </Link>

                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => handleDelete(user)}
                        disabled={String(user.role) === "admin"}
                        title={
                          String(user.role) === "admin"
                            ? "Không thể xoá admin"
                            : "Xoá account"
                        }
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center opacity-70">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : null}
            </tbody>

            <tfoot>
              <tr>
                <th>Email</th>
                <th>Vai trò người dùng</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;

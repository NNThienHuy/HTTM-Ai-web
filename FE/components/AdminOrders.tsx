"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";

type AdminOrderUI = {
  id: number | string;
  name: string;
  country: string;
  status: string;
  total: number;
  dateTime: string;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrderUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      // ✅ admin endpoint (đúng route)
      const res = await apiClient.get("/api/admin/orders"); // :contentReference[oaicite:4]{index=4}
      const data = await res.json();

      if (!res.ok) {
        // nếu 401/403 thì sẽ rơi vào đây
        setError(data?.message || `Fetch failed (${res.status})`);
        setOrders([]);
        return;
      }

      // ✅ BE có thể trả mảng trực tiếp (phổ biến nhất)
      const raw = Array.isArray(data) ? data : data?.orders ?? [];

      // ✅ map field từ Order model -> UI shape của AdminOrders.tsx
      const mapped: AdminOrderUI[] = raw.map((o: any) => ({
        id: o.order_id ?? o.id, // PK là order_id :contentReference[oaicite:5]{index=5}
        name: o.customer_name ?? o.name ?? "",
        country: o.shipping_city ?? o.shipping_district ?? "",
        status: o.status ?? "",
        total: Number(o.total_amount ?? o.total ?? 0),
        dateTime: o.created_at ?? o.order_date ?? o.dateTime ?? new Date().toISOString(),
      }));

      setOrders(mapped);
    } catch (e: any) {
      setError(e?.message || "Network error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    const ok = confirm(`Delete order #${id}?`);
    if (!ok) return;

    const res = await apiClient.delete(`/api/admin/orders/${id}`); // :contentReference[oaicite:6]{index=6}
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.message || `Delete failed (${res.status})`);
      return;
    }
    setOrders((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="xl:ml-5 w-full max-xl:mt-5">Loading...</div>;

  return (
    <div className="xl:ml-5 w-full max-xl:mt-5 ">
      <h1 className="text-3xl font-semibold text-center mb-5">All orders</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="py-10 text-center text-gray-500">Chưa có đơn hàng.</div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-md table-pin-cols">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={String(order.id)}>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>

                <td>
                  <p className="font-bold">#{order.id}</p>
                </td>

                <td>
                  <div className="font-bold">{order.name}</div>
                  <div className="text-sm opacity-50">{order.country}</div>
                </td>

                <td>
                  <span className="badge badge-success text-white badge-sm">
                    {order.status}
                  </span>
                </td>

                <td>
                  <p>${order.total}</p>
                </td>

                <td>{new Date(Date.parse(order.dateTime)).toDateString()}</td>

                <td className="flex gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="btn btn-ghost btn-xs"
                  >
                    details
                  </Link>
                  <button
                    className="btn btn-error btn-xs text-white"
                    onClick={() => handleDelete(order.id)}
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

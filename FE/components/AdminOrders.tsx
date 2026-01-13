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
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchOrders = async () => {
    // ✅ Admin list endpoint (đúng route api.php)
    const response = await apiClient.get("/api/admin/orders"); // :contentReference[oaicite:10]{index=10}
    const data = await response.json();

    // ✅ BE thường trả array; nếu lỡ có wrap {orders: []} thì vẫn ăn
    const raw = Array.isArray(data) ? data : data?.orders ?? [];

    // ✅ map đúng field từ Order model (order_id, customer_name, shipping_city, total_amount, created_at)
    const mapped: AdminOrderUI[] = raw.map((o: any) => ({
      id: o.order_id ?? o.id, // PK là order_id :contentReference[oaicite:11]{index=11}
      name: o.customer_name ?? o.name ?? "",
      country: o.shipping_city ?? o.shipping_district ?? "",
      status: o.status ?? "",
      total: Number(o.total_amount ?? o.total ?? 0),
      dateTime: o.created_at ?? o.order_date ?? o.dateTime ?? new Date().toISOString(),
    }));

    setOrders(mapped);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: number | string) => {
    const ok = confirm(`Delete order #${id}?`);
    if (!ok) return;

    setDeletingId(id);
    try {
      // ✅ Admin delete endpoint (đúng route api.php)
      const res = await apiClient.delete(`/api/admin/orders/${id}`); // :contentReference[oaicite:12]{index=12}
      if (!res.ok) {
        alert("Delete failed. Check API / permission / token.");
        return;
      }
      setOrders((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="xl:ml-5 w-full max-xl:mt-5 ">
      <h1 className="text-3xl font-semibold text-center mb-5">All orders</h1>
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
            {orders && orders.length > 0 &&
              orders.map((order) => (
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
                    <div className="flex items-center gap-5">
                      <div>
                        <div className="font-bold">{order.name}</div>
                        <div className="text-sm opacity-50">{order.country}</div>
                      </div>
                    </div>
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
                      disabled={deletingId === order.id}
                      onClick={() => handleDelete(order.id)}
                    >
                      {deletingId === order.id ? "deleting..." : "delete"}
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

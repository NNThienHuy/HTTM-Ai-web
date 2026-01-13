"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";

type AdminOrderRow = {
  id: string;
  customerName: string;
  country?: string;
  status: string;
  subtotal: number;
  createdAt?: string | null;
};

async function safeReadJson(res: Response) {
  const text = await res.text(); // đọc text trước để tránh crash khi BE trả HTML
  try {
    return JSON.parse(text);
  } catch {
    // trả lại text để bạn nhìn thấy BE đang trả gì (HTML error, etc.)
    throw new Error(text.slice(0, 2000));
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setErr("");

      try {
        // ✅ Admin route đúng theo routes/api.php
        const res = await apiClient.get("/api/admin/orders");

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 800)}`);
        }

        const data = await safeReadJson(res);

        // Hỗ trợ nhiều kiểu BE trả về:
        // 1) { data: [...] }
        // 2) { orders: [...] }
        // 3) [...] (mảng trực tiếp như OrderController@index đang làm)
        const rawList = Array.isArray(data) ? data : data?.data ?? data?.orders ?? [];

        const mapped: AdminOrderRow[] = rawList.map((o: any) => ({
          id: String(o.order_id ?? o.id),
          customerName: o.customer_name ?? o.customerName ?? o.name ?? "",
          country: o.shipping_city ?? o.country ?? o.shipping_district ?? "",
          status: o.status ?? "pending",
          subtotal: Number(o.total_amount ?? o.subtotal ?? o.total ?? 0),
          createdAt: o.created_at ?? o.order_date ?? o.createdAt ?? null,
        }));

        setOrders(mapped);
      } catch (e: any) {
        setErr(e?.message || "Fetch orders failed");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="xl:ml-5 w-full max-xl:mt-5">
      <h1 className="text-3xl font-semibold text-center mb-5">All orders</h1>

      {err && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {err}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-md table-pin-cols">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" disabled />
                  </label>
                </th>
                <th>Order ID</th>
                <th>Name and country</th>
                <th>Status</th>
                <th>Subtotal</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <p className="font-bold">#{o.id}</p>
                  </td>

                  <td>
                    <div className="font-bold">{o.customerName}</div>
                    <div className="text-sm opacity-50">{o.country || "—"}</div>
                  </td>

                  <td>
                    <span className="badge badge-success text-white badge-sm">{o.status}</span>
                  </td>

                  <td>
                    <p>{o.subtotal.toLocaleString("vi-VN")}₫</p>
                  </td>

                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : "—"}</td>

                  <td className="text-right">
                    {/* TODO: nút details / delete nếu bạn muốn */}
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
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

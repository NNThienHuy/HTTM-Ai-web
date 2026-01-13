
"use client";

import React, { useMemo, useState } from "react";
import { AdminOrderRow, deleteAdminOrder } from "@/lib/adminOrders";

const vnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function OrdersTable({ initialOrders }: { initialOrders: AdminOrderRow[] }) {
  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allChecked = useMemo(() => {
    if (orders.length === 0) return false;
    return orders.every((o) => selected[o.id]);
  }, [orders, selected]);

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      orders.forEach((o) => (next[o.id] = true));
      setSelected(next);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm(`Xoá đơn hàng #${id} ?`);
    if (!ok) return;

    setDeletingId(id);
    try {
      const done = await deleteAdminOrder(id);
      if (!done) {
        alert("Xoá thất bại (check API / quyền / CORS).");
        return;
      }
      setOrders((prev) => prev.filter((x) => x.id !== id));
      setSelected((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (orders.length === 0) {
    return <div className="py-10 text-center text-gray-500">Chưa có đơn hàng.</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">All orders</h2>

        <div className="text-sm text-gray-500">
          {Object.values(selected).filter(Boolean).length} selected
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="table w-full">
          <thead>
            <tr className="text-gray-600">
              <th className="w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th className="text-right">Subtotal</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const checked = !!selected[o.id];
              return (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelected((prev) => ({ ...prev, [o.id]: !checked }))}
                    />
                  </td>

                  <td className="font-semibold">#{o.id}</td>

                  <td>
                    <div className="font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.country || "—"}</div>
                  </td>

                  <td>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                      {o.status}
                    </span>
                  </td>

                  <td className="text-right font-semibold">{vnd(o.subtotal)}</td>

                  <td className="text-sm text-gray-600">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : "—"}
                  </td>

                  <td className="text-right">
                    <button
                      className="px-3 py-1 rounded-md border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      disabled={deletingId === o.id}
                      onClick={() => handleDelete(o.id)}
                    >
                      {deletingId === o.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

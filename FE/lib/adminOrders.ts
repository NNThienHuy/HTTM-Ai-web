import config from "@/lib/config";

export type AdminOrderRow = {
  id: string;
  customerName: string;
  country: string;
  status: string;
  subtotal: number;
  createdAt: string;
};

const API_BASE = (config.apiBaseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");

function extractList(json: any): any[] {
  // chịu nhiều format
  if (Array.isArray(json?.orders?.data)) return json.orders.data;
  if (Array.isArray(json?.orders)) return json.orders;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function pick(obj: any, paths: string[], fallback: any = "") {
  for (const p of paths) {
    const val = p.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
}

export async function getAdminOrders(): Promise<AdminOrderRow[]> {
  const res = await fetch(`${API_BASE}/api/admin/orders?per_page=50`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const list = extractList(json);

  return list.map((o: any) => {
    const id = String(pick(o, ["id", "order_id"], ""));
    const customerName = String(
      pick(o, ["customer_name", "name", "full_name", "user.name", "user.full_name"], "Unknown")
    );
    const country = String(pick(o, ["country", "shipping_address.country", "address.country", "user.country"], ""));
    const status = String(pick(o, ["status", "order_status"], "pending"));
    const subtotal = Number(pick(o, ["subtotal", "total", "total_price", "total_amount", "totalPrice"], 0)) || 0;
    const createdAt = String(pick(o, ["created_at", "date", "createdAt"], ""));

    return { id, customerName, country, status, subtotal, createdAt };
  }).filter((x) => x.id);
}

export async function deleteAdminOrder(orderId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  return res.ok;
}

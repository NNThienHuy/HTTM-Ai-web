import React from "react";
import OrdersTable from "@/components/admin/OrdersTable";
import { getAdminOrders } from "@/lib/adminOrders";

export default async function Page() {
  const orders = await getAdminOrders();
  return <OrdersTable initialOrders={orders} />;
}
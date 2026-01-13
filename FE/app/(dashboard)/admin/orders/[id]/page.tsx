"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Giả sử các component/lib này đã có sẵn như file cũ
import { DashboardSidebar } from "@/components"; 
import apiClient from "@/lib/api";
import { isValidEmailAddressFormat, isValidNameOrLastname } from "@/lib/utils";

// --- TYPE DEFINITIONS & ADAPTERS (Khớp với logic File 1) ---

interface OrderProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
  };
}

interface OrderDetail {
  id: string;
  // Customer Info
  name: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  // Shipping Info
  address: string; // Đổi từ 'adress' cho đúng chính tả
  apartment: string;
  city: string;
  country: string;
  postalCode: string;
  // Order Info
  status: "pending" | "processing" | "delivered" | "canceled";
  total: number;
  orderNotice: string;
  createdAt: string;
}

// Hàm chuẩn hóa dữ liệu từ BE (tránh crash nếu thiếu trường)
function adaptOrderDetail(o: any): OrderDetail {
  return {
    id: String(o?.id ?? o?.order_id ?? ""),
    name: o?.name ?? o?.firstname ?? "",
    lastname: o?.lastname ?? "",
    email: o?.email ?? o?.user?.email ?? "",
    phone: o?.phone ?? "",
    company: o?.company ?? "",
    address: o?.address ?? o?.adress ?? "", // Handle typo từ BE cũ
    apartment: o?.apartment ?? "",
    city: o?.city ?? "",
    country: o?.country ?? "",
    postalCode: o?.postalCode ?? o?.zip ?? "",
    status: o?.status ?? "processing",
    total: Number(o?.total ?? o?.grand_total ?? o?.amount ?? 0),
    orderNotice: o?.orderNotice ?? o?.note ?? "",
    createdAt: o?.created_at ?? o?.createdAt ?? "",
  };
}

// --- MAIN COMPONENT ---

const AdminSingleOrder = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Data State
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [products, setProducts] = useState<OrderProduct[]>([]);

  // 1. Fetch Data
  useEffect(() => {
    if (!params?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Gọi song song 2 API: Lấy thông tin đơn & Lấy sản phẩm
        const [resOrder, resProds] = await Promise.all([
          apiClient.get(`/api/admin/orders/${params.id}`),
          apiClient.get(`/api/admin/order-product/${params.id}`).catch(() => ({ ok: false })) // Fallback nếu API này lỗi
        ]);

        if (!resOrder.ok) throw new Error("Không tìm thấy đơn hàng");

        const orderJson = await resOrder.json();
        // Nếu API product trả về lỗi, ta coi như mảng rỗng
        const prodsJson = resProds.ok ? await (resProds as Response).json() : [];

        setOrder(adaptOrderDetail(orderJson));
        
        // Xử lý mảng product tùy vào cấu trúc BE trả về (data hoặc trực tiếp)
        const prodList = Array.isArray(prodsJson?.data) ? prodsJson.data : (Array.isArray(prodsJson) ? prodsJson : []);
        setProducts(prodList);

      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Lỗi tải thông tin đơn hàng");
        router.push("/admin/orders"); // Quay về nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id, router]);

  // 2. Update Order Logic
  const handleUpdate = async () => {
    if (!order) return;

    // Validate cơ bản
    if (!order.name || !order.lastname || !order.email || !order.address) {
      toast.error("Vui lòng điền các trường bắt buộc (Tên, Email, Địa chỉ)");
      return;
    }
    if (!isValidEmailAddressFormat(order.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    try {
      setUpdating(true);
      const res = await apiClient.put(`/api/admin/orders/${order.id}`, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order), // Gửi object đã chỉnh sửa lên
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Cập nhật đơn hàng thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  // 3. Delete Order Logic (Khớp với File 1: Delete Order -> Redirect)
  const handleDelete = async () => {
    if (!order?.id) return;
    
    const confirmDelete = confirm(`Bạn có chắc muốn xóa đơn #${order.id}? Hành động này không thể hoàn tác.`);
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      
      // Nếu BE cần xóa product trước (như code cũ của bạn), hãy giữ logic này. 
      // Tuy nhiên, chuẩn REST thường chỉ cần xóa Order cha là đủ (Cascade Delete).
      // Ở đây mình gọi xóa Order theo chuẩn file 1:
      const res = await apiClient.delete(`/api/admin/orders/${order.id}`);

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Đã xóa đơn hàng");
      router.push("/admin/orders"); // Chuyển hướng về danh sách
    } catch (error) {
      console.error(error);
      toast.error("Xóa đơn thất bại");
      setDeleting(false);
    }
  };

  // Helper change handler
  const handleChange = (field: keyof OrderDetail, value: any) => {
    setOrder((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!order) return <div className="p-10 text-center">Không tìm thấy đơn hàng.</div>;

  // Tính toán hiển thị tiền
  const shipFee = 5000;
  const tax = order.total * 0.2; // 20%
  const finalTotal = order.total + tax + shipFee;

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      
      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Chi tiết đơn hàng #{order.id}</h1>
          <Link href="/admin/orders" className="text-blue-500 hover:underline">
            &larr; Quay lại danh sách
          </Link>
        </div>

        {/* --- FORM INFO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1: Thông tin khách hàng */}
          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-bold text-lg">Thông tin khách hàng</h3>
            
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="label-text block mb-1">Tên</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={order.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="label-text block mb-1">Họ</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={order.lastname}
                  onChange={(e) => handleChange("lastname", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label-text block mb-1">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={order.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <label className="label-text block mb-1">Số điện thoại</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={order.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
             <div>
              <label className="label-text block mb-1">Công ty</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={order.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
          </div>

          {/* Cột 2: Địa chỉ giao hàng & Trạng thái */}
          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-bold text-lg">Vận chuyển & Trạng thái</h3>
            
            <div>
              <label className="label-text block mb-1">Địa chỉ</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={order.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="flex gap-2">
                <div className="w-1/2">
                    <label className="label-text block mb-1">Căn hộ/Phòng</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={order.apartment}
                        onChange={(e) => handleChange("apartment", e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                     <label className="label-text block mb-1">Thành phố</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={order.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex gap-2">
                 <div className="w-1/2">
                    <label className="label-text block mb-1">Quốc gia</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={order.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                    <label className="label-text block mb-1">Mã bưu chính</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={order.postalCode}
                        onChange={(e) => handleChange("postalCode", e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-2 border-t mt-4">
              <label className="label-text block mb-1 font-semibold text-blue-600">Trạng thái đơn hàng</label>
              <select
                className="select select-bordered w-full"
                value={order.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="pending">Chờ xử lý (Pending)</option>
                <option value="processing">Đang xử lý (Processing)</option>
                <option value="delivered">Đã giao (Delivered)</option>
                <option value="canceled">Đã hủy (Canceled)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- GHI CHÚ --- */}
        <div>
          <label className="label-text block mb-1">Ghi chú đơn hàng</label>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            value={order.orderNotice}
            onChange={(e) => handleChange("orderNotice", e.target.value)}
          ></textarea>
        </div>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-4">Sản phẩm đã đặt</h3>
          <div className="space-y-4">
            {products.length === 0 && <p className="text-gray-500">Không có thông tin sản phẩm.</p>}
            
            {products.map((p) => (
              <div className="flex items-center gap-x-4 bg-white p-3 rounded shadow-sm" key={p.id}>
                <div className="relative w-16 h-16 shrink-0">
                    <Image
                    src={p.product?.mainImage ? `/${p.product.mainImage}` : "/product_placeholder.jpg"}
                    alt={p.product?.title || "Product"}
                    fill
                    className="object-cover rounded"
                    />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${p.product?.slug}`} className="font-semibold text-blue-600 hover:underline">
                    {p.product?.title || "Unknown Product"}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Đơn giá: {p.product?.price?.toLocaleString("vi-VN")} đ | Số lượng: {p.quantity}
                  </p>
                </div>
                <div className="font-bold">
                    {((p.product?.price || 0) * p.quantity).toLocaleString("vi-VN")} đ
                </div>
              </div>
            ))}
          </div>

          {/* --- TỔNG TIỀN --- */}
          <div className="flex flex-col gap-y-2 mt-6 text-right border-t pt-4">
            <p>Tạm tính: {order.total.toLocaleString("vi-VN")} đ</p>
            <p>Thuế (20%): {tax.toLocaleString("vi-VN")} đ</p>
            <p>Phí Ship: {shipFee.toLocaleString("vi-VN")} đ</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              Tổng cộng: {finalTotal.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex gap-4 mt-2 justify-end">
          <button
            type="button"
            disabled={updating || deleting}
            className="btn btn-primary min-w-[150px] uppercase font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            onClick={handleUpdate}
          >
            {updating ? "Đang lưu..." : "Cập nhật đơn"}
          </button>
          
          <button
            type="button"
            disabled={updating || deleting}
            className="btn btn-error min-w-[150px] uppercase font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            onClick={handleDelete}
          >
            {deleting ? "Đang xóa..." : "Xóa đơn hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSingleOrder;
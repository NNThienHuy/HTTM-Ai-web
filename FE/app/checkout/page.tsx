"use client";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import config from "@/lib/config";

// --- Hàm xử lý ảnh ---
const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  
  // Xử lý đường dẫn tương đối từ Laravel Storage
  const cleanSrc = src.replace(/^\/+/, "");
  const baseUrl = config.apiBaseUrl?.replace(/\/+$/, "") || "http://localhost:8000";
  
  if (cleanSrc.startsWith("storage") || cleanSrc.startsWith("images")) {
      return `${baseUrl}/${cleanSrc}`;
  }
  return `/${cleanSrc}`;
};

const CheckoutPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { products, total, clearCart } = useProductStore();

  // State
  const [userId, setUserId] = useState<number | null>(null); // Lưu ID thực từ DB
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "", lastname: "", phone: "", email: "", company: "",
    adress: "", apartment: "", city: "", country: "", postalCode: "", orderNotice: "",
  });

  // Phí ship cố định (có thể đổi logic sau này)
  const SHIPPING_FEE = 5;
  const FINAL_TOTAL = total + SHIPPING_FEE;

  // --- 1. Tự động lấy thông tin User khi có Session ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user?.email) {
        try {
          // Gọi API mới thêm: /api/users/email/{email}
          const res = await apiClient.get(`/api/users/email/${session.user.email}`);
          if (res.ok) {
            const userData = await res.json();
            // Lưu user_id database
            setUserId(userData.id);
            
            // Tự động điền form (Optional)
            setCheckoutForm(prev => ({
              ...prev,
              email: userData.email || session.user?.email || "",
              name: userData.name || session.user?.name || "",
              // Nếu backend trả về phone hay address thì điền luôn ở đây
            }));
          }
        } catch (error) {
          console.error("Không lấy được thông tin user:", error);
        }
      }
    };
    fetchUserInfo();
  }, [session]);

  // --- 2. Validate Form ---
  const validateForm = () => {
    const errors: string[] = [];
    if (!checkoutForm.name.trim() || checkoutForm.name.trim().length < 2) errors.push("Tên phải ít nhất 2 ký tự");
    if (!checkoutForm.email.trim() || !/^\S+@\S+\.\S+$/.test(checkoutForm.email)) errors.push("Email không hợp lệ");
    if (!checkoutForm.phone.trim() || checkoutForm.phone.length < 10) errors.push("Số điện thoại không hợp lệ");
    if (!checkoutForm.adress.trim()) errors.push("Địa chỉ là bắt buộc");
    if (!checkoutForm.city.trim()) errors.push("Thành phố là bắt buộc");
    return errors;
  };

  // --- 3. Xử lý đặt hàng ---
  const makePurchase = async () => {
    // Validate
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return;
    }
    if (products.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ghép địa chỉ đầy đủ
      const fullShippingAddress = [
        checkoutForm.apartment,
        checkoutForm.adress,
        checkoutForm.city,
        checkoutForm.country,
        checkoutForm.postalCode
      ].filter(Boolean).join(", ");

      // Chuẩn bị dữ liệu gửi lên
      const orderData = {
        customer_name: `${checkoutForm.name} ${checkoutForm.lastname}`.trim(),
        customer_phone: checkoutForm.phone.trim(),
        customer_email: checkoutForm.email.trim().toLowerCase(),
        shipping_address: fullShippingAddress,
        payment_method: "COD", 
        company: checkoutForm.company.trim(),
        order_notes: checkoutForm.orderNotice.trim(), 
        status: "pending",
        total_amount: FINAL_TOTAL, // Gửi tổng tiền đã cộng ship
        user_id: userId // Gửi ID lấy được từ useEffect (hoặc null nếu khách vãng lai)
      };

      console.log("Sending Order Data:", orderData); // Debug log

      // Gửi request tạo đơn
      const response = await apiClient.post("/api/orders", orderData);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Tạo đơn hàng thất bại");
      }

      const data = await response.json();
      // Lấy ID đơn hàng vừa tạo (support cả cấu trúc trả về trực tiếp hoặc bọc trong data)
      const newOrderId = data.id || data.order?.id || data.data?.id;

      if (newOrderId) {
        // --- 4. Lưu chi tiết sản phẩm (Dùng Promise.all cho nhanh) ---
        const orderPromises = products.map(product => 
          apiClient.post("/api/order-product", {
            customerOrderId: newOrderId, // ID đơn hàng
            product_id: product.id,      // ID sản phẩm
            quantity: product.amount,    // Số lượng
            price: product.price         // (Optional) Gửi giá tại thời điểm mua để an toàn
          })
        );

        await Promise.all(orderPromises);
        
        // Thành công
        toast.success("Đặt hàng thành công!");
        clearCart();
        setCheckoutForm({
            name: "", lastname: "", phone: "", email: "", company: "",
            adress: "", apartment: "", city: "", country: "", postalCode: "", orderNotice: "",
        });
        
        // Dispatch event để update UI (ví dụ số lượng cart trên header)
        try { window.dispatchEvent(new CustomEvent('orderCompleted')); } catch (e) {}

        setTimeout(() => router.push("/"), 1500);
      } else {
        throw new Error("Không lấy được ID đơn hàng từ server");
      }

    } catch (error: any) {
      console.error("💥 Error makePurchase:", error);
      let errorMsg = "Có lỗi xảy ra.";
      try {
        // Cố gắng parse lỗi JSON từ server nếu có
        const parsed = JSON.parse(error.message);
        if (parsed.errors) {
            // Lấy lỗi đầu tiên trong object errors
            const firstKey = Object.keys(parsed.errors)[0];
            errorMsg = parsed.errors[firstKey][0];
        } else if (parsed.message) {
            errorMsg = parsed.message;
        }
      } catch (e) {
         // Nếu không parse được thì dùng message gốc
         if (error.message && !error.message.includes("<!DOCTYPE")) errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check giỏ hàng trống khi vào trang
  useEffect(() => {
    if (products.length === 0) {
      toast.error("Giỏ hàng trống");
      router.push("/cart");
    }
  }, [products, router]);

  return (
    <div className="bg-white">
      <SectionTitle title="Thanh Toán" path="Trang chủ | Thanh Toán" />
      <main className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 p-5">
        
        {/* CỘT TRÁI: FORM */}
        <form className="pt-10">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Thông tin giao hàng</h2>
            
            {/* Tên & Họ */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên *</label>
                    <input type="text" required value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ</label>
                    <input type="text" value={checkoutForm.lastname}
                        onChange={(e) => setCheckoutForm({...checkoutForm, lastname: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>

            {/* Email */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input type="email" required value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* Phone */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                <input type="tel" required value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* Địa chỉ */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ (Số nhà, đường) *</label>
                <input type="text" required value={checkoutForm.adress}
                    onChange={(e) => setCheckoutForm({...checkoutForm, adress: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            {/* Thành phố & Quốc gia */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Thành phố *</label>
                    <input type="text" required value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quốc gia</label>
                    <input type="text" value={checkoutForm.country} placeholder="Việt Nam"
                        onChange={(e) => setCheckoutForm({...checkoutForm, country: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>

            {/* Ghi chú */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng</label>
                <textarea rows={3} value={checkoutForm.orderNotice}
                    onChange={(e) => setCheckoutForm({...checkoutForm, orderNotice: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <button type="button" onClick={makePurchase} disabled={isSubmitting}
                className={`w-full text-white py-3 px-4 rounded-md font-bold transition-colors ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}>
                {isSubmitting ? "Đang xử lý..." : `THANH TOÁN $${FINAL_TOTAL.toLocaleString()}`}
            </button>
        </form>

        {/* CỘT PHẢI: CHI TIẾT ĐƠN HÀNG */}
        <div className="bg-gray-50 p-6 rounded-lg mt-10 lg:mt-0 h-fit border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Đơn hàng của bạn</h2>
            <ul className="divide-y divide-gray-200">
                {products.map((product) => {
                    // Xử lý logic ảnh an toàn cho TypeScript
                    const productImg = product.image || (product as any).mainImage || (product as any).main_image;
                    
                    return (
                        <li key={product.id} className="flex py-4">
                            <div className="h-16 w-16 flex-none rounded-md border border-gray-200 overflow-hidden relative bg-white">
                                <Image 
                                    src={buildImgSrc(productImg)} 
                                    alt={product.title} 
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                />
                            </div>
                            <div className="ml-4 flex-auto">
                                <h3 className="font-medium text-sm text-gray-900">{product.title}</h3>
                                <p className="text-gray-500 text-sm">Số lượng: {product.amount}</p>
                            </div>
                            <p className="font-medium text-sm text-gray-900">${Number(product.price).toLocaleString()}</p>
                        </li>
                    );
                })}
            </ul>
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <dt className="text-gray-600">Tạm tính</dt>
                    <dd className="font-medium">${total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-gray-600">Phí vận chuyển</dt>
                    <dd className="font-medium">${SHIPPING_FEE}</dd>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 text-gray-900">
                    <dt>Tổng cộng</dt>
                    <dd className="text-blue-600">${FINAL_TOTAL.toLocaleString()}</dd>
                </div>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-100 flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-sm text-blue-800">
                    <strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị tiền mặt khi shipper giao tới.
                </p>
            </div>
        </div>

      </main>
    </div>
  );
};

export default CheckoutPage;
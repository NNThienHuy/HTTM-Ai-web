import React from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";
// import apiClient from "@/lib/api"; // <-- KHÔNG DÙNG NỮA VÌ ĐÂY LÀ SERVER COMPONENT

/**
 * Hàm này lấy dữ liệu trên server.
 * Chúng ta dùng 'fetch' trực tiếp thay vì 'apiClient' vì 'apiClient'
 * sử dụng 'getSession' (client-side) không tương thích với Server Component.
 */
const fetchProducts = async () => {
  // Lấy URL của API từ biến môi trường
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const endpoint = `${baseUrl}/api/products`;

  try {
    // *** SỬA LỖI Ở ĐÂY: Dùng fetch API tiêu chuẩn ***
    const data = await fetch(endpoint, {
      cache: "no-store", // Đảm bảo dữ liệu luôn mới (giống useEffect)
    });

    if (!data.ok) {
      console.error("Failed to fetch products:", data.statusText);
      return []; // Trả về mảng rỗng nếu lỗi
    }

    const result = await data.json();

    // API backend trả về cấu trúc { data: [...] }
    if (result && Array.isArray(result.data)) {
      return result.data; // Trả về mảng sản phẩm
    }

    // Dự phòng nếu API trả về mảng trực tiếp
    if (Array.isArray(result)) {
      return result;
    }

    return []; // Trả về rỗng nếu cấu trúc không như mong đợi
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Trả về mảng rỗng nếu có ngoại lệ
  }
};

const ProductsSection = async () => {
  // Gọi hàm fetch data (hàm này giờ đã an toàn để chạy trên server)
  const products = await fetchProducts();

  return (
    <div className="bg-blue-500 border-t-4 border-white">
      <div className="max-w-screen-2xl mx-auto pt-20">
        <Heading title="SẢN PHẨM NỔI BẬT" />
        <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-2 px-10 gap-y-8 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductItem key={product.id} product={product} color="white" />
            ))
          ) : (
            <div className="col-span-full text-center text-white py-10">
              <p>Hiện chưa có sản phẩm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
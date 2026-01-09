import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";
import { Product } from "@/lib/types";

// Hàm xử lý đường dẫn ảnh
const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const cleaned = src.replace(/^\/+/, "");
  return `/${cleaned}`;
};

const ProductItem = ({ product, color }: { product: Product; color: string }) => {
  const imgSrc = buildImgSrc(product.mainImage);

  // --- SỬA LỖI URL TẠI ĐÂY ---
  // Sử dụng ID làm định danh duy nhất cho URL. 
  // Thêm fallback product.product_id phòng trường hợp dữ liệu chưa map field 'id'
  // @ts-ignore
  const productId = product.id || product.product_id;
  
  // Nếu không tìm thấy ID thì dùng dấu # để tránh crash trang
  const href = productId ? `/product/${productId}` : "#";

  return (
    <div className="flex flex-col items-center gap-y-2 group">
      {/* 1. Link bọc hình ảnh */}
      <Link href={href} className="cursor-pointer">
        <Image
          src={imgSrc}
          width={300}
          height={300}
          // Thêm hiệu ứng zoom nhẹ khi hover
          className="w-auto h-[300px] object-contain transition-transform duration-300 group-hover:scale-105"
          alt={sanitize(product?.title) || "Product image"}
        />
      </Link>

      {/* 2. Link bọc tên sản phẩm */}
      <Link
        href={href}
        className={
          color === "black"
            ? "text-xl text-black font-normal mt-2 uppercase hover:text-blue-600 transition-colors"
            : "text-xl text-white font-normal mt-2 uppercase hover:text-blue-300 transition-colors"
        }
      >
        {sanitize(product.title)}
      </Link>

      {/* 3. Giá tiền */}
      <p
        className={
          color === "black"
            ? "text-lg text-black font-semibold"
            : "text-lg text-white font-semibold"
        }
      >
        ${Number(product.price).toLocaleString()}
      </p>


      {/* 5. Nút Xem chi tiết */}
      <Link
        href={href}
        className="block flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-gray-300 font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 mt-2"
      >
        Xem chi tiết
      </Link>
    </div>
  );
};

export default ProductItem;
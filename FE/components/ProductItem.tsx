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

// Tạo href chuẩn: /product/slug/id
const buildHref = (product: any) => {
  const id = product?.id ?? product?.product_id;
  const slug = (product?.slug ?? "product").toString();

  if (!id) return "#";
  return `/product/${encodeURIComponent(slug)}/${encodeURIComponent(String(id))}`;
};

const ProductItem = ({ product, color }: { product: Product; color: string }) => {
  const imgSrc = buildImgSrc(product?.mainImage);
  const href = buildHref(product);

  return (
    // ✅ h-full + flex-col => đồng đều chiều cao
    <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link href={href} className="block">
        {/* ✅ Khung ảnh cố định => không lệch layout */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
          <Image
            src={imgSrc}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            alt={sanitize(product?.title) || "Product image"}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col">
        {/* Title */}
        <Link
          href={href}
          title={sanitize(product?.title || "")}
          className={
            color === "black"
              ? "text-base font-semibold text-black uppercase hover:text-blue-600 transition-colors line-clamp-2"
              : "text-base font-semibold text-white uppercase hover:text-blue-300 transition-colors line-clamp-2"
          }
        >
          {sanitize(product?.title || "")}
        </Link>

        {/* Price + Rating */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className={color === "black" ? "text-lg font-bold text-black" : "text-lg font-bold text-white"}>
            ${Number(product?.price ?? 0).toLocaleString()}
          </p>
          <ProductItemRating productRating={Number(product?.rating ?? 0)} />
        </div>

        {/* Button luôn nằm đáy */}
        <Link
          href={href}
          className="mt-auto inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white py-2 text-sm font-bold text-blue-600 uppercase
                     hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default ProductItem;

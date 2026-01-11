import Image from "next/image";
import Link from "next/link";
import React from "react";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";
import { Product } from "@/lib/types";

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/${src.replace(/^\/+/, "")}`;
};

const ProductItem = ({ product, color }: { product: Product; color: string }) => {
  const productId = product?.id ?? product?.product_id;
  const href = productId ? `/product/${productId}` : "#";

  const imgSrc = buildImgSrc(product?.mainImage);

  return (
    <div
      className={[
        "w-full max-w-[260px]",
        "rounded-xl border border-gray-200 bg-white",
        "shadow-sm hover:shadow-md transition",
        "overflow-hidden",
      ].join(" ")}
    >
      <Link href={href} className="block">
        <div className="relative w-full aspect-square bg-gray-50">
          <Image
            src={imgSrc}
            alt={sanitize(product?.title) || "Product image"}
            fill
            className="object-contain p-3"
            sizes="260px"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2">
        <Link
          href={href}
          className={[
            "font-semibold uppercase line-clamp-2 min-h-[44px]",
            color === "black" ? "text-gray-900 hover:text-blue-600" : "text-white hover:text-blue-200",
          ].join(" ")}
          title={sanitize(product?.title)}
        >
          {sanitize(product?.title)}
        </Link>

        <div className="flex items-center justify-between">
          <p className={color === "black" ? "text-gray-900 font-bold" : "text-white font-bold"}>
            ${Number(product?.price ?? 0).toLocaleString()}
          </p>
        </div>

        <Link
          href={href}
          className="mt-2 inline-flex items-center justify-center w-full rounded-lg
                     border border-blue-600 text-blue-600 font-bold py-2
                     hover:bg-blue-600 hover:text-white transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default ProductItem;

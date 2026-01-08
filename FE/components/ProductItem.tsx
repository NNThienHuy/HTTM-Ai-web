import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { sanitize } from "@/lib/sanitize";
import { Product } from "@/lib/types";

const buildImgSrc = (src?: string) => {

  if (!src) return "/product_placeholder.jpg";

  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const cleaned = src.replace(/^\/+/, "");

  return `/${cleaned}`;
};

const ProductItem = ({ product, color }: { product: Product; color: string }) => {
  const imgSrc = buildImgSrc(product.mainImage);
  const href = `/product/${product.slug || "product"}/${product.id}`;

  return (
    <div className="flex flex-col items-center gap-y-2">
      <Link href={href}>
        <Image
          src={imgSrc}
          width={300}
          height={300}
          className="w-auto h-[300px] object-contain"
          alt={sanitize(product?.title) || "Product image"}
        />
      </Link>

      <Link
        href={href}
        className={
          color === "black"
            ? "text-xl text-black font-normal mt-2 uppercase"
            : "text-xl text-white font-normal mt-2 uppercase"
        }
      >
        {sanitize(product.title)}
      </Link>

      <p
        className={
          color === "black"
            ? "text-lg text-black font-semibold"
            : "text-lg text-white font-semibold"
        }
      >
        ${product.price}
      </p>

      <ProductItemRating productRating={product?.rating} />

      <Link
        href={href}
        className="block flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
      >
        <p>Xem sản phẩm</p>
      </Link>
    </div>
  );
};

export default ProductItem;

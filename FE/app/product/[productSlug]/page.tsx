import {
  StockAvailabillity,
  SingleProductRating,
  ProductTabs,
  SingleProductDynamicFields,
  AddToWishlistBtn,
} from "@/components";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import { FaSquareFacebook, FaSquareXTwitter, FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import config from "@/lib/config";

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/${src.replace(/^\/+/, "")}`;
};

async function fetchProductBySlug(slug: string) {
  // ✅ dùng index + search để lấy list, rồi tìm slug trùng
  const url = `${config.apiBaseUrl}/api/products?search=${encodeURIComponent(slug)}&per_page=50`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);

  // Laravel: { success: true, products: { data: [...] } }
  const list = Array.isArray(json?.products?.data) ? json.products.data : [];
  const product = list.find((p: any) => p?.slug === slug) ?? null;
  return product;
}

export default async function SingleProductPage({
  params,
}: {
  params: { productSlug: string };
}) {
  const product = await fetchProductBySlug(params.productSlug);
  if (!product) notFound();

  // map nhanh cho UI bạn đang dùng
  const uiProduct = {
    ...product,
    title: product.name ?? product.title ?? "",
    mainImage: product.mainImage ?? product.main_image ?? product.image ?? "",
    inStock: product.inStock ?? product.stock_quantity ?? 0,
    manufacturer: product.manufacturer ?? product.brand?.name ?? "",
    rating: product.rating ?? 0,
  };

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-center gap-x-16 pt-10 max-lg:flex-col items-center gap-y-5 px-5">
          <div>
            <Image
              src={buildImgSrc(uiProduct.mainImage)}
              width={500}
              height={500}
              alt="main image"
              className="w-auto h-auto"
            />
          </div>

          <div className="flex flex-col gap-y-7 text-black max-[500px]:text-center">
            <SingleProductRating rating={uiProduct.rating} />
            <h1 className="text-3xl">{sanitize(uiProduct.title)}</h1>
            <p className="text-xl font-semibold">${uiProduct.price}</p>
            <StockAvailabillity stock={94} inStock={uiProduct.inStock} />
            <SingleProductDynamicFields product={uiProduct} />

            <div className="flex flex-col gap-y-2 max-[500px]:items-center">
              <AddToWishlistBtn product={uiProduct} slug={params.productSlug} />

              <div className="text-lg flex gap-x-2">
                <span>Share:</span>
                <div className="flex items-center gap-x-1 text-2xl">
                  <FaSquareFacebook />
                  <FaSquareXTwitter />
                  <FaSquarePinterest />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16">
          <ProductTabs product={uiProduct} />
        </div>
      </div>
    </div>
  );
}

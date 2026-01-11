import React from "react";
import { searchProducts } from "@/lib/data";
import ProductItem from "@/components/ProductItem";

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const products = q ? await searchProducts(q) : [];

  return (
    <div className="max-w-screen-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-semibold text-black">
        Kết quả tìm kiếm: <span className="text-blue-600">{q || "..."}</span>
      </h1>

      {products.length === 0 ? (
        <p className="mt-6 text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((p) => (
            <ProductItem key={p.id} product={p as any} color="black" />
          ))}
        </div>
      )}
    </div>
  );
}
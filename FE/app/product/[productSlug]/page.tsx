import React from "react";
import Image from "next/image";
import { SingleProductDynamicFields } from "@/components"; 
import { sanitize, sanitizeHtml } from "@/lib/sanitize";
import config from "@/lib/config";
import { Product } from "@/lib/types";

// ... (Hàm buildImgSrc và fetchProductById GIỮ NGUYÊN) ...
const buildImgSrc = (src?: string) => {
  if (!src || src === "") return "/product_placeholder.jpg";
  if (src.startsWith("http")) return src;
  if (src.includes("storage")) {
    const baseUrl = config.apiBaseUrl?.replace(/\/+$/, "") || "http://localhost:8000";
    const cleanSrc = src.replace(/^\/+/, "");
    return `${baseUrl}/${cleanSrc}`;
  }
  return `/${src.replace(/^\/+/, "")}`;
};

async function fetchProductById(id: string) {
  try {
    const url = `${config.apiBaseUrl}/api/products/${id}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.product || null;
  } catch (error) {
    return null;
  }
}

// --- SỬA PHẦN NÀY ---
export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>; // 1. Thêm Promise vào type
}) {
  // 2. Await params trước khi dùng
  const resolvedParams = await params;
  const productId = resolvedParams.productSlug;

  // Kiểm tra nếu productId bị "undefined" (do link sai)
  if (!productId || productId === "undefined") {
     return <div className="p-10 text-center text-red-500">Lỗi: ID sản phẩm không hợp lệ.</div>;
  }

  const rawProduct = await fetchProductById(productId);

  if (!rawProduct) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-500 text-xl font-bold">
        Không tìm thấy sản phẩm #{productId}
      </div>
    );
  }

  // Map dữ liệu
  const uiProduct: Product = {
    ...rawProduct,
    id: rawProduct.product_id || rawProduct.id, 
    title: rawProduct.name ?? rawProduct.title ?? "Sản phẩm",
    price: Number(rawProduct.price ?? 0),
    mainImage: rawProduct.image_url ?? rawProduct.main_image ?? "/product_placeholder.jpg",
    inStock: Number(rawProduct.stock_quantity ?? 0),
    description: rawProduct.description ?? "",
    slug: productId,
  };

  return (
    <div className="bg-white text-black min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* CỘT ẢNH */}
          <div className="w-full md:w-1/2 flex justify-center bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
            <Image
              src={buildImgSrc(uiProduct.mainImage)}
              width={600}
              height={600}
              alt={uiProduct.title}
              className="object-contain w-full h-auto max-h-[500px]"
              priority
            />
          </div>

          {/* CỘT THÔNG TIN */}
          <div className="w-full md:w-1/2 flex flex-col gap-y-6">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {sanitize(uiProduct.title)}
            </h1>

            <div className="flex items-center gap-x-4">
               <p className="text-3xl font-bold text-blue-600">
                {uiProduct.price.toLocaleString('vi-VN')} đ
              </p>
               <span className={`px-3 py-1 rounded-full text-sm font-medium ${uiProduct.inStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {uiProduct.inStock > 0 ? "Còn hàng" : "Hết hàng"}
               </span>
            </div>

            <div className="divider my-0"></div>

            <div className="py-2">
                <SingleProductDynamicFields product={uiProduct} />
            </div>
          </div>
        </div>

        {/* MÔ TẢ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">
            Chi tiết sản phẩm
          </h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed bg-white">
            {uiProduct.description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(uiProduct.description),
                }}
              />
            ) : (
              <p className="text-gray-400 italic">Đang cập nhật nội dung...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
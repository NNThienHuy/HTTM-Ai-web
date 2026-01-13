import Image from "next/image";
import { notFound } from "next/navigation";
import { SingleProductDynamicFields } from "@/components";
import { sanitize, sanitizeHtml } from "@/lib/sanitize";
import config from "@/lib/config";
import { Product } from "@/lib/types";
import SimilarProductsSlider from "@/components/SimilarProductsSlider";

const buildImgSrc = (src?: string) => {
  if (!src || src === "") return "/product_placeholder.jpg";

  // remote
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const baseUrl = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  // nếu BE trả "storage/..." hoặc "/storage/..."
  if (clean.startsWith("storage/")) return `${baseUrl}/${clean}`;

  // nếu bạn có kiểu đường dẫn khác từ BE, thêm rule ở đây

  // local public
  return `/${clean}`;
};

async function fetchProductById(id: string) {
  try {
    const base = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
    const url = `${base}/api/products/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = await res.json().catch(() => null);
    return json?.product ?? null;
  } catch {
    return null;
  }
}

export default async function SingleProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;

  if (!productId || productId === "undefined") {
    return (
      <div className="p-10 text-center text-red-500">
        Lỗi: ID sản phẩm không hợp lệ.
      </div>
    );
  }

  const rawProduct = await fetchProductById(productId);
  if (!rawProduct) {
    // bạn muốn hiện UI báo lỗi thì giữ return div,
    // còn muốn đúng chuẩn Next 404 thì dùng notFound()
    notFound();
  }

  // ✅ Map dữ liệu an toàn (tránh thiếu field)
  const uiProduct: Product = {
    ...rawProduct,
    id: String(rawProduct.product_id ?? rawProduct.id ?? productId),
    title: rawProduct.name ?? rawProduct.title ?? "Sản phẩm",
    price: Number(rawProduct.price ?? 0),
    mainImage:
      rawProduct.image_url ??
      rawProduct.main_image ??
      rawProduct.mainImage ??
      rawProduct.image ??
      "",
    inStock: Number(rawProduct.stock_quantity ?? rawProduct.inStock ?? rawProduct.stock ?? 0),
    description: rawProduct.description ?? "",
    slug: rawProduct.slug ?? String(productId), // slug để tạm cũng được

    category_id: rawProduct?.category?.id ?? rawProduct?.category_id ?? 0,
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
              alt={sanitize(uiProduct.title)}
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
                {Number(uiProduct.price).toLocaleString("vi-VN")} VND
              </p>

              <span
                className={[
                  "px-3 py-1 rounded-full text-sm font-medium",
                  uiProduct.inStock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
                ].join(" ")}
              >
                {uiProduct.inStock > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>

            <div className="divider my-0" />

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
        <SimilarProductsSlider
          currentProductId={String(uiProduct.id)}
          categoryId={uiProduct.category_id}
          title="Các sản phẩm tương tự dành cho bạn"
          limit={8}
        />
      </div>
    </div>
  );
}

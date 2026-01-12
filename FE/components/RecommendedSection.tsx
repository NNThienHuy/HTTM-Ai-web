"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";
import SectionTitle from "./SectionTitle";

const asArray = (json: any): any[] => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.recommendations)) return json.recommendations; // <-- Thêm dòng này phòng khi cấu trúc thay đổi
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

export default function RecommendedSection() {
  const { status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Nếu chưa đăng nhập thì không tải (hoặc có thể tải gợi ý chung tùy logic)
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      (async () => {
        try {
          const res = await apiClient.get("/api/recommendations/personalized", {
            cache: "no-store",
          });

          if (!res.ok) {
            setProducts([]);
            return;
          }

          const json = await res.json();
          const rawList = asArray(json);

          // --- BƯỚC QUAN TRỌNG: MAP DỮ LIỆU TỪ BACKEND SANG FRONTEND ---
          const mappedList: Product[] = rawList.map((item: any) => {
            // Nếu API trả về cấu trúc bọc (wrapper) có chứa 'product' và 'score'
            const p = item.product || item; 

            return {
              id: String(p.product_id ?? p.id),
              title: p.name ?? p.title ?? "Sản phẩm",
              price: Number(p.price ?? 0),
              // Ánh xạ image_url từ DB sang mainImage của FE
              mainImage: p.image_url ?? p.main_image ?? p.image ?? "", 
              inStock: Number(p.stock_quantity ?? p.inStock ?? 0),
              description: p.description ?? "",
              slug: p.slug ?? String(p.product_id ?? p.id),
            };
          });
          // -------------------------------------------------------------

          setProducts(mappedList.slice(0, 8));
        } catch (e) {
          console.error("Lỗi khi tải gợi ý:", e);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [status]);

  const canShow = useMemo(() => !loading && products.length > 0, [loading, products.length]);
  
  if (!loading && products.length === 0) return null;

  const scrollByOneCard = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-card='card']");
    const gap = 16; 
    const amount = (firstCard?.offsetWidth ?? 300) + gap;

    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 max-w-screen-2xl mx-auto px-5">
      <SectionTitle title="Gợi ý riêng cho bạn" path="Dựa trên sở thích" />

      {loading ? (
        <div className="text-center py-10">Đang tải gợi ý...</div>
      ) : (
        <div className="relative mt-8">

          {canShow && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByOneCard("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ‹
            </button>
          )}

          {canShow && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByOneCard("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ›
            </button>
          )}

          <div
            ref={scrollerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-1 [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {products.map((product) => (
              <div
                key={String(product.id)}
                data-card="card"
                className={
                  "shrink-0 snap-start " +
                  "basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                }
              >
                <div className="h-full rounded-xl border border-gray-200 bg-white p-4">
                  {/* Bây giờ product đã có mainImage, component này sẽ tự xử lý buildImgSrc */}
                  <ProductItem product={product} color="black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
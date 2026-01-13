"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";
import SectionTitle from "./SectionTitle";

const GAP_PX = 16; // gap-4
const STEP = 3;    // bấm 1 lần trượt 3 card

const asArray = (json: any): any[] => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.recommendations)) return json.recommendations;
  if (Array.isArray(json?.data)) return json.data;
  return [];
};

export default function RecommendedSection() {
  const { status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // chưa login => không load
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (status !== "authenticated") return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const res = await apiClient.get("/api/recommendations/personalized", {
          cache: "no-store",
        });

        if (!res.ok) {
          if (mounted) setProducts([]);
          return;
        }

        const json = await res.json();
        const rawList = asArray(json);

        const mappedList: Product[] = rawList.map((item: any) => {
          const p = item?.product || item;

          const id = p?.product_id ?? p?.id;
          return {
            // Product type của bạn đang dùng string/id lẫn lộn => ép về string cho an toàn
            id: String(id ?? ""),
            title: p?.name ?? p?.title ?? "Sản phẩm",
            price: Number(p?.price ?? 0),
            mainImage: p?.image_url ?? p?.main_image ?? p?.image ?? "",
            inStock: Number(p?.stock_quantity ?? p?.inStock ?? 0),
            description: p?.description ?? "",
            slug: p?.slug ?? String(id ?? ""),
          } as Product;
        });

        if (mounted) setProducts(mappedList.slice(0, 8)); // ✅ 8 sản phẩm
      } catch (e) {
        console.error("Lỗi khi tải gợi ý:", e);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  // ✅ chỉ hiện nút khi > 5 sản phẩm (đúng yêu cầu)
  const showNav = useMemo(() => !loading && products.length > 5, [loading, products.length]);

  const getCardWidth = () => {
    const el = scrollerRef.current;
    if (!el) return 320;
    const first = el.querySelector<HTMLElement>("[data-card='card']");
    return first?.getBoundingClientRect().width ?? 320;
  };

  const scrollByStep = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    const cardW = getCardWidth();
    const amount = (cardW + GAP_PX) * STEP;

    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 max-w-screen-2xl mx-auto px-5">
      {/* path ở SectionTitle thường là URL, nếu bạn muốn subtitle thì sửa component SectionTitle */}
      <SectionTitle title="Gợi ý riêng cho bạn" path="/shop" />

      {loading ? (
        <div className="text-center py-10">Đang tải gợi ý...</div>
      ) : (
        <div className="relative mt-8">
          {showNav && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByStep("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ‹
            </button>
          )}

          {showNav && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByStep("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ›
            </button>
          )}

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-1
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={String(product.id)}
                data-card="card"
                className="shrink-0 snap-start basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                {/* ProductItem đã có card style rồi thì bỏ wrapper này,
                    còn nếu muốn card đôi thì giữ wrapper và bỏ border ở ProductItem */}
                <ProductItem product={product} color="black" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

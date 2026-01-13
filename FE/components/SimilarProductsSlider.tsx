"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";

const GAP_PX = 16; // gap-4
const STEP = 3; // bấm 1 lần trượt 3 card

function pickArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.products?.data)) return json.products.data;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

function mapToProduct(p: any): Product {
  const id = p?.product_id ?? p?.id ?? "";
  return {
    id: String(id),
    title: p?.name ?? p?.title ?? "Sản phẩm",
    price: Number(p?.price ?? 0),
    mainImage: p?.image_url ?? p?.main_image ?? p?.image ?? "",
    inStock: Number(p?.stock_quantity ?? p?.inStock ?? 0),
    description: p?.description ?? "",
    slug: p?.slug ?? String(id),
  } as Product;
}

export default function SimilarProductsSlider({
  currentProductId,
  categoryId,
  title = "Các sản phẩm tương tự dành cho bạn",
  limit = 8,
}: {
  currentProductId: string;
  categoryId?: string | number;
  title?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // chỉ show nút khi nhiều hơn 5 sp (đúng “5 hiện + 3 sau”)
  const showNav = useMemo(() => !loading && items.length > 5, [loading, items.length]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // ✅ lấy theo category nếu có
        const qs = categoryId ? `?category_id=${encodeURIComponent(String(categoryId))}` : "";
        const res = await apiClient.get(`/api/products${qs}`, { cache: "no-store" });

        if (!res.ok) {
          if (mounted) setItems([]);
          return;
        }

        const json = await res.json();
        const list = pickArray(json);

        const mapped = list
          .map(mapToProduct)
          .filter((p: Product) => String(p.id) !== String(currentProductId))
          .slice(0, limit);

        if (mounted) setItems(mapped);
      } catch (e) {
        console.error("Load similar products error:", e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentProductId, categoryId, limit]);

  const updateNavState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const left = el.scrollLeft;
    const maxLeft = el.scrollWidth - el.clientWidth;

    // nới 1 tí để tránh float lệch
    setCanLeft(left > 2);
    setCanRight(left < maxLeft - 2);
  }, []);

  useEffect(() => {
    if (!showNav) return;

    const el = scrollerRef.current;
    if (!el) return;

    updateNavState();

    const onScroll = () => updateNavState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => updateNavState();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [showNav, items.length, updateNavState]);

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

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-14">
      <h3 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">{title}</h3>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="relative">
          {showNav && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByStep("left")}
              disabled={!canLeft}
              className={[
                "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-black/60 text-white",
                "flex items-center justify-center hover:bg-black/80",
                !canLeft ? "opacity-40 pointer-events-none" : "",
              ].join(" ")}
            >
              ‹
            </button>
          )}

          {showNav && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByStep("right")}
              disabled={!canRight}
              className={[
                "absolute -right-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-black/60 text-white",
                "flex items-center justify-center hover:bg-black/80",
                !canRight ? "opacity-40 pointer-events-none" : "",
              ].join(" ")}
            >
              ›
            </button>
          )}

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-1
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p) => (
              <div
                key={String(p.id)}
                data-card="card"
                className={[
                  "shrink-0 snap-start",
                  // ✅ Desktop: đúng 5 card, không bị tụt còn 4
                  "basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-[calc((100%-64px)/5)]",
                ].join(" ")}
              >
                <ProductItem product={p} color="black" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

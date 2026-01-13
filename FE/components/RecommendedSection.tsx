"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";
import SectionTitle from "./SectionTitle";

const GAP_PX = 16; 
const STEP = 3;    

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
  const rafRef = useRef<number | null>(null);


  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateNavState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    const left = el.scrollLeft;
    const EPS = 2;

    setCanLeft(left > EPS);
    setCanRight(left < max - EPS);
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateNavState());
  }, [updateNavState]);

  useEffect(() => {
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
            id: String(id ?? ""),
            title: p?.name ?? p?.title ?? "Sản phẩm",
            price: Number(p?.price ?? 0),
            mainImage: p?.image_url ?? p?.main_image ?? p?.image ?? "",
            inStock: Number(p?.stock_quantity ?? p?.inStock ?? 0),
            description: p?.description ?? "",
            slug: p?.slug ?? String(id ?? ""),
          } as Product;
        });

        if (mounted) setProducts(mappedList.slice(0, 8)); 
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

  const showNav = useMemo(
    () => !loading && products.length > 5,
    [loading, products.length]
  );

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

    scheduleUpdate();
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    scheduleUpdate();

    const onScroll = () => scheduleUpdate();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => scheduleUpdate();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [products.length, loading, scheduleUpdate]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 max-w-screen-2xl mx-auto px-5">
      <SectionTitle title="Gợi ý riêng cho bạn" path="" />

      {loading ? (
        <div className="text-center py-10">Đang tải gợi ý...</div>
      ) : (
        <div className="relative mt-8">
          {showNav && canLeft && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByStep("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-[999]
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ‹
            </button>
          )}

          {showNav && canRight && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByStep("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-[999]
                         w-10 h-10 rounded-full bg-black/60 text-white
                         flex items-center justify-center hover:bg-black/80"
            >
              ›
            </button>
          )}

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3
                       px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={String(product.id)}
                data-card="card"
                className="shrink-0 snap-start
                           basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <ProductItem product={product} color="black" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";

const RecommendedSection = () => {
  const { status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);

  const TOTAL = 8;
  const STEP = 3;

  const scrollByItems = (dir: "prev" | "next") => {
    const el = viewportRef.current;
    if (!el) return;

    const first = el.querySelector<HTMLElement>("[data-card='1']");
    const cardW = first?.getBoundingClientRect().width ?? 260;
    const gap = 16; 
    const delta = (cardW + gap) * STEP * (dir === "next" ? 1 : -1);

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      const fetchRecommendations = async () => {
        try {
          const response = await apiClient.get("/api/recommendations/personalized", {
            cache: "no-store",
          });

          if (!response.ok) return;

          const data = await response.json();
          if (data?.success && Array.isArray(data?.data)) {
            setProducts(data.data.slice(0, TOTAL));
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách gợi ý:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [status]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 max-w-screen-2xl mx-auto px-5">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm có thể bạn sẽ thích</h2>
          <p className="text-sm text-gray-500">Dành riêng cho bạn</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByItems("prev")}
            className="h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByItems("next")}
            className="h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải gợi ý cho bạn...</div>
      ) : (
        <div
          ref={viewportRef}
          className="overflow-x-auto scroll-smooth"
          style={{
            scrollbarWidth: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div
            className="flex gap-4 pr-2"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {products.map((product, idx) => (
              <div
                key={product.id}
                data-card={idx === 0 ? "1" : undefined}
                className="
                  shrink-0
                  snap-start
                  w-[80%]
                  sm:w-[45%]
                  md:w-[30%]
                  lg:w-[22%]
                  xl:w-[19%]
                "
              >
                <ProductItem product={product} color="black" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendedSection;

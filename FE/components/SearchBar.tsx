import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import config from "@/lib/config";

type Product = {
  id: string | number;
  name?: string;
  title?: string;
  price?: number;
  main_image?: string;
  mainImage?: string;
  image?: string;
};

function buildImgSrc(src?: string) {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const base = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  // nếu BE trả storage/...
  if (clean.startsWith("storage/")) return `${base}/${clean}`;

  return `/${clean}`;
}

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    const run = async () => {
      const keyword = debouncedQ.trim();
      if (keyword.length < 2) {
        setItems([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const base = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
        const url = `${base}/api/products/search?q=${encodeURIComponent(keyword)}&per_page=8`;

        const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
        const json = await res.json().catch(() => null);

        const list: Product[] =
          json?.products?.data ??
          json?.data ??
          json?.products ??
          [];

        setItems(Array.isArray(list) ? list : []);
        setOpen(true);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedQ]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    setOpen(false);
    router.push(`/shop?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={onSubmit} className="flex w-full">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder="Type here"
          className="w-full h-11 rounded-l-md border border-gray-300 px-4 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-r-md bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 py-2 text-sm text-gray-500 flex items-center justify-between">
            <span>{loading ? "Đang tìm..." : `Gợi ý (${items.length})`}</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700"
              type="button"
            >
              ✕
            </button>
          </div>

          {items.length === 0 && !loading ? (
            <div className="px-3 py-4 text-sm text-gray-500">Không có kết quả.</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              {items.map((p) => {
                const title = p.name ?? p.title ?? "Sản phẩm";
                const img = p.main_image ?? p.mainImage ?? p.image ?? "";
                return (
                  <Link
                    key={String(p.id)}
                    href={`/product/${p.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                      <Image
                        src={buildImgSrc(img)}
                        width={40}
                        height={40}
                        alt={title}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
                      <div className="text-xs text-gray-500">
                        {typeof p.price === "number" ? p.price.toLocaleString("vi-VN") + " đ" : ""}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500">
            Gõ ≥ 2 ký tự để gợi ý. Enter để xem tất cả kết quả.
          </div>
        </div>
      )}
    </div>
  );
}

function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { sanitize } from "@/lib/sanitize";
import { searchProducts } from "@/lib/data";
import { Product } from "@/lib/types";

export default function SearchInput() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const keyword = q.trim();
    if (!keyword) {
      setItems([]);
      setLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      const result = await searchProducts(keyword);
      setItems(result.slice(0, 5)); 
      setLoading(false);
      setOpen(true);
    }, 250);

    return () => clearTimeout(t);
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    setOpen(false);
  };

  const goProduct = (p: Product) => {
    router.push(`/product/${p.id}`);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-[520px] max-w-full">
      <form onSubmit={onSubmit} className="flex">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim() && setOpen(true)}
          placeholder="Tìm sản phẩm..."
          className="input input-bordered w-full rounded-r-none"
        />
        <button className="btn btn-primary rounded-l-none" type="submit">
          Tìm
        </button>
      </form>

      {open && (loading || items.length > 0) && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
          {loading && <div className="p-3 text-sm text-gray-500">Đang tìm...</div>}

          {!loading &&
            items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goProduct(p)}
                className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3"
              >
                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <Image src={p.mainImage} alt={sanitize(p.title)} fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{sanitize(p.title)}</div>
                  <div className="text-xs text-gray-500">${Number(p.price).toLocaleString()}</div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
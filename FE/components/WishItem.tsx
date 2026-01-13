"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaHeartCrack } from "react-icons/fa6";
import { useSession } from "next-auth/react";

import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import config from "@/lib/config";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import type { ProductInWishlist } from "@/app/_zustand/wishlistStore";

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const baseUrl = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  // BE trả "storage/..." => prefix base url
  if (clean.startsWith("storage/")) return `${baseUrl}/${clean}`;

  // nếu bạn đang lưu public path kiểu "uploads/..." thì giữ như cũ
  return `/${clean}`;
};

const WishItem = (props: ProductInWishlist) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { removeFromWishlist } = useWishlistStore();

  // ---- Normalize product fields ----
  const productId = String((props as any).id ?? (props as any).product_id ?? "");
  const title = String((props as any).title ?? (props as any).name ?? "");
  const image = (props as any).image ?? (props as any).mainImage ?? (props as any).image_url;

  const inStock = useMemo(() => {
    // ưu tiên inStock/stock_quantity nếu có
    const s =
      (props as any).inStock ??
      (props as any).stock_quantity ??
      (props as any).stockAvailabillity ??
      0;

    // s có thể là boolean / number / string
    if (typeof s === "boolean") return s;
    const n = Number(s);
    return Number.isFinite(n) ? n > 0 : false;
  }, [props]);

  // ---- userId ----
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    let mounted = true;

    apiClient
      .get(`/api/users/email/${encodeURIComponent(email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const uid = data?.id ?? data?.user?.id;
        if (mounted) setUserId(uid ? String(uid) : "");
      })
      .catch((e) => console.error("getUserByEmail failed:", e));

    return () => {
      mounted = false;
    };
  }, [session?.user?.email]);

  const openProduct = () => {
    if (!productId) return;
    router.push(`/product/${productId}`); // ✅ /product/[id]
  };

  const deleteItemFromWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ tránh click lan lên row -> openProduct
    if (!userId || !productId) return;

    try {
      await apiClient.delete(`/api/wishlist/${userId}/${productId}`);
      removeFromWishlist(productId);
      toast.success("Đã xoá khỏi wishlist");
    } catch (err) {
      console.error("deleteItemFromWishlist failed:", err);
      toast.error("Xoá thất bại");
    }
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={openProduct}>
      <td className="text-black text-sm text-center">{productId}</td>

      <td className="text-black text-sm text-center">
        <div className="w-12 h-12 mx-auto">
          <Image
            src={buildImgSrc(image)}
            width={48}
            height={48}
            className="w-full h-full object-contain"
            alt={sanitize(title) || "Product image"}
          />
        </div>
      </td>

      <td className="text-black text-sm text-center">{sanitize(title)}</td>

      <td className="text-black text-sm text-center">
        {inStock ? (
          <span className="text-green-600 font-medium">Còn hàng</span>
        ) : (
          <span className="text-red-500 font-medium">Hết hàng</span>
        )}
      </td>

      <td className="text-center">
        <button
          className="btn btn-xs bg-blue-500 text-white border border-blue-500 hover:bg-white hover:text-blue-500 text-sm"
          onClick={deleteItemFromWishlist}
        >
          <FaHeartCrack />
          <span className="max-sm:hidden">Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default WishItem;

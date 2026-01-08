"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaHeartCrack } from "react-icons/fa6";
import { useSession } from "next-auth/react";

import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import type { ProductInWishlist } from "@/app/_zustand/wishlistStore";

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/${src.replace(/^\/+/, "")}`;
};

const WishItem = (props: ProductInWishlist) => {

  const title = (props as any).title ?? (props as any).name ?? "";

  const id = String((props as any).id ?? "");
  const price = Number((props as any).price ?? 0);
  const image = (props as any).image as string | undefined;
  const slug = (props as any).slug as string;
  const stockAvailabillity = Number((props as any).stockAvailabillity ?? 0);

  const { data: session } = useSession();
  const { removeFromWishlist } = useWishlistStore();
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");

  const openProduct = (s: string) => {
    router.push(`/product/${s}`);
  };

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    apiClient
      .get(`/api/users/email/${encodeURIComponent(email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const uid = data?.id ?? data?.user?.id;
        setUserId(uid ? String(uid) : "");
      })
      .catch((e) => console.error("getUserByEmail failed:", e));
  }, [session?.user?.email]);

  const deleteItemFromWishlist = async (productId: string) => {
    if (!userId) return;

    try {
      await apiClient.delete(`/api/wishlist/${userId}/${productId}`, { method: "DELETE" });
      removeFromWishlist(productId);
      toast.success("Item removed from your wishlist");
    } catch (e) {
      console.error("deleteItemFromWishlist failed:", e);
      toast.error("Remove failed");
    }
  };

  return (
    <tr className="hover:bg-gray-100 cursor-pointer">
      <th className="text-black text-sm text-center" onClick={() => openProduct(slug)}>
        {id}
      </th>

      <th>
        <div className="w-12 h-12 mx-auto" onClick={() => openProduct(slug)}>
          <Image
            src={buildImgSrc(image)}
            width={48}
            height={48}
            className="w-full h-full object-contain"
            alt={sanitize(title) || "Product image"}
          />
        </div>
      </th>

      <td className="text-black text-sm text-center" onClick={() => openProduct(slug)}>
        {sanitize(title)}
      </td>

      <td className="text-black text-sm text-center" onClick={() => openProduct(slug)}>
        {stockAvailabillity ? (
          <span className="text-success">Còn hàng</span>
        ) : (
          <span className="text-error">Hết hàng</span>
        )}
      </td>

      <td>
        <button
          className="btn btn-xs bg-blue-500 text-white border border-blue-500 hover:bg-white hover:text-blue-500 text-sm"
          onClick={() => deleteItemFromWishlist(id)}
        >
          <FaHeartCrack />
          <span className="max-sm:hidden">remove from the wishlist</span>
        </button>
      </td>
    </tr>
  );
};

export default WishItem;

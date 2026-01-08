"use client";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";

import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";

import type { ProductInWishlist } from "@/app/_zustand/wishlistStore";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { setWishlist, wishQuantity } = useWishlistStore();

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  const asArray = (json: any): any[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.wishlist)) return json.wishlist;
    if (Array.isArray(json?.wishlist?.data)) return json.wishlist.data;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    return [];
  };

  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, { cache: "no-store" });
    const json = await response.json();

    const list = asArray(json);

    const productArray: ProductInWishlist[] = list.map((item: any) => {
      const p = item?.product ?? item;
      return {
        id: String(p?.id ?? ""),
        name: p?.title ?? p?.name ?? "",
        price: Number(p?.price ?? 0),
        image: p?.mainImage ?? p?.main_image ?? p?.image ?? "/product_placeholder.jpg",
        slug: p?.slug ?? "",
        stockAvailabillity: Number(p?.inStock ?? p?.stock_quantity ?? 0),
      };
    });

    setWishlist(productArray);
  };

  const getUserByEmail = async () => {
    const email = session?.user?.email;
    if (!email) return;

    try {
      const res = await apiClient.get(`/api/users/email/${encodeURIComponent(email)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      const userId = data?.id ?? data?.user?.id;
      if (userId) await getWishlistByUserId(String(userId));
    } catch (e) {
      console.error("getUserByEmail failed:", e);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    getUserByEmail();

  }, [status, session?.user?.email]);

  return (
    <header className="bg-white">
      <HeaderTop />

      {pathname.startsWith("/admin") === false && (
        <div className="h-32 bg-white flex items-center justify-between px-16 max-[1320px]:px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-7 max-lg:justify-center max-lg:h-60 max-w-screen-2xl mx-auto">
          <Link href="/">
            <img
              src="/logo v1 svg.png"
              width={500}
              height={500}
              alt="PTIT logo"
              className="relative right-5 max-[1023px]:w-56"
            />
          </Link>

          <SearchInput />

          <div className="flex gap-x-10 items-center">
            <NotificationBell />
            <HeartElement wishQuantity={wishQuantity} />
            <CartElement />
          </div>
        </div>
      )}

      {pathname.startsWith("/admin") === true && (
        <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5">
          <Link href="/">
            <Image
              src="/logo v1.png"
              width={130}
              height={130}
              alt="singitronic logo"
              className="w-56 h-auto"
            />
          </Link>

          <div className="flex gap-x-5 items-center">
            <NotificationBell />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-10">
                <Image
                  src="/randomuser.jpg"
                  alt="random profile photo"
                  width={30}
                  height={30}
                  className="w-full h-full rounded-full"
                />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li>
                  <a>Profile</a>
                </li>
                <li onClick={handleLogout}>
                  <a href="#">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

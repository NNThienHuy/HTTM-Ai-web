"use client";

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaHeartCrack } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa6";

interface AddToWishlistBtnProps {
  product: Product;
  slug: string;
}

const AddToWishlistBtn = ({ product, slug }: AddToWishlistBtnProps) => {
  const { data: session, status } = useSession();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [isProductInWishlist, setIsProductInWishlist] = useState<boolean>();

  const addToWishlistFun = async () => {
    if (!session?.user?.email) {
      toast.error("You need to be logged in to add a product to the wishlist");
      return;
    }

    const productId = (product as any)?.id ?? (product as any)?.product_id;
    if (!productId) return toast.error("Missing product id");

    const wishImage =
      (product as any)?.mainImage ??
      (product as any)?.main_image ??
      (product as any)?.image_url ??
      (product as any)?.image ??
      "/product_placeholder.jpg";

    try {
      const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`, {
        cache: "no-store",
      });
      const userData = await userResponse.json();

      const wishlistResponse = await apiClient.post("/api/wishlist", {
        productId,
        userId: userData?.id,
      });

      if (wishlistResponse.ok) {
        addToWishlist({
          id: productId,
          title: product?.title,
          price: product?.price,
          image: wishImage,
          slug: String(productId), 
          stockAvailabillity: product?.inStock,
        });
        toast.success("Product added to the wishlist");
      } else {
        const errorData = await wishlistResponse.json();
        toast.error(errorData.message || "Failed to add product to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add product to wishlist");
    }
  };

  const removeFromWishlistFun = async () => {
    if (session?.user?.email) {
      try {
        // sending fetch request to get user id because we will need to delete wish item
        const userResponse = await apiClient.get(`/api/users/email/${session?.user?.email}`, {
          cache: "no-store",
        });
        const userData = await userResponse.json();
        
        // Remove product from wishlist
        const deleteResponse = await apiClient.delete(
          `/api/wishlist/${userData?.id}/${product?.id}`
        );
        
        if (deleteResponse.ok) {
          removeFromWishlist(product?.id);
          toast.success("Product removed from the wishlist");
        } else {
          const errorData = await deleteResponse.json();
          toast.error(errorData.message || "Failed to remove product from wishlist");
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove product from wishlist");
      }
    }
  };

  const isInWishlist = async () => {
    // sending fetch request to get user id because we will need it for checking whether the product is in wishlist
    if (session?.user?.email) {
      try {
        const userResponse = await apiClient.get(`/api/users/email/${session?.user?.email}`, {
          cache: "no-store",
        });
        const userData = await userResponse.json();
        
        // checking is product in wishlist
        const wishlistResponse = await apiClient.get(
          `/api/wishlist/${userData?.id}/${product?.id}`
        );
        const wishlistData = await wishlistResponse.json();
        
        if (wishlistData[0]?.id) {
          setIsProductInWishlist(true);
        } else {
          setIsProductInWishlist(false);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
        setIsProductInWishlist(false);
      }
    }
  };

  useEffect(() => {
    isInWishlist();
  }, [session?.user?.email, wishlist]);

  return (
    <>
      {isProductInWishlist ? (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={removeFromWishlistFun}
        >
          <FaHeartCrack className="text-xl text-custom-black" />
          <span className="text-lg">REMOVE FROM WISHLIST</span>
        </p>
      ) : (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={addToWishlistFun}
        >
          <FaHeart className="text-xl text-custom-black" />
          <span className="text-lg">Thêm vào danh sách yêu thích</span>
        </p>
      )}
    </>
  );
};

export default AddToWishlistBtn;

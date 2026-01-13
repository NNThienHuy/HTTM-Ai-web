"use client";

import { DashboardSidebar } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import config from "@/lib/config";

interface Product {
  id?: string;
  title: string;
  slug: string;
  price: number;
  manufacturer: string;
  description: string;
  mainImage?: string;
  inStock?: number;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface OtherImages {
  id?: string;
  image: string;
}

interface DashboardProductDetailsProps {
  // ✅ KHÔNG Promise + KHÔNG use(params) trong client
  params: { id: string };
}

const EMPTY_PRODUCT: Product = {
  title: "",
  slug: "",
  price: 0,
  manufacturer: "",
  description: "",
  mainImage: "",
  inStock: 1,
  categoryId: "",
};

const buildImgSrc = (src?: string) => {
  if (!src || src === "") return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const baseUrl = (config.apiBaseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  if (clean.startsWith("storage/") || clean.startsWith("images/")) {
    return `${baseUrl}/${clean}`;
  }
  return `/${clean}`;
};

export default function DashboardProductDetails({ params }: DashboardProductDetailsProps) {
  const id = params.id;

  // ✅ init object sẵn để không bị undefined
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const canUpdate = useMemo(() => {
    return (
      product.title.trim() &&
      product.slug.trim() &&
      Number.isFinite(product.price) &&
      product.manufacturer.trim() &&
      product.description.trim()
    );
  }, [product]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/categories");
      if (!res.ok) throw new Error("fetch categories failed");
      const data = (await res.json()) as Category[];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không tải được danh mục");
    }
  };

  const fetchProductData = async () => {
    try {
      const res = await apiClient.get(`/api/products/${id}`);
      if (!res.ok) throw new Error("fetch product failed");
      const data = (await res.json()) as Product;

      setProduct({ ...EMPTY_PRODUCT, ...data });
    } catch {
      toast.error("Không tải được sản phẩm");
    }

    try {
      const imagesRes = await apiClient.get(`/api/images/${id}`, { cache: "no-store" });
      if (!imagesRes.ok) throw new Error("fetch images failed");
      const images = (await imagesRes.json()) as OtherImages[];
      setOtherImages(Array.isArray(images) ? images : []);
    } catch {
      setOtherImages([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const deleteProduct = async () => {
    try {
      const res = await apiClient.delete(`/api/products/${id}`, { method: "DELETE" });

      if (res.status !== 204) {
        if (res.status === 400) {
          toast.error("Cannot delete the product because of foreign key constraint");
          return;
        }
        toast.error("There was an error while deleting product");
        return;
      }

      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch {
      toast.error("There was an error while deleting product");
    }
  };

  const updateProduct = async () => {
    if (!canUpdate) {
      toast.error("You need to enter values in input fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.put(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error("update failed");
      toast.success("Product successfully updated");
    } catch {
      toast.error("There was an error while updating product");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadMainImage = async (file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    setIsUploading(true);
    try {
      const res = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("File upload unsuccessful.");
        return;
      }

      // ✅ lấy path/url BE trả về, fallback file.name
      const data = await res.json().catch(() => null);
      const uploadedPath = data?.path || data?.url || file.name;

      setProduct((prev) => ({ ...prev, mainImage: uploadedPath }));
      toast.success("Upload ảnh OK");
    } catch {
      toast.error("There was an error during request sending");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
        <h1 className="text-3xl font-semibold">Chi tiết sản phẩm</h1>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Tên sản phẩm:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.title}
              onChange={(e) => setProduct((p) => ({ ...p, title: e.target.value }))}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Giá:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={Number.isFinite(product.price) ? product.price : ""}
              onChange={(e) => setProduct((p) => ({ ...p, price: Number(e.target.value) }))}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Nhà sản xuất:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.manufacturer}
              onChange={(e) => setProduct((p) => ({ ...p, manufacturer: e.target.value }))}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.slug ? convertSlugToURLFriendly(product.slug) : ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, slug: convertSlugToURLFriendly(e.target.value) }))
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sản phẩm còn hàng không?</span>
            </div>
            <select
              className="select select-bordered"
              value={product.inStock ?? 1}
              onChange={(e) => setProduct((p) => ({ ...p, inStock: Number(e.target.value) }))}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Danh mục:</span>
            </div>
            <select
              className="select select-bordered"
              value={product.categoryId ?? ""}
              onChange={(e) => setProduct((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <option value="" disabled>
                -- Chọn danh mục --
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCategoryName(c.name)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <input
            type="file"
            disabled={isUploading}
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadMainImage(f);
            }}
          />

          {product.mainImage ? (
            <Image
              src={buildImgSrc(product.mainImage)}
              alt={product.title || "product"}
              className="w-auto h-auto mt-2"
              width={100}
              height={100}
              unoptimized
            />
          ) : null}
        </div>

        <div className="flex gap-x-1">
          {otherImages.map((img) => (
            <Image
              key={img.id ?? img.image}
              src={buildImgSrc(img.image)}
              alt="product image"
              width={100}
              height={100}
              className="w-auto h-auto"
              unoptimized
            />
          ))}
        </div>

        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Mô tả sản phẩm:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product.description}
              onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={updateProduct}
            disabled={!canUpdate || isSaving}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
          </button>

          <button
            type="button"
            onClick={deleteProduct}
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-red-700"
          >
            Xóa sản phẩm
          </button>
        </div>

        <p className="text-xl max-sm:text-lg text-error">
          Để xóa sản phẩm, trước tiên bạn cần xóa tất cả các bản ghi của sản phẩm đó
          trong đơn hàng (bảng sản phẩm đơn hàng của khách hàng).
        </p>
      </div>
    </div>
  );
}

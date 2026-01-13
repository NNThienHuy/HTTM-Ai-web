"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { convertCategoryNameToURLFriendly as slugify } from "@/utils/categoryFormating";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

type NewProduct = {
  title: string;
  price: number;
  manufacturer: string;
  inStock: number;
  mainImage: string;
  description: string;
  slug: string;
  categoryId: string;
};

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const baseUrl = (config.apiBaseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  if (clean.startsWith("storage/") || clean.startsWith("images/")) return `${baseUrl}/${clean}`;
  return `/${clean}`;
};

const normalizeCategories = (raw: any): Category[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.categories)) return raw.categories;
  if (Array.isArray(raw?.result)) return raw.result;
  return [];
};

export default function AddNewProduct() {
  const router = useRouter();

  const [product, setProduct] = useState<NewProduct>({
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // preview ảnh local để biết chắc file input hoạt động
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/categories");
      const raw = await res.json();

      const list = normalizeCategories(raw);
      setCategories(list);

      // set default categoryId
      setProduct((p) => ({
        ...p,
        categoryId: p.categoryId || list[0]?.id || "",
      }));
    } catch {
      setCategories([]);
      toast.error("Không tải được danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

      const data = await res.json().catch(() => null);
      const uploadedPath = data?.path || data?.url || file.name;

      setProduct((p) => ({ ...p, mainImage: uploadedPath }));
      toast.success("Upload ảnh OK");
    } catch {
      toast.error("Upload lỗi. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const addProduct = async () => {
    // validation đặt ở đây để nút luôn bấm được
    if (
      !product.title.trim() ||
      !product.slug.trim() ||
      !product.manufacturer.trim() ||
      !product.description.trim() ||
      !product.categoryId
    ) {
      toast.error("Bạn cần nhập đủ: tên, slug, NSX, mô tả, danh mục");
      return;
    }

    setIsSaving(true);
    try {
      const payload = sanitizeFormData(product);

      const res = await apiClient.post("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status !== 201) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Failed to add product");
        return;
      }

      const data = await res.json().catch(() => null);
      const newId =
        data?.id ??
        data?.product?.id ??
        data?.data?.id ??
        data?.data?.product?.id ??
        null;

      if (newId) setCreatedId(String(newId));

      toast.success("Product added successfully");

      // reset (giữ categoryId)
      setProduct((p) => ({
        title: "",
        price: 0,
        manufacturer: "",
        inStock: 1,
        mainImage: "",
        description: "",
        slug: "",
        categoryId: p.categoryId,
      }));
      setPreviewUrl("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Thêm sản phẩm</h1>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Tên sản phẩm:</span></div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.title}
              onChange={(e) => {
                const v = e.target.value;
                setProduct((p) => ({
                  ...p,
                  title: v,
                  slug: p.slug ? p.slug : slugify(v),
                }));
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Sản phẩm Slug:</span></div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={slugify(product.slug)}
              onChange={(e) => setProduct((p) => ({ ...p, slug: slugify(e.target.value) }))}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Giá sản phẩm:</span></div>
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
            <div className="label"><span className="label-text">Nhà máy:</span></div>
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
            <div className="label"><span className="label-text">Sản phẩm có sẵn?</span></div>
            <select
              className="select select-bordered"
              value={product.inStock}
              onChange={(e) => setProduct((p) => ({ ...p, inStock: Number(e.target.value) }))}
            >
              <option value={1}>Có</option>
              <option value={0}>Không</option>
            </select>
          </label>
        </div>

        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            // ✅ không disable để bạn luôn chọn được file
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;

              // preview local
              const url = URL.createObjectURL(f);
              setPreviewUrl(url);

              // upload lên BE
              uploadMainImage(f);
            }}
          />

          {(previewUrl || product.mainImage) ? (
            <Image
              src={previewUrl || buildImgSrc(product.mainImage)}
              alt={product.title || "product"}
              className="w-auto h-auto mt-2"
              width={100}
              height={100}
              unoptimized
            />
          ) : null}

          {isUploading ? <p className="text-sm text-gray-500">Đang upload ảnh...</p> : null}
        </div>

        <div>
          <label className="form-control">
            <div className="label"><span className="label-text">Mô tả sản phẩm:</span></div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product.description}
              onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
        </div>

        <div className="flex gap-x-2 flex-wrap">
          <button
            type="button"
            onClick={addProduct}
            disabled={isSaving}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add product"}
          </button>

          {createdId ? (
            <button
              type="button"
              onClick={() => router.push(`/admin/products/${createdId}`)}
              className="uppercase bg-amber-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-amber-600"
            >
              Sửa sản phẩm vừa tạo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

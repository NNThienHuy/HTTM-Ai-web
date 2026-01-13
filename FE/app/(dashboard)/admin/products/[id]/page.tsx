"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
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
  if (!src || src === "") return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const baseUrl = (config.apiBaseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const clean = src.replace(/^\/+/, "");

  // BE trả "storage/..." hoặc "images/..."
  if (clean.startsWith("storage/") || clean.startsWith("images/")) {
    return `${baseUrl}/${clean}`;
  }

  // public/...
  return `/${clean}`;
};

const AddNewProduct = () => {
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

  // ✅ để hiện nút Sửa sau khi tạo xong
  const [createdId, setCreatedId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      product.title.trim() &&
      product.slug.trim() &&
      product.manufacturer.trim() &&
      product.description.trim() &&
      !!product.categoryId
    );
  }, [product]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/categories");
      if (!res.ok) throw new Error("fetch categories failed");
      const data = (await res.json()) as Category[];

      const list = Array.isArray(data) ? data : [];
      setCategories(list);

      // set default category nếu chưa có
      setProduct((prev) => ({
        ...prev,
        categoryId: prev.categoryId || list[0]?.id || "",
      }));
    } catch {
      toast.error("Không tải được danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const uploadFile = async (file: File) => {
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

      setProduct((prev) => ({ ...prev, mainImage: uploadedPath }));
      toast.success("Upload ảnh OK");
    } catch (e) {
      toast.error("Upload lỗi. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const addProduct = async () => {
    if (!canSubmit) {
      toast.error("Please enter values in input fields");
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedProduct = sanitizeFormData(product);

      // ✅ FIX: gửi đúng dạng RequestInit như các chỗ PUT/DELETE của bạn
      const response = await apiClient.post(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedProduct),
      });

      if (response.status === 201) {
        const data = await response.json().catch(() => null);

        // cố lấy id theo nhiều kiểu response phổ biến
        const newId =
          data?.id ??
          data?.product?.id ??
          data?.data?.id ??
          data?.data?.product?.id ??
          null;

        if (newId) setCreatedId(String(newId));

        toast.success("Product added successfully");

        // reset form (giữ category mặc định)
        setProduct((prev) => ({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: prev.categoryId || categories[0]?.id || "",
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Error: ${errorData?.message || "Failed to add product"}`);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new product</h1>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.title}
              onChange={(e) => {
                const v = e.target.value;
                setProduct((prev) => ({
                  ...prev,
                  title: v,
                  // auto slug nếu đang để trống (đỡ “form không hoạt động” vì thiếu slug)
                  slug: prev.slug ? prev.slug : convertSlugToURLFriendly(v),
                }));
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={convertSlugToURLFriendly(product.slug)}
              onChange={(e) =>
                setProduct((prev) => ({
                  ...prev,
                  slug: convertSlugToURLFriendly(e.target.value),
                }))
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product.categoryId}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, categoryId: e.target.value }))
              }
            >
              <option value="" disabled>
                -- Select category --
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={Number.isFinite(product.price) ? product.price : ""}
              onChange={(e) =>
                setProduct((prev) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.manufacturer}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, manufacturer: e.target.value }))
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product.inStock}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, inStock: Number(e.target.value) }))
              }
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
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
              if (f) uploadFile(f);
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

        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product.description}
              onChange={(e) =>
                setProduct((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </label>
        </div>

        <div className="flex gap-x-2 flex-wrap">
          <button
            onClick={addProduct}
            type="button"
            disabled={!canSubmit || isSaving}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add product"}
          </button>

          {/* ✅ NÚT SỬA: hiện sau khi tạo thành công */}
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
};

export default AddNewProduct;

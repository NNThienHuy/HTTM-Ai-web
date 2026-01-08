"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import type { Product } from "@/lib/types"; // ✅ nhớ import đúng type

const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/${src.replace(/^\/+/, "")}`; // ✅ tránh //...
};

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiClient
      .get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        // ✅ Laravel paginate: { success: true, products: { data: [...] } }
        const list =
          Array.isArray(json?.products?.data) ? json.products.data :
          Array.isArray(json?.data) ? json.data :
          Array.isArray(json) ? json :
          [];

        setProducts(list);
      })
      .catch((e) => {
        console.error("Fetch admin products failed:", e);
        setProducts([]);
      });
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-5">All products</h1>

      <div className="flex justify-end mb-5">
        <Link href="/admin/products/new">
          <CustomButton
            buttonType="button"
            customWidth="110px"
            paddingX={10}
            paddingY={5}
            textSize="base"
            text="Add new product"
          />
        </Link>
      </div>

      <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto h-[80vh]">
        <table className="table table-md table-pin-cols">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(products) &&
              products.map((product: any) => (
                <tr key={product?.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={buildImgSrc(product?.mainImage)}
                            alt={sanitize(product?.title ?? product?.name) || "Product image"}
                            className="w-auto h-auto"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="font-bold">
                          {sanitize(product?.title ?? product?.name)}
                        </div>
                        <div className="text-sm opacity-50">
                          {sanitize(product?.manufacturer ?? product?.brand?.name ?? "")}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product?.inStock ? (
                      <span className="badge badge-success text-white badge-sm">In stock</span>
                    ) : (
                      <span className="badge badge-error text-white badge-sm">Out of stock</span>
                    )}
                  </td>

                  <td>${product?.price}</td>

                  <th>
                    <Link href={`/admin/products/${product?.id}`} className="btn btn-ghost btn-xs">
                      details
                    </Link>
                  </th>
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;

import React from "react";
import { getProducts } from "@/lib/data";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem";

type SearchParams = { [key: string]: string | string[] | undefined };

const asArray = (json: any): Product[] => {
  if (Array.isArray(json)) return json as Product[];

  if (Array.isArray(json?.data)) return json.data as Product[];

  if (Array.isArray(json?.products?.data)) return json.products.data as Product[];

  if (Array.isArray(json?.products)) return json.products as Product[];
  if (Array.isArray(json?.items)) return json.items as Product[];

  return [];
};

const Products = async ({
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: SearchParams;
}) => {
  const raw = await getProducts(searchParams);
  const products = asArray(raw);

  return (
    <>
      {products.length === 0 ? (
        <p className="mt-10">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {products.map((product: any) => (
            <ProductItem
              key={String(product?.id ?? product?.product_id ?? product?.slug ?? Math.random())}
              product={product}
              color="black"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Products;

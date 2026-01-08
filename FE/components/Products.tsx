import React from "react";

import { getProducts } from "@/lib/data"; 

import { Product } from "@/lib/types"; 
import ProductItem from "./ProductItem";

const Products = async ({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {

  const products: Product[] = await getProducts(searchParams);

  return (
    <>
      {products?.length === 0 ? (
        <p className="mt-10">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {products?.map((product: Product) => (
            <ProductItem product={product} key={product.id} color="black" />
          ))}
        </div>
      )}
    </>
  );
};

export default Products;
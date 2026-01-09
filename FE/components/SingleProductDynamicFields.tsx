"use client";
import React, { useState } from "react";
import QuantityInput from "./QuantityInput";
import AddToCartSingleProductBtn from "./AddToCartSingleProductBtn";
import BuyNowSingleProductBtn from "./BuyNowSingleProductBtn";
import { Product } from "@/lib/types"; // Import interface

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const [quantityCount, setQuantityCount] = useState<number>(1);
  
  // Kiểm tra inStock an toàn hơn
  const isAvailable = product && product.inStock > 0;

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex gap-x-2 items-center mb-2">
        <span className="text-lg">Số lượng:</span>
        <QuantityInput
          quantityCount={quantityCount}
          setQuantityCount={setQuantityCount}
        />
      </div>
      
      {isAvailable ? (
        <div className="flex gap-x-5 max-[500px]:flex-col max-[500px]:items-center max-[500px]:gap-y-3">
          <AddToCartSingleProductBtn
            quantityCount={quantityCount}
            product={product}
          />
          <BuyNowSingleProductBtn
            quantityCount={quantityCount}
            product={product}
          />
        </div>
      ) : (
        <p className="text-red-500 text-lg font-semibold">Hết hàng</p>
      )}
    </div>
  );
};

export default SingleProductDynamicFields;
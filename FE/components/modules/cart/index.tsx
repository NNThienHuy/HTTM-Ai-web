"use client";

import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";
import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";
import config from "@/lib/config"; // 1. Import config để lấy domain backend

// 2. Thêm hàm xử lý ảnh chuẩn (copy logic từ ProductItem)
const buildImgSrc = (src?: string) => {
  if (!src) return "/product_placeholder.jpg";

  // Nếu ảnh đã là link tuyệt đối (http/https) -> dùng luôn
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Xóa dấu / ở đầu để tránh lỗi //
  const cleanSrc = src.replace(/^\/+/, "");
  
  // Lấy domain backend
  const baseUrl = config.apiBaseUrl?.replace(/\/+$/, "") || "http://localhost:8000";

  // Nếu ảnh thuộc backend (chứa images hoặc storage) -> Nối domain vào
  if (cleanSrc.startsWith("images") || cleanSrc.startsWith("storage")) {
    return `${baseUrl}/${cleanSrc}`;
  }

  // Các trường hợp khác coi như ảnh ở public frontend
  return `/${cleanSrc}`;
};

export const CartModule = () => {
  const { products, removeFromCart, calculateTotals, total } = useProductStore();

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    calculateTotals();
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  return (
    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <h2 id="cart-heading" className="sr-only">
          Các mặt hàng trong giỏ hàng của bạn
        </h2>

        <ul
          role="list"
          className="divide-y divide-gray-200 border-b border-t border-gray-200"
        >
          {products.map((product) => (
            <li key={product.id} className="flex py-6 sm:py-10">
              <div className="flex-shrink-0">
                {/* 3. Áp dụng hàm buildImgSrc vào đây */}
                <Image
                  width={192}
                  height={192}
                  src={buildImgSrc(product.image)} 
                  alt={sanitize(product.title) || "Product Image"}
                  className="h-24 w-24 rounded-md object-contain object-center sm:h-48 sm:w-48 border border-gray-100"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-sm">
                        <Link
                          href={`/product/${product.id}`}
                          className="font-medium text-gray-700 hover:text-gray-800"
                        >
                          {sanitize(product.title)}
                        </Link>
                      </h3>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ${product.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:pr-9">
                    <QuantityInputCart product={product} />
                    <div className="absolute right-0 top-0">
                      <button
                        onClick={() => handleRemoveItem(product.id)}
                        type="button"
                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Xóa</span>
                        <FaXmark className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                  <FaCheck
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                  <span>Còn hàng</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2
          id="summary-heading"
          className="text-lg font-medium text-gray-900"
        >
          Đơn hàng
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Tổng tiền hàng</dt>
            <dd className="text-sm font-medium text-gray-900">
              ${total.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Phí vận chuyển</span>
              <FaCircleQuestion className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            </dt>
            <dd className="text-sm font-medium text-gray-900">$5.00</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex text-sm text-gray-600">
              <span>Thuế ước tính</span>
              <FaCircleQuestion className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              ${(total / 10).toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">
              Tổng thanh toán
            </dt>
            <dd className="text-base font-medium text-gray-900">
              ${total === 0 ? 0 : (total + total / 10 + 5).toLocaleString()}
            </dd>
          </div>
        </dl>

        {products.length > 0 && (
          <div className="mt-6">
            <Link
              href="/checkout"
              className="block flex justify-center items-center w-full uppercase bg-blue-600 px-4 py-3 text-base border border-transparent font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <span>Thanh toán</span>
            </Link>
          </div>
        )}
      </section>
    </form>
  );
};
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { Product } from "@/lib/types";
import ProductItem from "./ProductItem"; // Component hiển thị từng sản phẩm
import SectionTitle from "./SectionTitle"; // Component tiêu đề section

const RecommendedSection = () => {
  const { status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Nếu chưa đăng nhập thì không gọi API cá nhân hóa
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    // 2. Nếu đã đăng nhập, gọi API lấy danh sách gợi ý
    if (status === "authenticated") {
      const fetchRecommendations = async () => {
        try {
          // Gọi endpoint backend bạn đã cung cấp
          const response = await apiClient.get("/api/recommendations/personalized");
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              // YÊU CẦU CỦA BẠN: Chỉ lấy 5 sản phẩm
              setProducts(data.data.slice(0, 5));
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách gợi ý:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [status]);

  // Nếu đang loading hoặc không có sản phẩm (hoặc chưa login), có thể ẩn đi
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 max-w-screen-2xl mx-auto px-5">
      {/* YÊU CẦU CỦA BẠN: Đổi tiêu đề thành Khuyến nghị sản phẩm */}
      <SectionTitle title="Khuyến nghị sản phẩm" path="/shop" />
      
      {loading ? (
        <div className="text-center py-10">Đang tải gợi ý cho bạn...</div>
      ) : (
        // Grid hiển thị sản phẩm
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} color="black" />
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendedSection;
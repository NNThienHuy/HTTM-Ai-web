export interface Product {
  // Các trường bắt buộc cho UI
  id: string | number;
  title: string;
  price: number;
  mainImage: string;
  inStock: number;
  description: string;
  slug: string; // Vẫn giữ slug ở FE để dùng cho URL

  // --- MAPPING TỪ BACKEND LARAVEL ---
  product_id?: number;       // Khớp với Product.php
  name?: string;             // Khớp với Product.php
  image_url?: string;        // Khớp với Product.php
  stock_quantity?: number;   // Khớp với Product.php
  rating?: number | string;  // Khớp với Product.php (decimal string)
  category_id?: number;
  
  // Quan hệ (Relation)
  category?: { 
      category_id: number;
      category_name: string; // Kiểm tra lại model Category của bạn
      name?: string; 
  };
}
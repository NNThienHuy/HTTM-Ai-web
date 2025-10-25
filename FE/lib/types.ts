export interface Product {
  id: number;
  merchantId: string;
  slug: string;
  title: string;
  mainImage: string;
  price: number;
  rating: number;
  description: string;
  manufacturer: string;
  categoryId: number;
  inStock: number;
}
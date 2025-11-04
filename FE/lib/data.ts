import { Product } from './types';

// ==========================================================
//  ĐỊNH NGHĨA TYPES CỦA BACKEND
// ==========================================================
interface LaravelProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  description: string | null;
  status: string;
  category: { id: number; name: string };
  brand: { id: number; name: string };
  images?: { url: string }[]; 
  reviews?: { rating: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ==========================================================
//  HÀM "DỊCH" (ADAPTER FUNCTION)
// ==========================================================

function adaptProduct(laravelProduct: LaravelProduct): Product {
  
  const mainImage = (laravelProduct.images && laravelProduct.images.length > 0)
    ? laravelProduct.images[0].url
    : '/product_placeholder.jpg';

  let avgRating = 0;
  if (laravelProduct.reviews && laravelProduct.reviews.length > 0) {
    const total = laravelProduct.reviews.reduce((acc, r) => acc + r.rating, 0);
    avgRating = total / laravelProduct.reviews.length;
  }

  const inStock = laravelProduct.stock_quantity > 0 ? laravelProduct.stock_quantity : 0;

  return {
    id: laravelProduct.id,
    title: laravelProduct.name,
    slug: laravelProduct.slug,
    price: laravelProduct.price,
    mainImage: mainImage,
    rating: avgRating,
    inStock: inStock,
    description: laravelProduct.description || "",
    categoryId: laravelProduct.category.id,
    manufacturer: laravelProduct.brand.name,
    merchantId: "default-merchant",
  };
}

// ==========================================================
//  HÀM GỌI API MỚI
// ==========================================================

export async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Xử lý searchParams 
     const query = new URLSearchParams(searchParams as Record<string, string>).toString();


    const url = `${baseUrl}/api/products`; 
    // Nếu dùng query: const url = `${baseUrl}/api/products?${query}`;

    const response = await fetch(url, { cache: 'no-store' }); 

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const laravelPaginatedData: PaginatedResponse<LaravelProduct> = await response.json();
    const laravelProducts = laravelPaginatedData.data;
    const appProducts = laravelProducts.map(adaptProduct);

    return appProducts;

  } catch (error) {
    console.error('Error fetching products from Laravel:', error);
    return [];
  }
}
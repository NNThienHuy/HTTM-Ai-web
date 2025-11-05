import { Product, Category } from "./types";
import config from "@/lib/config";

const API_BASE_URL = config.apiBaseUrl;

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

type LaravelPaginatePlain<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type LaravelPaginateResource<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  links?: unknown;
};

function isResourceStyle<T>(j: any): j is LaravelPaginateResource<T> {
  return j && Array.isArray(j.data) && j.meta && typeof j.meta.current_page === "number";
}
function isPlainStyle<T>(j: any): j is LaravelPaginatePlain<T> {
  return j && Array.isArray(j.data) && typeof j.current_page === "number";
}

function adaptProduct(p: LaravelProduct): Product {
  const mainImage = p.images?.length ? p.images[0].url : "/product_placeholder.jpg";
  const avgRating = p.reviews?.length
    ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
    : 0;

  return {
    id: p.id,                         
    merchantId: String(p.brand.id),   
    title: p.name,
    slug: p.slug,
    price: p.price,
    mainImage,
    rating: avgRating,
    inStock: p.stock_quantity,
    description: p.description ?? "",
    categoryId: p.category.id,        
    manufacturer: p.brand.name,
  };
}

function toQuery(params: { [k: string]: string | string[] | undefined }) {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") flat[k] = v;
    else if (Array.isArray(v)) flat[k] = v[0] ?? "";
  }
  const qs = new URLSearchParams(flat).toString();
  return qs ? `?${qs}` : "";
}

export async function getProducts(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/api/products${toQuery(searchParams)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    const json = await res.json();

    const list: LaravelProduct[] = isResourceStyle<LaravelProduct>(json)
      ? json.data
      : isPlainStyle<LaravelProduct>(json)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list.map(adaptProduct);
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as Category[]; 
    return data;
  } catch (e) {
    console.error("Error fetching categories:", e);
    return [];
  }
}
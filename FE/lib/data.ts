import { Product } from "./types";
import config from "@/lib/config";

export type Category = {
  id: number | string;
  name: string;
};
const API_BASE_URL = (config.apiBaseUrl || "http://localhost:8000").replace(/\/+$/, "");
function buildImgSrc(src?: string) {
  if (!src) return "/product_placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const clean = src.replace(/^\/+/, "");

  // Nếu ảnh nằm trong thư mục storage hoặc images của Backend -> Nối domain vào
  if (clean.startsWith("storage/") || clean.startsWith("images/")) {
    return `${API_BASE_URL}/${clean}`;
  }

  // Mặc định trả về ảnh trong public của Frontend
  return `/${clean}`;
}
function toQuery(params: { [k: string]: string | string[] | undefined } = {}) {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v !== "") flat[k] = v;
    else if (Array.isArray(v) && (v[0] ?? "") !== "") flat[k] = String(v[0] ?? "");
  }
  const qs = new URLSearchParams(flat).toString();
  return qs ? `?${qs}` : "";
}

function adaptProduct(p: any): Product {
  const rawImg =
    p?.images?.length
      ? p.images[0]?.url ?? p.images[0]?.image ?? p.images[0]
      : p?.mainImage ?? p?.main_image ?? p?.image ?? p?.image_url;

  const avgRating =
    Array.isArray(p?.reviews) && p.reviews.length
      ? p.reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) / p.reviews.length
      : Number(p?.rating) || 0;

  const brandId = p?.brand?.id ?? p?.brand_id ?? 0;
  const brandName = p?.brand?.name ?? p?.manufacturer ?? "";

  const categoryId = p?.category?.id ?? p?.category_id ?? 0;

  return {
    id: Number(p?.id ?? p?.product_id ?? 0),
    // merchantId: String(brandId),
    title: p?.name ?? p?.title ?? "",
    slug: p?.slug ?? "",
    price: Number(p?.price ?? 0),
    mainImage: buildImgSrc(String(rawImg ?? "")),
    rating: avgRating,
    inStock: Number(p?.stock_quantity ?? p?.inStock ?? p?.stock ?? 0),
    description: p?.description ?? "",
    // categoryId: categoryId as any,
    // manufacturer: brandName,
  };
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `API trả về không phải JSON. Status=${res.status}. Body=${text.slice(0, 200)}`
    );
  }
}

export async function getProducts(
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/api/products${toQuery(searchParams)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }

    const json: any = await readJsonSafe(res);

    const rawList =
      Array.isArray(json?.products?.data)
        ? json.products.data
        : 
        Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];

    return rawList.map(adaptProduct);
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export async function searchProducts(q: string): Promise<Product[]> {
  try {
    const keyword = (q ?? "").trim();
    if (!keyword) return [];

    const url = `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(keyword)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to search products: ${res.status} ${res.statusText}`);
    }

    const json: any = await readJsonSafe(res);

    const rawList = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

    return rawList.map(adaptProduct);
  } catch (e) {
    console.error("Error searching products:", e);
    return [];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const pid = String(id ?? "").trim();
    if (!pid) return null;

    const url = `${API_BASE_URL}/api/products/${encodeURIComponent(pid)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json: any = await readJsonSafe(res);

    const raw = json?.product ?? json?.data ?? null;
    if (!raw) return null;

    return adaptProduct(raw);
  } catch (e) {
    console.error("Error fetching product by id:", e);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);

    const json: any = await readJsonSafe(res);

    const list: Category[] = Array.isArray(json?.categories)
      ? json.categories
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    return list;
  } catch (e) {
    console.error("Error fetching categories:", e);
    return [];
  }
}

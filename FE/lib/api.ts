import { getSession } from "next-auth/react";
import config from "./config";

type RequestInitLike = RequestInit & { body?: any };

function isRequestInitLike(v: any): v is RequestInitLike {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    ("method" in v ||
      "headers" in v ||
      "body" in v ||
      "credentials" in v ||
      "signal" in v ||
      "cache" in v ||
      "mode" in v ||
      "redirect" in v ||
      "referrer" in v ||
      "integrity" in v ||
      "keepalive" in v)
  );
}

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // getSession chỉ chạy ổn ở client-side
    const session = await getSession().catch(() => null);
    const token = (session as any)?.accessToken;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as any),
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, { ...options, headers });
  },

  get(endpoint: string, options?: RequestInit) {
    return apiClient.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint: string, dataOrOptions?: any, options?: RequestInit) {
    const optsFromArg = isRequestInitLike(dataOrOptions) ? dataOrOptions : undefined;
    const data = optsFromArg ? undefined : dataOrOptions;

    const mergedOptions: RequestInit = {
      ...(optsFromArg ?? {}),
      ...(options ?? {}),
      method: "POST",
    };

    // Nếu caller đã set body (kiểu fetch), giữ nguyên.
    // Nếu caller truyền data object, stringify data.
    if (mergedOptions.body === undefined && data !== undefined) {
      mergedOptions.body = JSON.stringify(data);
    }

    return apiClient.request(endpoint, mergedOptions);
  },

  put(endpoint: string, dataOrOptions?: any, options?: RequestInit) {
    const optsFromArg = isRequestInitLike(dataOrOptions) ? dataOrOptions : undefined;
    const data = optsFromArg ? undefined : dataOrOptions;

    const mergedOptions: RequestInit = {
      ...(optsFromArg ?? {}),
      ...(options ?? {}),
      method: "PUT",
    };

    if (mergedOptions.body === undefined && data !== undefined) {
      mergedOptions.body = JSON.stringify(data);
    }

    return apiClient.request(endpoint, mergedOptions);
  },

  delete(endpoint: string, options?: RequestInit) {
    return apiClient.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default apiClient;

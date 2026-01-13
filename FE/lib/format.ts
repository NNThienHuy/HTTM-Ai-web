export const formatVND = (value: number | string) => {
  const n = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(safe);
};

export const normalizeImageUrl = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const backendOriginFromApi = String(process.env.REACT_APP_API_URL || "")
    .trim()
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "");
  const backendOrigin =
    String(process.env.REACT_APP_BACKEND_ORIGIN || "").trim().replace(/\/+$/, "") ||
    backendOriginFromApi ||
    "http://localhost:5000";

  if (/^blob:/i.test(trimmed)) return trimmed;
  if (/^data:image\//i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${backendOrigin}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${backendOrigin}/${trimmed}`;

  // Allow users to paste domain-style URLs without protocol.
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

export const resolveImageUrl = (value, fallback) => normalizeImageUrl(value) || fallback;

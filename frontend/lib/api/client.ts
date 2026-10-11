// The ONLY place that calls fetch(). Everything else uses the typed modules in lib/api/.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "nutriguide_token";
const GENERIC_ERROR = "Something went wrong. Please try again.";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// NOTE: localStorage keeps this project simple. For production, prefer an httpOnly cookie.
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => window.localStorage.setItem(TOKEN_KEY, t),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

type Query = Record<string, string | number | undefined>;

function messageFromDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    // FastAPI validation errors: [{ loc, msg }]
    return detail
      .map((d) => (typeof d?.msg === "string" ? d.msg.replace(/^Value error, /, "") : ""))
      .filter(Boolean)
      .join(" ");
  }
  return GENERIC_ERROR;
}

export async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; query?: Query; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, query, auth = true } = opts;
  const qs = query
    ? "?" + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${qs}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth && token) {
      tokenStore.clear();
      if (typeof window !== "undefined") window.location.assign("/login");
    }
    throw new ApiError(messageFromDetail(data?.detail), res.status);
  }
  return data as T;
}

import type { UserEntity } from "@db/types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function normalizeBackendOrigin(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const raw =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
      : "";
  if (!raw) return p;
  return `${normalizeBackendOrigin(raw)}${p}`;
}

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SECRET_KEY?.trim()
      : undefined;
  if (!token) return {};
  return { "x-token": token };
}

export async function apiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const url =
    typeof input === "string" && input.startsWith("/") ? apiUrl(input) : input;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchUsers(): Promise<UserEntity[]> {
  return apiJson<UserEntity[]>("/api/users");
}

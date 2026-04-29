import type { UserEntity } from "@db/types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SECRET_KEY
      : undefined;
  if (!token) return {};
  return { "x-token": token };
}

export async function apiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
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

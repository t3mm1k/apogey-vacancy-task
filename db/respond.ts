import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonZodError(error: z.ZodError) {
  return NextResponse.json(
    { error: "validation_error", issues: error.issues },
    { status: 400 },
  );
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

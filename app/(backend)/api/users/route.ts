import { createUserBodySchema } from "@db/user-schemas";
import { jsonError, jsonZodError, readJson } from "@db/respond";
import { createUser, listUsers } from "@db/users-service";
import { NextResponse } from "next/server";

export function GET() {
  try {
    return NextResponse.json(listUsers());
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

export async function POST(req: Request) {
  const raw = await readJson<unknown>(req);
  if (raw === null) {
    return jsonError(400, "invalid_json");
  }

  const parsed = createUserBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonZodError(parsed.error);
  }

  try {
    const profile = createUser(parsed.data);
    return NextResponse.json(profile, { status: 201 });
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

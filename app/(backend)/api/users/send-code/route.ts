import { jsonError, jsonZodError, readJson } from "@db/respond";
import { sendCodeBodySchema } from "@db/user-schemas";
import { userExists } from "@db/users-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const raw = await readJson<unknown>(req);
  if (raw === null) {
    return jsonError(400, "invalid_json");
  }

  const parsed = sendCodeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonZodError(parsed.error);
  }

  try {
    if (!userExists(parsed.data.userId)) {
      return jsonError(404, "not_found");
    }
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

import { jsonError, jsonZodError, readJson } from "@db/respond";
import { confirmCodeBodySchema } from "@db/user-schemas";
import { confirmPhoneChange } from "@db/users-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const raw = await readJson<unknown>(req);
  if (raw === null) {
    return jsonError(400, "invalid_json");
  }

  const parsed = confirmCodeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonZodError(parsed.error);
  }

  const { userId, phone, code } = parsed.data;

  try {
    const result = confirmPhoneChange(userId, phone, code);
    if (!result.ok) {
      if (result.reason === "not_found") {
        return jsonError(404, "not_found");
      }
      return jsonError(400, "invalid_code");
    }
    return NextResponse.json(result.profile);
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

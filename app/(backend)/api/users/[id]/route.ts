import { jsonError, jsonZodError, readJson } from "@db/respond";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "@db/users-service";
import { updateUserBodySchema } from "@db/user-schemas";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  try {
    const user = getUserById(id);
    if (!user) {
      return jsonError(404, "not_found");
    }
    return NextResponse.json(user);
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

export async function PUT(req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const raw = await readJson<unknown>(req);
  if (raw === null) {
    return jsonError(400, "invalid_json");
  }

  const parsed = updateUserBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonZodError(parsed.error);
  }

  try {
    const user = updateUser(id, parsed.data);
    if (!user) {
      return jsonError(404, "not_found");
    }
    return NextResponse.json(user);
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  try {
    const removed = deleteUser(id);
    if (!removed) {
      return jsonError(404, "not_found");
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return jsonError(500, "database_unavailable");
  }
}

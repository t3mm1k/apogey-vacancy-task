import { reinitializeDatabase } from "@db/sqlite";
import { NextResponse } from "next/server";

const UUID_1 = "a1111111-1111-4111-8111-111111111101";
const UUID_2 = "a1111111-1111-4111-8111-111111111102";
const UUID_3 = "a1111111-1111-4111-8111-111111111103";

const NAME_AFTER_PUT = "АннаПослеPUT";
const NEW_PHONE = "+79997776655";

type Step = {
  step: string;
  status: number;
  body: unknown;
  ok: boolean;
};

const authHeaders = (secret: string) => ({
  "x-token": secret,
  "content-type": "application/json",
});

async function readBackendBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function pickId(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("id" in body)) return null;
  const id = (body as { id: unknown }).id;
  return typeof id === "string" ? id : null;
}

export async function GET() {
  const base = process.env.BACKEND_URL?.trim().replace(/\/$/, "");
  const secret = process.env.SECRET_KEY?.trim();

  if (!base) {
    return NextResponse.json({ ok: false, error: "missing_BACKEND_URL" }, { status: 500 });
  }
  if (!secret) {
    return NextResponse.json({ ok: false, error: "missing_SECRET_KEY" }, { status: 500 });
  }

  const h = authHeaders(secret);
  const steps: Step[] = [];

  const push = (step: string, res: Response, body: unknown, ok: boolean) => {
    steps.push({ step, status: res.status, body, ok });
  };

  try {
    reinitializeDatabase();
    const r1 = await fetch(`${base}/api/users/${UUID_1}`, {
      method: "PUT",
      headers: h,
      body: JSON.stringify({ name: NAME_AFTER_PUT }),
      cache: "no-store",
    });
    const b1 = await readBackendBody(r1);
    const putOk =
      r1.status === 200 &&
      typeof b1 === "object" &&
      b1 !== null &&
      (b1 as { name?: string }).name === NAME_AFTER_PUT;
    push("1) PUT /api/users/[uuid_1]", r1, b1, putOk);

    const r1phone = await fetch(`${base}/api/users/${UUID_1}`, {
      method: "PUT",
      headers: h,
      body: JSON.stringify({ phone: NEW_PHONE }),
      cache: "no-store",
    });
    const b1phone = await readBackendBody(r1phone);
    push(
      "1b) PUT /api/users/[uuid_1] — phone запрещён",
      r1phone,
      b1phone,
      r1phone.status === 400,
    );

    const r2a = await fetch(`${base}/api/users/send-code`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ userId: UUID_2, phone: NEW_PHONE }),
      cache: "no-store",
    });
    const b2a = await readBackendBody(r2a);
    push("2a) POST /api/users/send-code [uuid_2]", r2a, b2a, r2a.status === 200);

    const r2b = await fetch(`${base}/api/users/confirm-code`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        userId: UUID_2,
        phone: NEW_PHONE,
        code: "1111",
      }),
      cache: "no-store",
    });
    const b2b = await readBackendBody(r2b);
    const phoneOk =
      r2b.status === 200 &&
      typeof b2b === "object" &&
      b2b !== null &&
      (b2b as { phone?: string }).phone === NEW_PHONE &&
      (b2b as { phoneVerified?: boolean }).phoneVerified === true;
    push("2b) POST /api/users/confirm-code [uuid_2]", r2b, b2b, phoneOk);

    const r3 = await fetch(`${base}/api/users/${UUID_3}`, {
      method: "DELETE",
      headers: { "x-token": secret },
      cache: "no-store",
    });
    const b3 = await readBackendBody(r3);
    push("3) DELETE /api/users/[uuid_3]", r3, b3, r3.status === 204);

    const createPayload = {
      name: "Смоук",
      surname: "Новый",
      middlename: "Пользователь",
      position: "intern" as const,
      phone: "+79990001101",
      schedule: {
        weekdaysStart: 3600,
        weekdaysEnd: 72000,
        allowOffdayCallsWeekdays: true,
      },
    };
    const r4 = await fetch(`${base}/api/users`, {
      method: "POST",
      headers: h,
      body: JSON.stringify(createPayload),
      cache: "no-store",
    });
    const b4 = await readBackendBody(r4);
    const idCreated = pickId(b4);
    push(
      "4) POST /api/users — create",
      r4,
      b4,
      r4.status === 201 && idCreated !== null,
    );

    const r5 = await fetch(`${base}/api/users/${UUID_1}`, {
      headers: { "x-token": secret },
      cache: "no-store",
    });
    const b5 = await readBackendBody(r5);
    const getModifiedOk =
      r5.status === 200 &&
      typeof b5 === "object" &&
      b5 !== null &&
      (b5 as { name?: string }).name === NAME_AFTER_PUT;
    push("5) GET /api/users/[uuid_1] — после PUT", r5, b5, getModifiedOk);

    if (idCreated) {
      const r6 = await fetch(`${base}/api/users/${idCreated}`, {
        headers: { "x-token": secret },
        cache: "no-store",
      });
      const b6 = await readBackendBody(r6);
      const getCreatedOk =
        r6.status === 200 &&
        typeof b6 === "object" &&
        b6 !== null &&
        (b6 as { name?: string }).name === createPayload.name;
      push("6) GET /api/users/[created]", r6, b6, getCreatedOk);
    } else {
      steps.push({
        step: "6) GET /api/users/[created]",
        status: 0,
        body: null,
        ok: false,
      });
    }

    const r7 = await fetch(`${base}/api/users`, {
      headers: { "x-token": secret },
      cache: "no-store",
    });
    const b7 = await readBackendBody(r7);
    const listOk = r7.status === 200 && Array.isArray(b7);
    push("7) GET /api/users — список", r7, b7, listOk);

    const ok = steps.every((s) => s.ok);
    return NextResponse.json({ ok, steps }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, steps }, { status: 500 });
  }
}

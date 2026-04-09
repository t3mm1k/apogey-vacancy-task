import { z } from "zod";
import { POSITION_VALUES } from "./position";

const positionSchema = z.enum(POSITION_VALUES);

const secondsSchema = z.number().int().min(0).max(86400);

export const scheduleInputSchema = z
  .object({
    weekdaysStart: secondsSchema,
    weekdaysEnd: secondsSchema,
    allowOffdayCallsWeekdays: z.boolean(),
    lunchStart: secondsSchema.optional(),
    lunchEnd: secondsSchema.optional(),
    allowLunchCalls: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const has = [
      val.lunchStart !== undefined,
      val.lunchEnd !== undefined,
      val.allowLunchCalls !== undefined,
    ];
    const n = has.filter(Boolean).length;
    if (n !== 0 && n !== 3) {
      ctx.addIssue({
        code: "custom",
        message: "lunch: укажите lunchStart, lunchEnd и allowLunchCalls или не передавайте ланч",
      });
    }
  });

export type ScheduleInput = z.infer<typeof scheduleInputSchema>;

export const createUserBodySchema = z
  .object({
    name: z.string().min(1),
    surname: z.string().min(1),
    middlename: z.string().min(1),
    position: positionSchema,
    phone: z.string().optional(),
    phoneVerified: z.boolean().optional(),
    schedule: scheduleInputSchema,
  })
  .strict();

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    surname: z.string().min(1).optional(),
    middlename: z.string().min(1).optional(),
    position: positionSchema.optional(),
    schedule: scheduleInputSchema.optional(),
  })
  .strict();

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const sendCodeBodySchema = z.object({
  userId: z.string().uuid(),
  phone: z.string().min(1),
});

export const confirmCodeBodySchema = z.object({
  userId: z.string().uuid(),
  phone: z.string().min(1),
  code: z.string().min(1),
});

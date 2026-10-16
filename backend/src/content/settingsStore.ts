import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { snapshot } from "../lib/audit.js";
import { badRequest, notFound, zodFields } from "../lib/errors.js";
import { emptyValue, objectSchema } from "./fields.js";
import { settingByKey, settingRefinements, settings } from "./settings.js";

export function requireSetting(key: string) {
  const def = settingByKey.get(key);
  if (!def) throw notFound("Unknown settings group.");
  return def;
}

function emptyFor(key: string) {
  const def = requireSetting(key);
  return Object.fromEntries(def.fields.map((f) => [f.name, emptyValue(f)]));
}

/** All settings documents, with defaults filled in for anything never saved. */
export async function allSettings(): Promise<Record<string, Record<string, unknown>>> {
  const rows = await prisma.setting.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.value as Record<string, unknown>]));
  return Object.fromEntries(settings.map((s) => [s.key, { ...emptyFor(s.key), ...(byKey.get(s.key) ?? {}) }]));
}

export async function updateSetting(key: string, input: unknown, userId: string | null) {
  const def = requireSetting(key);
  const parsed = objectSchema(def.fields).safeParse(input ?? {});
  if (!parsed.success) {
    const fields = zodFields(parsed.error);
    throw badRequest(Object.values(fields)[0] ?? "Check the highlighted fields.", fields);
  }
  const value = parsed.data as Record<string, unknown>;
  const extra = settingRefinements(key, value);
  if (Object.keys(extra).length) throw badRequest(Object.values(extra)[0], extra);
  const json = JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  await prisma.setting.upsert({ where: { key }, create: { key, value: json, updatedById: userId }, update: { value: json, updatedById: userId } });
  await snapshot("setting", key, "saved", value, userId ?? undefined);
  return value;
}

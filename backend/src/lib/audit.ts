import type { Prisma } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "../db.js";

export interface AuditEntry {
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}

/** Records an administrative action. Failures are logged but never block the request. */
export async function audit(req: Request, entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: { ...entry, userId: req.user?.id ?? null, ip: req.ip ?? null },
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}

/** Stores a snapshot so an earlier version can be restored. */
export async function snapshot(entityType: string, entityId: string, action: string, data: unknown, userId?: string) {
  await prisma.revision.create({
    data: { entityType, entityId, action, data: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue, userId: userId ?? null },
  });
}

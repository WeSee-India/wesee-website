import type { Role } from "@prisma/client";

/**
 * What each role can do. Enforced on every admin route by requirePermission();
 * the admin UI reads the same list (from /api/auth/me) only to hide controls.
 *
 * - EDITOR: write and publish content, upload media.
 * - ADMIN: everything an editor can, plus deleting, settings, page structure and the activity log.
 * - OWNER: everything, including managing users.
 */
export const PERMISSIONS = {
  "content.edit": ["OWNER", "ADMIN", "EDITOR"],
  "content.publish": ["OWNER", "ADMIN", "EDITOR"],
  "content.delete": ["OWNER", "ADMIN"],
  "structure.edit": ["OWNER", "ADMIN"],
  "media.upload": ["OWNER", "ADMIN", "EDITOR"],
  "media.delete": ["OWNER", "ADMIN"],
  "settings.edit": ["OWNER", "ADMIN"],
  "audit.view": ["OWNER", "ADMIN"],
  "users.manage": ["OWNER"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function permissionsFor(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((p) => can(role, p));
}

/**
 * Create or reset an admin user from the command line.
 *
 *   pnpm user:create -- --email you@weseegpt.com --name "Your Name" --role OWNER
 *
 * The password is read from the ADMIN_PASSWORD environment variable, or a
 * strong one is generated and printed once.
 */
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaClient, type Role } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "OWNER" } } });
const roles: Role[] = ["OWNER", "ADMIN", "EDITOR"];
if (!values.email || !roles.includes(values.role as Role)) {
  console.error('Usage: pnpm user:create -- --email you@example.com --name "Name" [--role OWNER|ADMIN|EDITOR]');
  process.exit(1);
}

const prisma = new PrismaClient();
const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD ?? randomBytes(18).toString("base64url");
if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}
const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
const email = values.email.toLowerCase();
const user = await prisma.user.upsert({
  where: { email },
  create: { email, name: values.name ?? email, role: values.role as Role, passwordHash },
  update: { passwordHash, role: values.role as Role, isActive: true, failedLogins: 0, lockedUntil: null, ...(values.name ? { name: values.name } : {}) },
});
await prisma.session.deleteMany({ where: { userId: user.id } });
console.log(`${user.role} ${user.email} is ready.`);
if (generated) console.log(`Password (shown once): ${password}`);
await prisma.$disconnect();

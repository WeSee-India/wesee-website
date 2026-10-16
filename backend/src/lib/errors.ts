import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error",
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) => new HttpError(400, message, "bad_request", fields);
export const unauthorized = (message = "Sign in to continue.") => new HttpError(401, message, "unauthorized");
export const forbidden = (message = "You don't have permission to do that.") => new HttpError(403, message, "forbidden");
export const notFound = (message = "Not found.") => new HttpError(404, message, "not_found");
export const conflict = (message: string, fields?: Record<string, string>) => new HttpError(409, message, "conflict", fields);

/** Flatten Zod issues into { "path.to.field": "message" }, first message per field. */
export function zodFields(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found.", code: "not_found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code, fields: err.fields });
  }
  if (err instanceof ZodError) {
    const fields = zodFields(err);
    return res.status(400).json({ error: Object.values(fields)[0] ?? "Check the form and try again.", code: "validation", fields });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = ([] as string[]).concat((err.meta?.target as string[] | string) ?? []);
      const fields = Object.fromEntries(target.map((t) => [t, "This value is already in use."]));
      return res.status(409).json({ error: "That value is already in use.", code: "conflict", fields });
    }
    if (err.code === "P2025") return res.status(404).json({ error: "Not found.", code: "not_found" });
  }
  // multer and body-parser errors carry a status
  const status = typeof err?.status === "number" ? err.status : typeof err?.statusCode === "number" ? err.statusCode : 500;
  if (status < 500) return res.status(status).json({ error: err.message ?? "Bad request.", code: err.code ?? "bad_request" });

  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Please try again.", code: "server_error" });
};

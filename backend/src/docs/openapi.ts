import { collections } from "../content/collections.js";
import { settings } from "../content/settings.js";

/**
 * OpenAPI description of the API, served at /openapi.json and rendered by Swagger UI at /docs.
 * Hand-written: keep it in step with src/routes when an endpoint is added or changed.
 */

type Op = {
  summary: string;
  description?: string;
  params?: string[];
  query?: Record<string, { type: string; enum?: string[]; description?: string }>;
  body?: Record<string, unknown>;
  multipart?: Record<string, unknown>;
  auth?: "session" | "session+csrf";
  created?: boolean;
};

const json = (schema: unknown) => ({ "application/json": { schema } });
const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties, ...(required.length ? { required } : {}) });
const str = (description?: string, extra: Record<string, unknown> = {}) => ({ type: "string", ...(description ? { description } : {}), ...extra });

const collectionKeys = collections.map((c) => c.key);
const settingKeys = settings.map((s) => s.key);
const role = { type: "string", enum: ["OWNER", "ADMIN", "EDITOR"] };

const paramDocs: Record<string, Record<string, unknown>> = {
  key: { description: "Collection key (collections routes) or settings/page key.", schema: { type: "string" } },
  id: { schema: { type: "string" } },
  slug: { schema: { type: "string" } },
  revisionId: { schema: { type: "string" } },
};

function op(tag: string, o: Op) {
  const parameters = [
    ...(o.params ?? []).map((name) => ({ name, in: "path", required: true, ...paramDocs[name] })),
    ...Object.entries(o.query ?? {}).map(([name, s]) => ({ name, in: "query", required: false, description: s.description, schema: { type: s.type, ...(s.enum ? { enum: s.enum } : {}) } })),
  ];
  const responses: Record<string, unknown> = {
    [o.created ? "201" : "200"]: { description: "OK", content: json({ type: "object" }) },
    "400": { $ref: "#/components/responses/Error" },
    "404": { $ref: "#/components/responses/Error" },
  };
  if (o.auth) responses["401"] = { $ref: "#/components/responses/Error" };
  if (o.auth === "session+csrf") responses["403"] = { $ref: "#/components/responses/Error" };
  return {
    tags: [tag],
    summary: o.summary,
    ...(o.description ? { description: o.description } : {}),
    ...(parameters.length ? { parameters } : {}),
    ...(o.body ? { requestBody: { required: true, content: json(o.body) } } : {}),
    ...(o.multipart ? { requestBody: { required: true, content: { "multipart/form-data": { schema: o.multipart } } } } : {}),
    ...(o.auth === "session" ? { security: [{ session: [] }] } : {}),
    ...(o.auth === "session+csrf" ? { security: [{ session: [], csrf: [] }] } : {}),
    responses,
  };
}

const A = "session+csrf" as const;

export function openApiSpec(serverUrl: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "WeSee CMS API",
      version: "1.0.0",
      description: [
        "Content API for weseegpt.com and its admin panel.",
        "",
        "**Public** endpoints need no login. **Admin** endpoints need a session: call `POST /api/auth/login`",
        "(the browser keeps the session cookie), then copy `csrfToken` from the response into **Authorize → csrf**.",
        `Collections: ${collectionKeys.map((k) => `\`${k}\``).join(", ")}. Settings: ${settingKeys.map((k) => `\`${k}\``).join(", ")}.`,
      ].join("\n"),
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: "Health" },
      { name: "Public", description: "Published content for the website. Cached; no login." },
      { name: "Contact", description: "Contact / discovery-call form." },
      { name: "Auth", description: "Admin sign-in and the signed-in user's account." },
      { name: "Admin · Collections", description: "Projects, case studies, blog posts, services and the other repeatable content." },
      { name: "Admin · Pages", description: "Built-in and custom pages and their sections." },
      { name: "Admin · Media", description: "Image and document library." },
      { name: "Admin · Settings", description: "Site-wide settings." },
      { name: "Admin · Users & activity", description: "Team accounts, dashboard and the audit log." },
    ],
    components: {
      securitySchemes: {
        session: { type: "apiKey", in: "cookie", name: "wesee_admin_session", description: "Set by POST /api/auth/login." },
        csrf: { type: "apiKey", in: "header", name: "X-CSRF-Token", description: "The csrfToken from login or GET /api/auth/me. Required on admin and account changes." },
      },
      responses: {
        Error: { description: "Error", content: json(obj({ error: str(), code: str(), fields: { type: "object", additionalProperties: { type: "string" } } })) },
      },
    },
    paths: {
      "/health": { get: op("Health", { summary: "Server and database health" }) },

      "/api/public/snapshot": { get: op("Public", { summary: "Everything published", description: "Settings, pages and every collection in one response. The website is built from this." }) },
      "/api/public/settings": { get: op("Public", { summary: "All site settings" }) },
      "/api/public/pages": { get: op("Public", { summary: "All published pages" }) },
      "/api/public/pages/{key}": { get: op("Public", { summary: "One published page", params: ["key"] }) },
      "/api/public/collections/{key}": { get: op("Public", { summary: "Published items of a collection", params: ["key"] }) },
      "/api/public/collections/{key}/{slug}": { get: op("Public", { summary: "One published item by slug", params: ["key", "slug"] }) },
      "/api/public/preview": { get: op("Public", { summary: "Draft preview", description: "Authorised by a short-lived token from the admin's Preview button.", query: { token: { type: "string" } } }) },

      "/api/contact": {
        post: op("Contact", {
          summary: "Send a contact message",
          description: "Rate-limited to 10 per 10 minutes per connection. Emails the team via Resend.",
          body: obj(
            {
              name: str(),
              email: str(undefined, { format: "email" }),
              message: str(),
              company: str(),
              service: str(),
              phone: str(),
              consentNonMarketing: { type: "boolean" },
              consentMarketing: { type: "boolean" },
              honeypot: str("Spam trap: leave empty."),
              formAge: { type: "number", description: "Milliseconds the form was open; under 1000 is treated as a bot." },
            },
            ["name", "email", "message"],
          ),
        }),
      },

      "/api/auth/login": {
        post: op("Auth", {
          summary: "Sign in",
          description: "Sets the session cookie and returns the user plus a `csrfToken`. Rate-limited to 20 attempts per 15 minutes.",
          body: obj({ email: str(undefined, { format: "email" }), password: str(undefined, { format: "password" }) }, ["email", "password"]),
        }),
      },
      "/api/auth/me": {
        get: op("Auth", { summary: "Current user and CSRF token", auth: "session" }),
        patch: op("Auth", { summary: "Update your name", auth: A, body: obj({ name: str() }, ["name"]) }),
      },
      "/api/auth/logout": { post: op("Auth", { summary: "Sign out", auth: A }) },
      "/api/auth/password": {
        post: op("Auth", {
          summary: "Change your password",
          description: "Signs out your other devices.",
          auth: A,
          body: obj({ currentPassword: str(undefined, { format: "password" }), newPassword: str("12+ characters.", { format: "password" }) }, ["currentPassword", "newPassword"]),
        }),
      },

      "/api/admin/schema": { get: op("Admin · Users & activity", { summary: "Content model (collections, fields, settings, page types)", auth: A }) },
      "/api/admin/dashboard": { get: op("Admin · Users & activity", { summary: "Dashboard counts and recent activity", auth: A }) },
      "/api/admin/audit": {
        get: op("Admin · Users & activity", {
          summary: "Audit log",
          auth: A,
          query: { entityType: { type: "string" }, entityId: { type: "string" }, userId: { type: "string" }, action: { type: "string" }, take: { type: "integer" }, skip: { type: "integer" } },
        }),
      },
      "/api/admin/users": {
        get: op("Admin · Users & activity", { summary: "List team accounts", auth: A }),
        post: op("Admin · Users & activity", {
          summary: "Add a team account",
          auth: A,
          created: true,
          body: obj({ email: str(undefined, { format: "email" }), name: str(), role, password: str("12+ characters.", { format: "password" }) }, ["email", "name", "role", "password"]),
        }),
      },
      "/api/admin/users/{id}": {
        patch: op("Admin · Users & activity", { summary: "Update a team account", auth: A, params: ["id"], body: obj({ name: str(), role, isActive: { type: "boolean" }, password: str(undefined, { format: "password" }) }) }),
        delete: op("Admin · Users & activity", { summary: "Remove a team account", auth: A, params: ["id"] }),
      },

      "/api/admin/settings": { get: op("Admin · Settings", { summary: "All settings", auth: A }) },
      "/api/admin/settings/{key}": { put: op("Admin · Settings", { summary: "Save a settings group", auth: A, params: ["key"], body: { type: "object", description: "The group's fields, as described by /api/admin/schema." } }) },
      "/api/admin/settings/{key}/revisions": { get: op("Admin · Settings", { summary: "Settings history", auth: A, params: ["key"] }) },

      "/api/admin/collections/{key}": {
        get: op("Admin · Collections", {
          summary: "List items",
          auth: A,
          params: ["key"],
          query: { q: { type: "string", description: "Search" }, status: { type: "string", enum: ["all", "draft", "published", "pending"] }, take: { type: "integer" }, skip: { type: "integer" } },
        }),
        post: op("Admin · Collections", { summary: "Create a draft item", auth: A, params: ["key"], created: true, body: { type: "object", description: "The collection's fields, as described by /api/admin/schema." } }),
      },
      "/api/admin/collections/{key}/reorder": { post: op("Admin · Collections", { summary: "Reorder items", auth: A, params: ["key"], body: obj({ ids: { type: "array", items: str() } }, ["ids"]) }) },
      "/api/admin/collections/{key}/{id}": {
        get: op("Admin · Collections", { summary: "Get an item (draft and published state)", auth: A, params: ["key", "id"] }),
        put: op("Admin · Collections", { summary: "Save the draft", auth: A, params: ["key", "id"], body: { type: "object" } }),
        delete: op("Admin · Collections", { summary: "Delete an item", auth: A, params: ["key", "id"] }),
      },
      "/api/admin/collections/{key}/{id}/publish": {
        post: op("Admin · Collections", { summary: "Publish now or schedule", auth: A, params: ["key", "id"], body: obj({ publishAt: str("ISO date to schedule; omit to publish now.", { format: "date-time", nullable: true }) }) }),
      },
      "/api/admin/collections/{key}/{id}/unpublish": { post: op("Admin · Collections", { summary: "Unpublish", auth: A, params: ["key", "id"] }) },
      "/api/admin/collections/{key}/{id}/discard": { post: op("Admin · Collections", { summary: "Discard draft changes", auth: A, params: ["key", "id"] }) },
      "/api/admin/collections/{key}/{id}/preview": { post: op("Admin · Collections", { summary: "Create a preview link", auth: A, params: ["key", "id"] }) },
      "/api/admin/collections/{key}/{id}/revisions": { get: op("Admin · Collections", { summary: "Item history", auth: A, params: ["key", "id"] }) },
      "/api/admin/collections/{key}/{id}/revisions/{revisionId}/restore": { post: op("Admin · Collections", { summary: "Restore a revision into the draft", auth: A, params: ["key", "id", "revisionId"] }) },

      "/api/admin/pages": {
        get: op("Admin · Pages", { summary: "List pages", auth: A }),
        post: op("Admin · Pages", { summary: "Create a custom page", auth: A, created: true, body: obj({ title: str(), path: str() }) }),
      },
      "/api/admin/pages/{id}": {
        get: op("Admin · Pages", { summary: "Get a page", auth: A, params: ["id"] }),
        put: op("Admin · Pages", { summary: "Save the draft", auth: A, params: ["id"], body: { type: "object" } }),
        delete: op("Admin · Pages", { summary: "Delete a custom page", auth: A, params: ["id"] }),
      },
      "/api/admin/pages/{id}/publish": { post: op("Admin · Pages", { summary: "Publish", auth: A, params: ["id"] }) },
      "/api/admin/pages/{id}/unpublish": { post: op("Admin · Pages", { summary: "Unpublish", auth: A, params: ["id"] }) },
      "/api/admin/pages/{id}/discard": { post: op("Admin · Pages", { summary: "Discard draft changes", auth: A, params: ["id"] }) },
      "/api/admin/pages/{id}/preview": { post: op("Admin · Pages", { summary: "Create a preview link", auth: A, params: ["id"] }) },
      "/api/admin/pages/{id}/revisions": { get: op("Admin · Pages", { summary: "Page history", auth: A, params: ["id"] }) },
      "/api/admin/pages/{id}/revisions/{revisionId}/restore": { post: op("Admin · Pages", { summary: "Restore a revision into the draft", auth: A, params: ["id", "revisionId"] }) },

      "/api/admin/media": {
        get: op("Admin · Media", { summary: "List media", auth: A, query: { q: { type: "string" }, type: { type: "string", enum: ["image", "document"] }, take: { type: "integer" }, skip: { type: "integer" } } }),
        post: op("Admin · Media", { summary: "Upload files (up to 20)", auth: A, multipart: obj({ files: { type: "array", items: { type: "string", format: "binary" } } }, ["files"]) }),
      },
      "/api/admin/media/{id}": {
        patch: op("Admin · Media", { summary: "Edit alt text or name", auth: A, params: ["id"], body: obj({ alt: str(undefined, { nullable: true }), originalName: str() }) }),
        delete: op("Admin · Media", { summary: "Delete a file", description: "Refused while the file is in use unless `force=true`.", auth: A, params: ["id"], query: { force: { type: "boolean" } } }),
      },
      "/api/admin/media/{id}/replace": { post: op("Admin · Media", { summary: "Replace a file, keeping its URL", auth: A, params: ["id"], multipart: obj({ file: { type: "string", format: "binary" } }, ["file"]) }) },
      "/api/admin/media/{id}/usage": { get: op("Admin · Media", { summary: "Where a file is used", auth: A, params: ["id"] }) },
    },
  };
}

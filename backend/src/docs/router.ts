import crypto from "node:crypto";
import { Router } from "express";
import { openApiSpec } from "./openapi.js";

/** API reference: Swagger UI at /docs (assets from jsDelivr), the spec at /openapi.json, and / redirects to /docs. */
export const docsRouter = Router();

const SWAGGER_UI = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14";

docsRouter.get("/", (_req, res) => res.redirect(302, "/docs"));

docsRouter.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec("/"));
});

docsRouter.get("/docs", (_req, res) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  // Loosens the API's default-src 'none' policy for this page only.
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      `script-src ${SWAGGER_UI}/ 'nonce-${nonce}'`,
      `style-src ${SWAGGER_UI}/ 'unsafe-inline'`,
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>WeSee CMS API</title>
  <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css">
  <style>body { margin: 0; } .swagger-ui .topbar { display: none; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
  <script nonce="${nonce}">
    window.ui = SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      persistAuthorization: true,
      withCredentials: true,
      docExpansion: "list",
      tryItOutEnabled: false,
    });
  </script>
</body>
</html>`);
});

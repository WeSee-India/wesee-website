import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { config } from "../config.js";
import { badRequest } from "./errors.js";

/**
 * Media storage on local disk (UPLOAD_DIR). In production this directory must
 * be on a persistent volume (a Railway volume), or uploads are lost on redeploy.
 *
 * Files are validated by their actual bytes, not the name or the browser's
 * claimed type. SVG is not accepted because it can carry scripts.
 */

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export interface StoredFile {
  storageKey: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
}

export async function ensureUploadDir() {
  await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
}

function safeBaseName(originalName: string) {
  return (
    path
      .parse(originalName)
      .name.toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file"
  );
}

/** Validate and inspect an upload, returning its real type and dimensions. */
export async function inspectUpload(buffer: Buffer) {
  if (buffer.length === 0) throw badRequest("The file is empty.");
  if (buffer.length > config.uploadMaxBytes) throw badRequest(`Files can be up to ${config.UPLOAD_MAX_MB} MB.`);
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_TYPES[detected.mime]) {
    throw badRequest("That file type isn't supported. Upload a JPG, PNG, WebP, AVIF, GIF or PDF.");
  }
  let width: number | null = null;
  let height: number | null = null;
  let data = buffer;
  if (detected.mime.startsWith("image/")) {
    try {
      const image = sharp(buffer, { animated: detected.mime === "image/gif" });
      const meta = await image.metadata();
      width = meta.width ?? null;
      height = meta.pageHeight ?? meta.height ?? null;
      // Re-encode still images: drops EXIF (location data) and applies orientation.
      if (RASTER.has(detected.mime)) data = await sharp(buffer).rotate().toBuffer();
    } catch {
      throw badRequest("That image couldn't be read. It may be damaged; try exporting it again.");
    }
  }
  return { data, mimeType: detected.mime, ext: ALLOWED_TYPES[detected.mime], width, height };
}

export async function saveUpload(buffer: Buffer, originalName: string): Promise<StoredFile> {
  const info = await inspectUpload(buffer);
  const storageKey = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}-${safeBaseName(originalName)}.${info.ext}`;
  await ensureUploadDir();
  await fs.writeFile(path.join(config.UPLOAD_DIR, storageKey), info.data);
  return { storageKey, mimeType: info.mimeType, size: info.data.length, width: info.width, height: info.height };
}

/** Overwrite an existing file in place so its URL keeps working. The type must stay the same. */
export async function replaceUpload(storageKey: string, currentMime: string, buffer: Buffer): Promise<Omit<StoredFile, "storageKey">> {
  const info = await inspectUpload(buffer);
  if (info.mimeType !== currentMime) {
    throw badRequest(`Replace it with the same kind of file (${ALLOWED_TYPES[currentMime]?.toUpperCase() ?? currentMime}) so existing links keep working.`);
  }
  await fs.writeFile(path.join(config.UPLOAD_DIR, storageKey), info.data);
  return { mimeType: info.mimeType, size: info.data.length, width: info.width, height: info.height };
}

export async function deleteUpload(storageKey: string) {
  await fs.rm(path.join(config.UPLOAD_DIR, path.basename(storageKey)), { force: true });
}

export const publicUrlFor = (storageKey: string) => `/uploads/${storageKey}`;

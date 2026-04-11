export function toSlug(input: string, fallbackPrefix = "media") {
  const slug = input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  if (slug) {
    return slug;
  }

  return `${fallbackPrefix}-${Date.now()}`;
}

export function parseOptionalInt(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const numberValue = Number(text);
  if (!Number.isFinite(numberValue)) {
    return Number.NaN;
  }

  return numberValue;
}

export function getFileExtension(file: File) {
  const parts = file.name.split(".");
  const rawExt = parts.length > 1 ? parts.pop() : "";
  const ext = String(rawExt ?? "").toLowerCase().trim();

  if (ext && /^[a-z0-9]+$/.test(ext)) {
    return ext;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }
  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }
  if (file.type === "image/avif") {
    return "avif";
  }
  if (file.type === "image/gif") {
    return "gif";
  }
  if (file.type === "image/svg+xml") {
    return "svg";
  }

  return "bin";
}

export function isVercelBlobUrl(value: string) {
  return /https?:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(value);
}

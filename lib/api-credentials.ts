import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export const API_CREDENTIAL_PROVIDERS = ["TELEGRAM", "OPENAI", "SERPAPI"] as const;
export type ApiCredentialProvider = (typeof API_CREDENTIAL_PROVIDERS)[number];

type StoredApiCredential = {
  version: 1;
  provider: ApiCredentialProvider;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  maskedValue: string;
  isActive: boolean;
  lastValidatedAt: string | null;
};

export type ApiCredentialView = {
  provider: ApiCredentialProvider;
  label: string;
  maskedValue: string;
  isActive: boolean;
  configured: boolean;
  updatedAt: string | null;
  lastValidatedAt: string | null;
};

const API_CREDENTIAL_SETTING_PREFIX = "api_credential";

const providerLabelMap: Record<ApiCredentialProvider, string> = {
  TELEGRAM: "Telegram Bot",
  OPENAI: "OpenAI API",
  SERPAPI: "SerpAPI"
};

function ensureObject(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getSettingKey(provider: ApiCredentialProvider) {
  return `${API_CREDENTIAL_SETTING_PREFIX}:${provider.toLowerCase()}`;
}

function toBase64(buffer: Buffer) {
  return buffer.toString("base64");
}

function fromBase64(value: string) {
  return Buffer.from(value, "base64");
}

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_MASTER_KEY?.trim() ?? "";
  if (!raw) {
    throw new Error("Missing ENCRYPTION_MASTER_KEY");
  }
  return createHash("sha256").update(raw).digest();
}

function encryptSecret(secret: string): Pick<StoredApiCredential, "encryptedSecret" | "iv" | "authTag"> {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedSecret: toBase64(encrypted),
    iv: toBase64(iv),
    authTag: toBase64(authTag)
  };
}

function parseStoredCredential(value: Prisma.JsonValue | null | undefined): StoredApiCredential | null {
  const record = ensureObject(value);
  if (!record) {
    return null;
  }

  const version = record.version;
  const provider = record.provider;
  const encryptedSecret = record.encryptedSecret;
  const iv = record.iv;
  const authTag = record.authTag;
  const maskedValue = record.maskedValue;
  const isActive = record.isActive;
  const lastValidatedAt = record.lastValidatedAt;

  if (version !== 1) {
    return null;
  }

  if (typeof provider !== "string" || !API_CREDENTIAL_PROVIDERS.includes(provider as ApiCredentialProvider)) {
    return null;
  }

  if (
    typeof encryptedSecret !== "string" ||
    typeof iv !== "string" ||
    typeof authTag !== "string" ||
    typeof maskedValue !== "string" ||
    typeof isActive !== "boolean"
  ) {
    return null;
  }

  return {
    version: 1,
    provider: provider as ApiCredentialProvider,
    encryptedSecret,
    iv,
    authTag,
    maskedValue,
    isActive,
    lastValidatedAt: typeof lastValidatedAt === "string" ? lastValidatedAt : null
  };
}

function maskSecret(secret: string) {
  const trimmed = secret.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}***${trimmed.slice(-1)}`;
  }

  return `${trimmed.slice(0, 4)}***${trimmed.slice(-4)}`;
}

async function upsertSettingForTenant(
  tx: Prisma.TransactionClient,
  tenantId: string | null,
  key: string,
  value: Prisma.InputJsonValue
) {
  const existing = await tx.siteSetting.findFirst({
    where: {
      key,
      ...(tenantId
        ? {
            OR: [{ tenantId }, { tenantId: null }]
          }
        : {})
    },
    select: {
      id: true,
      tenantId: true
    }
  });

  if (existing) {
    return tx.siteSetting.update({
      where: { id: existing.id },
      data: {
        tenantId: tenantId ?? existing.tenantId,
        value,
        groupKey: "integrations",
        isPublic: false,
        description: "Encrypted API credential"
      }
    });
  }

  return tx.siteSetting.create({
    data: {
      tenantId,
      key,
      value,
      groupKey: "integrations",
      isPublic: false,
      description: "Encrypted API credential"
    }
  });
}

export async function listApiCredentialsForTenant(tenantId: string | null): Promise<ApiCredentialView[]> {
  if (!process.env.DATABASE_URL) {
    return API_CREDENTIAL_PROVIDERS.map((provider) => ({
      provider,
      label: providerLabelMap[provider],
      configured: false,
      maskedValue: "",
      isActive: false,
      updatedAt: null,
      lastValidatedAt: null
    }));
  }

  const keys = API_CREDENTIAL_PROVIDERS.map((provider) => getSettingKey(provider));
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: keys
      },
      ...(tenantId
        ? {
            OR: [{ tenantId }, { tenantId: null }]
          }
        : { tenantId: null })
    },
    select: {
      key: true,
      tenantId: true,
      value: true,
      updatedAt: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  const rowMap = new Map<string, (typeof rows)[number]>();
  for (const key of keys) {
    const tenantRow = rows.find((row) => row.key === key && row.tenantId === tenantId);
    const fallbackRow = rows.find((row) => row.key === key && row.tenantId === null);
    if (tenantRow) {
      rowMap.set(key, tenantRow);
    } else if (fallbackRow) {
      rowMap.set(key, fallbackRow);
    }
  }

  return API_CREDENTIAL_PROVIDERS.map((provider) => {
    const row = rowMap.get(getSettingKey(provider));
    const parsed = parseStoredCredential(row?.value);

    return {
      provider,
      label: providerLabelMap[provider],
      configured: Boolean(parsed),
      maskedValue: parsed?.maskedValue ?? "",
      isActive: parsed?.isActive ?? false,
      updatedAt: row?.updatedAt.toISOString() ?? null,
      lastValidatedAt: parsed?.lastValidatedAt ?? null
    };
  });
}

export async function saveApiCredentialForTenant(input: {
  tenantId: string | null;
  provider: ApiCredentialProvider;
  secretInput: string;
  isActive: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Thieu DATABASE_URL." };
  }

  const key = getSettingKey(input.provider);
  const secretTrimmed = input.secretInput.trim();

  const existing = await prisma.siteSetting.findFirst({
    where: {
      key,
      ...(input.tenantId
        ? {
            OR: [{ tenantId: input.tenantId }, { tenantId: null }]
          }
        : {})
    },
    select: {
      value: true
    }
  });

  const existingParsed = parseStoredCredential(existing?.value);
  const secretToPersist = secretTrimmed || null;

  if (!secretToPersist && !existingParsed) {
    return { ok: false, message: "Vui long nhap secret API." };
  }

  const encrypted =
    secretToPersist !== null
      ? encryptSecret(secretToPersist)
      : {
          encryptedSecret: existingParsed?.encryptedSecret ?? "",
          iv: existingParsed?.iv ?? "",
          authTag: existingParsed?.authTag ?? ""
        };

  const nextValue: StoredApiCredential = {
    version: 1,
    provider: input.provider,
    encryptedSecret: encrypted.encryptedSecret,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    maskedValue: secretToPersist ? maskSecret(secretToPersist) : existingParsed?.maskedValue ?? "",
    isActive: input.isActive,
    lastValidatedAt: existingParsed?.lastValidatedAt ?? null
  };

  await prisma.$transaction(async (tx) => {
    await upsertSettingForTenant(tx, input.tenantId, key, nextValue as Prisma.InputJsonValue);
  });

  return { ok: true };
}

export async function decryptApiCredentialSecret(input: {
  tenantId: string | null;
  provider: ApiCredentialProvider;
}): Promise<string | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const key = getSettingKey(input.provider);
  const row = await prisma.siteSetting.findFirst({
    where: {
      key,
      ...(input.tenantId
        ? {
            OR: [{ tenantId: input.tenantId }, { tenantId: null }]
          }
        : { tenantId: null })
    },
    orderBy: {
      updatedAt: "desc"
    },
    select: {
      value: true
    }
  });

  const parsed = parseStoredCredential(row?.value);
  if (!parsed || !parsed.isActive) {
    return null;
  }

  try {
    const keyBuffer = getEncryptionKey();
    const decipher = createDecipheriv("aes-256-gcm", keyBuffer, fromBase64(parsed.iv));
    decipher.setAuthTag(fromBase64(parsed.authTag));
    const decrypted = Buffer.concat([
      decipher.update(fromBase64(parsed.encryptedSecret)),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

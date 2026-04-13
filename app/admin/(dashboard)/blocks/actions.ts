"use server";

import { Prisma, SectionType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getHomeBlockTemplate, getHomeSectionTemplate, type HomeBlockTemplate } from "@/lib/home-blocks";
import { isBuilderSectionKey } from "@/lib/page-builder";
import prisma from "@/lib/prisma";
import { resolveTenantIdForSessionUser, whereByTenantId } from "@/lib/tenant";

type ActionStatus = "idle" | "success" | "error";

export type BlocksActionState = {
  status: ActionStatus;
  message: string;
};

type EditorGuard = { tenantId: string | null } | { error: BlocksActionState };

const sectionKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+-[a-z0-9-]+$/, "Khóa section không hợp lệ.")
  .refine((value) => isBuilderSectionKey(value), "Section phải thuộc một trang hợp lệ.")
  .max(120, "Khóa section không hợp lệ.");

const blockKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Khóa block không hợp lệ.")
  .max(120, "Khóa block không hợp lệ.");

const sectionFormSchema = z.object({
  sectionKey: sectionKeySchema,
  title: z.string().trim().min(2, "Tiêu đề mục cần ít nhất 2 ký tự.").max(200, "Tiêu đề mục quá dài."),
  description: z.string().trim().max(3000, "Mô tả quá dài."),
  isActive: z.boolean()
});

const blockFormSchema = z.object({
  sectionKey: sectionKeySchema,
  blockKey: blockKeySchema,
  title: z.string().trim().max(200, "Tiêu đề khối quá dài."),
  sortOrder: z.coerce.number().int().min(-999).max(9999),
  isActive: z.boolean(),
  blockType: z.string().trim().min(1).max(60)
});

const layoutRowSchema = z.object({
  sectionKey: sectionKeySchema,
  blocks: z.array(blockKeySchema).max(300)
});

function errorState(message: string): BlocksActionState {
  return {
    status: "error",
    message
  };
}

function successState(message: string): BlocksActionState {
  return {
    status: "success",
    message
  };
}

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseBlockContentFromTemplate(
  blockTemplate: HomeBlockTemplate,
  formData: FormData
): { content: Record<string, unknown> } | { error: string } {
  const nextContent: Record<string, unknown> = {};

  for (const field of blockTemplate.fields) {
    const key = `field_${field.key}`;
    const rawValue = String(formData.get(key) ?? "");
    const value = rawValue.trim();

    if (field.type === "lines") {
      const lines = parseLines(rawValue);
      if (field.required && lines.length === 0) {
        return { error: `${field.label} không được để trống.` };
      }
      nextContent[field.key] = lines;
      continue;
    }

    if (field.type === "json") {
      if (field.required && !value) {
        return { error: `${field.label} không được để trống.` };
      }

      if (!value) {
        nextContent[field.key] = {};
        continue;
      }

      try {
        const parsedJson = JSON.parse(value) as unknown;
        if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
          return { error: `${field.label} phải là JSON object hợp lệ.` };
        }
        nextContent[field.key] = parsedJson;
      } catch {
        return { error: `${field.label} phải là JSON hợp lệ.` };
      }

      continue;
    }

    if (field.required && !value) {
      return { error: `${field.label} không được để trống.` };
    }

    if (value.length > 5000) {
      return { error: `${field.label} vượt quá độ dài cho phép.` };
    }

    nextContent[field.key] = value;
  }

  return { content: nextContent };
}

function parseRawJsonContent(contentJson: string): { content: Record<string, unknown> } | { error: string } {
  const trimmed = contentJson.trim();
  if (!trimmed) {
    return { error: "Nội dung JSON của block không được để trống." };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "Nội dung JSON của block phải là object hợp lệ." };
    }

    return {
      content: parsed as Record<string, unknown>
    };
  } catch {
    return { error: "Nội dung JSON của block không hợp lệ." };
  }
}

function revalidateBuilderContent() {
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/gioi-thieu", "page");
  revalidatePath("/dich-vu", "page");
  revalidatePath("/bang-gia", "page");
  revalidatePath("/blog", "page");
  revalidatePath("/faq", "page");
  revalidatePath("/lien-he", "page");
  revalidatePath("/admincp/blocks", "page");
}

async function validateAuthenticatedEditor(): Promise<EditorGuard> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: errorState("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") };
  }

  const role = session.user.role;
  if (role !== UserRole.ADMIN && role !== UserRole.EDITOR) {
    return { error: errorState("Bạn không có quyền cập nhật nội dung landing page.") };
  }

  const tenantId = await resolveTenantIdForSessionUser(session.user);
  return { tenantId };
}

async function findSectionByTenantAndKey(sectionKey: string, tenantId: string | null) {
  let section = await prisma.siteSection.findFirst({
    where: {
      ...whereByTenantId(tenantId),
      key: sectionKey
    }
  });

  if (!section && tenantId) {
    section = await prisma.siteSection.findFirst({
      where: {
        tenantId: null,
        key: sectionKey
      }
    });
  }

  return section;
}

async function upsertSectionByKey(
  sectionKey: string,
  input: { title: string; description: string; isActive: boolean },
  tenantId: string | null
) {
  const template = getHomeSectionTemplate(sectionKey);

  const createSection = {
    tenantId,
    key: sectionKey,
    name: template?.name ?? `Section ${sectionKey}`,
    type: template?.type ?? SectionType.HOME,
    sortOrder: template?.sortOrder ?? 999,
    title: input.title,
    description: input.description || null,
    isActive: input.isActive
  };

  const existing = await findSectionByTenantAndKey(sectionKey, tenantId);
  if (existing) {
    return prisma.siteSection.update({
      where: { id: existing.id },
      data: {
        tenantId,
        title: input.title,
        description: input.description || null,
        isActive: input.isActive,
        name: template?.name ?? createSection.name,
        type: template?.type ?? createSection.type
      }
    });
  }

  return prisma.siteSection.create({ data: createSection });
}

export async function saveLayoutOrderAction(
  _prevState: BlocksActionState,
  formData: FormData
): Promise<BlocksActionState> {
  const guard = await validateAuthenticatedEditor();
  if ("error" in guard) {
    return guard.error;
  }

  if (!process.env.DATABASE_URL) {
    return errorState("Thiếu DATABASE_URL nên chưa thể lưu bố cục.");
  }

  const rawJson = String(formData.get("layout_json") ?? "");
  if (!rawJson.trim()) {
    return errorState("Không tìm thấy dữ liệu bố cục để lưu.");
  }

  let parsedRows: unknown;
  try {
    parsedRows = JSON.parse(rawJson);
  } catch {
    return errorState("Dữ liệu bố cục không hợp lệ.");
  }

  const parsed = z.array(layoutRowSchema).min(1).safeParse(parsedRows);
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dữ liệu bố cục không hợp lệ.");
  }

  try {
    const sectionKeys = parsed.data.map((row) => row.sectionKey);
    let sections = await prisma.siteSection.findMany({
      where: {
        ...whereByTenantId(guard.tenantId),
        key: { in: sectionKeys }
      },
      select: { id: true, key: true }
    });

    if (sections.length === 0 && guard.tenantId) {
      sections = await prisma.siteSection.findMany({
        where: {
          tenantId: null,
          key: { in: sectionKeys }
        },
        select: { id: true, key: true }
      });
    }

    const sectionIdByKey = new Map(sections.map((section) => [section.key, section.id]));

    await prisma.$transaction(async (tx) => {
      for (let sectionIndex = 0; sectionIndex < parsed.data.length; sectionIndex += 1) {
        const layoutSection = parsed.data[sectionIndex];
        const sectionId = sectionIdByKey.get(layoutSection.sectionKey);

        if (!sectionId) {
          continue;
        }

        await tx.siteSection.update({
          where: { id: sectionId },
          data: {
            sortOrder: sectionIndex + 1
          }
        });

        for (let blockIndex = 0; blockIndex < layoutSection.blocks.length; blockIndex += 1) {
          const blockKey = layoutSection.blocks[blockIndex];
          await tx.pageBlock.updateMany({
            where: {
              sectionId,
              blockKey
            },
            data: {
              sortOrder: blockIndex + 1
            }
          });
        }
      }
    });

    revalidateBuilderContent();
    return successState("Đã lưu thứ tự bố cục landing page.");
  } catch {
    return errorState("Không thể lưu thứ tự bố cục. Vui lòng thử lại.");
  }
}

export async function updateSectionAction(
  _prevState: BlocksActionState,
  formData: FormData
): Promise<BlocksActionState> {
  const guard = await validateAuthenticatedEditor();
  if ("error" in guard) {
    return guard.error;
  }

  if (!process.env.DATABASE_URL) {
    return errorState("Thiếu DATABASE_URL nên chưa thể lưu nội dung.");
  }

  const parsed = sectionFormSchema.safeParse({
    sectionKey: String(formData.get("sectionKey") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dữ liệu section không hợp lệ.");
  }

  try {
    await upsertSectionByKey(
      parsed.data.sectionKey,
      {
        title: parsed.data.title,
        description: parsed.data.description,
        isActive: parsed.data.isActive
      },
      guard.tenantId
    );

    revalidateBuilderContent();
    return successState("Đã cập nhật mục nội dung thành công.");
  } catch {
    return errorState("Không thể cập nhật mục nội dung. Vui lòng thử lại.");
  }
}

export async function updateBlockAction(
  _prevState: BlocksActionState,
  formData: FormData
): Promise<BlocksActionState> {
  const guard = await validateAuthenticatedEditor();
  if ("error" in guard) {
    return guard.error;
  }

  if (!process.env.DATABASE_URL) {
    return errorState("Thiếu DATABASE_URL nên chưa thể lưu block.");
  }

  const parsed = blockFormSchema.safeParse({
    sectionKey: String(formData.get("sectionKey") ?? ""),
    blockKey: String(formData.get("blockKey") ?? ""),
    title: String(formData.get("title") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    isActive: formData.get("isActive") === "on",
    blockType: String(formData.get("blockType") ?? "text")
  });

  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dữ liệu block không hợp lệ.");
  }

  try {
    let section = await findSectionByTenantAndKey(parsed.data.sectionKey, guard.tenantId);

    if (!section) {
      section = await upsertSectionByKey(
        parsed.data.sectionKey,
        {
          title: String(formData.get("sectionTitleFallback") ?? parsed.data.sectionKey),
          description: String(formData.get("sectionDescriptionFallback") ?? ""),
          isActive: true
        },
        guard.tenantId
      );
    }

    const existingBlock = await prisma.pageBlock.findUnique({
      where: {
        sectionId_blockKey: {
          sectionId: section.id,
          blockKey: parsed.data.blockKey
        }
      }
    });

    const blockTemplate = getHomeBlockTemplate(parsed.data.sectionKey, parsed.data.blockKey);
    let nextContent: Record<string, unknown>;

    if (blockTemplate) {
      const parsedTemplateContent = parseBlockContentFromTemplate(blockTemplate, formData);
      if ("error" in parsedTemplateContent) {
        return errorState(parsedTemplateContent.error);
      }

      nextContent = {
        ...asRecord(existingBlock?.content),
        ...parsedTemplateContent.content
      };
    } else {
      const rawContent = parseRawJsonContent(String(formData.get("content_json") ?? ""));
      if ("error" in rawContent) {
        return errorState(rawContent.error);
      }
      nextContent = rawContent.content;
    }

    await prisma.pageBlock.upsert({
      where: {
        sectionId_blockKey: {
          sectionId: section.id,
          blockKey: parsed.data.blockKey
        }
      },
      update: {
        tenantId: guard.tenantId,
        title: parsed.data.title || null,
        blockType: blockTemplate?.blockType ?? parsed.data.blockType,
        content: nextContent as Prisma.InputJsonValue,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder
      },
      create: {
        tenantId: guard.tenantId,
        sectionId: section.id,
        blockKey: parsed.data.blockKey,
        title: parsed.data.title || null,
        blockType: blockTemplate?.blockType ?? parsed.data.blockType,
        content: nextContent as Prisma.InputJsonValue,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder
      }
    });

    revalidateBuilderContent();
    return successState("Đã cập nhật block thành công.");
  } catch {
    return errorState("Không thể cập nhật block. Vui lòng thử lại.");
  }
}

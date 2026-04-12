import { Prisma, SectionType } from "@prisma/client";

import { AdminBlocksEditor } from "@/components/admin/blocks-editor";
import {
  HOME_CONTENT_SECTION_KEY_SET,
  HOME_CONTENT_SECTION_TEMPLATES,
  getHomeSectionTemplate,
  type HomeBlockEditorField,
  type HomeBlockEditorItem,
  type HomeBlockFieldType,
  type HomeSectionEditorItem
} from "@/lib/home-blocks";
import prisma from "@/lib/prisma";
import { resolveTenantForCurrentRequest, whereByTenantId } from "@/lib/tenant";

type DbSectionWithBlocks = {
  key: string;
  name: string;
  type: SectionType;
  sortOrder: number;
  title: string | null;
  description: string | null;
  isActive: boolean;
  blocks: Array<{
    blockKey: string;
    blockType: string;
    sortOrder: number;
    title: string | null;
    isActive: boolean;
    content: Prisma.JsonValue | null;
  }>;
};

type MediaAssetForEditor = {
  id: string;
  title: string;
  url: string;
  altText: string | null;
  groupKey: string;
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function formatJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function stringifyFieldValue(value: unknown, type: HomeBlockFieldType) {
  if (type === "lines") {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
        .join("\n");
    }

    return typeof value === "string" ? value : "";
  }

  if (type === "json") {
    return formatJson(value);
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function buildTemplateBlockEditorData(
  sectionKey: string,
  existingBlockMap: Map<string, DbSectionWithBlocks["blocks"][number]>
): HomeBlockEditorItem[] {
  const sectionTemplate = getHomeSectionTemplate(sectionKey);
  if (!sectionTemplate) {
    return [];
  }

  return sectionTemplate.blocks.map((blockTemplate) => {
    const dbBlock = existingBlockMap.get(blockTemplate.blockKey);
    const dbContent = asRecord(dbBlock?.content);
    const defaultContent = blockTemplate.defaultContent;

    const fields: HomeBlockEditorField[] = blockTemplate.fields.map((field) => {
      const fallbackValue = defaultContent[field.key];
      const dbValue = dbContent[field.key];
      const resolvedValue = dbValue ?? fallbackValue;

      return {
        key: field.key,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
        placeholder: field.placeholder,
        helperText: field.helperText,
        options: field.options,
        value: stringifyFieldValue(resolvedValue, field.type)
      };
    });

    return {
      blockKey: blockTemplate.blockKey,
      label: blockTemplate.label,
      blockType: dbBlock?.blockType ?? blockTemplate.blockType,
      sortOrder: dbBlock?.sortOrder ?? blockTemplate.sortOrder,
      title: dbBlock?.title ?? blockTemplate.label,
      isActive: dbBlock?.isActive ?? true,
      description: blockTemplate.description,
      mode: "template",
      fields,
      rawJson: formatJson(dbBlock?.content ?? blockTemplate.defaultContent)
    };
  });
}

function buildRawBlockEditorData(block: DbSectionWithBlocks["blocks"][number]): HomeBlockEditorItem {
  return {
    blockKey: block.blockKey,
    label: block.title ?? block.blockKey,
    blockType: block.blockType,
    sortOrder: block.sortOrder,
    title: block.title ?? "",
    isActive: block.isActive,
    description: "Block ngoài cấu hình mẫu, chỉnh sửa bằng JSON.",
    mode: "raw",
    fields: [],
    rawJson: formatJson(block.content ?? {})
  };
}

function buildTemplateOnlySections(): HomeSectionEditorItem[] {
  return HOME_CONTENT_SECTION_TEMPLATES.map((sectionTemplate) => ({
    key: sectionTemplate.key,
    name: sectionTemplate.name,
    type: sectionTemplate.type,
    sortOrder: sectionTemplate.sortOrder,
    title: sectionTemplate.title,
    description: sectionTemplate.description,
    isActive: true,
    blocks: sectionTemplate.blocks.map((blockTemplate) => ({
      blockKey: blockTemplate.blockKey,
      label: blockTemplate.label,
      blockType: blockTemplate.blockType,
      sortOrder: blockTemplate.sortOrder,
      title: blockTemplate.label,
      isActive: true,
      description: blockTemplate.description,
      mode: "template",
      fields: blockTemplate.fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
        placeholder: field.placeholder,
        helperText: field.helperText,
        options: field.options,
        value: stringifyFieldValue(blockTemplate.defaultContent[field.key], field.type)
      })),
      rawJson: formatJson(blockTemplate.defaultContent)
    }))
  }));
}

async function getEditorData(): Promise<{
  sections: HomeSectionEditorItem[];
  mediaAssets: MediaAssetForEditor[];
  databaseReady: boolean;
}> {
  if (!process.env.DATABASE_URL) {
    return {
      sections: buildTemplateOnlySections(),
      mediaAssets: [],
      databaseReady: false
    };
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    const tenantId = tenant?.id ?? null;

    const [dbSections, mediaAssets] = await Promise.all([
      prisma.siteSection.findMany({
        where: {
          ...whereByTenantId(tenantId),
          key: {
            startsWith: "home-"
          }
        },
        include: {
          blocks: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
          }
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }),
      prisma.mediaAsset.findMany({
        where: {
          ...whereByTenantId(tenantId),
          isActive: true
        },
        orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          url: true,
          altText: true,
          groupKey: true
        }
      })
    ]);

    const sectionRows =
      dbSections.length > 0 || !tenantId
        ? dbSections
        : await prisma.siteSection.findMany({
            where: {
              tenantId: null,
              key: {
                startsWith: "home-"
              }
            },
            include: {
              blocks: {
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
              }
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
          });

    const assetRows =
      mediaAssets.length > 0 || !tenantId
        ? mediaAssets
        : await prisma.mediaAsset.findMany({
            where: { tenantId: null, isActive: true },
            orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
            select: {
              id: true,
              title: true,
              url: true,
              altText: true,
              groupKey: true
            }
          });

    const dbSectionMap = new Map<string, DbSectionWithBlocks>();
    for (const section of sectionRows) {
      dbSectionMap.set(section.key, section);
    }

    const templateSections: HomeSectionEditorItem[] = HOME_CONTENT_SECTION_TEMPLATES.map((sectionTemplate) => {
      const dbSection = dbSectionMap.get(sectionTemplate.key);
      const dbBlockMap = new Map(dbSection?.blocks.map((block) => [block.blockKey, block]) ?? []);

      const templatedBlocks = buildTemplateBlockEditorData(sectionTemplate.key, dbBlockMap);

      const extraBlocks = (dbSection?.blocks ?? [])
        .filter((block) => !sectionTemplate.blocks.some((templateBlock) => templateBlock.blockKey === block.blockKey))
        .map((block) => buildRawBlockEditorData(block));

      return {
        key: sectionTemplate.key,
        name: dbSection?.name ?? sectionTemplate.name,
        type: dbSection?.type ?? sectionTemplate.type,
        sortOrder: dbSection?.sortOrder ?? sectionTemplate.sortOrder,
        title: dbSection?.title ?? sectionTemplate.title,
        description: dbSection?.description ?? sectionTemplate.description,
        isActive: dbSection?.isActive ?? true,
        blocks: [...templatedBlocks, ...extraBlocks].sort((a, b) => a.sortOrder - b.sortOrder)
      };
    });

    const customSections: HomeSectionEditorItem[] = sectionRows
      .filter((section) => !HOME_CONTENT_SECTION_KEY_SET.has(section.key))
      .map((section) => ({
        key: section.key,
        name: section.name,
        type: section.type,
        sortOrder: section.sortOrder,
        title: section.title ?? section.name,
        description: section.description ?? "",
        isActive: section.isActive,
        blocks: section.blocks.map((block) => buildRawBlockEditorData(block))
      }));

    return {
      sections: [...templateSections, ...customSections].sort((a, b) => a.sortOrder - b.sortOrder),
      mediaAssets: assetRows,
      databaseReady: true
    };
  } catch {
    return {
      sections: buildTemplateOnlySections(),
      mediaAssets: [],
      databaseReady: false
    };
  }
}

export default async function AdminBlocksPage() {
  const { sections, mediaAssets, databaseReady } = await getEditorData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Landing Editor trang chủ</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kéo thả để đổi bố cục section và block, chỉnh nội dung trực tiếp, thay ảnh ngay trong từng block bằng cách
          chọn từ thư viện hoặc upload trực tiếp. Sau khi lưu, trang công khai cập nhật ngay từ SQL.
        </p>
      </section>

      <AdminBlocksEditor sections={sections} mediaAssets={mediaAssets} databaseReady={databaseReady} />
    </div>
  );
}

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

  const blocksFromTemplate = sectionTemplate.blocks.map((blockTemplate) => {
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
      mode: "template" as const,
      fields,
      rawJson: formatJson(dbBlock?.content ?? blockTemplate.defaultContent)
    };
  });

  return blocksFromTemplate;
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
        value: stringifyFieldValue(blockTemplate.defaultContent[field.key], field.type)
      })),
      rawJson: formatJson(blockTemplate.defaultContent)
    }))
  }));
}

async function getEditorData(): Promise<{ sections: HomeSectionEditorItem[]; databaseReady: boolean }> {
  if (!process.env.DATABASE_URL) {
    return {
      sections: buildTemplateOnlySections(),
      databaseReady: false
    };
  }

  try {
    const dbSections = await prisma.siteSection.findMany({
      where: {
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

    const dbSectionMap = new Map<string, DbSectionWithBlocks>();
    for (const section of dbSections) {
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

    const customSections: HomeSectionEditorItem[] = dbSections
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
      databaseReady: true
    };
  } catch {
    return {
      sections: buildTemplateOnlySections(),
      databaseReady: false
    };
  }
}

export default async function AdminBlocksPage() {
  const { sections, databaseReady } = await getEditorData();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý blocks nội dung trang chủ</h1>
        <p className="mt-2 text-sm text-slate-600">
          Chỉnh sửa trực tiếp nội dung section và block đang dùng ở homepage (hero, badge, CTA, mô tả section, footer
          text). Sau khi lưu thành công, public site sẽ nhận dữ liệu mới từ SQL.
        </p>
      </section>

      <AdminBlocksEditor sections={sections} databaseReady={databaseReady} />
    </div>
  );
}

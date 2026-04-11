import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export type FooterContentData = {
  companyName: string;
  description: string;
  serviceAreas: string[];
  bottomNote: string;
};

const fallbackFooterContent: FooterContentData = {
  companyName: "Taxi Ninh Bình",
  description: "Dịch vụ taxi và xe du lịch chuyên nghiệp, hỗ trợ đặt xe nhanh 24/7.",
  serviceAreas: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Hoa Lư", "Kim Sơn"],
  bottomNote: "© {year} Taxi Ninh Bình. Bản quyền thuộc về Taxi Ninh Bình."
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getTextFromRecord(record: Record<string, unknown> | null, key = "text"): string | undefined {
  const value = record?.[key];
  if (typeof value !== "string") {
    return undefined;
  }

  const text = value.trim();
  return text.length > 0 ? text : undefined;
}

function getListFromRecord(record: Record<string, unknown> | null, key = "items"): string[] {
  const value = record?.[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

export async function getFooterContentData(): Promise<FooterContentData> {
  if (!process.env.DATABASE_URL) {
    return fallbackFooterContent;
  }

  try {
    const section = await prisma.siteSection.findFirst({
      where: {
        key: "home-footer",
        isActive: true
      },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    if (!section) {
      return fallbackFooterContent;
    }

    const blockByKey = (blockKey: string) => section.blocks.find((block) => block.blockKey === blockKey);
    const companyBlock = blockByKey("footer-company-name");
    const descriptionBlock = blockByKey("footer-description");
    const serviceAreasBlock = blockByKey("footer-service-areas");
    const bottomNoteBlock = blockByKey("footer-bottom-note");

    const companyName =
      getTextFromRecord(asRecord(companyBlock?.content)) ??
      section.title?.trim() ??
      fallbackFooterContent.companyName;
    const description =
      getTextFromRecord(asRecord(descriptionBlock?.content)) ??
      section.description?.trim() ??
      fallbackFooterContent.description;
    const serviceAreas = getListFromRecord(asRecord(serviceAreasBlock?.content));
    const bottomNote =
      getTextFromRecord(asRecord(bottomNoteBlock?.content)) ?? fallbackFooterContent.bottomNote;

    return {
      companyName,
      description,
      serviceAreas: serviceAreas.length > 0 ? serviceAreas : fallbackFooterContent.serviceAreas,
      bottomNote
    };
  } catch {
    return fallbackFooterContent;
  }
}

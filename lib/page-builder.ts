export type BuilderPageKey = "home" | "about" | "services" | "pricing" | "blog" | "faq" | "contact";

export type BuilderPageConfig = {
  key: BuilderPageKey;
  label: string;
  sectionPrefix: string;
  previewPath: string;
};

export const BUILDER_PAGE_CONFIGS: BuilderPageConfig[] = [
  {
    key: "home",
    label: "Trang chu",
    sectionPrefix: "home-",
    previewPath: "/"
  },
  {
    key: "about",
    label: "Gioi thieu",
    sectionPrefix: "about-",
    previewPath: "/gioi-thieu"
  },
  {
    key: "services",
    label: "Dich vu",
    sectionPrefix: "services-",
    previewPath: "/dich-vu"
  },
  {
    key: "pricing",
    label: "Bang gia",
    sectionPrefix: "pricing-",
    previewPath: "/bang-gia"
  },
  {
    key: "blog",
    label: "Blog",
    sectionPrefix: "blog-",
    previewPath: "/blog"
  },
  {
    key: "faq",
    label: "FAQ",
    sectionPrefix: "faq-",
    previewPath: "/faq"
  },
  {
    key: "contact",
    label: "Lien he",
    sectionPrefix: "contact-",
    previewPath: "/lien-he"
  }
];

const builderPageConfigMap = new Map<BuilderPageKey, BuilderPageConfig>(
  BUILDER_PAGE_CONFIGS.map((item) => [item.key, item])
);

export function getBuilderPageConfig(input?: string | null): BuilderPageConfig {
  if (input) {
    const normalized = input.trim().toLowerCase() as BuilderPageKey;
    const matched = builderPageConfigMap.get(normalized);
    if (matched) {
      return matched;
    }
  }

  return builderPageConfigMap.get("home") as BuilderPageConfig;
}

export function sectionBelongsToBuilderPage(sectionKey: string, pageKey: BuilderPageKey): boolean {
  const page = getBuilderPageConfig(pageKey);
  return sectionKey.startsWith(page.sectionPrefix);
}

export function isBuilderSectionKey(sectionKey: string): boolean {
  const normalized = sectionKey.trim().toLowerCase();
  return BUILDER_PAGE_CONFIGS.some((page) => normalized.startsWith(page.sectionPrefix));
}

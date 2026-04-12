-- DropIndex
DROP INDEX IF EXISTS "BlogCategory_slug_key";

-- DropIndex
DROP INDEX IF EXISTS "BlogPost_slug_key";

-- DropIndex
DROP INDEX IF EXISTS "Faq_slug_key";

-- DropIndex
DROP INDEX IF EXISTS "MediaAsset_code_key";

-- DropIndex
DROP INDEX IF EXISTS "PricingItem_code_key";

-- DropIndex
DROP INDEX IF EXISTS "ServicePage_slug_key";

-- DropIndex
DROP INDEX IF EXISTS "SiteSection_key_key";

-- DropIndex
DROP INDEX IF EXISTS "SiteSetting_key_key";

-- DropIndex
DROP INDEX IF EXISTS "Testimonial_code_key";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_tenantId_slug_key" ON "BlogCategory"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_tenantId_slug_key" ON "BlogPost"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Faq_tenantId_slug_key" ON "Faq"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_tenantId_code_key" ON "MediaAsset"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PricingItem_tenantId_code_key" ON "PricingItem"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServicePage_tenantId_slug_key" ON "ServicePage"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSection_tenantId_key_key" ON "SiteSection"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_tenantId_key_key" ON "SiteSetting"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Testimonial_tenantId_code_key" ON "Testimonial"("tenantId", "code");

-- DropIndex
DROP INDEX "BlogCategory_slug_key";

-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- DropIndex
DROP INDEX "Faq_slug_key";

-- DropIndex
DROP INDEX "MediaAsset_code_key";

-- DropIndex
DROP INDEX "PricingItem_code_key";

-- DropIndex
DROP INDEX "ServicePage_slug_key";

-- DropIndex
DROP INDEX "SiteSection_key_key";

-- DropIndex
DROP INDEX "SiteSetting_key_key";

-- DropIndex
DROP INDEX "Testimonial_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_tenantId_slug_key" ON "BlogCategory"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_tenantId_slug_key" ON "BlogPost"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_tenantId_slug_key" ON "Faq"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_tenantId_code_key" ON "MediaAsset"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PricingItem_tenantId_code_key" ON "PricingItem"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePage_tenantId_slug_key" ON "ServicePage"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSection_tenantId_key_key" ON "SiteSection"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_tenantId_key_key" ON "SiteSetting"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_tenantId_code_key" ON "Testimonial"("tenantId", "code");

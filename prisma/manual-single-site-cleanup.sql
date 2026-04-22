-- Optional cleanup for single-site mode.
-- Run only after you have stopped using CMS multi-domain features.

BEGIN;

-- Drop legacy tenant-domain table from CMS mode.
DROP TABLE IF EXISTS "TenantDomain";

-- Remove legacy CMS domain field from tenant.
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "cmsDomain";

COMMIT;

-- AlterTable: Seller agrega landingContent editable
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "landingContent" JSONB;

-- CreateTable: SellerPlanOverride (personalización de planes por vendedor)
DROP TABLE IF EXISTS "SellerPlanOverride";
CREATE TABLE "SellerPlanOverride" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "overrides" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPlanOverride_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: un vendedor solo puede tener un override por plan
CREATE UNIQUE INDEX IF NOT EXISTS "SellerPlanOverride_sellerId_planId_key" ON "SellerPlanOverride"("sellerId", "planId");

-- Indexes
CREATE INDEX IF NOT EXISTS "SellerPlanOverride_sellerId_idx" ON "SellerPlanOverride"("sellerId");
CREATE INDEX IF NOT EXISTS "SellerPlanOverride_planId_idx" ON "SellerPlanOverride"("planId");

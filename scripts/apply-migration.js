import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,

  `CREATE TABLE IF NOT EXISTS "Company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandColor" TEXT NOT NULL DEFAULT '#00748E',
    "brandColorDark" TEXT NOT NULL DEFAULT '#005A6F',
    "secondaryColor" TEXT NOT NULL DEFAULT '#FDDC02',
    "accentColor" TEXT NOT NULL DEFAULT '#FF8000',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "websiteUrl" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Company_slug_key" UNIQUE ("slug")
  )`,

  `CREATE TABLE IF NOT EXISTS "Plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "speedLabel" TEXT NOT NULL DEFAULT '',
    "price" TEXT NOT NULL,
    "priceSubtitle" TEXT NOT NULL DEFAULT '',
    "features" JSONB NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT NOT NULL,
    "planOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Plan_value_key" UNIQUE ("value")
  )`,

  `ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "companyId" UUID`,
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "planId" UUID`,

  `DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Plan_companyId_fkey'
    ) THEN
      ALTER TABLE "Plan" ADD CONSTRAINT "Plan_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,

  `DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Seller_companyId_fkey'
    ) THEN
      ALTER TABLE "Seller" ADD CONSTRAINT "Seller_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$`,

  `DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'Lead_planId_fkey'
    ) THEN
      ALTER TABLE "Lead" ADD CONSTRAINT "Lead_planId_fkey"
        FOREIGN KEY ("planId") REFERENCES "Plan"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$`,

  `CREATE INDEX IF NOT EXISTS "Plan_companyId_idx" ON "Plan"("companyId")`,
  `CREATE INDEX IF NOT EXISTS "Plan_category_idx" ON "Plan"("category")`,
  `CREATE INDEX IF NOT EXISTS "Plan_active_idx" ON "Plan"("active")`,
  `CREATE INDEX IF NOT EXISTS "Seller_companyId_idx" ON "Seller"("companyId")`,
  `CREATE INDEX IF NOT EXISTS "Lead_planId_idx" ON "Lead"("planId")`,

  // Landing editor migrations
  `ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "landingContent" JSONB`,
  `ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "defaultMessage" TEXT`,

  `DROP TABLE IF EXISTS "SellerPlanOverride"`,

  `CREATE TABLE IF NOT EXISTS "SellerPlanOverride" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "overrides" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerPlanOverride_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SellerPlanOverride_sellerId_planId_key" UNIQUE ("sellerId", "planId")
  )`,

  `CREATE INDEX IF NOT EXISTS "SellerPlanOverride_sellerId_idx" ON "SellerPlanOverride"("sellerId")`,
  `CREATE INDEX IF NOT EXISTS "SellerPlanOverride_planId_idx" ON "SellerPlanOverride"("planId")`,
];

async function main() {
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("OK:", sql.split(/\s+/).slice(0, 6).join(" "), "...");
    } catch (err) {
      console.error("ERROR ejecutando:", sql.slice(0, 80));
      console.error(err.message);
      throw err;
    }
  }
  console.log("Migración aplicada correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

  `CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
  )`,

  // Limpia videos de fondo heredados para que la landing no muestre video
  `UPDATE "Seller" SET "bgVideoUrl" = '' WHERE "bgVideoUrl" IS NOT NULL AND "bgVideoUrl" != ''`,
  `DELETE FROM "Setting" WHERE key = 'bg_video_url'`,

  // Suscripciones y pagos
  `CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'trial',
    "planName" TEXT NOT NULL DEFAULT 'Plan Ejecutivo',
    "planAmount" INTEGER NOT NULL DEFAULT 29990,
    "planCurrency" TEXT NOT NULL DEFAULT 'CLP',
    "trialEndsAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "preapprovalId" TEXT,
    "payerId" TEXT,
    "paymentMethodId" TEXT,
    "lastFourDigits" TEXT,
    "cardBrand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Subscription_sellerId_key" UNIQUE ("sellerId")
  )`,

  `CREATE TABLE IF NOT EXISTS "PaymentHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscriptionId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "status" TEXT NOT NULL,
    "externalId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE INDEX IF NOT EXISTS "Subscription_sellerId_idx" ON "Subscription"("sellerId")`,
  `CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status")`,
  `CREATE INDEX IF NOT EXISTS "Subscription_preapprovalId_idx" ON "Subscription"("preapprovalId")`,
  `CREATE INDEX IF NOT EXISTS "PaymentHistory_subscriptionId_idx" ON "PaymentHistory"("subscriptionId")`,
  `CREATE INDEX IF NOT EXISTS "PaymentHistory_sellerId_idx" ON "PaymentHistory"("sellerId")`,
  `CREATE INDEX IF NOT EXISTS "PaymentHistory_externalId_idx" ON "PaymentHistory"("externalId")`,

  // Normaliza logos base de companias conocidas.
  `UPDATE "Company" SET "logoUrl" = 'https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg' WHERE "slug" = 'mundo'`,
  `UPDATE "Company" SET "logoUrl" = '/company-logos/movistar.png' WHERE "slug" = 'movistar' AND ("logoUrl" IS NULL OR "logoUrl" = '' OR "logoUrl" LIKE '%movistar%')`,
  `UPDATE "Company" SET "logoUrl" = '/company-logos/claro.png' WHERE "slug" = 'claro' AND ("logoUrl" IS NULL OR "logoUrl" = '' OR "logoUrl" LIKE '%claro%')`,
  `UPDATE "Company" SET "logoUrl" = '/company-logos/vtr.webp' WHERE "slug" = 'vtr' AND ("logoUrl" IS NULL OR "logoUrl" = '' OR "logoUrl" LIKE '%vtr%')`,
  `UPDATE "Company" SET "logoUrl" = '/company-logos/wom.png' WHERE "slug" = 'wom' AND ("logoUrl" IS NULL OR "logoUrl" = '' OR "logoUrl" LIKE '%wom%')`,
  `UPDATE "Company" SET "logoUrl" = '/company-logos/entel.jpg' WHERE "slug" = 'entel' AND ("logoUrl" IS NULL OR "logoUrl" = '' OR "logoUrl" LIKE '%entel%')`,

  `INSERT INTO "Subscription" ("sellerId", "status", "trialEndsAt")
   SELECT s."id", 'trial', CURRENT_TIMESTAMP + INTERVAL '7 days'
   FROM "Seller" s
   LEFT JOIN "Subscription" sub ON sub."sellerId" = s."id"
   WHERE sub."id" IS NULL`,

  `ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "dashboardTheme" TEXT NOT NULL DEFAULT ''`,
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

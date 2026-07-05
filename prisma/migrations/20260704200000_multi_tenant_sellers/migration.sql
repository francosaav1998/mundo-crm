-- CreateTable: Seller (ejecutivas con landing propia)
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT UNIQUE,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "photo" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "bgVideoUrl" TEXT NOT NULL DEFAULT '',
    "footerText" TEXT NOT NULL DEFAULT '',
    "metaPixelId" TEXT NOT NULL DEFAULT '',
    "landingTheme" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");
CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");
CREATE INDEX "Seller_userId_idx" ON "Seller"("userId");
CREATE INDEX "Seller_slug_idx" ON "Seller"("slug");

-- AlterTable: Lead + relacion con Seller
ALTER TABLE "Lead" ADD COLUMN "sellerId" TEXT;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Lead_sellerId_idx" ON "Lead"("sellerId");

-- AlterTable: Setting agrega userId opcional
ALTER TABLE "Setting" ADD COLUMN "userId" TEXT;

-- Migrar settings globales existentes a un seller por defecto (si quieres)
-- Esto es opcional, comentado por seguridad:
-- INSERT INTO "Seller" (id, slug, name, email, phone, photo, bio, "bgVideoUrl", "footerText", "metaPixelId", "landingTheme", active, "createdAt", "updatedAt")
-- VALUES (gen_random_uuid(), 'admin', 'Admin Mundo', 'admin@mundo-crm.local', '', '', '', '', '', '', '', true, NOW(), NOW());
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "assignedTo" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

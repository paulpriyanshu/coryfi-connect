-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "SKU" TEXT,
ADD COLUMN     "Sales" INTEGER,
ALTER COLUMN "stock" DROP NOT NULL;

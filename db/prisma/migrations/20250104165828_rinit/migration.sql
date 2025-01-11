/*
  Warnings:

  - The `imageUrl` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `videoUrl` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[],
DROP COLUMN "videoUrl",
ADD COLUMN     "videoUrl" TEXT[];

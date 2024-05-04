/*
  Warnings:

  - The primary key for the `detail_gudangs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_gudang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_satuan_id_fkey";

-- AlterTable
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_pkey",
ADD CONSTRAINT "detail_gudangs_pkey" PRIMARY KEY ("barang_id", "gudang_id", "satuan_id");

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_gudang_id_fkey" FOREIGN KEY ("gudang_id") REFERENCES "gudangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_gudang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_satuan_id_fkey";

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_gudang_id_fkey" FOREIGN KEY ("gudang_id") REFERENCES "gudangs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_satuans" DROP CONSTRAINT "detail_satuans_barang_id_fkey";

-- AddForeignKey
ALTER TABLE "detail_satuans" ADD CONSTRAINT "detail_satuans_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barangs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barangs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

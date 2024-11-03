-- CreateTable
CREATE TABLE "detail_satuans" (
    "barang_id" INTEGER NOT NULL,
    "satuan_id" INTEGER NOT NULL,
    "amount" DECIMAL(18,3) NOT NULL,

    CONSTRAINT "detail_satuans_pkey" PRIMARY KEY ("barang_id", "satuan_id")
);

-- AddForeignKey
ALTER TABLE "detail_satuans" ADD CONSTRAINT "detail_satuans_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_satuans" ADD CONSTRAINT "detail_satuans_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

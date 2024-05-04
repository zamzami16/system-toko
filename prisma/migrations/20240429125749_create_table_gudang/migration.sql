-- CreateTable
CREATE TABLE "gudangs" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(500) NOT NULL,
    "alamat" VARCHAR(500),
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "gudangs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_gudangs" (
    "barang_id" INTEGER NOT NULL,
    "gudang_id" INTEGER NOT NULL,
    "satuan_id" INTEGER NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "jumlah_minimal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "berat" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "detail_gudangs_pkey" PRIMARY KEY ("barang_id","gudang_id")
);

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_gudang_id_fkey" FOREIGN KEY ("gudang_id") REFERENCES "gudangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

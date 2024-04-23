-- CreateTable
CREATE TABLE "barang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(500) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',
    "satuan_id" INTEGER NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "subkategori_id" INTEGER NOT NULL,
    "hpp" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "harga_beli_akhir" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "harga_beli_3" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "harga_jual_1" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "harga_jual_2" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "harga_jual_3" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "barcode" VARCHAR(100) NOT NULL,
    "expired" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "diskon_rp" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "diskon_persen" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "jumlah_stok" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "jumlah_awal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "keterangan" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barang_barcode_key" ON "barang"("barcode");

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_subkategori_id_fkey" FOREIGN KEY ("subkategori_id") REFERENCES "sub_kategori_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

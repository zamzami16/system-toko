/*
  Warnings:

  - You are about to drop the `Kas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `barang` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kategori_barang` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `satuan_barang` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Kas" DROP CONSTRAINT "Kas_kode_akun_fkey";

-- DropForeignKey
ALTER TABLE "Kas" DROP CONSTRAINT "Kas_kode_akun_kartu_kredit_fkey";

-- DropForeignKey
ALTER TABLE "barang" DROP CONSTRAINT "barang_kategori_id_fkey";

-- DropForeignKey
ALTER TABLE "barang" DROP CONSTRAINT "barang_satuan_id_fkey";

-- DropForeignKey
ALTER TABLE "barang" DROP CONSTRAINT "barang_subkategori_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "detail_gudangs" DROP CONSTRAINT "detail_gudangs_satuan_id_fkey";

-- DropTable
DROP TABLE "Kas";

-- DropTable
DROP TABLE "barang";

-- DropTable
DROP TABLE "kategori_barang";

-- DropTable
DROP TABLE "rak";

-- DropTable
DROP TABLE "satuan_barang";

-- CreateTable
CREATE TABLE "kategori_barangs" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',

    CONSTRAINT "kategori_barangs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satuan_barangs" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',

    CONSTRAINT "satuan_barangs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raks" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,

    CONSTRAINT "raks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barangs" (
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
    "supplier_contact_id" INTEGER NOT NULL,

    CONSTRAINT "barangs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kas" (
    "id" SERIAL NOT NULL,
    "kode_akun" CHAR(6) NOT NULL,
    "kode_akun_kartu_kredit" CHAR(6),
    "nama" VARCHAR(200) NOT NULL,
    "nomor_rekening" VARCHAR(50),
    "pemilik" VARCHAR(200),
    "saldo_kas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "kas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barangs_barcode_key" ON "barangs"("barcode");

-- AddForeignKey
ALTER TABLE "barangs" ADD CONSTRAINT "barangs_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barangs" ADD CONSTRAINT "barangs_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori_barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barangs" ADD CONSTRAINT "barangs_subkategori_id_fkey" FOREIGN KEY ("subkategori_id") REFERENCES "sub_kategori_barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barangs" ADD CONSTRAINT "barangs_supplier_contact_id_fkey" FOREIGN KEY ("supplier_contact_id") REFERENCES "suppliers"("contact_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "satuan_barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_gudangs" ADD CONSTRAINT "detail_gudangs_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kas" ADD CONSTRAINT "kas_kode_akun_fkey" FOREIGN KEY ("kode_akun") REFERENCES "akuns"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kas" ADD CONSTRAINT "kas_kode_akun_kartu_kredit_fkey" FOREIGN KEY ("kode_akun_kartu_kredit") REFERENCES "akuns"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

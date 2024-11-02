/*
  Warnings:

  - You are about to drop the column `isActive` on the `Kas` table. All the data in the column will be lost.
  - You are about to drop the column `kodeAkun` on the `Kas` table. All the data in the column will be lost.
  - You are about to drop the column `kodeAkunKartuKredit` on the `Kas` table. All the data in the column will be lost.
  - You are about to drop the column `nomorRekening` on the `Kas` table. All the data in the column will be lost.
  - You are about to drop the column `saldoKas` on the `Kas` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `kodeAkunInduk` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `levelAkun` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `saldoAwal` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `statusArusKas` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `typeAkun` on the `akuns` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `jenis_pelanggans` table. All the data in the column will be lost.
  - The primary key for the `pelanggans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contactId` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `isCanCredit` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `jatuhTempo` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `jenisPajak` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `jenisPelangganId` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `limitHariPiutang` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `maxPiutang` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `saldoAwalPiutang` on the `pelanggans` table. All the data in the column will be lost.
  - You are about to drop the column `saldoPiutang` on the `pelanggans` table. All the data in the column will be lost.
  - Added the required column `kode_akun` to the `Kas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_akun` to the `akuns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_id` to the `pelanggans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenis_pelanggan_id` to the `pelanggans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Kas" DROP CONSTRAINT "Kas_kodeAkunKartuKredit_fkey";

-- DropForeignKey
ALTER TABLE "Kas" DROP CONSTRAINT "Kas_kodeAkun_fkey";

-- DropForeignKey
ALTER TABLE "akuns" DROP CONSTRAINT "akuns_kodeAkunInduk_fkey";

-- DropForeignKey
ALTER TABLE "pelanggans" DROP CONSTRAINT "pelanggans_contactId_fkey";

-- DropForeignKey
ALTER TABLE "pelanggans" DROP CONSTRAINT "pelanggans_jenisPelangganId_fkey";

-- AlterTable
ALTER TABLE "Kas" DROP COLUMN "isActive",
DROP COLUMN "kodeAkun",
DROP COLUMN "kodeAkunKartuKredit",
DROP COLUMN "nomorRekening",
DROP COLUMN "saldoKas",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kode_akun" CHAR(6) NOT NULL,
ADD COLUMN     "kode_akun_kartu_kredit" CHAR(6),
ADD COLUMN     "nomor_rekening" VARCHAR(50),
ADD COLUMN     "saldo_kas" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "akuns" DROP COLUMN "isActive",
DROP COLUMN "kodeAkunInduk",
DROP COLUMN "levelAkun",
DROP COLUMN "saldoAwal",
DROP COLUMN "statusArusKas",
DROP COLUMN "typeAkun",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kode_akun_induk" CHAR(6),
ADD COLUMN     "level_akun" INTEGER NOT NULL,
ADD COLUMN     "saldo_awal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "status_arus_kas" "StatusArusKas" NOT NULL DEFAULT 'None',
ADD COLUMN     "type_akun" "TypeAkun" NOT NULL DEFAULT 'NonKas';

-- AlterTable
ALTER TABLE "jenis_pelanggans" DROP COLUMN "isDefault",
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pelanggans" DROP CONSTRAINT "pelanggans_pkey",
DROP COLUMN "contactId",
DROP COLUMN "isCanCredit",
DROP COLUMN "jatuhTempo",
DROP COLUMN "jenisPajak",
DROP COLUMN "jenisPelangganId",
DROP COLUMN "limitHariPiutang",
DROP COLUMN "maxPiutang",
DROP COLUMN "saldoAwalPiutang",
DROP COLUMN "saldoPiutang",
ADD COLUMN     "contact_id" INTEGER NOT NULL,
ADD COLUMN     "is_can_credit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jatuh_tempo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jenis_pajak" "JenisPajak" NOT NULL DEFAULT 'None',
ADD COLUMN     "jenis_pelanggan_id" INTEGER NOT NULL,
ADD COLUMN     "limit_hari_piutang" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_piutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "saldo_awal_piutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "saldo_piutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD CONSTRAINT "pelanggans_pkey" PRIMARY KEY ("contact_id");

-- AddForeignKey
ALTER TABLE "pelanggans" ADD CONSTRAINT "pelanggans_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggans" ADD CONSTRAINT "pelanggans_jenis_pelanggan_id_fkey" FOREIGN KEY ("jenis_pelanggan_id") REFERENCES "jenis_pelanggans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "akuns" ADD CONSTRAINT "akuns_kode_akun_induk_fkey" FOREIGN KEY ("kode_akun_induk") REFERENCES "akuns"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kas" ADD CONSTRAINT "Kas_kode_akun_fkey" FOREIGN KEY ("kode_akun") REFERENCES "akuns"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kas" ADD CONSTRAINT "Kas_kode_akun_kartu_kredit_fkey" FOREIGN KEY ("kode_akun_kartu_kredit") REFERENCES "akuns"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

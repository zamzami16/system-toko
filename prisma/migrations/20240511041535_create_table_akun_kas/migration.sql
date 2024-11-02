-- CreateEnum
CREATE TYPE "TypeAkun" AS ENUM ('AkunKas', 'NonKas');

-- CreateEnum
CREATE TYPE "StatusArusKas" AS ENUM ('None', 'KasOperasional', 'KasInvestasi', 'KasPendanaan');

-- CreateTable
CREATE TABLE "akuns" (
    "kode" CHAR(6) NOT NULL,
    "kodeAkunInduk" CHAR(6),
    "nama" VARCHAR(200) NOT NULL,
    "levelAkun" INTEGER NOT NULL,
    "saldoAwal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "typeAkun" "TypeAkun" NOT NULL DEFAULT 'NonKas',
    "statusArusKas" "StatusArusKas" NOT NULL DEFAULT 'None',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "akuns_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "Kas" (
    "id" SERIAL NOT NULL,
    "kodeAkun" CHAR(6) NOT NULL,
    "kodeAkunKartuKredit" CHAR(6),
    "nama" VARCHAR(200) NOT NULL,
    "nomorRekening" VARCHAR(50) NOT NULL,
    "pemilik" VARCHAR(200) NOT NULL,
    "saldoKas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "keterangan" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Kas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "akuns" ADD CONSTRAINT "akuns_kodeAkunInduk_fkey" FOREIGN KEY ("kodeAkunInduk") REFERENCES "akuns"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kas" ADD CONSTRAINT "Kas_kodeAkun_fkey" FOREIGN KEY ("kodeAkun") REFERENCES "akuns"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kas" ADD CONSTRAINT "Kas_kodeAkunKartuKredit_fkey" FOREIGN KEY ("kodeAkunKartuKredit") REFERENCES "akuns"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

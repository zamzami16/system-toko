-- CreateEnum
CREATE TYPE "JenisPajak" AS ENUM ('None', 'Inclusive', 'Exclusive');

-- CreateTable
CREATE TABLE "jenis_pelanggans" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jenis_pelanggans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelanggans" (
    "contactId" INTEGER NOT NULL,
    "jenisPelangganId" INTEGER NOT NULL,
    "isCanCredit" BOOLEAN NOT NULL DEFAULT false,
    "saldoPiutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "maxPiutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "saldoAwalPiutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "limitHariPiutang" INTEGER NOT NULL DEFAULT 0,
    "jatuhTempo" INTEGER NOT NULL DEFAULT 0,
    "jenisPajak" "JenisPajak" NOT NULL DEFAULT 'None',

    CONSTRAINT "pelanggans_pkey" PRIMARY KEY ("contactId")
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_pelanggans_nama_key" ON "jenis_pelanggans"("nama");

-- AddForeignKey
ALTER TABLE "pelanggans" ADD CONSTRAINT "pelanggans_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggans" ADD CONSTRAINT "pelanggans_jenisPelangganId_fkey" FOREIGN KEY ("jenisPelangganId") REFERENCES "jenis_pelanggans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

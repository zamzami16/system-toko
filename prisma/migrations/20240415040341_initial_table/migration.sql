-- CreateEnum
CREATE TYPE "JenisBarang" AS ENUM ('Barang', 'Jasa', 'Menu', 'Paket');

-- CreateTable
CREATE TABLE "users" (
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "contact_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "alamat" VARCHAR(500),
    "email" VARCHAR(500),
    "no_hp" VARCHAR(20),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_barang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',

    CONSTRAINT "kategori_barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_kategori_barang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',

    CONSTRAINT "sub_kategori_barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satuan_barang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "jenis_barang" "JenisBarang" NOT NULL DEFAULT 'Barang',

    CONSTRAINT "satuan_barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rak" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(200) NOT NULL,

    CONSTRAINT "rak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_id_key" ON "users"("contact_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

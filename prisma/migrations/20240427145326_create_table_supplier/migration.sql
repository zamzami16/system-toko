-- CreateTable
CREATE TABLE "suppliers" (
    "contact_id" INTEGER NOT NULL,
    "saldo_hutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "max_hutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "saldo_awal_hutang" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "jatuh_tempo" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("contact_id")
);

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

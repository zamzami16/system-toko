import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TypeKas } from '../model/akun.model';
import { ValidationService } from '../common/validation.service';
import { Akun, Prisma, StatusArusKas, TypeAkun } from '@prisma/client';

@Injectable()
export class AkunService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async findAkunByKode(kode: string) {
    return await this.prismaService.akun.findUnique({ where: { kode: kode } });
  }

  async findAkunByNama(nama: string) {
    return await this.prismaService.akun.findFirst({ where: { nama: nama } });
  }

  async createKodeAkunKas(
    tx: Prisma.TransactionClient,
    typeKas: TypeKas,
  ): Promise<string> {
    const candidateCode = `11${typeKas}`;
    const count = await tx.akun.count({
      where: {
        kode: {
          startsWith: candidateCode,
        },
      },
    });
    const incPrefix = (count + 1).toString().padStart(2, '0');
    return `${candidateCode}${incPrefix}`;
  }

  async createAkunKas(
    nama: string,
    typeKas: TypeKas,
    tx: Prisma.TransactionClient,
  ): Promise<Akun> {
    const kode = await this.createKodeAkunKas(tx, typeKas);
    return await tx.akun.create({
      data: {
        kode: kode,
        nama: nama,
        levelAkun: 2,
        typeAkun: TypeAkun.AkunKas,
        statusArusKas: StatusArusKas.KasOperasional,
      },
    });
  }
}

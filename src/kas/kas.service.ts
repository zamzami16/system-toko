import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AkunService } from '../akun/akun.service';
import { CreateKasDto, KasResponse, UpdateKasDto } from '../model/kas.model';
import { ValidationService } from '../common/validation.service';
import { KasValidation } from './kas.validation';
import {
  AlreadyExistsError,
  AlreadyUsedForOtherDataError,
  NotFoundError,
} from '../common/toko.exceptions';
import { Akun, Kas, Prisma } from '@prisma/client';

@Injectable()
export class KasService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly akunService: AkunService,
    private readonly validationService: ValidationService,
  ) {}

  async getKasByNama(nama: string) {
    return await this.prismaService.kas.findFirst({
      where: {
        nama: {
          contains: nama,
          mode: 'insensitive',
        },
      },
    });
  }

  async getKasById(tx: Prisma.TransactionClient, id: number): Promise<Kas> {
    return await tx.kas.findUnique({
      where: {
        id: id,
      },
    });
  }

  async isKasHasTransactionOccured(
    tx: Prisma.TransactionClient,
    kodeAkun: string,
  ): Promise<boolean> {
    await tx.$executeRaw`select ${kodeAkun}`;
    return false;
  }

  async throwIfKasAlreadyUsedForOtherData(
    tx: Prisma.TransactionClient,
    kodeAkun: string,
  ) {
    const hasTransactionOccured = await this.isKasHasTransactionOccured(
      tx,
      kodeAkun,
    );
    if (hasTransactionOccured) {
      throw new AlreadyUsedForOtherDataError();
    }
  }

  toKasResponse(kas: Kas, akunKas?: Akun, akunKartuKredit?: Akun): KasResponse {
    return {
      akunKas: akunKas,
      akunKartuKredit: akunKartuKredit,
      id: kas.id,
      kodeAkun: kas.kodeAkun,
      kodeAkunKartuKredit: kas.kodeAkunKartuKredit,
      nama: kas.nama,
      nomorRekening: kas.nomorRekening,
      pemilik: kas.pemilik,
      saldoKas: kas.saldoKas.toNumber(),
      keterangan: kas.keterangan,
      isActive: kas.isActive,
    };
  }

  async create(request: CreateKasDto): Promise<KasResponse> {
    const validatedRequest = this.validationService.validate(
      KasValidation.CREATE,
      request,
    );

    const existingKas = await this.getKasByNama(validatedRequest.nama);

    if (existingKas) {
      throw new AlreadyExistsError('Kas already exists');
    }

    return await this.prismaService.$transaction(async (tx) => {
      const akunKas = await this.akunService.createAkunKas(
        validatedRequest.nama,
        validatedRequest.typeKas,
        tx,
      );

      const kas = await tx.kas.create({
        data: {
          nama: validatedRequest.nama,
          akun: {
            connect: {
              kode: akunKas.kode,
            },
          },
          nomorRekening: validatedRequest.nomorRekening,
          pemilik: validatedRequest.pemilik,
          saldoKas: validatedRequest.saldoKas,
          keterangan: validatedRequest.keterangan,
          isActive: validatedRequest.isActive,
        },
      });

      if (validatedRequest.kodeAkunKartuKredit) {
        await tx.kas.update({
          where: {
            id: kas.id,
          },
          data: {
            akunKartuKredit: {
              connect: {
                kode: validatedRequest.kodeAkunKartuKredit,
              },
            },
          },
        });

        const akunKartuKredit = await tx.akun.findUnique({
          where: {
            kode: validatedRequest.kodeAkunKartuKredit,
          },
        });

        return this.toKasResponse(kas, akunKas, akunKartuKredit);
      }

      return this.toKasResponse(kas, akunKas);
    });
  }

  async update(request: UpdateKasDto): Promise<KasResponse> {
    const validatedRequest = this.validationService.validate(
      KasValidation.UPDATE,
      request,
    );

    const updated = await this.prismaService.$transaction(async (tx) => {
      const exists = await this.getKasById(tx, validatedRequest.id);
      if (!exists) {
        throw new NotFoundError('Kas not found');
      }

      await this.throwIfKasAlreadyUsedForOtherData(tx, exists.kodeAkun);

      return await tx.kas.update({
        where: {
          id: validatedRequest.id,
        },
        data: validatedRequest,
      });
    });
    return this.toKasResponse(updated);
  }

  async findById(kasId: number): Promise<KasResponse> {
    const kas = await this.prismaService.kas.findUnique({
      where: { id: kasId },
    });

    if (!kas) {
      throw new NotFoundError('Kas Not Found');
    }

    return this.toKasResponse(kas);
  }

  async search(
    name: string = '',
    isActive: boolean = true,
  ): Promise<KasResponse[]> {
    const kass = await this.prismaService.kas.findMany({
      where: {
        isActive,
        ...(name && {
          nama: {
            contains: name,
            mode: 'insensitive',
          },
        }),
      },
    });

    return kass.map((kas) => this.toKasResponse(kas));
  }

  async delete(kasId: number): Promise<KasResponse> {
    this.validationService.validate(KasValidation.DELETE, { id: kasId });

    const deleted = await this.prismaService.$transaction(async (tx) => {
      const kasRecord = await this.getKasById(tx, kasId);
      if (!kasRecord) {
        throw new NotFoundError('Kas not found');
      }

      await this.throwIfKasAlreadyUsedForOtherData(tx, kasRecord.kodeAkun);

      const deletedKas = await tx.kas.delete({
        where: {
          id: kasId,
        },
      });

      await Promise.all([
        tx.akun.delete({ where: { kode: deletedKas.kodeAkun } }),
        deletedKas.kodeAkunKartuKredit
          ? tx.akun.delete({ where: { kode: deletedKas.kodeAkunKartuKredit } })
          : Promise.resolve(),
      ]);

      return deletedKas;
    });
    return this.toKasResponse(deleted);
  }
}

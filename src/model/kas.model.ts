import { Akun } from '@prisma/client';
import { TypeKas } from './akun.model';
import { ApiProperty } from '@nestjs/swagger';

export class KasResponse {
  id: number;
  kodeAkun: string;
  kodeAkunKartuKredit: string;
  nama: string;
  nomorRekening: string;
  pemilik: string;
  saldoKas: number;
  keterangan: string;
  isActive: boolean;
  akunKas?: Akun;
  akunKartuKredit?: Akun;
}

export class CreateKasDto {
  @ApiProperty({ enum: TypeKas, enumName: 'TypeKas' })
  typeKas: TypeKas;
  kodeAkunKartuKredit: string;
  nama: string;
  nomorRekening: string;
  pemilik: string;
  saldoKas: number;
  keterangan: string;
  isActive: boolean;
}

export class UpdateKasDto {
  id: number;
  kodeAkunKartuKredit: string;
  nama: string;
  nomorRekening: string;
  pemilik: string;
  saldoKas: number;
  keterangan: string;
  isActive: boolean;
}

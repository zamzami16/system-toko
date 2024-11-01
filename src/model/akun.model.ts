import { StatusArusKas, TypeAkun } from '@prisma/client';

export enum KelompokAkun {
  Aset = 1,
}

export enum TypeKas {
  Kas = '01',
  Bank = '02',
}

export class CreateAkunRequest {
  kodeAkunInduk: string;
  nama: string;
  levelAkun: number;
  saldoAwal: number;
  typeAkun: TypeAkun;
  statusArusKas: StatusArusKas;
  isActive: boolean;
}

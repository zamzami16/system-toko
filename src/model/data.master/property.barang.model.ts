import { GudangResponse } from './gudang.model';
import { SatuanResponse } from './satuan.model';

export class DetailSatuanResponse {
  barangId: number;
  satuanId: number;
  amount: number;
  satun: SatuanResponse;
}

export class CreateDetailSatuanRequestDto {
  satuanId: number;
  amount: number;
}

export class UpdateDetailSatuanRequestDto extends CreateDetailSatuanRequestDto {
  barangId: number;
}

export class CreateDetailGudangRequestDto {
  gudangId: number;
  satuanId: number;
  jumlah: number = 0;
  jumlahMinimal: number = 0;
  berat: number = 0;
}

export class UpdateDetailGudangRequestDto extends CreateDetailGudangRequestDto {
  barangId: number;
}

export class DetailGudangResponse {
  barangId: number;
  gudangId: number;
  satuanId: number;
  jumlah: number = 0;
  jumlahMinimal: number = 0;
  berat: number = 0;
  gudang: GudangResponse;
  satuan: SatuanResponse;
}

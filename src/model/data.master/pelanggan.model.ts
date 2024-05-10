import { JenisPajak } from '@prisma/client';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
} from '../contact.model';
import { JenisPelangganResponse } from './jenis.pelanggan.model';

export class PelangganResponse {
  contactId: number;
  contact: ContactResponse;
  jenisPelangganId: number;
  jenisPelanggan: JenisPelangganResponse;
  isCanCredit: boolean;
  saldoPiutang: number;
  maxPiutang: number;
  saldoAwalPiutang: number;
  limitHariPiutang: number;
  jatuhTempo: number;
  jenisPajak: JenisPajak;
}

export class CreatePelangganRequest {
  contactId?: number;
  contact?: CreateContactRequest;
  jenisPelangganId: number;
  isCanCredit?: boolean = false;
  saldoPiutang?: number = 0;
  maxPiutang?: number = 0;
  limitHariPiutang?: number = 0;
  jatuhTempo?: number = 0;
  jenisPajak?: JenisPajak = JenisPajak.None;
}

export class UpdatePelangganRequest {
  contactId?: number;
  jenisPelangganId?: number;
  isCanCredit?: boolean = false;
  saldoPiutang?: number = 0;
  maxPiutang?: number = 0;
  limitHariPiutang?: number = 0;
  jatuhTempo?: number = 0;
  jenisPajak?: JenisPajak = JenisPajak.None;
}

export class SearchPelangganRequest extends SearchContactRequest {
  jenisPelanggan?: string;
  isCanCredit?: boolean;
  jenisPajak?: JenisPajak;
}

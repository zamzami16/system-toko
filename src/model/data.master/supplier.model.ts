import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
} from '../contact.model';

export class SupplierResponse {
  contactId: number;
  contact: ContactResponse;
  saldoHutang: number;
  maxHutang: number;
  saldoAwalHutang: number;
  jatuhTempo: number;
}

export class CreateSupplierRequest {
  contactId?: number;
  contact?: CreateContactRequest;
  saldoHutang?: number;
  maxHutang?: number;
  saldoAwalHutang?: number;
  jatuhTempo?: number;
}

export class UpdateSupplierRequest {
  contactId: number;
  saldoHutang?: number;
  maxHutang?: number;
  saldoAwalHutang?: number;
  jatuhTempo?: number;
}

export class SearchSupplierRequest extends SearchContactRequest {}

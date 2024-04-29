import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
} from '../contact.model';

export class SupplierResponse {
  contact_id: number;
  contact: ContactResponse;
  saldo_hutang: number;
  max_hutang: number;
  saldo_awal_hutang: number;
  jatuh_tempo: number;
}

export class CreateSupplierRequest {
  contact_id?: number;
  contact?: CreateContactRequest;
  saldo_hutang?: number;
  max_hutang?: number;
  saldo_awal_hutang?: number;
  jatuh_tempo?: number;
}

export class UpdateSupplierRequest {
  contact_id: number;
  saldo_hutang?: number;
  max_hutang?: number;
  saldo_awal_hutang?: number;
  jatuh_tempo?: number;
}

export class SearchSupplierRequest extends SearchContactRequest {}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { ContactValidation } from './contact.validation';
import { Contact } from '@prisma/client';
import {
  ContactResponse,
  UpdateContactRequest,
  CreateContactRequest,
  SearchContactRequest,
} from '../../model/contact.model';
import {
  AlreadyExistsError,
  NotFoundError,
} from '../../common/toko.exceptions';
import { WebResponse } from '../../model/web.response';

@Injectable()
export class ContactService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toContactResponse(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      nama: contact.nama,
      alamat: contact.alamat,
      email: contact.email,
      noHp: contact.noHp,
    };
  }

  async getContactById(contactId: number) {
    return await this.prismaService.contact.findUnique({
      where: {
        id: contactId,
      },
    });
  }

  async getContactOr404(contactId: number): Promise<Contact> {
    const contact = await this.getContactById(contactId);
    if (!contact) {
      throw new NotFoundError();
    }

    return contact;
  }

  async cekContactUnique(nama: string, contactId: number) {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        AND: [
          {
            nama: nama,
          },
          {
            id: {
              not: contactId,
            },
          },
        ],
      },
    });
    if (contact) {
      throw new AlreadyExistsError();
    }
  }

  async create(request: CreateContactRequest): Promise<ContactResponse> {
    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    let contact = await this.prismaService.contact.findFirst({
      where: createRequest,
    });

    if (contact) {
      throw new AlreadyExistsError();
    }

    contact = await this.prismaService.contact.create({
      data: createRequest,
    });

    return this.toContactResponse(contact);
  }

  async detail(contactId: number): Promise<ContactResponse> {
    const contact = await this.getContactOr404(contactId);
    return this.toContactResponse(contact);
  }

  async update(request: UpdateContactRequest): Promise<ContactResponse> {
    const updateRequest: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    let contact = await this.getContactOr404(updateRequest.id);
    await this.cekContactUnique(updateRequest.nama, contact.id);
    contact = await this.prismaService.contact.update({
      data: updateRequest,
      where: {
        id: contact.id,
      },
    });

    return this.toContactResponse(contact);
  }

  async delete(contactId: number): Promise<ContactResponse> {
    let contact = await this.getContactOr404(contactId);
    contact = await this.prismaService.contact.delete({
      where: {
        id: contactId,
      },
    });
    return this.toContactResponse(contact);
  }

  async search(
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchRequest: SearchContactRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filter = this.createFilter(searchRequest);
    const total = await this.prismaService.contact.count({
      where: {
        AND: filter,
      },
    });

    const skip = searchRequest.size * (searchRequest.page - 1);
    const contacts = await this.prismaService.contact.findMany({
      where: {
        AND: filter,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      paging: {
        size: searchRequest.size,
        page: searchRequest.page,
        totalPage: Math.ceil(total / searchRequest.size),
      },
    };
  }

  createFilter(search: SearchContactRequest) {
    const filter = [];
    if (search.nama) {
      filter.push({
        AND: [
          {
            nama: {
              contains: search.nama,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (search.alamat) {
      filter.push({
        AND: [
          {
            alamat: {
              contains: search.alamat,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (search.email) {
      filter.push({
        AND: [
          {
            email: {
              contains: search.email,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (search.noHp) {
      filter.push({
        AND: [
          {
            noHp: {
              contains: search.noHp,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    return filter;
  }
}

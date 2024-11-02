import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { KategoriService } from './kategori.service';
import {
  CreateKategoriRequest,
  KategoriResponse,
  SearchkategoriRequest,
  UpdatekategoriRequest,
} from '../../model/data.master/kategori.model';
import { WebResponse } from '../../model/web.response';
import { JenisBarang } from '@prisma/client';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Kategori')
@ApiBearerAuth()
@Controller('/api/kategori')
export class KategoriController {
  constructor(private kategoriService: KategoriService) {}

  /**
   * Create a new Kategori Record
   * @param request The request body containing Kategori data
   * @returns A WebResponse that containing saved data
   */
  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateKategoriRequest,
  ): Promise<WebResponse<KategoriResponse>> {
    const result = await this.kategoriService.create(request);
    return {
      data: result,
    };
  }

  /**
   * Get Kategori data for given id
   * @param kategoriId The Id of Kategori to be get
   * @returns Kategori data
   */
  @Get('/:kategoriId')
  @HttpCode(200)
  async get(
    @Param('kategoriId', ParseIntPipe) kategoriId: number,
  ): Promise<WebResponse<KategoriResponse>> {
    const result = await this.kategoriService.get(kategoriId);
    return {
      data: result,
    };
  }

  /**
   * Update kategori record
   * @param kategoriId the id of Kategori to be updated
   * @param request The request body containing Kategori data tobe updated
   * @returns A WebResponse containing updated data
   */
  @Put('/:kategoriId')
  @HttpCode(200)
  async update(
    @Param('kategoriId', ParseIntPipe) kategoriId: number,
    @Body() request: UpdatekategoriRequest,
  ): Promise<WebResponse<KategoriResponse>> {
    request.id = kategoriId;
    const result = await this.kategoriService.update(request);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'nama', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 10 })
  @ApiQuery({
    name: 'jenisbarang',
    required: false,
    enum: JenisBarang,
    isArray: false,
  })
  async serach(
    @Query('id', new ParseIntPipe({ optional: true }))
    kategoriId?: number,
    @Query('nama') nama?: string,
    @Query('jenisbarang') jenisBarang?: JenisBarang,
    @Query('page', new ParseIntPipe({ optional: true }))
    page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<KategoriResponse[]>> {
    const request: SearchkategoriRequest = {
      page: page || 1,
      size: size || 10,
      id: kategoriId,
      nama: nama,
      jenisBarang: jenisBarang || JenisBarang.Barang,
    };

    const result = await this.kategoriService.search(request);
    return result;
  }

  @Delete('/:kategoriId')
  @HttpCode(200)
  async remove(@Param('kategoriId', ParseIntPipe) kategoriId: number) {
    const result = await this.kategoriService.remove(kategoriId);
    return {
      data: result,
    };
  }
}

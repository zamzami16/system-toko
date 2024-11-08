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
import { SubkategoriService } from './subkategori.service';
import {
  CreateSubkategoriRequest,
  UpdateSubkategoriRequest,
  SearchSubkategoriRequest,
  SubkategoriResponse,
} from '../../model/data.master/subkategori.model';
import { WebResponse } from '../../model/web.response';
import { JenisBarang } from '@prisma/client';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags("Subkategori")
@ApiBearerAuth()
@Controller('/api/subkategori')
export class SubkategoriController {
  constructor(private subkategoriService: SubkategoriService) {}

  /**
   * Create a new subKategori Record
   * @param request The request body containing subKategori data
   * @returns A WebResponse that containing saved data
   */
  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateSubkategoriRequest,
  ): Promise<WebResponse<SubkategoriResponse>> {
    const result = await this.subkategoriService.create(request);
    return {
      data: result,
    };
  }

  /**
   * Get Subkategori data for given id
   * @param subkategoriId The Id of subKategori to be get
   * @returns SUbkategori data
   */
  @Get('/:subkategoriId')
  @HttpCode(200)
  async get(
    @Param('subkategoriId', ParseIntPipe) subkategoriId: number,
  ): Promise<WebResponse<SubkategoriResponse>> {
    const result = await this.subkategoriService.get(subkategoriId);
    return {
      data: result,
    };
  }

  /**
   * Update kategori record
   * @param subkategoriId the id of Subkategori to be updated
   * @param request The request body containing Subkategori data tobe updated
   * @returns A WebResponse containing updated data
   */
  @Put('/:subkategoriId')
  @HttpCode(200)
  async update(
    @Param('subkategoriId', ParseIntPipe) subkategoriId: number,
    @Body() request: UpdateSubkategoriRequest,
  ): Promise<WebResponse<SubkategoriResponse>> {
    request.id = subkategoriId;
    const result = await this.subkategoriService.update(request);
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
    @Query('id', new ParseIntPipe({ optional: true })) subkategoriId?: number,
    @Query('nama') nama?: string,
    @Query('jenisbarang') jenisBarang?: JenisBarang,
    @Query('page', new ParseIntPipe({ optional: true }))
    page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<SubkategoriResponse[]>> {
    const request: SearchSubkategoriRequest = {
      page: page || 1,
      size: size || 10,
      id: subkategoriId,
      nama: nama,
      jenisBarang: jenisBarang || JenisBarang.Barang,
    };

    const result = await this.subkategoriService.search(request);
    return result;
  }

  @Delete('/:subkategoriId')
  @HttpCode(200)
  async remove(@Param('subkategoriId', ParseIntPipe) subkategoriId: number) {
    const result = await this.subkategoriService.remove(subkategoriId);
    return {
      data: result,
    };
  }
}

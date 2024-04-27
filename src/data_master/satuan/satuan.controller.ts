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
import { SatuanService } from './satuan.service';
import {
  CreateSatuanRequest,
  UpdateSatuanRequest,
  SearchSatuanRequest,
  SatuanResponse,
} from '../../model/data.master/satuan.model';
import { WebResponse } from '../../model/web.response';
import { JenisBarang } from '@prisma/client';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Satuan')
@ApiBearerAuth()
@Controller('/api/satuan')
export class SatuanController {
  constructor(private satuanService: SatuanService) {}

  /**
   * Create a new Kategori Record
   * @param request The request body containing Kategori data
   * @returns A WebResponse that containing saved data
   */
  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateSatuanRequest,
  ): Promise<WebResponse<SatuanResponse>> {
    const result = await this.satuanService.create(request);
    return {
      data: result,
    };
  }

  /**
   * Get Kategori data for given id
   * @param satuanId The Id of Kategori to be get
   * @returns Kategori data
   */
  @Get('/:satuan_id')
  @HttpCode(200)
  async get(
    @Param('satuan_id', ParseIntPipe) satuanId: number,
  ): Promise<WebResponse<SatuanResponse>> {
    const result = await this.satuanService.get(satuanId);
    return {
      data: result,
    };
  }

  /**
   * Update kategori record
   * @param satuanId the id of Kategori to be updated
   * @param request The request body containing Kategori data tobe updated
   * @returns A WebResponse containing updated data
   */
  @Put('/:satuan_id')
  @HttpCode(200)
  async update(
    @Param('satuan_id', ParseIntPipe) satuanId: number,
    @Body() request: UpdateSatuanRequest,
  ): Promise<WebResponse<SatuanResponse>> {
    request.id = satuanId;
    const result = await this.satuanService.update(request);
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
    @Query('id', new ParseIntPipe({ optional: true })) satuan_id?: number,
    @Query('nama') nama?: string,
    @Query('jenisbarang') jenis_barang?: JenisBarang,
    @Query('page', new ParseIntPipe({ optional: true }))
    page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<SatuanResponse[]>> {
    const request: SearchSatuanRequest = {
      page: page || 1,
      size: size || 10,
      id: satuan_id,
      nama: nama,
      jenis_barang: jenis_barang || JenisBarang.Barang,
    };

    const result = await this.satuanService.search(request);
    return result;
  }

  @Delete('/:satuan_id')
  @HttpCode(200)
  async remove(@Param('satuan_id', ParseIntPipe) satuan_id: number) {
    const result = await this.satuanService.remove(satuan_id);
    return {
      data: result,
    };
  }
}

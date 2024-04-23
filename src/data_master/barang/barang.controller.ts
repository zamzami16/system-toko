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
import { BarangService } from './barang.service';
import {
  BarangResponse,
  CreateBarangRequest,
  SearchBarangRequest,
  UpdateBarangRequest,
} from '../../model/data.master/barang.model';
import { WebResponse } from '../../model/web.response';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('/api/barang')
export class BarangController {
  constructor(private barangService: BarangService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateBarangRequest,
  ): Promise<WebResponse<BarangResponse>> {
    const result = await this.barangService.create(request);
    return {
      data: result,
    };
  }

  @Put('/:barang_id')
  @HttpCode(200)
  async update(
    @Body() request: UpdateBarangRequest,
    @Param('barang_id', ParseIntPipe) barang_id: number,
  ): Promise<WebResponse<BarangResponse>> {
    request.id = barang_id;
    const result = await this.barangService.update(request);
    return {
      data: result,
    };
  }

  @Delete('/:barang_id')
  @HttpCode(200)
  async remove(
    @Param('barang_id', ParseIntPipe) barang_id: number,
  ): Promise<WebResponse<BarangResponse>> {
    const result = await this.barangService.remove(barang_id);
    return {
      data: result,
    };
  }

  @Get('/:barang_id')
  @HttpCode(200)
  async detail(
    @Param('barang_id', ParseIntPipe) barang_id: number,
  ): Promise<WebResponse<BarangResponse>> {
    const result = await this.barangService.detail(barang_id);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Query('barang_id', new ParseIntPipe({ optional: true }))
    barang_id?: number,
    @Query('size', new ParseIntPipe({ optional: true }))
    size?: number,
    @Query('page', new ParseIntPipe({ optional: true }))
    page?: number,
    @Query('nama') nama?: string,
    @Query('kategori') kategori?: string,
    @Query('subkategori') subkategori?: string,
    @Query('satuan') satuan?: string,
  ): Promise<WebResponse<BarangResponse[]>> {
    const request: SearchBarangRequest = {
      id: barang_id,
      nama: nama,
      kategori: kategori,
      subkategori: subkategori,
      satuan: satuan,
      size: size || 10,
      page: page || 1,
    };

    const result = await this.barangService.search(request);
    return result;
  }
}

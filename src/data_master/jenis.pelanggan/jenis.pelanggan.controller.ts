import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { JenisPelangganService } from './jenis.pelanggan.service';
import {
  CreateJenisPelangganRequest,
  JenisPelangganResponse,
  SearchJenisPelangganRequest,
  UpdateJenisPelangganRequest,
} from '../../model/data.master/jenis.pelanggan.model';
import { WebResponse } from '../../model/web.response';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Jenis Pelanggan')
@ApiBearerAuth()
@Controller('/api/jenis_pelanggans')
export class JenisPelangganController {
  constructor(private jenisPelangganService: JenisPelangganService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateJenisPelangganRequest,
  ): Promise<WebResponse<JenisPelangganResponse>> {
    const result = await this.jenisPelangganService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:jenisPelangganId')
  @HttpCode(200)
  async detail(
    @Param('jenisPelangganId', ParseIntPipe) jenisPelangganId: number,
  ): Promise<WebResponse<JenisPelangganResponse>> {
    const result = await this.jenisPelangganService.detail(jenisPelangganId);
    return {
      data: result,
    };
  }

  @Delete('/:jenisPelangganId')
  @HttpCode(200)
  async delete(
    @Param('jenisPelangganId', ParseIntPipe) jenisPelangganId: number,
  ): Promise<WebResponse<JenisPelangganResponse>> {
    const result = await this.jenisPelangganService.delete(jenisPelangganId);
    return {
      data: result,
    };
  }

  @Put('/:jenisPelangganId')
  @HttpCode(200)
  async update(
    @Param('jenisPelangganId', ParseIntPipe) jenisPelangganId: number,
    @Body() request: UpdateJenisPelangganRequest,
  ): Promise<WebResponse<JenisPelangganResponse>> {
    request.id = jenisPelangganId;
    const result = await this.jenisPelangganService.update(request);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'nama', required: false, example: 'umum' })
  @ApiQuery({ name: 'isDefault', required: false, example: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 10 })
  async search(
    @Query('nama') nama?: string,
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<JenisPelangganResponse[]>> {
    const request: SearchJenisPelangganRequest = {
      nama: nama,
      isDefault: isDefault,
      page: page || 1,
      size: size || 10,
    };

    const result = await this.jenisPelangganService.search(request);
    return result;
  }
}

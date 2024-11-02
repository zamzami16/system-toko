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
import { KasService } from './kas.service';
import { CreateKasDto, KasResponse, UpdateKasDto } from '../model/kas.model';
import { WebResponse } from '../model/web.response';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Kas')
@ApiBearerAuth()
@Controller('/api/kas')
export class KasController {
  constructor(private readonly kasService: KasService) {}

  @Post()
  @HttpCode(200)
  async createKasAccount(
    @Body() createKasDto: CreateKasDto,
  ): Promise<WebResponse<KasResponse>> {
    const result = await this.kasService.create(createKasDto);
    return {
      data: result,
    };
  }

  @Put('/:kas_id')
  @HttpCode(200)
  async updateKasAccount(
    @Body() updateKasDto: UpdateKasDto,
    @Param('kas_id', ParseIntPipe) kas_id: number,
  ) {
    updateKasDto.id = kas_id;
    const result = await this.kasService.update(updateKasDto);
    return {
      data: result,
    };
  }

  @Get('/:kas_id')
  @HttpCode(200)
  async getById(@Param('kas_id', ParseIntPipe) kas_id: number) {
    const result = await this.kasService.findById(kas_id);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async search(
    @Query('name') name?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    const result = await this.kasService.search(name, isActive);
    return {
      data: result,
    };
  }

  @Delete('/:kas_id')
  @HttpCode(200)
  async delete(@Param('kas_id', ParseIntPipe) kasId: number) {
    const result = await this.kasService.delete(kasId);
    return {
      data: result,
    };
  }
}

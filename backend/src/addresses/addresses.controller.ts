import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  // Tüm adresleri getir
  @Get()
  async getAddresses(
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID required');
    }
    return this.addressesService.getAddresses(userId, companyId);
  }

  // Tek adres getir
  @Get(':id')
  async getAddress(@Param('id') id: string) {
    return this.addressesService.getAddressById(id);
  }

  // Yeni adres oluştur
  @Post()
  async createAddress(
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateAddressDto,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID required');
    }
    return this.addressesService.createAddress(userId, companyId, dto);
  }

  // Adres güncelle
  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(id, dto);
  }

  // Adres sil
  @Delete(':id')
  async deleteAddress(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.addressesService.deleteAddress(id, userId);
    return { success: true };
  }

  // Default adres yap
  @Post(':id/default')
  async setDefaultAddress(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.addressesService.setDefaultAddress(id, userId, companyId);
  }
}

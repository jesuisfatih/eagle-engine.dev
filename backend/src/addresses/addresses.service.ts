import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto, AddressType } from './dto/address.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Address {
  id: string;
  userId: string;
  companyId: string;
  label: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  provinceCode?: string;
  country: string;
  countryCode?: string;
  zip: string;
  phone?: string;
  type: AddressType;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AddressesService {
  private addresses: Map<string, Address> = new Map();

  constructor(private prisma: PrismaService) {}

  async getAddresses(userId: string, companyId: string): Promise<Address[]> {
    return Array.from(this.addresses.values())
      .filter((a) => a.userId === userId || a.companyId === companyId)
      .sort((a, b) => {
        // Default adresler önce
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async getAddressById(id: string): Promise<Address> {
    const address = this.addresses.get(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async createAddress(
    userId: string,
    companyId: string,
    dto: CreateAddressDto,
  ): Promise<Address> {
    // Eğer bu default yapılıyorsa, diğer default'ları kaldır
    if (dto.isDefault) {
      await this.clearDefaultAddresses(userId, companyId, dto.type);
    }

    const address: Address = {
      id: uuidv4(),
      userId,
      companyId,
      label: dto.label,
      firstName: dto.firstName,
      lastName: dto.lastName,
      company: dto.company,
      address1: dto.address1,
      address2: dto.address2,
      city: dto.city,
      province: dto.province,
      provinceCode: dto.provinceCode,
      country: dto.country,
      countryCode: dto.countryCode,
      zip: dto.zip,
      phone: dto.phone,
      type: dto.type || AddressType.BOTH,
      isDefault: dto.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.addresses.set(address.id, address);
    return address;
  }

  async updateAddress(id: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.getAddressById(id);

    // Eğer bu default yapılıyorsa, diğer default'ları kaldır
    if (dto.isDefault && !address.isDefault) {
      await this.clearDefaultAddresses(
        address.userId,
        address.companyId,
        dto.type || address.type,
      );
    }

    const updated: Address = {
      ...address,
      ...dto,
      updatedAt: new Date(),
    };

    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const address = await this.getAddressById(id);

    if (address.userId !== userId) {
      throw new BadRequestException('You can only delete your own addresses');
    }

    this.addresses.delete(id);
  }

  async setDefaultAddress(
    id: string,
    userId: string,
    companyId: string,
  ): Promise<Address> {
    const address = await this.getAddressById(id);

    // Aynı tip adreslerin default'larını kaldır
    await this.clearDefaultAddresses(userId, companyId, address.type);

    address.isDefault = true;
    address.updatedAt = new Date();
    this.addresses.set(id, address);

    return address;
  }

  private async clearDefaultAddresses(
    userId: string,
    companyId: string,
    type?: AddressType,
  ): Promise<void> {
    const userAddresses = Array.from(this.addresses.values()).filter(
      (a) =>
        (a.userId === userId || a.companyId === companyId) &&
        a.isDefault &&
        (type === undefined || a.type === type),
    );

    for (const addr of userAddresses) {
      addr.isDefault = false;
      addr.updatedAt = new Date();
      this.addresses.set(addr.id, addr);
    }
  }

  async getDefaultAddress(
    userId: string,
    companyId: string,
    type: AddressType,
  ): Promise<Address | null> {
    return (
      Array.from(this.addresses.values()).find(
        (a) =>
          (a.userId === userId || a.companyId === companyId) &&
          a.isDefault &&
          (a.type === type || a.type === AddressType.BOTH),
      ) || null
    );
  }
}

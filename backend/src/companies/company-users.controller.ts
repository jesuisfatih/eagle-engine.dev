import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('company-users')
@UseGuards(JwtAuthGuard)
export class CompanyUsersController {
  constructor(private companyUsersService: CompanyUsersService) {}

  @Get('me')
  async getMyProfile(@CurrentUser('sub') userId: string) {
    const user = await this.companyUsersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const updateData: any = {};
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    
    return this.companyUsersService.update(userId, updateData);
  }
}

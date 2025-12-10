import { Controller, Get, Put, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!userId || !companyId) {
      throw new BadRequestException('User ID and Company ID required');
    }
    return this.notificationsService.getNotifications(userId, companyId);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('read-all')
  async markAllAsRead(
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!userId || !companyId) {
      throw new BadRequestException('User ID and Company ID required');
    }
    return this.notificationsService.markAllAsRead(userId, companyId);
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!userId || !companyId) {
      throw new BadRequestException('User ID and Company ID required');
    }
    const count = await this.notificationsService.getUnreadCount(userId, companyId);
    return { count };
  }
}


import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('notifications')
@Public()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications() {
    const userId = 'test';
    const companyId = 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
    return this.notificationsService.getNotifications(userId, companyId);
  }
}


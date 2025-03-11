import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';

@Controller('health')
export class HealthController {
  constructor() {}

  @Get('/')
  @Public()
  private getHealthCheck() {
    return 'ok';
  }
}

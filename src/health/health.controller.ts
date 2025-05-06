import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor() {}

  @Get('/')
  @Public()
  private getHealthCheck() {
    return 'ok';
  }
}

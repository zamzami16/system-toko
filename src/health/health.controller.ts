import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../common/public.decorator';
import { PrismaHealthIndicator } from './PrismaHealthIndicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  async check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      async () => this.prisma.isHealthy('database'),
      () =>
        this.http.pingCheck('swagger-ui', 'http://localhost:3000/api', {
          timeout: 3000,
        }),
    ]);
  }
}

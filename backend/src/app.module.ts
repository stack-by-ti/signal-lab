import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ScenarioModule } from './scenario/scenario.module';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    PrismaModule,
    ScenarioModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

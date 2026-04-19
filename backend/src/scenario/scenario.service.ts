import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { appendScenarioLog } from '../logging/scenario-file-log';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScenarioService {
  constructor(private readonly prisma: PrismaService) {}

  async runScenario(scenario: 'success' | 'slow_request' | 'system_error') {
    const start = Date.now();

    if (scenario === 'slow_request') {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const durationMs = Date.now() - start;

    if (scenario === 'system_error') {
      await this.prisma.scenarioRun.create({
        data: {
          scenario,
          status: 'error',
          durationMs,
          message: 'Intentional system error for demo',
        },
      });

      await appendScenarioLog({
        level: 'error',
        scenario,
        status: 'error',
      });

      throw new InternalServerErrorException('Intentional system error for demo');
    }

    const record = await this.prisma.scenarioRun.create({
      data: {
        scenario,
        status: scenario === 'slow_request' ? 'slow' : 'success',
        durationMs,
        message: `Scenario ${scenario} completed`,
      },
    });

    await appendScenarioLog({
      level: 'info',
      scenario,
      status: record.status,
    });

    return record;
  }

  async getHistory() {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}

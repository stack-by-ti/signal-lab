import { Body, Controller, Get, Post } from '@nestjs/common';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenarioService } from './scenario.service';

@Controller('api/scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post()
  async run(@Body() body: RunScenarioDto) {
    return this.scenarioService.runScenario(body.scenario);
  }

  @Get()
  async history() {
    return this.scenarioService.getHistory();
  }
}

import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { GrammarService } from './grammar.service';

@Controller('grammar')
export class GrammarController {
  constructor(private grammar: GrammarService) {}

  @Get()
  async list(@Query('level', new DefaultValuePipe(0), ParseIntPipe) level: number) {
    return { items: await this.grammar.list(level || undefined) };
  }
}

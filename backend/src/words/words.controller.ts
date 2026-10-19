import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private words: WordsService) {}

  @Get()
  list(
    @Query('level', new DefaultValuePipe(0), ParseIntPipe) level: number,
    @Query('q') q: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.words.list(level || undefined, q, Math.max(1, page), Math.min(100, Math.max(1, limit)));
  }

  @Get('levels')
  levels() { return this.words.levels(); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.words.get(id); }
}

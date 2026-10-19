import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

@Controller('exercises')
export class ExercisesController {
  constructor(private ex: ExercisesService) {}

  @Get('cloze')
  cloze(
    @Query('level', new DefaultValuePipe(1), ParseIntPipe) level: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) { return this.ex.cloze(clamp(level, 1, 3), clamp(count, 3, 30)); }

  @Get('order')
  order(
    @Query('level', new DefaultValuePipe(1), ParseIntPipe) level: number,
    @Query('count', new DefaultValuePipe(8), ParseIntPipe) count: number,
  ) { return this.ex.order(clamp(level, 1, 3), clamp(count, 3, 30)); }
}

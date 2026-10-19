import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private quiz: QuizService) {}

  @Get()
  build(
    @Query('level', new DefaultValuePipe(1), ParseIntPipe) level: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    return this.quiz.build(Math.min(3, Math.max(1, level)), Math.min(30, Math.max(4, count)));
  }
}

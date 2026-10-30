import { BadRequestException, Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { GrammarService } from './grammar.service';
import { AnswerDto, ProgressDto } from './grammar.dto';
import { EXERCISE_TYPES, ExerciseType } from './grammar-exercises';

type Req_ = { user?: { id: number } };

@Controller('grammar')
export class GrammarController {
  constructor(private grammar: GrammarService) {}

  /**
   * GET /grammar: giữ nguyên cách gọi cũ ({ items } kèm ví dụ đúng).
   * Thêm tham số q, category, page hoặc limit thì trả bản có phân trang và không kèm ví dụ.
   */
  @UseGuards(OptionalJwtGuard)
  @Get()
  async list(
    @Req() req: Req_,
    @Query('level', new DefaultValuePipe(-1), ParseIntPipe) level: number,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const lv = level >= 0 && level <= 9 ? level : undefined;
    if (q === undefined && category === undefined && page === undefined && limit === undefined) return { items: await this.grammar.list(lv) };
    const p = Math.max(1, Number.parseInt(page ?? '1', 10) || 1);
    const l = Math.min(100, Math.max(1, Number.parseInt(limit ?? '20', 10) || 20));
    return this.grammar.find({ q: q?.slice(0, 64), level: lv, category: category?.slice(0, 64), page: p, limit: l }, req.user?.id);
  }

  @Get('categories') categories() { return this.grammar.categories(); }

  @Get('exercises')
  exercises(
    @Query('type') type: string,
    @Query('level', new DefaultValuePipe(-1), ParseIntPipe) level: number,
    @Query('grammarId', new DefaultValuePipe(0), ParseIntPipe) grammarId: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    if (!EXERCISE_TYPES.includes(type as ExerciseType)) throw new BadRequestException(`type phải là một trong: ${EXERCISE_TYPES.join(', ')}`);
    return this.grammar.exercises({ type: type as ExerciseType, level: level >= 0 && level <= 9 ? level : undefined, grammarId: grammarId || undefined, count: Math.min(30, Math.max(1, count)) });
  }

  @UseGuards(OptionalJwtGuard)
  @Post('exercises/answer')
  answer(@Req() req: Req_, @Body() dto: AnswerDto) { return this.grammar.answer(dto, req.user?.id); }

  @UseGuards(JwtAuthGuard)
  @Get('progress')
  progress(@Req() req: { user: { id: number } }) { return this.grammar.progress(req.user.id); }

  @UseGuards(JwtAuthGuard)
  @Put(':id/progress')
  setProgress(@Req() req: { user: { id: number } }, @Param('id', ParseIntPipe) id: number, @Body() dto: ProgressDto) {
    return this.grammar.setProgress(req.user.id, id, dto);
  }

  @UseGuards(OptionalJwtGuard)
  @Get(':slug')
  detail(@Req() req: Req_, @Param('slug') slug: string) { return this.grammar.detail(slug, req.user?.id); }

  @Get(':slug/examples')
  examples(@Param('slug') slug: string) { return this.grammar.examples(slug); }
}

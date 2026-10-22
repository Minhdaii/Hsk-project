import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewDto } from './study.dto';
import { StudyService } from './study.service';

type Req_ = { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('study')
export class StudyController {
  constructor(private study: StudyService) {}

  @Get('session')
  session(@Req() req: Req_, @Query('level', new DefaultValuePipe(1), ParseIntPipe) level: number) {
    return this.study.session(req.user.id, Math.min(3, Math.max(1, level)));
  }

  @Post('review')
  review(@Req() req: Req_, @Body() dto: ReviewDto) {
    return this.study.review(req.user.id, dto.wordId, dto.rating);
  }

  @Get('activity')
  activity(@Req() req: Req_) { return this.study.activity(req.user.id); }

  @Get('levels')
  levels(@Req() req: Req_) { return this.study.levels(req.user.id); }

  @Get('stats')
  stats(@Req() req: Req_) { return this.study.stats(req.user.id); }
}

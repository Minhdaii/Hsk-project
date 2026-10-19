import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

type Req_ = { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private fav: FavoritesService) {}

  @Get() list(@Req() req: Req_) { return this.fav.list(req.user.id); }

  @Get('ids') ids(@Req() req: Req_) { return this.fav.ids(req.user.id); }

  @Post(':wordId')
  add(@Req() req: Req_, @Param('wordId', ParseIntPipe) wordId: number) { return this.fav.add(req.user.id, wordId); }

  @Delete(':wordId')
  remove(@Req() req: Req_, @Param('wordId', ParseIntPipe) wordId: number) { return this.fav.remove(req.user.id, wordId); }
}

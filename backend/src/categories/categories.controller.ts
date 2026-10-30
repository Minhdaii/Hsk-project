import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, ReorderDto, UpdateCategoryDto } from './categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private cats: CategoriesService) {}

  @Get() async tree() { return { items: await this.cats.tree() }; }

  @Get(':slug') detail(@Param('slug') slug: string) { return this.cats.bySlug(slug); }

  @Get(':slug/words')
  words(
    @Param('slug') slug: string,
    @Query('level', new DefaultValuePipe(0), ParseIntPipe) level: number,
    @Query('q') q: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.cats.words(slug, { level: level >= 1 && level <= 9 ? level : undefined, q: q?.slice(0, 64), page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) });
  }
}

/** Quản trị danh mục: cần đăng nhập bằng tài khoản có role = admin */
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private cats: CategoriesService) {}

  @Get() async all() { return { items: await this.cats.tree(true) }; }
  @Post() create(@Body() dto: CreateCategoryDto) { return this.cats.create(dto); }
  @Patch('reorder') reorder(@Body() dto: ReorderDto) { return this.cats.reorder(dto.items); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) { return this.cats.update(id, dto); }
}

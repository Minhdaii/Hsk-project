import { Module } from '@nestjs/common';
import { AdminCategoriesController, CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AdminGuard } from '../auth/admin.guard';

@Module({ controllers: [CategoriesController, AdminCategoriesController], providers: [CategoriesService, AdminGuard], exports: [CategoriesService] })
export class CategoriesModule {}

import { Controller, Get, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WordsModule } from './words/words.module';
import { QuizModule } from './quiz/quiz.module';
import { StudyModule } from './study/study.module';
import { GrammarModule } from './grammar/grammar.module';
import { ExercisesModule } from './exercises/exercises.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { CategoriesModule } from './categories/categories.module';
import { RecognizeModule } from './recognize/recognize.module';

@Controller()
class HealthController {
  @Get('health')
  health() { return { status: 'ok' }; }
}

@Module({
  imports: [PrismaModule, AuthModule, WordsModule, QuizModule, StudyModule, GrammarModule, ExercisesModule, FavoritesModule, LeaderboardModule, CategoriesModule, RecognizeModule],
})
export class AppModule {}

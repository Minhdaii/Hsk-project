import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrammarService {
  constructor(private prisma: PrismaService) {}

  list(level?: number) {
    return this.prisma.grammarPoint.findMany({
      where: level ? { level } : undefined,
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
      include: { examples: { orderBy: { id: 'asc' } } },
    });
  }
}

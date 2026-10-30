import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Chỉ cho quản trị viên (users.role = 'admin'). Đặt SAU JwtAuthGuard. Vai trò đọc từ database mỗi lần, không tin vào token. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<{ user?: { id: number } }>();
    if (!req.user) throw new ForbiddenException();
    const u = await this.prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true } });
    if (u?.role !== 'admin') throw new ForbiddenException('Chỉ quản trị viên được thực hiện thao tác này');
    return true;
  }
}

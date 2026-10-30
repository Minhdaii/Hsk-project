import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Cho phép cả khách lẫn người đã đăng nhập: có token hợp lệ thì gắn req.user, không thì req.user = undefined */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) { return super.canActivate(ctx); }
  handleRequest<T>(_err: unknown, user: T | false): T | undefined { return user || undefined; }
}

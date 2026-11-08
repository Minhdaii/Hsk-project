import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './feedback.dto';

interface ReqWithUser {
  user?: { id: number; email?: string; username?: string };
}

@Controller('feedback')
export class FeedbackController {
  constructor(
    private feedbackService: FeedbackService,
    private prisma: PrismaService,
  ) {}

  /**
   * Tạo giấy nhớ góp ý mới và ghim lên bảng
   * Hỗ trợ cả khách vãng lai và người dùng đã đăng nhập
   */
  @UseGuards(OptionalJwtGuard)
  @Post()
  async create(@Req() req: ReqWithUser, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto, req.user?.id);
  }

  /**
   * Lấy dữ liệu bảng thông báo giấy nhớ công khai
   * BẢO MẬT: Không tiết lộ nội dung của người khác, chỉ hiển thị số lượng, danh mục, màu sắc, vị trí
   */
  @UseGuards(OptionalJwtGuard)
  @Get()
  async getPublicBoard(@Req() req: ReqWithUser) {
    let isAdmin = false;
    const userId = req.user?.id;
    if (userId) {
      const u = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      isAdmin = u?.role === 'admin';
    }

    return this.feedbackService.getPublicBoard(userId, isAdmin);
  }

  /**
   * Quản trị viên: Xem toàn bộ nội dung mọi góp ý
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async getAdminList(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.feedbackService.getAdminList(status, category, search);
  }

  /**
   * Quản trị viên: Cập nhật trạng thái và ghi chú xử lý
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeedbackStatusDto,
  ) {
    return this.feedbackService.updateStatus(id, dto);
  }

  /**
   * Quản trị viên: Xóa giấy nhớ vi phạm
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.delete(id);
  }
}

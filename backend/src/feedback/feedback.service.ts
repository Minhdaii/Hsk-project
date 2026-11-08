import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './feedback.dto';

const DEFAULT_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];
const DEFAULT_PINS = ['red', 'gold', 'blue', 'green', 'tape'];

function maskAuthor(name: string): string {
  if (!name || name === 'Học viên ẩn danh' || name.toLowerCase().includes('ẩn danh')) {
    return 'Học viên ẩn danh';
  }
  const trimmed = name.trim();
  if (trimmed.length <= 2) return trimmed[0] + '*';
  if (trimmed.length <= 4) return trimmed.slice(0, 2) + '**';
  const parts = trimmed.split(' ');
  if (parts.length > 1) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first} ${last[0]}***`;
  }
  return trimmed.slice(0, 3) + '***';
}

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto, userId?: number) {
    // Tự động phân bổ góc xoay tự nhiên (-4.5 deg đến +4.5 deg)
    const rotation = parseFloat(((Math.random() * 9) - 4.5).toFixed(1));
    // Tọa độ ngẫu nhiên an toàn trên bảng (tỷ lệ phần trăm để responsive, tránh viền khung)
    const posX = parseFloat((18 + Math.random() * 64).toFixed(1));
    const posY = parseFloat((22 + Math.random() * 56).toFixed(1));

    const color = dto.color && DEFAULT_COLORS.includes(dto.color)
      ? dto.color
      : DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

    const pinType = dto.pinType && DEFAULT_PINS.includes(dto.pinType)
      ? dto.pinType
      : DEFAULT_PINS[Math.floor(Math.random() * DEFAULT_PINS.length)];

    let authorName = dto.name?.trim();
    if (!authorName && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, fullName: true },
      });
      authorName = user?.fullName || user?.username || 'Học viên HSK';
    }
    if (!authorName) {
      authorName = 'Học viên ẩn danh';
    }

    const note = await this.prisma.feedback.create({
      data: {
        userId: userId || null,
        name: authorName,
        category: dto.category,
        content: dto.content.trim(),
        color,
        rotation,
        posX,
        posY,
        pinType,
        status: 'pending',
      },
    });

    return {
      success: true,
      id: note.id,
      category: note.category,
      color: note.color,
      rotation: note.rotation,
      posX: note.posX,
      posY: note.posY,
      pinType: note.pinType,
      createdAt: note.createdAt,
      message: 'Góp ý của bạn đã được ghim lên bảng thông báo!',
    };
  }

  async getPublicBoard(currentUserId?: number, isAdmin: boolean = false) {
    const [totalCount, rawCategories, notes] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          userId: true,
          name: true,
          category: true,
          color: true,
          rotation: true,
          posX: true,
          posY: true,
          pinType: true,
          status: true,
          createdAt: true,
          content: true,
          user: {
            select: { username: true },
          },
        },
      }),
    ]);

    const categoryCounts: Record<string, number> = {
      suggestion: 0,
      bug: 0,
      content: 0,
      compliment: 0,
    };
    rawCategories.forEach((rc) => {
      categoryCounts[rc.category] = rc._count._all;
    });

    // BẢO MẬT: Người xem thông thường KHÔNG ĐƯỢC PHÉP xem nội dung của người khác
    // Chỉ admin hoặc chính tác giả bài viết mới nhận được trường content!
    const items = notes.map((n) => {
      const isMine = !!(currentUserId && n.userId === currentUserId);
      const canRead = isAdmin || isMine;

      return {
        id: n.id,
        category: n.category,
        color: n.color,
        rotation: n.rotation,
        posX: n.posX,
        posY: n.posY,
        pinType: n.pinType,
        status: n.status,
        createdAt: n.createdAt,
        isMine,
        author: isMine ? (n.name || 'Bạn') : maskAuthor(n.name || n.user?.username || 'Học viên ẩn danh'),
        // Chỉ gửi content khi là Admin hoặc tác giả ghi chú
        content: canRead ? n.content : undefined,
      };
    });

    return {
      totalCount,
      categoryCounts,
      items,
    };
  }

  async getAdminList(status?: string, category?: string, search?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { name: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }

    const items = await this.prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, username: true, role: true },
        },
      },
    });

    return {
      total: items.length,
      items,
    };
  }

  async updateStatus(id: number, dto: UpdateFeedbackStatusDto) {
    const exists = await this.prisma.feedback.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy giấy nhớ góp ý');

    return this.prisma.feedback.update({
      where: { id },
      data: {
        status: dto.status,
        adminNote: dto.adminNote !== undefined ? dto.adminNote : exists.adminNote,
      },
    });
  }

  async delete(id: number) {
    const exists = await this.prisma.feedback.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy giấy nhớ góp ý');

    await this.prisma.feedback.delete({ where: { id } });
    return { success: true, message: 'Đã xóa giấy nhớ khỏi bảng' };
  }
}

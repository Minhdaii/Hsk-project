import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CategoryNode = { id: number; name: string; slug: string; description: string | null; icon: string | null; parentId: number | null; sortOrder: number; wordCount: number; children: CategoryNode[] };

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** Cây danh mục đang hiển thị, kèm số từ (một từ nằm ở nhiều danh mục con của cùng một cha chỉ được đếm một lần) */
  async tree(includeHidden = false): Promise<CategoryNode[]> {
    const cats = await this.prisma.category.findMany({
      where: includeHidden ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    const links = await this.prisma.wordCategory.findMany({ select: { wordId: true, categoryId: true } });
    const direct = new Map<number, Set<number>>();
    for (const l of links) (direct.get(l.categoryId) ?? direct.set(l.categoryId, new Set()).get(l.categoryId)!).add(l.wordId);

    const nodes = new Map<number, CategoryNode>(cats.map((c) => [c.id, { id: c.id, name: c.name, slug: c.slug, description: c.description, icon: c.icon, parentId: c.parentId, sortOrder: c.sortOrder, wordCount: 0, children: [] }]));
    const roots: CategoryNode[] = [];
    for (const n of nodes.values()) {
      const parent = n.parentId ? nodes.get(n.parentId) : undefined;
      if (parent) parent.children.push(n); else if (!n.parentId) roots.push(n);
    }
    const collect = (n: CategoryNode): Set<number> => {
      const s = new Set(direct.get(n.id) ?? []);
      for (const c of n.children) collect(c).forEach((w) => s.add(w));
      n.wordCount = s.size;
      return s;
    };
    roots.forEach(collect);
    return roots;
  }

  async bySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({ where: { slug } });
    if (!cat || !cat.isActive) throw new NotFoundException('Không tìm thấy danh mục');
    const all = await this.tree();
    const find = (list: CategoryNode[], trail: CategoryNode[]): { node: CategoryNode; trail: CategoryNode[] } | null => {
      for (const n of list) {
        if (n.slug === slug) return { node: n, trail };
        const r = find(n.children, [...trail, n]);
        if (r) return r;
      }
      return null;
    };
    const hit = find(all, []);
    if (!hit) throw new NotFoundException('Danh mục đang bị ẩn');
    return { category: { ...hit.node, children: hit.node.children }, breadcrumb: hit.trail.map((t) => ({ id: t.id, name: t.name, slug: t.slug })) };
  }

  /** Từ vựng của danh mục (gồm cả danh mục con), có lọc theo cấp HSK, từ khoá và phân trang */
  async words(slug: string, q: { level?: number; q?: string; page: number; limit: number }) {
    const cat = await this.prisma.category.findUnique({ where: { slug }, select: { id: true, isActive: true } });
    if (!cat || !cat.isActive) throw new NotFoundException('Không tìm thấy danh mục');
    const ids = [cat.id];
    for (let i = 0; i < ids.length; i++) {
      const kids = await this.prisma.category.findMany({ where: { parentId: ids[i], isActive: true }, select: { id: true } });
      kids.forEach((k) => { if (!ids.includes(k.id)) ids.push(k.id); });
    }
    const text = q.q?.trim();
    const where: Prisma.WordWhereInput = {
      categories: { some: { categoryId: { in: ids } } },
      ...(q.level ? { hskLevel: q.level } : {}),
      ...(text ? { OR: [{ hanzi: { contains: text } }, { pinyin: { contains: text } }, { meaningVi: { contains: text } }] } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.word.count({ where }),
      this.prisma.word.findMany({ where, orderBy: [{ hskLevel: 'asc' }, { frequency: 'asc' }, { id: 'asc' }], skip: (q.page - 1) * q.limit, take: q.limit }),
    ]);
    return { items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) };
  }

  // ---------- Quản trị: thêm, sửa, ẩn, sắp xếp. Không có thao tác xoá để tránh mất liên kết; dùng isActive = false để ẩn ----------
  async create(d: { name: string; slug: string; description?: string; parentId?: number; icon?: string; sortOrder?: number }) {
    if (d.parentId) await this.assertExists(d.parentId);
    try {
      return await this.prisma.category.create({ data: { name: d.name, slug: d.slug, description: d.description, parentId: d.parentId, icon: d.icon, sortOrder: d.sortOrder ?? 0 } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new BadRequestException('Slug đã tồn tại');
      throw e;
    }
  }

  async update(id: number, d: { name?: string; slug?: string; description?: string | null; parentId?: number | null; icon?: string | null; sortOrder?: number; isActive?: boolean }) {
    await this.assertExists(id);
    if (d.parentId) {
      if (d.parentId === id) throw new BadRequestException('Danh mục không thể là cha của chính nó');
      await this.assertExists(d.parentId);
      // chặn vòng lặp: cha mới không được là hậu duệ của danh mục đang sửa
      let cur: number | null = d.parentId;
      for (let guard = 0; cur && guard < 20; guard++) {
        if (cur === id) throw new BadRequestException('Không thể chuyển danh mục vào chính nhánh con của nó');
        cur = (await this.prisma.category.findUnique({ where: { id: cur }, select: { parentId: true } }))?.parentId ?? null;
      }
    }
    try { return await this.prisma.category.update({ where: { id }, data: d }); }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new BadRequestException('Slug đã tồn tại');
      throw e;
    }
  }

  async reorder(items: { id: number; sortOrder: number }[]) {
    await this.prisma.$transaction(items.map((i) => this.prisma.category.update({ where: { id: i.id }, data: { sortOrder: i.sortOrder } })));
    return { updated: items.length };
  }

  private async assertExists(id: number) {
    if (!(await this.prisma.category.findUnique({ where: { id }, select: { id: true } }))) throw new NotFoundException(`Không có danh mục #${id}`);
  }
}

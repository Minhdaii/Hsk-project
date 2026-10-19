import type { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Lấy kiểu cấu hình trực tiếp từ adapter, tránh lỗi lệch phiên bản gói `mariadb`
type MariaDbConfig = Exclude<ConstructorParameters<typeof PrismaMariaDb>[0], string>;

/** Đọc DATABASE_URL (mysql://user:pass@host:port/db) thành cấu hình kết nối cho adapter MariaDB/MySQL */
export function dbConfig(url = process.env.DATABASE_URL): MariaDbConfig {
  if (!url) throw new Error('Thiếu biến môi trường DATABASE_URL');
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true, // cần khi MySQL 8 dùng mật khẩu (caching_sha2_password)
  };
}

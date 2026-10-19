// Client gọi REST API của backend NestJS
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'hsk_token';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));
export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); window.dispatchEvent(new Event('auth-changed')); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); window.dispatchEvent(new Event('auth-changed')); }

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.', 0);
  }
  if (!res.ok) {
    let msg = `Lỗi ${res.status}`;
    try {
      const j = await res.json();
      msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg;
    } catch { /* bỏ qua */ }
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

export type RecognizeStatus = 'ok' | 'uncertain' | 'unreadable';
export type RecognizeCandidate = { char: string; score: number };
export type RecognizeResult = { status: RecognizeStatus; candidates: RecognizeCandidate[] };

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Model đa phương thức (nhận ảnh) trên Groq, xem https://console.groq.com/docs/vision. Đổi bằng biến GROQ_VISION_MODEL.
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';
const TIMEOUT_MS = 8_000;
const RATE_LIMIT = 40; // số lần gọi tối đa
const RATE_WINDOW_MS = 60_000; // trong mỗi phút, tính theo IP
const CONFIDENT = 0.5; // dưới ngưỡng này coi là "không chắc chắn"

const PROMPT =
  'You are an OCR engine for handwritten Chinese. The image shows ONE Chinese character (simplified or traditional) ' +
  'drawn with a mouse on a white background; rarely it may be a short word. Identify it from the strokes you actually see. ' +
  'Never guess a plausible character that is not drawn. Keep traditional characters traditional and simplified ones simplified. ' +
  'Reply with JSON only, in exactly this shape: ' +
  '{"status":"ok|uncertain|unreadable","candidates":[{"char":"你","confidence":0.0}]}. ' +
  'Give at most 5 candidates, best first, confidence between 0 and 1. ' +
  'Add visually similar characters as lower-confidence alternatives only when you are unsure. ' +
  'If the image is blank, a scribble, or not a Chinese character, reply {"status":"unreadable","candidates":[]}.';

@Injectable()
export class RecognizeService {
  private logger = new Logger('Recognize');
  private hits = new Map<string, number[]>();

  async recognize(image: string, ip: string): Promise<RecognizeResult> {
    this.checkRate(ip);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('Chưa có GROQ_API_KEY trong biến môi trường, bỏ qua nhận diện bằng Groq');
      throw new HttpException('Nhận diện AI chưa được cấu hình', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const model = process.env.GROQ_VISION_MODEL || DEFAULT_MODEL;
    const isQwen = model.startsWith('qwen/');

    const body: Record<string, unknown> = {
      model,
      temperature: 0.2,
      max_completion_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ],
    };
    // Qwen 3.8: tắt chế độ suy luận (instruct mode) cho nhanh, và bật JSON mode
    if (isQwen) {
      body.reasoning_effort = 'none';
      body.response_format = { type: 'json_object' };
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        this.logger.warn(`Groq phản hồi quá ${TIMEOUT_MS}ms`);
        throw new HttpException('Nhận diện AI phản hồi quá chậm', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.warn(`Không kết nối được Groq: ${e instanceof Error ? e.message : e}`);
      throw new HttpException('Không kết nối được dịch vụ nhận diện AI', HttpStatus.BAD_GATEWAY);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) await this.failFromUpstream(res, model);

    const data = (await res.json().catch(() => null)) as { choices?: { message?: { content?: unknown } }[] } | null;
    const content = data?.choices?.[0]?.message?.content;
    return this.parse(typeof content === 'string' ? content : '');
  }

  /** Đổi lỗi của Groq thành lỗi gọn cho frontend; chi tiết chỉ ghi log phía máy chủ (không chứa khoá API). */
  private async failFromUpstream(res: Response, model: string): Promise<never> {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    this.logger.warn(`Groq trả ${res.status} (model ${model}): ${detail}`);
    if (res.status === 429) throw new HttpException('Nhận diện AI đang quá tải, thử lại sau', HttpStatus.TOO_MANY_REQUESTS);
    if (res.status === 401 || res.status === 403) throw new HttpException('Nhận diện AI chưa được cấu hình đúng', HttpStatus.BAD_GATEWAY);
    if (res.status === 400 || res.status === 404) throw new HttpException('Model nhận diện AI không khả dụng hoặc không hỗ trợ ảnh', HttpStatus.BAD_GATEWAY);
    throw new HttpException('Dịch vụ nhận diện AI gặp lỗi', HttpStatus.BAD_GATEWAY);
  }

  /** Đọc JSON của model một cách chặt chẽ: chỉ giữ chữ Hán, bỏ trùng, tối đa 5 ứng viên. */
  private parse(raw: string): RecognizeResult {
    const none: RecognizeResult = { status: 'unreadable', candidates: [] };
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return none;
    let json: { status?: unknown; candidates?: unknown };
    try { json = JSON.parse(m[0]); } catch { return none; }
    if (!Array.isArray(json.candidates)) return none;

    const seen = new Set<string>();
    const candidates: RecognizeCandidate[] = [];
    for (const it of json.candidates as { char?: unknown; confidence?: unknown }[]) {
      const char = typeof it?.char === 'string' ? it.char.trim() : '';
      if (!/^\p{Script=Han}{1,4}$/u.test(char) || seen.has(char)) continue;
      seen.add(char);
      const c = Number(it.confidence);
      candidates.push({ char, score: Number.isFinite(c) ? Math.min(1, Math.max(0, c)) : 0 });
      if (candidates.length === 5) break;
    }
    if (!candidates.length || json.status === 'unreadable') return none;
    candidates.sort((a, b) => b.score - a.score);
    const sure = json.status !== 'uncertain' && candidates[0].score >= CONFIDENT;
    return { status: sure ? 'ok' : 'uncertain', candidates };
  }

  /** Chặn lạm dụng: mỗi IP tối đa RATE_LIMIT lần/phút (bộ nhớ tiến trình, đủ cho một máy chủ). */
  private checkRate(ip: string) {
    const now = Date.now();
    const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_LIMIT) {
      this.hits.set(ip, recent);
      throw new HttpException('Bạn gửi quá nhanh, thử lại sau ít phút', HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.hits.set(ip, recent);
    if (this.hits.size > 5000) for (const [k, v] of this.hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) this.hits.delete(k);
  }
}

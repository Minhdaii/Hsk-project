"""Tạo data/sentences.json và data/grammar.json (có pinyin tự sinh) từ file nguồn:
  data/sentences_src.txt   (từ cần điền | câu đã tách từ | nghĩa Việt)
  data/grammar_src.json    (các điểm ngữ pháp)
Chạy:  pip install pypinyin   rồi   python scripts/build_content.py
Pinyin do pypinyin sinh tự động, có thể sai ở một vài chữ đa âm, hãy rà lại khi cần.
"""
import csv, json, re, sys
from pypinyin import Style, lazy_pinyin

CJK = re.compile(r'[\u3400-\u9fff]')


SANDHI_YI = {'1': 'yì', '2': 'yì', '3': 'yì', '4': 'yí'}


def token_pinyin(tokens):
    """Pinyin cho cả câu (đọc đúng chữ đa âm theo ngữ cảnh), có xử lý biến điệu 一/不, trợ từ 得/地/过 và đuôi 儿."""
    sentence = ''.join(tokens)
    syl = lazy_pinyin(sentence, style=Style.TONE, errors=lambda s: list(s))
    num = lazy_pinyin(sentence, style=Style.TONE3, errors=lambda s: list(s))

    def tone_of(i):
        return num[i][-1] if i < len(num) and num[i][-1:].isdigit() else ''

    for i, ch in enumerate(sentence):
        nxt = sentence[i + 1] if i + 1 < len(sentence) else ''
        prev = sentence[i - 1] if i > 0 else ''
        if ch == '一' and nxt and CJK.search(nxt) and (not prev or prev not in '第十二三四五六七八九零') and tone_of(i + 1) in SANDHI_YI:
            syl[i] = SANDHI_YI[tone_of(i + 1)]
        elif ch == '不':
            syl[i] = 'bu' if prev and prev == nxt else ('bú' if tone_of(i + 1) == '4' else 'bù')

    out, i = [], 0
    for k, t in enumerate(tokens):
        piece = syl[i:i + len(t)]
        i += len(t)
        if t in ('得', '地'):
            piece = ['de']
        elif t == '过' and k > 0:
            piece = ['guo']
        elif t.endswith('儿') and len(t) > 1:
            piece[-1] = 'r'
        out.append(''.join(piece) if CJK.search(t) else t)
    return ' '.join(out)


def main():
    vocab = {}
    for r in csv.DictReader(open('data/words_import.csv', encoding='utf-8')):
        lv = int(r['hsk_level']) if r['hsk_level'] else 99
        if r['hanzi'] not in vocab or lv < vocab[r['hanzi']]:
            vocab[r['hanzi']] = lv

    sentences, skipped = [], []
    for line in open('data/sentences_src.txt', encoding='utf-8'):
        if line.startswith('#') or not line.strip():
            continue
        word, seg, vi = [x.strip() for x in line.split('|')]
        tokens = seg.split()
        text = ''.join(tokens)
        if vocab.get(word, 99) > 3 or word not in text:
            skipped.append(word)
            continue
        sentences.append({'word': word, 'level': vocab[word], 'hanzi': text, 'tokens': ' '.join(tokens),
                          'pinyin': token_pinyin(tokens), 'meaningVi': vi})

    grammar = json.load(open('data/grammar_src.json', encoding='utf-8'))
    for n, gp in enumerate(grammar, 1):
        gp['order'] = n
        for ex in gp['examples']:
            tokens = ex['zh'].split()
            ex['hanzi'] = ''.join(tokens)
            ex['tokens'] = ' '.join(tokens)
            ex['pinyin'] = token_pinyin(tokens)
            ex['meaningVi'] = ex.pop('vi')
            del ex['zh']

    json.dump(sentences, open('data/sentences.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(grammar, open('data/grammar.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(sentences)} câu ví dụ, {len(grammar)} điểm ngữ pháp. Bỏ qua: {skipped or "không"}')


if __name__ == '__main__':
    sys.exit(main())

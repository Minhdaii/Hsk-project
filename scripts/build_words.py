"""Xây data/words_import.csv từ complete-hsk-vocabulary (complete.json) + CVDICT (CVDICT.u8).
Chạy:  python scripts/build_words.py complete.json CVDICT.u8 data/words_import.csv
Lưu ý: chọn cách đọc chính và lọc nghĩa bằng quy tắc tự động, có thể còn sót, hãy rà lại khi cần.
"""
import collections, csv, json, re, sys

HAN = re.compile(r'[\u3400-\u9fff]+')
EN_BAD = re.compile(r'^(old variant|variant of|unofficial variant|erhua variant|surname|see |see also|cl:|abbr\. for|also written|also pr\.|japanese variant|archaic variant)', re.I)
VI_BAD = ('biến thể', 'dạng cũ', 'dạng khác', 'cách viết khác', 'họ ', 'xem ', 'viết tắt', 'lt:', 'cl:', 'từ viết tắt', 'tên họ')
NOISY_NOTE = re.compile(r'lưu ý|đài loan|phát âm|thường dùng|thường phát', re.I)
# Một số chữ đa âm rất thường gặp: ép chọn cách đọc phổ biến nhất trong HSK
OVERRIDE = {'得': 'de', '为': 'wèi', '行': 'xíng', '了': 'le', '重': 'zhòng', '地': 'de', '着': 'zhe', '会': 'huì',
            '乐': 'lè', '教': 'jiāo', '差': 'chà', '只': 'zhǐ', '长': 'cháng', '好': 'hǎo', '还': 'hái', '都': 'dōu',
            '中': 'zhōng', '的': 'de', '和': 'hé', '说': 'shuō'}


def norm(num: str) -> str:
    return num.lower().replace('u:', 'v').replace('ü', 'v').strip()


def level(entry, kind):
    xs = [int(x.split('-')[1]) for x in entry['level'] if x.startswith(kind + '-') and x.split('-')[1].isdigit()]
    return min(xs) if xs else None


def valid_defs(form):
    return [m for m in form['meanings'] if not EN_BAD.match(m.strip())]


def pick_form(e):
    forms = e['forms']
    want = OVERRIDE.get(e['simplified'])
    if want:
        same = [f for f in forms if f['transcriptions']['pinyin'] == want]
        if same:
            return max(same, key=lambda f: len(valid_defs(f)))
    best = None
    for i, f in enumerate(forms):
        ok = bool(valid_defs(f)) and not f['transcriptions']['pinyin'][:1].isupper()
        key = (ok, len(valid_defs(f)), -i)
        if best is None or key > best[0]:
            best = (key, f)
    return best[1]


def clean_vi(defs):
    out = []
    for d in defs:
        s = d.strip()
        if not s or s.lower().startswith(VI_BAD):
            continue

        def fix(m):
            inner = m.group(1)
            if HAN.search(inner) or '[' in inner or NOISY_NOTE.search(inner) or len(inner) > 45:
                return ''
            return m.group(0)

        s = re.sub(r'\(([^()]*)\)', fix, s)
        s = re.sub(r'\[[^\]]*\]', '', s)
        s = HAN.sub('', s)
        s = re.sub(r'\s+', ' ', s).strip(' ;,:-')
        s = re.sub(r'\s+([,;])', r'\1', s)
        if not re.sub(r'[()\s,;.\-~]', '', s):
            continue
        if s not in out:
            out.append(s)
    return out


def join_limited(parts, max_items, max_len):
    res = []
    for p in parts:
        if len(res) >= max_items:
            break
        if res and len('; '.join(res + [p])) > max_len:
            break
        res.append(p)
    text = '; '.join(res)
    return text if len(text) <= max_len + 30 else text[:max_len].rstrip() + '…'


def clean_en(defs):
    out = []
    for d in defs:
        s = re.sub(r'\([^()]*(Taiwan pr\.|also pr\.)[^()]*\)', '', d).strip()
        s = re.sub(r'\s+', ' ', s).strip(' ;,')
        if s and not EN_BAD.match(s) and s not in out:
            out.append(s)
    return out


def load_cvdict(path):
    pat = re.compile(r'^(\S+) (\S+) \[([^\]]*)\] /(.*)/\s*$')
    exact, by_han = collections.defaultdict(list), collections.defaultdict(list)
    with open(path, encoding='utf-8') as f:
        for line in f:
            if line.startswith('#'):
                continue
            m = pat.match(line)
            if not m:
                continue
            _, simp, py, defs = m.groups()
            defs = [x for x in defs.split('/') if x]
            exact[(simp, norm(py))].append(defs)
            by_han[simp].append((norm(py), defs))
    return exact, by_han


def vi_meaning(simp, numeric, exact, by_han):
    cands = exact.get((simp, numeric))
    if not cands:
        tone_less = re.sub(r'\d', '', numeric)
        cands = [d for p, d in by_han.get(simp, []) if re.sub(r'\d', '', p) == tone_less]
    if not cands and simp.endswith('儿') and len(simp) > 1:  # từ có đuôi 儿: lấy nghĩa của từ gốc
        cands = [d for _, d in by_han.get(simp[:-1], [])]
    cleaned = sorted((clean_vi(c) for c in cands or []), key=len, reverse=True)
    cleaned = [c for c in cleaned if c]
    if not cleaned:
        return ''
    merged = list(cleaned[0])
    for extra in cleaned[1:]:
        for s in extra:
            if s not in merged:
                merged.append(s)
    return join_limited(merged, 3, 110)


def main(complete, cvdict, out_path):
    data = json.load(open(complete, encoding='utf-8'))
    exact, by_han = load_cvdict(cvdict)
    rows = []
    for e in data:
        old, new = level(e, 'old'), level(e, 'new')
        if not ((old and old <= 3) or (new and new <= 3)):
            continue
        f = pick_form(e)
        tr = f['transcriptions']
        rows.append({
            'hanzi': e['simplified'], 'traditional': f['traditional'], 'pinyin': tr['pinyin'],
            'meaning_vi': vi_meaning(e['simplified'], norm(tr['numeric']), exact, by_han),
            'meaning_en': join_limited(clean_en(valid_defs(f)), 4, 160),
            'pos': ','.join(e.get('pos', [])),
            'hsk_level': new or '', 'hsk_old': old or '',
            'frequency': e.get('frequency', ''), 'radical': e.get('radical', ''),
        })
    rows.sort(key=lambda r: (int(r['hsk_level']) if r['hsk_level'] != '' else 99, int(r['frequency'] or 10**9)))
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    missing = sum(1 for r in rows if not r['meaning_vi'])
    print(f'{len(rows)} từ, thiếu nghĩa Việt: {missing}')


if __name__ == '__main__':
    main(*sys.argv[1:4])

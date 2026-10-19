"""Tạo file SQL điền âm Hán Việt cho bảng words, lấy từ Unicode Unihan (trường kVietnamese).
Chạy trên máy của bạn (cần Internet):   python scripts/fetch_hanviet.py
Kết quả: data/hanviet_update.sql  -> chạy file này trong MySQL (HeidiSQL hoặc: mysql -u root hsk < data/hanviet_update.sql)
"""
import csv, io, sys, urllib.request, zipfile

UNIHAN = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"

def parse_unihan(text: str) -> dict:
    table = {}
    for line in text.splitlines():
        if line.startswith("#") or "\tkVietnamese\t" not in line:
            continue
        code, _, value = line.split("\t")[:3]
        table[chr(int(code[2:], 16))] = value.split()[0].lower()
    return table

def main():
    print("Đang tải Unihan (~7 MB)...")
    raw = urllib.request.urlopen(UNIHAN, timeout=60).read()
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        table = parse_unihan(z.read("Unihan_Readings.txt").decode("utf-8"))
    print(f"Có {len(table)} chữ có âm Hán Việt.")

    out, skipped = [], 0
    seen = set()
    with open("data/words_import.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["hanzi"] in seen:
                continue
            seen.add(r["hanzi"])
            trad = r["traditional"] or r["hanzi"]
            parts = []
            for s, t in zip(r["hanzi"], trad if len(trad) == len(r["hanzi"]) else r["hanzi"]):
                parts.append(table.get(t) or table.get(s))
            if not parts or any(p is None for p in parts):
                skipped += 1
                continue
            hv = " ".join(parts).replace("'", "''")
            out.append(f"update words set hanviet = '{hv}' where hanzi = '{r['hanzi']}';")
    with open("data/hanviet_update.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    print(f"Đã ghi {len(out)} câu lệnh, bỏ qua {skipped} từ không đủ dữ liệu -> data/hanviet_update.sql")

if __name__ == "__main__":
    sys.exit(main())

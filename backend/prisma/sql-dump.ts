// Đọc các câu INSERT ... VALUES (...),(...); của file .sql do mysqldump/script xuất ra (không cần cài MySQL)
export type Cell = string | number | null;

export function parseInsertTable(sql: string, table: string): Cell[][] {
  const head = `INSERT INTO \`${table}\` VALUES`;
  const first = sql.indexOf(head);
  if (first < 0) throw new Error(`Không thấy INSERT cho bảng ${table}`);
  const end = sql.indexOf('UNLOCK TABLES;', first);
  const body = sql.slice(first, end < 0 ? undefined : end);
  const rows: Cell[][] = [];
  let i = 0;
  const n = body.length;
  while (i < n) {
    const c = body[i];
    if (c === ' ' || c === '\n' || c === '\r' || c === ',' || c === ';') { i++; continue; }
    if (body.startsWith('INSERT INTO', i)) { i = body.indexOf('VALUES', i) + 6; continue; }
    if (c !== '(') throw new Error(`Cú pháp lạ gần: ${body.slice(i, i + 40)}`);
    i++;
    const row: Cell[] = [];
    for (;;) {
      while (body[i] === ' ') i++;
      if (body[i] === "'") {
        i++;
        let s = '';
        for (;;) {
          const ch = body[i];
          if (ch === '\\') { const nx = body[i + 1]; s += nx === 'n' ? '\n' : nx === 't' ? '\t' : nx === 'r' ? '\r' : nx === '0' ? '\0' : nx; i += 2; continue; }
          if (ch === "'") { if (body[i + 1] === "'") { s += "'"; i += 2; continue; } i++; break; }
          s += ch; i++;
        }
        row.push(s);
      } else {
        let j = i;
        while (body[j] !== ',' && body[j] !== ')') j++;
        const tok = body.slice(i, j).trim();
        row.push(tok === 'NULL' ? null : /^-?\d+$/.test(tok) ? Number(tok) : tok);
        i = j;
      }
      if (body[i] === ',') { i++; continue; }
      if (body[i] === ')') { i++; break; }
    }
    rows.push(row);
  }
  return rows;
}

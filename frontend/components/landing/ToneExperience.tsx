'use client';
import { useState } from 'react';

const tones = [
  { label: 'mā', n: '01', name: 'CAO NGANG', path: 'M12 48 C55 47 95 49 138 48 S220 49 288 48', desc: 'Giữ cao và đều.' },
  { label: 'má', n: '02', name: 'ĐI LÊN', path: 'M12 86 C70 82 126 65 172 45 S242 20 288 13', desc: 'Bắt đầu vừa, đi lên cao.' },
  { label: 'mǎ', n: '03', name: 'XUỐNG — LÊN', path: 'M12 27 C60 35 92 83 145 87 S217 62 288 35', desc: 'Hạ thấp rồi nâng lên.' },
  { label: 'mà', n: '04', name: 'ĐI XUỐNG', path: 'M12 12 C75 19 154 57 210 75 S265 86 288 89', desc: 'Khởi điểm cao, dứt khoát hạ.' },
];
export default function ToneExperience() {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const tone = tones[active];
  return <div className="tone-lab"><div className="tone-lab__chart"><div className="tone-lab__axis"><span>高</span><i/><i/><i/><span>低</span></div><svg viewBox="0 0 300 100" role="img" aria-label={`Thanh ${active + 1}: ${tone.name}`}><path className="tone-lab__guide" d="M12 12H288M12 50H288M12 89H288"/><path className="tone-lab__line" d={tone.path}/><circle className="tone-lab__dot" r="5" cx="12" cy="50"><animateMotion key={`${active}-${run}`} dur="1.5s" repeatCount="1" path={tone.path}/></circle></svg><div className="tone-lab__labels"><span>起</span><span>声调轨迹 / 0{active + 1}</span><span>落</span></div></div><div className="tone-lab__detail"><div className="tone-lab__current"><span>第三声母音示例</span><strong>{tone.label}</strong></div><p>{tone.desc}</p><div className="tone-lab__tabs" role="tablist" aria-label="选择拼音声调">{tones.map((item, i) => <button key={item.n} type="button" role="tab" aria-selected={active === i} onClick={() => { setActive(i); setRun((value) => value + 1); }}><span>{item.label}</span><small>{item.n} · {item.name}</small></button>)}</div></div></div>;
}



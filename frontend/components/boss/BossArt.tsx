/** Ba Boss hoạt hình 2D, vẽ bằng SVG đơn giản. Biểu cảm đổi theo tình trạng: bình thường, bị đau, sắp gục. */
export type Mood = 'idle' | 'hurt' | 'low' | 'happy';

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'hurt') return (<g stroke="#2a2a35" strokeWidth="4" strokeLinecap="round" fill="none"><path d="M70 98l14 10M84 98l-14 10" /><path d="M116 98l14 10M130 98l-14 10" /></g>);
  const r = mood === 'low' ? 9 : 11;
  return (<g><circle cx="77" cy="102" r={r + 4} fill="#fff" /><circle cx="123" cy="102" r={r + 4} fill="#fff" /><circle cx="79" cy="104" r={r - 3} fill="#2a2a35" /><circle cx="121" cy="104" r={r - 3} fill="#2a2a35" /><circle cx="82" cy="100" r="3" fill="#fff" /><circle cx="124" cy="100" r="3" fill="#fff" />
    {mood === 'low' && <path d="M62 86q15-10 30 2M108 88q15-12 30-2" stroke="#2a2a35" strokeWidth="4" fill="none" strokeLinecap="round" />}</g>);
}
function Mouth({ mood }: { mood: Mood }) {
  if (mood === 'hurt') return <path d="M88 132q12-10 24 0" stroke="#2a2a35" strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (mood === 'low') return <path d="M88 136q12 10 24 0q-12-6-24 0z" fill="#7a2a2a" />;
  if (mood === 'happy') return <path d="M84 128q16 22 32 0z" fill="#7a2a2a" />;
  return <path d="M86 128q14 14 28 0" stroke="#2a2a35" strokeWidth="4" fill="none" strokeLinecap="round" />;
}
const Cheeks = () => (<g fill="#ff9fb0" opacity=".65"><ellipse cx="62" cy="124" rx="9" ry="6" /><ellipse cx="138" cy="124" rx="9" ry="6" /></g>);

function Slime({ mood }: { mood: Mood }) {
  return (<svg viewBox="0 0 200 200" role="img" aria-label="Boss Slime xanh">
    <ellipse cx="100" cy="182" rx="62" ry="9" fill="#000" opacity=".1" />
    <path d="M28 150Q26 56 100 54Q174 56 172 150Q172 176 100 176Q28 176 28 150Z" fill="#7bd88f" stroke="#2f9e57" strokeWidth="5" />
    <ellipse cx="64" cy="82" rx="16" ry="9" fill="#fff" opacity=".45" transform="rotate(-25 64 82)" />
    <Cheeks /><Eyes mood={mood} /><Mouth mood={mood} />
  </svg>);
}
function Dragon({ mood }: { mood: Mood }) {
  return (<svg viewBox="0 0 200 200" role="img" aria-label="Boss Rồng cam">
    <ellipse cx="100" cy="184" rx="64" ry="9" fill="#000" opacity=".1" />
    <path d="M150 150q40 0 34-38q-6 20-30 22z" fill="#f59b3d" stroke="#c9701a" strokeWidth="4" />
    <path d="M40 96q-34-30-14-62q16 24 40 40z" fill="#ffc46b" stroke="#c9701a" strokeWidth="4" /><path d="M160 96q34-30 14-62q-16 24-40 40z" fill="#ffc46b" stroke="#c9701a" strokeWidth="4" />
    <path d="M70 58l-8-26l22 16zM130 58l8-26l-22 16z" fill="#fff3d6" stroke="#c9701a" strokeWidth="4" strokeLinejoin="round" />
    <ellipse cx="100" cy="118" rx="70" ry="62" fill="#ffa94d" stroke="#c9701a" strokeWidth="5" />
    <ellipse cx="100" cy="146" rx="40" ry="28" fill="#ffe2b0" />
    <Cheeks /><Eyes mood={mood} /><Mouth mood={mood} />
  </svg>);
}
function Spiky({ mood }: { mood: Mood }) {
  return (<svg viewBox="0 0 200 200" role="img" aria-label="Boss quái tím có gai">
    <ellipse cx="100" cy="184" rx="62" ry="9" fill="#000" opacity=".1" />
    <g fill="#8e6bd8" stroke="#5b3fa8" strokeWidth="4" strokeLinejoin="round"><path d="M52 66l-10-30l28 18z" /><path d="M86 52l4-34l20 30z" /><path d="M126 50l16-28l12 34z" /><path d="M150 78l30-12l-10 30z" /><path d="M24 96l6-28l22 20z" /></g>
    <ellipse cx="100" cy="122" rx="72" ry="60" fill="#a98af0" stroke="#5b3fa8" strokeWidth="5" />
    <ellipse cx="68" cy="88" rx="14" ry="8" fill="#fff" opacity=".4" transform="rotate(-25 68 88)" />
    <Cheeks /><Eyes mood={mood} /><Mouth mood={mood} />
    <path d="M92 130l4 10l4-10M104 130l4 10l4-10" fill="#fff" stroke="#fff" strokeWidth="1" />
  </svg>);
}

export const BOSSES: Record<number, { name: string; Art: (p: { mood: Mood }) => JSX.Element }> = {
  1: { name: 'Slime Xanh', Art: Slime },
  2: { name: 'Rồng Cam', Art: Dragon },
  3: { name: 'Quái Gai Tím', Art: Spiky },
};

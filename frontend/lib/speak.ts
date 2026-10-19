// Phát âm bằng Web Speech API của trình duyệt (miễn phí, không cần file audio)
export function speak(text: string, audioUrl?: string | null) {
  if (typeof window === 'undefined') return;
  if (audioUrl) { new Audio(audioUrl).play().catch(() => {}); return; }
  if (!('speechSynthesis' in window)) { alert('Trình duyệt này không hỗ trợ đọc phát âm.'); return; }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const zh = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
  if (voices.length > 0 && !zh && !sessionStorage.getItem('no-zh-voice')) {
    sessionStorage.setItem('no-zh-voice', '1');
    alert('Máy chưa có giọng đọc tiếng Trung nên có thể không nghe được.\nWindows: Settings → Time & language → Speech → Add voices → Chinese (Simplified).');
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  if (zh) u.voice = zh;
  u.rate = 0.85;
  synth.cancel();
  synth.speak(u);
}

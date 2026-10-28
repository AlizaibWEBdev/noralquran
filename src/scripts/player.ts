// Verse-by-verse audio. Every element with [data-ayah="s:a"] on the page forms
// the playlist, in DOM order. [data-play="s:a"] starts from that verse;
// [data-play-all] starts from the first verse on the page.
const AUDIO_BASE = 'https://the-quran-project.github.io/Quran-Audio/Data/1';

const box = document.getElementById('player')!;
const el = <T extends HTMLElement>(name: string) => box.querySelector<T>(`[data-player="${name}"]`)!;
const audio = el<HTMLAudioElement>('audio');
const toggleBtn = el('toggle');
const seek = el<HTMLInputElement>('seek');

let list: HTMLElement[] = [];
let index = -1;

const keyOf = (node: HTMLElement) => node.dataset.ayah!;

function mark() {
  document.querySelectorAll('.ayah.is-playing').forEach((n) => n.classList.remove('is-playing'));
  const node = list[index];
  if (!node) return;
  node.classList.add('is-playing');
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function playAt(i: number) {
  if (i < 0 || i >= list.length) return;
  index = i;
  const node = list[i];
  const [s, a] = keyOf(node).split(':');
  audio.src = `${AUDIO_BASE}/${s}_${a}.mp3`;
  audio.play().catch(() => {});
  el('title').textContent = node.dataset.label || `${s}:${a}`;
  el('sub').textContent = `Mishary Rashid Alafasy · ${i + 1} of ${list.length}`;
  box.hidden = false;
  mark();
  // Warm the next file so playback is gapless.
  const next = list[i + 1];
  if (next) {
    const [ns, na] = keyOf(next).split(':');
    fetch(`${AUDIO_BASE}/${ns}_${na}.mp3`, { mode: 'no-cors' }).catch(() => {});
  }
}

function start(key?: string) {
  list = [...document.querySelectorAll<HTMLElement>('[data-ayah]')];
  const i = key ? list.findIndex((n) => keyOf(n) === key) : 0;
  playAt(Math.max(i, 0));
}

document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-play],[data-play-all]');
  if (!target) return;
  e.preventDefault();
  start(target.dataset.play);
});

audio.addEventListener('ended', () => {
  if (index < list.length - 1) playAt(index + 1);
  else toggleBtn.textContent = '▶';
});
audio.addEventListener('play', () => (toggleBtn.textContent = '❚❚'));
audio.addEventListener('pause', () => (toggleBtn.textContent = '▶'));
audio.addEventListener('loadedmetadata', () => (seek.max = String(audio.duration || 0)));
audio.addEventListener('timeupdate', () => (seek.value = String(audio.currentTime)));
seek.addEventListener('input', () => (audio.currentTime = Number(seek.value)));

toggleBtn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
el('prev').addEventListener('click', () => playAt(index - 1));
el('next').addEventListener('click', () => playAt(index + 1));
el('close').addEventListener('click', () => {
  audio.pause();
  box.hidden = true;
  document.querySelectorAll('.ayah.is-playing').forEach((n) => n.classList.remove('is-playing'));
});

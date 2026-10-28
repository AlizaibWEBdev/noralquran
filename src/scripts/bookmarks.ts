// Bookmark toggles. Same storage key/format as the previous app
// ({"36:5": true}) so existing users keep their saved verses.
export const STORAGE_KEY = 'nur_quran_bookmarks';

export function readBookmarks(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function write(map: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function paint(btn: HTMLElement, on: boolean) {
  btn.setAttribute('aria-pressed', String(on));
  btn.textContent = on ? '★ Saved' : '☆ Save';
}

const saved = readBookmarks();
document.querySelectorAll<HTMLElement>('[data-bookmark]').forEach((btn) => paint(btn, !!saved[btn.dataset.bookmark!]));

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-bookmark]');
  if (!btn) return;
  const key = btn.dataset.bookmark!;
  const map = readBookmarks();
  if (map[key]) delete map[key];
  else map[key] = true;
  write(map);
  paint(btn, !!map[key]);
});

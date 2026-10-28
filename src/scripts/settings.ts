// Reader preferences: dark mode, transliteration, translation, mushaf mode, Arabic size.
const root = document.documentElement;
const panel = document.getElementById('settings')!;
const toggle = document.getElementById('settings-toggle')!;

type Prefs = { size?: number; hideTranslit?: boolean; hideTranslation?: boolean; mushaf?: boolean };

const load = (): Prefs => {
  try {
    return JSON.parse(localStorage.getItem('nur_prefs') || '{}');
  } catch {
    return {};
  }
};
const save = (p: Prefs) => {
  try {
    localStorage.setItem('nur_prefs', JSON.stringify(p));
  } catch {}
};

toggle.addEventListener('click', () => {
  panel.hidden = !panel.hidden;
  toggle.setAttribute('aria-expanded', String(!panel.hidden));
});

const prefs = load();
const input = (name: string) => panel.querySelector<HTMLInputElement>(`[data-pref="${name}"]`)!;

input('dark').checked = root.classList.contains('dark');
input('translit').checked = !prefs.hideTranslit;
input('translation').checked = !prefs.hideTranslation;
input('mushaf').checked = !!prefs.mushaf;
input('size').value = String(prefs.size ?? 2);

input('dark').addEventListener('change', (e) => {
  const on = (e.target as HTMLInputElement).checked;
  root.classList.toggle('dark', on);
  try {
    localStorage.setItem('theme', on ? 'dark' : 'light');
  } catch {}
});

const bindClass = (name: string, cls: string, key: keyof Prefs, invert: boolean) =>
  input(name).addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    const on = invert ? !checked : checked;
    root.classList.toggle(cls, on);
    save({ ...load(), [key]: on });
  });

bindClass('translit', 'hide-translit', 'hideTranslit', true);
bindClass('translation', 'hide-translation', 'hideTranslation', true);
bindClass('mushaf', 'mushaf', 'mushaf', false);

input('size').addEventListener('input', (e) => {
  const size = Number((e.target as HTMLInputElement).value);
  root.style.setProperty('--arabic-size', size + 'rem');
  save({ ...load(), size });
});

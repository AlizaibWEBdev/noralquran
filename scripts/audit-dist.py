"""SEO audit of the built site (dist/). Run after `npm run build`:
    python -I scripts/audit-dist.py
Checks: broken internal links, duplicate titles/descriptions, H1 count,
canonical presence, and sitemap <-> noindex agreement."""
import re, sys, collections
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'
SITE = 'https://nural-quran.com'

def url_for(p: Path) -> str:
    rel = p.relative_to(DIST).as_posix()
    return '/' if rel == 'index.html' else '/' + rel.removesuffix('.html')

pages = {url_for(p): p for p in DIST.rglob('*.html')}
static = {'/' + p.relative_to(DIST).as_posix() for p in DIST.rglob('*') if p.is_file()}

title_re = re.compile(r'<title>(.*?)</title>', re.S)
desc_re = re.compile(r'<meta name="description" content="(.*?)"')
canon_re = re.compile(r'<link rel="canonical" href="(.*?)"')
href_re = re.compile(r'href="(/[^"#?]*)')

titles, descs = collections.defaultdict(list), collections.defaultdict(list)
broken, problems = collections.Counter(), []
noindex = set()

for url, path in pages.items():
    html = path.read_text(encoding='utf-8')
    if url in ('/404',):
        continue
    t, d, c = title_re.search(html), desc_re.search(html), canon_re.search(html)
    if not (t and d and c):
        problems.append(f'{url}: missing title/description/canonical')
        continue
    titles[t[1]].append(url)
    descs[d[1]].append(url)
    if html.count('<h1') != 1:
        problems.append(f'{url}: {html.count("<h1")} h1 tags')
    if 'noindex' in html:
        noindex.add(url)
    if len(t[1]) > 70:
        problems.append(f'{url}: title {len(t[1])} chars')
    for h in set(href_re.findall(html)):
        h = h.rstrip('/') or '/'
        if h not in pages and h not in static:
            broken[h] += 1

sitemap_urls = set()
for sm in DIST.glob('sitemap-*.xml'):
    sitemap_urls |= {u.removeprefix(SITE) or '/' for u in re.findall(r'<loc>(.*?)</loc>', sm.read_text(encoding='utf-8'))}

dup_t = {k: v for k, v in titles.items() if len(v) > 1}
dup_d = {k: v for k, v in descs.items() if len(v) > 1}
print(f'pages: {len(pages)}  indexable: {len(pages) - len(noindex)}  noindex: {len(noindex)}  in sitemaps: {len(sitemap_urls)}')
print(f'duplicate titles: {len(dup_t)}  duplicate descriptions: {len(dup_d)}')
print(f'broken internal links: {len(broken)}', broken.most_common(10))
print(f'sitemap URLs missing a page: {sorted(sitemap_urls - set(pages))[:10]}')
print(f'sitemap URLs that are noindex: {sorted(sitemap_urls & noindex)[:10]}')
indexable_missing = sorted(set(pages) - noindex - sitemap_urls - {'/404', '/donate'})
print(f'indexable pages not in a sitemap: {len(indexable_missing)}', indexable_missing[:10])
long_titles = [p for p in problems if 'title' in p and 'chars' in p]
other = [p for p in problems if p not in long_titles]
print(f'titles over 70 chars: {len(long_titles)}', long_titles[:5])
print(f'other problems: {len(other)}', other[:10])
for k, v in list(dup_t.items())[:3]:
    print('  dup title:', k, v[:3])
sys.exit(1 if broken or other or dup_t or (sitemap_urls & noindex) else 0)

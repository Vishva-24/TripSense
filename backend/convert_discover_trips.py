"""
Convert discoverTrips.ts into a Python data file.
Run from project root: python backend/convert_discover_trips.py
"""
import re, json, os

ts_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'discoverTrips.ts')
out_path = os.path.join(os.path.dirname(__file__), 'data', 'discover_trips.py')

with open(ts_path, encoding='utf-8') as f:
    content = f.read()

# Split on slug markers to isolate each trip block
trip_blocks = re.split(r'(?=\{\s*\n?\s*slug:\s*["\'])', content)
trip_blocks = [b.strip() for b in trip_blocks if 'slug:' in b]

def extract_str(block, key):
    m = re.search(rf'{key}:\s*"([^"]*)"', block)
    if not m:
        m = re.search(rf"{key}:\s*'([^']*)'", block)
    return m.group(1) if m else ''

def extract_days(block):
    days_section = re.search(r'days:\s*\[(.*?)\]\s*\}', block, re.DOTALL)
    if not days_section:
        return []
    raw = days_section.group(1)
    day_blocks = re.split(r'\{\s*\n?\s*day:', raw)
    days = []
    for db in day_blocks:
        if not db.strip():
            continue
        day_num_m = re.match(r'\s*(\d+)', db)
        if not day_num_m:
            continue
        day_num = int(day_num_m.group(1))
        title_m = re.search(r'title:\s*"([^"]*)"', db)
        title = title_m.group(1) if title_m else ''
        # description may span lines
        desc_m = re.search(r'description:\s*\n?\s*"((?:[^"\\]|\\.|\n)*?)"', db, re.DOTALL)
        if not desc_m:
            desc_m = re.search(r"description:\s*\n?\s*'((?:[^'\\]|\\.|\n)*?)'", db, re.DOTALL)
        desc = ' '.join((desc_m.group(1) if desc_m else '').split())
        days.append({'day': day_num, 'title': title, 'description': desc})
    return days

trips = []
for block in trip_blocks:
    slug = extract_str(block, 'slug')
    if not slug:
        continue
    trips.append({
        'slug': slug,
        'title': extract_str(block, 'title'),
        'location': extract_str(block, 'location'),
        'duration': extract_str(block, 'duration'),
        'vibe': extract_str(block, 'vibe'),
        'persona': extract_str(block, 'persona'),
        'badgeClass': extract_str(block, 'badgeClass'),
        'image': extract_str(block, 'image'),
        'days': extract_days(block),
    })

os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('"""\nStatically ported discover trips data from lib/discoverTrips.ts.\nDo not edit manually — re-run convert_discover_trips.py to regenerate.\n"""\nfrom __future__ import annotations\nfrom typing import Optional\n\n')
    f.write(f'DISCOVER_TRIPS: list[dict] = {json.dumps(trips, indent=2, ensure_ascii=False)}\n\n')
    f.write('''
def get_discover_trip_by_slug(slug: str) -> Optional[dict]:
    """Return the discover trip dict for a given slug, or None if not found."""
    return next((t for t in DISCOVER_TRIPS if t["slug"] == slug), None)


def get_all_discover_trips() -> list[dict]:
    return DISCOVER_TRIPS
''')

print(f'Wrote {len(trips)} trips to {out_path}')

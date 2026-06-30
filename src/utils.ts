import { Channel } from "./types";

export function parseStreamSpec(raw: string) {
  const input = (raw || '').trim();
  const parts = input.split('|');
  const cleanUrl = (parts.shift() || '').trim();
  const headers: Record<string, string> = {};
  parts.forEach(part => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim().toLowerCase();
      const val = part.slice(idx + 1).trim();
      headers[key] = val;
    }
  });
  return { rawUrl: input, cleanUrl, headers };
}

export function parseM3U(text: string, isPriority = false): Channel[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const res: Channel[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const info = lines[i];
      const url = lines[i + 1] && !lines[i + 1].startsWith('#') ? lines[i + 1] : null;
      if (!url) continue;
      const parsed = parseStreamSpec(url);
      const nm = info.match(/,(.+)$/);
      const lg = info.match(/tvg-logo="([^"]+)"/);
      const gr = info.match(/group-title="([^"]+)"/);
      const clean = parsed.cleanUrl;
      const lower = clean.toLowerCase();
      const isIframe = /embed|iframe|player|watch/.test(lower) && !(/\.m3u8|\.mpd|\.mp4|\.webm|\.mkv/.test(lower));
      res.push({
        name: nm ? nm[1].trim() : 'Unknown',
        logo: lg ? lg[1] : '',
        group: gr ? gr[1].replace(/[^\w\s&]/g, '').trim() : 'Other',
        url: clean,
        rawUrl: parsed.rawUrl,
        headers: parsed.headers,
        isIframe: isIframe,
        isPriority: isPriority
      });
      i++;
    }
  }
  return res;
}

export function normalizeGroup(g: string) {
  const s = g.toLowerCase();
  if (s.includes('sport') || s.includes('cricket') || s.includes('football')) return 'Sports';
  if (s.includes('news')) return 'News';
  if (s.includes('entertain') || s.includes('movie') || s.includes('cinema') || s.includes('drama')) return 'Entertainment';
  if (s.includes('kids') || s.includes('child') || s.includes('cartoon')) return 'Kids';
  if (s.includes('music')) return 'Music';
  if (s.includes('document')) return 'Documentary';
  if (s.includes('religious') || s.includes('islam')) return 'Religious';
  return g || 'Other';
}

export function channelToSlug(name: string) {
  return encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''));
}

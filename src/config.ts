import { Channel } from "./types";

export const M3U_URLS = [
  "https://raw.githubusercontent.com/bdtechexpert/live-tv-playlist/refs/heads/main/live-tv-playlist.m3u",
  "https://raw.githubusercontent.com/abusaeeidx/Mrgify-Tv/refs/heads/main/playlist.m3u",
  "https://raw.githubusercontent.com/abusaeeidx/T-Sports-Playlist-Auto-Update/refs/heads/main/combine_playlist.m3u",
  "https://raw.githubusercontent.com/v5on/filoox-bdix-selected/refs/heads/main/playlist.m3u"
];

export const ALLOWED_CHANNELS = [
  "Somoy TV for FIFA World Cup",
  "FIFA World Cup live 1",
  "FIFA World Cup live 2",
  "FIFA World Cup live 3",
  "FIFA World Cup live 4",
  "FIFA World Cup live 5",
  "T sports"
];

export const CUSTOM_CHANNELS: Channel[] = [
  { name: "Somoy TV for FIFA", logo: "https://i.postimg.cc/pVY2y4s3/images-(7).jpg", url: "https://live.thebosstv.com:30443/dwlive/Somoy-TV/chunks.m3u8", group: "Sports", isPriority: true },
  { name: "FOX", logo: "https://i.postimg.cc/pVY2y4s3/images-(7).jpg", url: "https://1nyaler.streamhostingcdn.top/stream/26/index.m3u8", group: "Sports", isPriority: true },
  { name: "WIW", logo: "https://i.postimg.cc/pVY2y4s3/images-(7).jpg", url: "https://1nyaler.streamhostingcdn.top/stream/32/index.m3u8", group: "Sports", isPriority: true },
  { name: "BEIN SPORTS", logo: "https://i.postimg.cc/pVY2y4s3/images-(7).jpg", url: "https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8", group: "Sports", isPriority: true },
  { name: "beIN Sports", logo: "https://i.postimg.cc/pVY2y4s3/images-(7).jpg", url: "https://edge22.776740.ir.cdn.ir/hls2/sport.m3u8", group: "Sports", isPriority: true }
];

export const AD_LINKS = [
  "https://www.effectivecpmnetwork.com/dyyctbfkq?key=c298d4bf82cd56f091274372b74742b2",
  "https://www.effectivecpmnetwork.com/dfxs2nu1wq?key=4d1218daa319186cb7d95e989135779c",
  "https://www.effectivecpmnetwork.com/ss7nmu0apx?key=a5ea4453215928f238b0b35845fef01f",
  "https://www.effectivecpmnetwork.com/c8w3rysv?key=4345f99e5ef6faca4564bb3e54a382ea"
];

export const BLACKLIST_CHANNELS = [
  "Court Sports Network",
  "BT Sports 2",
  "T Sports Live 01",
  "T Sports (1)",
  "T Sports (2)",
  "T Sports (720p) (3)",
  "T Sports 2 (4)",
  "T Sports 2 (5)",
  "T Sports 2 (6)",
  "T Sports (7)",
  "T Sports (8)",
  "T Sports (9)",
  "T Sports (10)",
  "T Sports (11)"
];

export const XTREAM_URL = 'https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/xtreame.txt';
export const NORMAL_URL = 'https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/normal.txt';
export const APP_LOGO = "https://i.postimg.cc/YqFXZcTP/no-bg-(7).png";
export const TELEGRAM_URL = "https://t.me/+LtoaxoKZxnQyNWE9";

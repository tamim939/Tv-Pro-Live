export interface Channel {
  name: string;
  logo: string;
  group: string;
  url: string;
  rawUrl?: string;
  headers?: Record<string, string>;
  isIframe?: boolean;
  isPriority?: boolean;
  isWorldCup?: boolean;
  isMovie?: boolean;
}

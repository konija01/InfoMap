export type Map = {
  name: string,
  width?: number;
  height?: number;
  link?: string;
  base64?: string;
  indicatorScore?: { [key: string]: number },
  normalizedIndicatorScore?: { [key: string]: number },
  layoutScore?: number,
  normalizedLayoutScore?: number,
  internal?: boolean;
  finished?: boolean;
}

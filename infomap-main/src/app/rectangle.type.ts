import {SegmentType} from "./segment-type.type";
import {ImagePixel} from "./image-pixel.type";

export type Rectangle = {
  id: string;
  rowNumber: number;
  columnNumber: number;
  segmentType?: SegmentType;
  color?: string;
  pixels?: ImagePixel[],
  sobelPixelsIntensitiesSum: number,
}

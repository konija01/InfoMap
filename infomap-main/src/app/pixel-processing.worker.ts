/// <reference lib="webworker" />

import {ImagePixel} from "./image-pixel.type";

addEventListener('message', ({data}) => {
  const pixelsByTypes: { [key: string]: { pixels: ImagePixel[]; sobelPixelsIntensitiesSum: number; } } = {
    'spd': {pixels: [], sobelPixelsIntensitiesSum: 0},
    'qtv': {pixels: [], sobelPixelsIntensitiesSum: 0},
    'ild': {pixels: [], sobelPixelsIntensitiesSum: 0},
    'txt': {pixels: [], sobelPixelsIntensitiesSum: 0},
    'background': {pixels: [], sobelPixelsIntensitiesSum: 0},
  };
  for (let segment of data.segments) {
    const pixels: ImagePixel[] = segment.pixels ?? [];
    const segmentType = segment.segmentType ?? 'background';
    pixelsByTypes[segmentType].pixels.push(...pixels);
    pixelsByTypes[segmentType].sobelPixelsIntensitiesSum += segment.sobelPixelsIntensitiesSum;
  }

  postMessage({pixelsByTypes});
});


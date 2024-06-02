/// <reference lib="webworker" />

import {ImagePixel} from "./image-pixel.type";

addEventListener('message', ({data}) => {
  const histogram = getHistogram(data.pixels);
  const surroundingHistogram = getHistogram(data.surroundingPixels);
  const standardDeviation = getStandardDeviation(histogram);
  const surroundingStandardDeviation = getStandardDeviation(surroundingHistogram);
  const pixelsCount = data.pixels.length;
  const allPixelsCount = pixelsCount + data.surroundingPixels.length;
  const visualAttractiveness = getVisualAttractiveness(
    standardDeviation,
    surroundingStandardDeviation,
    pixelsCount,
    allPixelsCount,
  );

  const colors: { [key: string]: number } = {};
  for (let pixel of data.pixels) {
    const key = pixel.r.toFixed() + '_' + pixel.g.toFixed() + '_' + pixel.b.toFixed();
    colors[key] ??= 0;
    colors[key]++;
  }
  const colorsCount = Object.keys(colors).length;
  const colorfulness = colorsCount ? ((colorsCount / 16777216) * 100) : 0;
  const graphicLoad = pixelsCount ? (data.sobelPixelsIntensitiesSum / pixelsCount) : 0;

  postMessage({
    standardDeviation,
    surroundingStandardDeviation,
    visualAttractiveness,
    colorsCount,
    colorfulness,
    graphicLoad,
  });
});

function getHistogram(pixels: ImagePixel[]): number[] {
  const histogram: number[] = new Array(256).fill(0);
  for (let pixel of pixels) {
    histogram[(0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b)]++;
  }

  return histogram;
}

function getStandardDeviation(histogram: number[]): number {
  let mean: number = 0;
  let histogramSum = 0;
  for (let i = 0; i < histogram.length; i++) {
    mean += i * histogram[i];
    histogramSum += histogram[i];
  }
  mean /= histogramSum;

  let variance: number = 0;
  for (let i = 0; i < histogram.length; i++) {
    variance += Math.pow(i - mean, 2) * histogram[i];
  }
  variance /= histogramSum;
  const deviation = Math.sqrt(variance);

  return Number.isNaN(deviation) ? 0 : deviation;
}

function getVisualAttractiveness(
  standardDeviation: number,
  surroundingStandardDeviation: number,
  pixelsCount: number,
  allPixelsCount: number,
): number {
  return (standardDeviation && surroundingStandardDeviation && allPixelsCount)
    ? Math.abs(standardDeviation - surroundingStandardDeviation) * ((pixelsCount ?? 0) / allPixelsCount)
    : 0;
}

function padLeft(num: any, dn: number = 3) {
  return ("0".repeat(dn) + Math.floor(num)).slice(-dn);
}

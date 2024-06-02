import {SegmentType} from "./segment-type.type";
import {ImagePixel} from "./image-pixel.type";
import {Observable, ReplaySubject} from "rxjs";

export class Segment {

  public standardDeviation: number = 0;
  public surroundingStandardDeviation: number = 0;

  public areaCoverage: number = 0;
  public visualAttractiveness: number = 0;
  public colorfulness: number = 0;
  public graphicLoad: number = 0;

  public pixelsCount: number = 0;
  public surroundingPixelsCount: number = 0;
  public allPixelsCount: number = 0;
  public colorsCount: number = 0;

  public indicatorScore: number = 0;

  public loading = false;

  constructor(
    public name: string,
    public segmentType: SegmentType,
    public layoutScoreConstant: number,
    public color: string,
    public order: number,
    public showInMenu: boolean = true,
    public showInTable: boolean = true,
  ) {
  }

  public updateComputations(
    pixels: ImagePixel[],
    surroundingPixels: ImagePixel[],
    sobelPixelsIntensitiesSum: number,
  ): Observable<void> {
    console.log('Start computations:', this.segmentType);
    const computationsFinished = new ReplaySubject<void>();
    this.loading = true;
    this.pixelsCount = pixels.length;
    this.surroundingPixelsCount = surroundingPixels.length;
    this.allPixelsCount = this.pixelsCount + this.surroundingPixelsCount;
    this.areaCoverage = this.allPixelsCount ? ((this.pixelsCount / this.allPixelsCount) * 100) : 0;

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./computation.worker', import.meta.url));
      worker.onmessage = ({data}) => {
        console.log('Worker response received:', this.segmentType);
        this.standardDeviation = data.standardDeviation;
        this.surroundingStandardDeviation = data.surroundingStandardDeviation;
        this.visualAttractiveness = data.visualAttractiveness;
        this.colorsCount = data.colorsCount;
        this.colorfulness = data.colorfulness;
        this.graphicLoad = data.graphicLoad;
        this.indicatorScore = (this?.areaCoverage ?? 0)
          + (this?.visualAttractiveness ?? 0)
          + (this?.colorfulness ?? 0)
          + (this?.graphicLoad ?? 0);
        this.loading = false;
        computationsFinished.next();
        console.log('Worker response processed:', this.segmentType);
      };
      worker.postMessage({pixels, surroundingPixels, sobelPixelsIntensitiesSum});
      console.log('Worker started:', this.segmentType);
    } else {
      alert("Web worker can't be started. Try another browser.");
    }
    console.log('End of computations fn:', this.segmentType);
    return computationsFinished.asObservable();
  }
}

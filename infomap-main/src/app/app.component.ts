import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {DecimalPipe, KeyValue, KeyValuePipe, NgClass, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {SegmentType} from "./segment-type.type";
import {Rectangle} from "./rectangle.type";
import {Segment} from "./segment";
import {SegmentsTypes} from "./segments-types.type";
import {ImagePixel} from "./image-pixel.type";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
// @ts-ignore
import {Sobel} from 'sobel/sobel.js';
import {MatIconModule} from "@angular/material/icon";
import {firstValueFrom} from "rxjs";
import {data} from "./data";
import {Map} from "./map";
import {NgxEchartsDirective, provideEcharts} from "ngx-echarts";
import {EChartsOption} from "echarts";
import screenfull from "screenfull";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonToggleModule,
    RouterOutlet,
    NgForOf,
    NgIf,
    KeyValuePipe,
    NgClass,
    DecimalPipe,
    NgTemplateOutlet,
    NgxEchartsDirective,
    MatProgressSpinner,
  ],
  providers: [
    provideEcharts(),
  ],
  template: `
    <div
      style="width: 100%; margin: 0 auto; padding-top: 30px; padding-bottom: 30px; display: flex; flex-direction: row;">
      <div style="flex: 2; padding: 0 4em;">

        <div style="margin: 0 auto 2em;">
          <p>
            <strong style="text-transform: uppercase;">1. upload your map</strong>
          </p>
          <p>
            <small>Select a map file from your device.</small>
          </p>
          <div style="margin: 1em auto; text-align: center;">
            <button (click)="fileInput.click()" mat-flat-button color="primary">
              upload a map
            </button>
          </div>
          <input #fileInput
                 style="text-align: center;"
                 hidden type="file"
                 class="file-upload"
                 accept="image/jpeg"
                 (change)="fileSelected($event)">
        </div>

        <section style="margin: 2em auto;">
          <div style="margin: 1em auto;">
            <p style="text-align: left;">
              <strong style="text-transform: uppercase;">2. selection size</strong>
            </p>
            <p>
              <small>Select the size of the pixel selection in the grid.</small>
            </p>
            <div style="text-align: center; margin-top: 1em;">
              <mat-button-toggle-group [hideSingleSelectionIndicator]="true" style="vertical-align: middle;">
                <mat-button-toggle [value]="0" [checked]="turbo === 0" (click)="turbo = 0">
                  <small style="font-size: 0.7em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
                <mat-button-toggle [value]="1" [checked]="turbo === 1" (click)="turbo = 1">
                  <small style="font-size: 0.9em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
                <mat-button-toggle [value]="2" [checked]="turbo === 2" (click)="turbo = 2">
                  <small style="font-size: 1.1em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
                <mat-button-toggle [value]="3" [checked]="turbo === 3" (click)="turbo = 3">
                  <small style="font-size: 1.3em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
                <mat-button-toggle [value]="4" [checked]="turbo === 4" (click)="turbo = 4">
                  <small style="font-size: 1.5em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
                <mat-button-toggle [value]="5" [checked]="turbo === 5" (click)="turbo = 5">
                  <small style="font-size: 1.7em; vertical-align: initial;">⬤</small>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>
          </div>
        </section>

        <section style="margin: 2em auto;">
          <p>
            <strong style="text-transform: uppercase;">3. Select components</strong>
          </p>
          <p>
            <small>Select the pixels in the grid corresponding to the chosen component.</small>
          </p>
          <ng-template ngFor let-segmentType [ngForOf]="segments|keyvalue:compareSegments">
            <div style="margin: 1em auto; text-align: center;" *ngIf="segmentType.value.showInMenu">
              <ng-template #square>
                <strong *ngIf="segmentType.value.segmentType !== 'background'"
                        [style.color]="removeRgbaAlpha(segmentType.value.color)">
                  ⬤
                </strong>
                <strong *ngIf="segmentType.value.segmentType === 'background'" [style.color]="'black'">
                  ◯
                </strong>
                &nbsp;{{ segmentType.value.name }}
              </ng-template>
              <button *ngIf="currentSegmentType === segmentType.value.segmentType"
                      (click)="currentSegmentType = segmentType.value.segmentType"
                      style="color: #FFFFFF;"
                      [style.background-color]="removeRgbaAlpha(segmentType.value.color)"
                      mat-flat-button>
                <ng-container *ngTemplateOutlet="square"></ng-container>
              </button>
              <button *ngIf="currentSegmentType !== segmentType.value.segmentType"
                      (click)="currentSegmentType = segmentType.value.segmentType"
                      style="background-color: #FFFFFF;"
                      [style.color]="removeRgbaAlpha(segmentType.value.color)"
                      mat-stroked-button>
                <ng-container *ngTemplateOutlet="square"></ng-container>
              </button>
            </div>
          </ng-template>
        </section>

        <section style="margin: 2em auto 2em;">
          <div style="margin: 1em auto; text-align: center;">
            <button *ngIf="currentSegmentType === segments['background'].segmentType"
                    (click)="currentSegmentType = segments['background'].segmentType"
                    mat-flat-button
                    style="background-color: #666666; color: #FFFFFF;">
              manual deselection
            </button>
            <button *ngIf="currentSegmentType !== segments['background'].segmentType"
                    (click)="currentSegmentType = segments['background'].segmentType"
                    mat-stroked-button
                    style="color: #666666; background-color: #FFFFFF;">
              manual deselection
            </button>
          </div>
          <div style="margin: 1em auto; text-align: center;">
            <button (click)="imageShow()" mat-flat-button style="color: #FFFFFF; background-color: #666666;">
              deselect all
            </button>
          </div>
        </section>

        <section style="margin: 2em auto;">
          <p style="text-align: left;">
            <strong style="text-transform: uppercase;">4. Start the evaluation process.</strong>
          </p>
          <p>
            <small>
              Clicking the start button will begin the automatic calculation. The result will be displayed below your
              map.
            </small>
          </p>
          <div style="margin: 1em auto; text-align: center;">
            <button mat-flat-button (click)="startComputations()" color="warn" [disabled]="loading"
                    style="display: flex; justify-content: center; align-items: center;">
              <mat-progress-spinner mode="indeterminate" diameter="15" *ngIf="loading"></mat-progress-spinner>
              <ng-template [ngIf]="!loading">start</ng-template>
            </button>
          </div>
        </section>

      </div>

      <div style="flex: 6;" #imageContainer>
        <div style="border: 35px solid black; width: 80%; margin: auto; position: relative;">
          <div style="position: absolute; border-radius: 50%; top: -35px; right: -35px; text-align: right;">
            <button mat-icon-button (click)="toggleImageFullscreen()">
              <mat-icon *ngIf="!isImageContainerFullscreen()" slot="icon-only">fullscreen</mat-icon>
              <mat-icon *ngIf="isImageContainerFullscreen()" slot="icon-only">fullscreen_exit</mat-icon>
            </button>
          </div>
          <div id="image_div"
               [style.display]="currentMap ? 'block' : 'background'"
               style="position: relative; top: 0; left: 0; width: 100%; z-index: 100;"></div>
          <div *ngIf="!currentMap" style="padding: 2em; text-align: center;">
            <p>No input file was selected yet.</p>
          </div>
          <ng-template [ngIf]="currentMap">
            <div *ngFor="let segment of rectangles; trackBy:identifySegment"
                 class="segment"
                 style="border: 1px solid rgba(120,120,120,.1); margin:0; padding:0; position: absolute; z-index: 100;"
                 [style.width]="((rectangleSize / (currentMap.width ?? -99999)) * 100) + '%'"
                 [style.height]="((rectangleSize / (currentMap.height ?? -99999)) * 100) + '%'"
                 [style.top]="((segment.rowNumber * (rectangleSize / (currentMap.height ?? -99999))) * 100) + '%'"
                 [style.left]="((segment.columnNumber * (rectangleSize / (currentMap.width ?? -99999))) * 100) + '%'"
                 [style.background-color]="segment.color ?? 'transparent'">
            </div>
          </ng-template>
        </div>
      </div>

    </div>

    <div
      style="width: 100%; margin: 0 auto; padding-top: 30px; padding-bottom: 30px; display: flex; flex-direction: row;">
      <div style="width: 100%; text-align: center; color: red;" *ngIf="(!currentMap || selecting) && !loading">
        <p><strong>Select the file and mark the relevant areas.</strong></p>
      </div>
      <div style="width: 100%; text-align: center; color: red;" *ngIf="loading">
        <p style="display: flex; justify-content: center; align-items: center;">
          <mat-progress-spinner mode="indeterminate" diameter="15"></mat-progress-spinner>
          <strong style="padding-left: 1em;">Calculation in progress...</strong>
        </p>
      </div>
      <ng-template [ngIf]="currentMap && !selecting && !loading">

        <div #results style="width: 100%; text-align: center;">
          <div style="width: 100%;">
            <div style="width: 50%; float: left; margin: 0; padding: 0;">
              <p>
                <strong>Radar Chart</strong>
              </p>
              <p>
                <small>Quantification of Graphic Expressiveness of components</small>
              </p>
              <div echarts [options]="radarOptions"></div>
            </div>
            <div style="width: 50%; float: left; margin: 0; padding: 0;">
              <p>
                <strong>HeatMap</strong>
              </p>
              <p>
                <small>Comparison of Graphic Expressiveness with pre-evaluated images</small>
              </p>
              <div echarts [options]="heatmapOptions"></div>
            </div>
          </div>

          <div style="width: 100%;">
            <div style="width: 50%; float: left; margin: 0; padding: 0;">
              <p>
                <strong>Scatter</strong>
              </p>
              <p>
                <small>Quantification of Infographic Style</small>
              </p>
              <div echarts [options]="scatterPlotOptions"></div>
            </div>
            <div id="results_table_div"
                 style="width: 50%; float: left; margin: 0; padding: 0; user-select: auto !important;">
              <p>
                <strong>Measured values</strong>
              </p>
              <p>
                <small>Measured data from InfoMap computation</small>
              </p>
              <div style="margin-bottom: 1em;">
                <table style="width: 90%; margin: auto; text-align: center;">
                  <tr style="vertical-align: bottom;">
                    <th></th>
                    <th>Area Coverage</th>
                    <th>Visual Attractiveness</th>
                    <th>Colourfulness</th>
                    <th>Graphic Load</th>
                    <th>IndicatorScore</th>
                  </tr>
                  <ng-template ngFor let-segmentType [ngForOf]="segments|keyvalue:compareSegments">
                    <tr *ngIf="segmentType.value.showInTable">
                      <td style="text-align: right;">
                        <strong>{{ segmentType.value.name }}</strong>
                      </td>
                      <td>{{ segmentType.value.areaCoverage|number: '1.0-3' }}</td>
                      <td>{{ segmentType.value.visualAttractiveness|number: '1.0-3' }}</td>
                      <td>{{ segmentType.value.colorfulness|number: '1.0-3' }}</td>
                      <td>{{ segmentType.value.graphicLoad|number: '1.0-3' }}</td>
                      <td>
                        {{ (currentMap.indicatorScore ? currentMap.indicatorScore[segmentType.key] : 0)|number: '1.0-3' }}
                        <br>
                        <small>
                          {{ (currentMap.normalizedIndicatorScore ? currentMap.normalizedIndicatorScore[segmentType.key] : 0)|number: '1.0-4' }}
                        </small>
                      </td>
                    </tr>
                  </ng-template>
                </table>
              </div>

              <div style="width: 100%;">
                <table style="width: 90%; margin: auto; border: 2px solid grey; text-align: center;">
                  <tr>
                    <th>
                      LayoutScore
                    </th>
                    <td>
                      <strong>{{ currentMap.layoutScore|number: '1.0-3' }}</strong>
                      <br>
                      <small>{{ currentMap.normalizedLayoutScore|number: '1.0-4' }}</small>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

        </div>

      </ng-template>

      <div style="width: 30%; margin: 0 auto; padding-top: 30px; padding-bottom: 30px; display: none;">
        <canvas id="sobel_canvas" style="width: 100%;"></canvas>
      </div>

    </div>

  `,
  styles: [`
    mat-toggle-button-group, button {
      width: 100%;
      margin: auto;
    }

    p {
      margin-top: .5em;
      margin-bottom: .5em;
    }

    #results_table_div {
      user-select: text !important;

      * {
        user-select: text !important;
      }
    }
  `],
})
export class AppComponent implements OnInit {
  @ViewChild('imageContainer') public imageContainer!: ElementRef<HTMLElement>;
  @ViewChild('results') public resultsContainer!: ElementRef<HTMLElement>;

  Math = Math;
  rectangleSize: number = 20;

  internalMaps: Map[] = data;

  selecting = true;

  currentSegmentType: SegmentType = 'spd';

  forcedImageLongerSize = 2450;

  mouseDown = false;

  rectangles: Rectangle[] = [];

  currentMap?: Map;

  canvas?: HTMLCanvasElement;
  canvasContext?: CanvasRenderingContext2D | null;

  sobelCanvas?: HTMLCanvasElement;
  sobelCanvasContext?: CanvasRenderingContext2D | null;

  turbo: number = 0;

  segments: SegmentsTypes = {
    spd: new Segment('spatial', 'spd', .25, 'rgba(240,80,80,.75)', 1),
    qtv: new Segment('data visualization', 'qtv', .5, 'rgba(80,240,80,.75)', 2),
    ild: new Segment('illustration', 'ild', .5, 'rgba(80,80,240,.75)', 3),
    txt: new Segment('text', 'txt', .25, 'rgba(239,161,17,0.69)', 4),
    background: new Segment('background', 'background', 0, 'transparent', 5, false, false),
  };

  radarOptions: EChartsOption = {};
  heatmapOptions: EChartsOption = {};
  scatterPlotOptions: EChartsOption = {};

  get loading(): boolean {
    return this.segments['spd'].loading
      || this.segments['qtv'].loading
      || this.segments['ild'].loading
      || this.segments['txt'].loading;
  }

  ngOnInit() {
    const events: { [key: string]: boolean } = {
      mousedown: true,
      touchstart: true,
      mouseup: false,
      touchend: false,
    };
    for (let key of Object.keys(events)) {
      window.addEventListener(key, async () => {
        this.mouseDown = events[key];
      });
    }
  }

  startComputations(): void {
    for (let key of Object.keys(this.segments)) {
      this.segments[key].loading = true;
    }
    this.selecting = false;

    const now = new Date();

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./pixel-processing.worker', import.meta.url));
      worker.onmessage = async ({data}) => {
        const pixelsByTypes: {
          [key: string]: { pixels: ImagePixel[]; sobelPixelsIntensitiesSum: number; }
        } = data.pixelsByTypes;

        const waitings: Promise<void>[] = [];

        for (const segmentTypeKey in this.segments) {
          console.log('Start:', segmentTypeKey);
          if (segmentTypeKey === 'background') {
            continue;
          }
          let surroundingPixels: ImagePixel[] = [];
          for (let key of Object.keys(this.segments)) {
            if (key !== segmentTypeKey) {
              surroundingPixels = surroundingPixels.concat(pixelsByTypes[key].pixels);
            }
          }
          waitings.push(firstValueFrom(this.segments[segmentTypeKey].updateComputations(
            pixelsByTypes[segmentTypeKey].pixels,
            surroundingPixels,
            pixelsByTypes[segmentTypeKey].sobelPixelsIntensitiesSum,
          )));
        }
        await Promise.all(waitings);
        if (this.currentMap) {
          for (let segmentTypeKey of ['spd', 'qtv', 'ild', 'txt']) {
            this.currentMap.indicatorScore ??= {};
            this.currentMap.indicatorScore[segmentTypeKey] = this.segments[segmentTypeKey].indicatorScore;
          }
        }

        this.updateResults();
        const now2 = new Date();
        console.log("Computations done.", (now2.getTime() - now.getTime()) / 1000);
      };
      worker.postMessage({segments: this.rectangles});
    } else {
      alert("Web worker can't be started. Try another browser.");
    }
  }

  isImageContainerFullscreen(): boolean {
    if (!this.imageContainer?.nativeElement) {
      return false;
    }
    return screenfull.element === this.imageContainer.nativeElement;
  }

  async toggleImageFullscreen(): Promise<void> {
    console.log('Fullscreen request element:', this.imageContainer.nativeElement);
    return await (this.isImageContainerFullscreen() ? screenfull.exit() : screenfull.request(this.imageContainer.nativeElement));
  }

  imageShow(): void {
    if (this.currentMap?.width && this.currentMap?.height) {
      this.rectangles = [];
      const segmentsInRow = (this.currentMap.height / this.rectangleSize);
      const seriesId = Math.floor(Math.random() * 1000);
      for (let rowNumber = 0; rowNumber < (this.currentMap.height / this.rectangleSize); rowNumber++) {
        for (let columnNumber = 0; columnNumber < (this.currentMap.width / this.rectangleSize); columnNumber++) {
          const imageData = this.getImageData(this.canvasContext, columnNumber, rowNumber);
          const pixels: ImagePixel[] = [];
          if (imageData) {
            for (let i = 0; i < (imageData?.data.length ?? 0); i += 4) {
              pixels.push({r: imageData.data[i], g: imageData.data[i + 1], b: imageData.data[i + 2]});
            }
          }

          let sobelPixelsIntensitiesSum: number = 0;
          const sobelImageData = this.getImageData(this.sobelCanvasContext, columnNumber, rowNumber);
          if (sobelImageData) {
            for (let i = 0; i < (sobelImageData?.data.length ?? 0); i += 4) {
              sobelPixelsIntensitiesSum += (
                ((sobelImageData.data[i] + sobelImageData.data[i + 1] + sobelImageData.data[i + 2]) / 3) / 255 * 100
              );
            }
          }

          this.rectangles.push({
            id: '' + seriesId + ((rowNumber * segmentsInRow) + columnNumber),
            rowNumber,
            columnNumber,
            pixels,
            sobelPixelsIntensitiesSum,
          });
        }
      }
      setTimeout(() => {
        const segments = document.querySelectorAll('.segment');
        for (let index = 0; index < segments.length; index++) {
          const element = segments[index];
          element.addEventListener('contextmenu', event => event.preventDefault());
          for (let event of ['mouseover', 'mouseenter', 'mousedown', 'click', 'touchstart', 'touchmove']) {
            element.addEventListener(event, async () => {
              this.segmentClicked(index, ['mousedown', 'click', 'touchstart', 'touchmove'].includes(event));
            });
          }
        }
      }, 500);
    }
  }

  getImageData(
    canvasContext: CanvasRenderingContext2D | null | undefined,
    columnNumber: number,
    rowNumber: number,
  ) {
    return canvasContext?.getImageData(
      columnNumber * this.rectangleSize,
      rowNumber * this.rectangleSize,
      Math.min(this.rectangleSize, ((this.currentMap?.width ?? 0) - (columnNumber * this.rectangleSize))),
      Math.min(this.rectangleSize, ((this.currentMap?.height ?? 0) - (rowNumber * this.rectangleSize))),
    );
  }

  segmentClicked(index: number, forced: boolean = false): void {
    const segment = this.rectangles[index];
    if ((this.mouseDown || forced) && segment.segmentType !== this.currentSegmentType) {
      segment.color = this.segments[this.currentSegmentType].color;
      segment.segmentType = this.currentSegmentType;
    }
    if (this.turbo > 0) {
      const size = this.turbo;
      const neighbors = this.rectangles.filter(s => {
        const verticalDiff = Math.abs(s.rowNumber - segment.rowNumber);
        const horizontalDiff = Math.abs(s.columnNumber - segment.columnNumber);

        return (verticalDiff <= size && horizontalDiff <= size && ((verticalDiff + horizontalDiff) / 2) <= (size - size / 4));
      });
      for (let s of neighbors) {
        if ((this.mouseDown || forced) && s.segmentType !== this.currentSegmentType) {
          s.color = this.segments[this.currentSegmentType].color;
          s.segmentType = this.currentSegmentType;
        }
      }
    }
  }

  public fileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files ?? [];
    const file: File = files[0];
    if (file) {
      const reader = new FileReader();
      const that = this;
      reader.onload = function (e) {
        const img = new Image();
        let originalWidth = 0;
        let originalHeight = 0;
        img.onload = function (event) {
          that.canvas = document.createElement('canvas');
          that.canvasContext = that.canvas.getContext('2d', {willReadFrequently: true});
          if (!that.canvasContext) {
            return;
          }
          const newImageSize = that.getForcedImageSize(img.width, img.height);
          that.canvas.width = newImageSize.width;
          that.canvas.height = newImageSize.height;
          that.canvasContext.drawImage(img, 0, 0, that.canvas.width, that.canvas.height);
          that.currentMap = {
            name: file.name,
            width: that.canvas.width,
            height: that.canvas.height,
            internal: false,
            finished: false,
            base64: that.canvas.toDataURL(),
          };
          that.drawSobelImage(img);
          that.imageShow();
        }

        img.src = <string>e.target?.result;

        const image = document.createElement("img");
        image.src = <string>e.target?.result;
        image.style.width = '100%';
        const imageDiv = document.querySelector('#image_div');
        if (imageDiv) {
          imageDiv.innerHTML = '';
          imageDiv?.appendChild(image);
        }
      }
      reader.readAsDataURL(file);
    }
  }

  drawSobelImage(image: HTMLImageElement) {
    this.sobelCanvas = <HTMLCanvasElement>document.getElementById('sobel_canvas');
    this.sobelCanvasContext = this.sobelCanvas?.getContext('2d', {willReadFrequently: true});
    if (!this.sobelCanvas || !this.sobelCanvasContext) {
      alert('Problem with canvas!');
      return;
    }

    const newImageSize = this.getForcedImageSize(image.width, image.height);
    this.sobelCanvas.width = newImageSize.width;
    this.sobelCanvas.height = newImageSize.height;

    this.sobelCanvasContext.drawImage(image, 0, 0, this.sobelCanvas.width, this.sobelCanvas.height);
    const imageData = this.sobelCanvasContext.getImageData(0, 0, this.sobelCanvas.width, this.sobelCanvas.height);
    const sobelData = Sobel(imageData);
    const sobelImageData = sobelData.toImageData();
    this.sobelCanvasContext.putImageData(sobelImageData, 0, 0);
  }

  identifySegment(index: number, item: Rectangle) {
    return item.id;
  }

  removeRgbaAlpha(color: string): string {
    return color.replace(/[\d.]+\)$/g, '1)');
  }

  protected compareSegments(
    _left: KeyValue<string, Segment>,
    _right: KeyValue<string, Segment>,
  ): number {
    return (_left.value.order ?? 0) - (_right.value.order ?? 0);
  }

  protected getForcedImageSize(width: number, height: number): { width: number, height: number } {
    if (width >= height) {
      return {
        width: this.forcedImageLongerSize,
        height: height / width * this.forcedImageLongerSize,
      };
    } else {
      return {
        height: this.forcedImageLongerSize,
        width: width / height * this.forcedImageLongerSize,
      };
    }
  }

  private updateResults() {
    let minIndicatorScore = +9999999;
    let maxIndicatorScore = -9999999;
    let minLayoutScore = +9999999;
    let maxLayoutScore = -9999999;
    for (const map of [...this.internalMaps, ...(this.currentMap ? [this.currentMap] : [])]) {
      map.indicatorScore ??= {};
      let layoutScore = 0;
      for (let segmentTypeKey of Object.keys(this.segments)) {
        layoutScore += ((map.indicatorScore[segmentTypeKey] ?? 0) * (this.segments[segmentTypeKey].layoutScoreConstant ?? 0))
      }
      map.layoutScore = (layoutScore / 1.5);

      const indicatorScores = Object.values((map?.indicatorScore ?? {})).map(value => value ?? 0);
      minIndicatorScore = Math.min(minIndicatorScore, ...indicatorScores);
      maxIndicatorScore = Math.max(maxIndicatorScore, ...indicatorScores);
      minLayoutScore = Math.min(minLayoutScore, map.layoutScore ?? 0);
      maxLayoutScore = Math.max(maxLayoutScore, map.layoutScore ?? 0);
    }
    const norm = maxIndicatorScore - minIndicatorScore;
    for (const map of [...this.internalMaps, ...(this.currentMap ? [this.currentMap] : [])]) {
      map.indicatorScore ??= {};
      map.normalizedIndicatorScore ??= {};
      for (let key of Object.keys(map.indicatorScore)) {
        map.normalizedIndicatorScore[key] = ((map.indicatorScore[key] ?? 0) - minIndicatorScore) / norm;
      }
      map.normalizedLayoutScore = ((map.layoutScore ?? 0) - minLayoutScore) / (maxLayoutScore - minLayoutScore);

      map.finished = true;
    }

    this.radarOptions.radar = {
      shape: 'circle',
      indicator: Object.keys(this.currentMap?.indicatorScore ?? {}).map((segmentTypeKey) => {
        const segment = this.segments[segmentTypeKey];
        return {
          name: segment.name,
          color: segment.color,
        };
      }),
    };
    this.radarOptions.series = [
      {
        type: 'radar',
        areaStyle: {},
        data: [
          {
            value: Object.keys(this.currentMap?.indicatorScore ?? {}).map((segmentTypeKey) => {
              return this.currentMap?.indicatorScore ? this.currentMap.indicatorScore[segmentTypeKey] : 0;
            }),
          }
        ],
      },
    ];

    const data: (number[] | any)[] = [];
    const heatmapMaps = [this.currentMap, ...this.internalMaps];
    heatmapMaps.sort(
      (a, b) => ((a?.normalizedLayoutScore ?? 0) - (b?.normalizedLayoutScore ?? 0))
    ).forEach(
      (map, mapIndex) => {
        if (!map) {
          return;
        }
        Object.keys(map.normalizedIndicatorScore ?? {}).forEach((segmentKey, segmentIndex) => {
          map.normalizedIndicatorScore ??= {};
          if (map.internal) {
            data.push([mapIndex, segmentIndex, map.normalizedIndicatorScore[segmentKey] ?? 0]);
          } else {
            data.push({
                value: [mapIndex, segmentIndex, map.normalizedIndicatorScore[segmentKey] ?? 0],
                itemStyle: {
                  borderColor: 'black',
                  borderWidth: 1,
                },
              },
            );
          }
        });
      });
    this.heatmapOptions = {
      tooltip: {
        position: 'top',
        formatter: (params: any, asyncTicket) => {
          const map = heatmapMaps[params.value[0]];
          if (!map) {
            return '';
          }
          const lines = Object.keys(map.indicatorScore ?? {}).map((key) => {
            const value = map.indicatorScore ? map.indicatorScore[key] : null;
            const segment = this.segments[key] ?? null;
            const number = Math.round((value ?? 0) * 100) / 100;
            return `<tr><td>${segment.name}</td><td>${number}</td></tr>`;
          });
          if (map.normalizedLayoutScore !== null && map.normalizedLayoutScore !== undefined) {
            const normLayoutScore = Math.round((map.normalizedLayoutScore ?? 0) * 100) / 100;
            lines.push(`<tr><td>LayoutScore (norm.)</td><td>${normLayoutScore}</td></tr>`);
          }
          const imgSrc = map.internal ? map.link : map.base64;
          return `
        <div>
          <table style="width: 100%;">
            <tr>
              <td colspan="2">${map.name}</td>
            </tr>
            ${lines.join('')}
            <tr>
              <td colspan="2">
                <div style="margin: auto;">
                  <img style="display: block; max-height: 150px; margin: auto;" src="${imgSrc}">
                </div>
              </td>
            </tr>
          </table>
        </div>
          `;
        },
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        show: false,
        type: 'category',
        nameRotate: 90,
        data: heatmapMaps.map((map) => map?.internal ? '' : ('my map')),
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: Object.values(this.segments).filter(segment => segment.showInTable).map((segment) => segment.name),
        axisLabel: {
          formatter: (name) => name.replaceAll(' ', '\n'),
          overflow: 'break',
        },
        splitArea: {
          show: true
        },
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [
        {
          type: 'heatmap',
          seriesLayoutBy: 'row',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };


    this.scatterPlotOptions = {
      xAxis: {
        scale: true
      },
      yAxis: {
        show: false,
        type: 'category',
        min: 0,
        max: 0,
      },
      tooltip: {
        position: 'top',
      },
      series: [
        {
          type: 'effectScatter',
          symbolSize: 20,
          tooltip: {
            position: 'top',
            formatter: (params: any, asyncTicket) => {
              const map = this.currentMap;
              if (!map) {
                return '';
              }
              const lines = Object.keys(map.indicatorScore ?? {}).map((key) => {
                const value = map.indicatorScore ? map.indicatorScore[key] : null;
                const segment = this.segments[key] ?? null;
                const number = Math.round((value ?? 0) * 100) / 100;
                return `<tr><td>${segment.name}</td><td>${number}</td></tr>`;
              });
              if (map.normalizedLayoutScore !== null && map.normalizedLayoutScore !== undefined) {
                const normLayoutScore = Math.round((map.normalizedLayoutScore ?? 0) * 100) / 100;
                lines.push(`<tr><td>LayoutScore (norm.)</td><td>${normLayoutScore}</td></tr>`);
              }
              const imgSrc = map.internal ? map.link : map.base64;
              return `
        <div>
          <table style="width: 100%;">
            <tr>
              <td colspan="2">${map.name}</td>
            </tr>
            ${lines.join('')}
            <tr>
              <td colspan="2">
                <div style="margin: auto;">
                  <img style="display: block; max-height: 150px; margin: auto;" src="${imgSrc}">
                </div>
              </td>
            </tr>
          </table>
        </div>
          `;
            },
          },
          data: [
            [this.currentMap?.normalizedLayoutScore ?? 0, 0],
          ]
        },
        {
          type: 'scatter',
          tooltip: {
            position: 'top',
            formatter: (params: any, asyncTicket) => {
              const map = this.internalMaps[params.dataIndex];
              if (!map) {
                return '';
              }
              const lines = Object.keys(map.indicatorScore ?? {}).map((key) => {
                const value = map.indicatorScore ? map.indicatorScore[key] : null;
                const segment = this.segments[key] ?? null;
                const number = Math.round((value ?? 0) * 100) / 100;
                return `<tr><td>${segment.name}</td><td>${number}</td></tr>`;
              });
              if (map.normalizedLayoutScore !== null && map.normalizedLayoutScore !== undefined) {
                const normLayoutScore = Math.round((map.normalizedLayoutScore ?? 0) * 100) / 100;
                lines.push(`<tr><td>LayoutScore (norm.)</td><td>${normLayoutScore}</td></tr>`);
              }
              const imgSrc = map.internal ? map.link : map.base64;
              return `
        <div>
          <table style="width: 100%;">
            <tr>
              <td colspan="2">${map.name}</td>
            </tr>
            ${lines.join('')}
            <tr>
              <td colspan="2">
                <div style="margin: auto;">
                  <img style="display: block; max-height: 150px; margin: auto;" src="${imgSrc}">
                </div>
              </td>
            </tr>
          </table>
        </div>
          `;
            },
          },
          data: this.internalMaps.map((map) => [map.normalizedLayoutScore ?? 0, 0]),
        }
      ],
    };
    setTimeout(() => {
      this.resultsContainer.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }, 150);
  }
}

addEventListener("message",({data:t})=>{let e={spd:{pixels:[],sobelPixelsIntensitiesSum:0},qtv:{pixels:[],sobelPixelsIntensitiesSum:0},ild:{pixels:[],sobelPixelsIntensitiesSum:0},txt:{pixels:[],sobelPixelsIntensitiesSum:0},background:{pixels:[],sobelPixelsIntensitiesSum:0}};for(let s of t.segments){let l=s.pixels??[],i=s.segmentType??"background";e[i].pixels.push(...l),e[i].sobelPixelsIntensitiesSum+=s.sobelPixelsIntensitiesSum}postMessage({pixelsByTypes:e})});

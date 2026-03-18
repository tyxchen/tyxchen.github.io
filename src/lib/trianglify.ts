import Delaunator from 'delaunator';
import {
  hexToRGB,
  RGBToHex,
  getGradient,
  type Colour,
} from "$lib/colours.ts";
import {
  chooseRandomIndex,
  escapeText,
  letterOffsets,
} from "$lib/utils.ts";

export type Point = [number, number];

export type TriangleOptions = {
  width?: number,
  height?: number,
  cell_size?: number,
  variance?: number,
};

export type Triangle = {
  a: number,
  b: number,
  c: number,
};

export type TrianglifyChangeColourSet = (colourSet: string[]) => void;

export class Mesh {
  points: Point[];
  triangles: Triangle[];
  
  constructor(points: Point[], triangles: Triangle[]) {
    this.points = points;
    this.triangles = triangles;
  }

  draw(ctx: CanvasRenderingContext2D, triInd: number, colour: string) {
    ctx.fillStyle = ctx.strokeStyle = colour;
    ctx.beginPath();
    ctx.moveTo(...this.points[this.triangles[triInd].a]);
    ctx.lineTo(...this.points[this.triangles[triInd].b]);
    ctx.lineTo(...this.points[this.triangles[triInd].c]);
    ctx.fill();
    ctx.stroke();
  }
}

// grid generation fcn taken from qrohlf/trianglify
export const generate_grid = (width: number, height: number, bleed_x: number, bleed_y: number, cell_size: number, variance: number, rand_fn: () => number) => {
  const w = width + bleed_x;
  const h = height + bleed_y;
  const half_cell_size = cell_size * 0.5;
  const double_v = variance * 2;
  const negative_v = -variance;

  const points: Point[] = [];
  for (let i = -bleed_x; i < w; i += cell_size) {
    for (let j = -bleed_y; j < h; j += cell_size) {
      const x = (i + half_cell_size) + (rand_fn() * double_v + negative_v);
      const y = (j + half_cell_size) + (rand_fn() * double_v + negative_v);
      points.push([Math.floor(x), Math.floor(y)]);
    }
  }

  return points;
};

// generate triangles
export const generate_triangles = (opts: TriangleOptions) => {
  const { width = 600, height = 400, cell_size = 75, variance = 0.75 } = opts;

  const points = generate_grid(
    width,
    height,
    ((Math.floor((width + 4 * cell_size) / cell_size) * cell_size) - width) / 2,
    ((Math.floor((height + 4 * cell_size) / cell_size) * cell_size) - height) / 2,
    cell_size,
    cell_size * variance / 2,
    Math.random
  );

  const delaunay_triangles = Delaunator.from(points).triangles!;

  const polys: Triangle[] = [];
  for (let i = 0; i < delaunay_triangles.length; i += 3) {
    polys.push({
      a: delaunay_triangles[i],
      b: delaunay_triangles[i + 1],
      c: delaunay_triangles[i + 2]
    });
  }

  return new Mesh(points, polys);
}

export const trianglify = (
  el: HTMLElement,
  colorSet: string[],
  animate = false,
  cell_size = 32,
) => {
  // wrap text to constraints of el
  // returns a SVG string
  // inspired by https://bl.ocks.org/mbostock/7555321
  const wrapText = (text: string, el: HTMLElement) => {
    const SVG = "http://www.w3.org/2000/svg";
    const words = escapeText(text).split(/\s/);
    const lineHeight = 1;
    const width = Math.ceil(el.getBoundingClientRect().width * 1.0125); // give some wiggle room
    const fontSizeGr72 = parseInt(getComputedStyle(el, null).fontSize) > 72;
    const builder: string[] = [];
    let line: string[] = [];
    let dy = 1;
    let word: string | undefined;

    const svg = document.createElementNS(SVG, "svg");
    const textNode = document.createElementNS(SVG, "text");
    const tspan = document.createElementNS(SVG, "tspan");

    tspan.setAttributeNS(SVG, "x", "0");
    tspan.setAttributeNS(SVG, "y", "0");
    textNode.appendChild(tspan);
    svg.appendChild(textNode);
    el.appendChild(svg);

    while ((word = words.shift())) {
      if (word.length === 0) continue;
      line.push(word);
      tspan.textContent = line.join(" ");
      if (Math.floor(tspan.getComputedTextLength()) > width) {
        line.pop();
        builder.push(
          `<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0] as keyof typeof letterOffsets] || 0) : 0}em" dy="${dy}em">${line.join(" ")}</tspan>`,
        );
        line = [word];
        dy += lineHeight;
      }
    }
    builder.push(
      `<tspan x="0" y="0" dx="${fontSizeGr72 ? (letterOffsets[line[0][0] as keyof typeof letterOffsets] || 0) : 0}em" dy="${dy}em">${line.join(" ")}</tspan>`,
    );

    el.removeChild(svg);

    return builder.join("");
  };

  const textIterator = document.createNodeIterator(el, NodeFilter.SHOW_TEXT);
  const textRange = document.createRange();
  let textNode: Node | undefined;
  let tmpNode: Node | null = null;

  // get first text node only
  while ((tmpNode = textIterator.nextNode())) {
    if (!tmpNode.textContent?.match(/^\s*$/)) {
      textNode = tmpNode;
    }
  }

  textRange.selectNode(textNode!);

  const textParent = textNode!.parentNode! as HTMLElement; // no guarantee textNode.parentNode === el
  const text = textNode!.textContent!;
  const maskId = "mask-" + Math.random().toString(36).slice(2);
  const { width, height } = textRange.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const defaultNumStops = 75; // 4500 / 60; each change takes 4.5 seconds
  let lastTimestamp = 0; // for animation
  let chosenColors: string[] = [];
  
  const mesh = generate_triangles({
    width,
    height,
    cell_size, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
    variance: 0.69,
  });
  
  let fading: { stop: number, colours: Colour[], triInd: number }[] = [];
  let polys: { clrInd: number, triInd: number }[] = [];

  const templ =
    `<svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="0" height="0" style="position:absolute;-webkit-user-select:none;user-select:none">
  <defs>
    <clipPath id="${maskId}" x="0" y="0" width="100%" height="100%">
      <text x="0" y="0">${wrapText(text, textParent)}</text>
    </clipPath>
  </defs>`.replace(/>\s+</g, "><");

  const changeColorSet: TrianglifyChangeColourSet = (set: string[]) => {
    const oldChosenColors = chosenColors;

    chosenColors = set;
    polys = mesh.triangles.map((_, i) => ({
      clrInd: chooseRandomIndex(chosenColors),
      triInd: i,
    }));
    fading = new Array(polys.length);

    for (const [i, { clrInd, triInd }] of polys.entries()) {
      if (animate && oldChosenColors.length > 1) {
        setTimeout(
          () => {
            fading[i] = {
              stop: 0,
              colours: getGradient(
                hexToRGB(oldChosenColors[clrInd]),
                hexToRGB(chosenColors[clrInd]),
                16,
              ),
              triInd,
            };
          },
          Math.floor(
            (690 * Math.exp(-4 * (Math.random() - 1) ** 2)) / Math.PI,
          ),
        );
      } else {
        mesh.draw(ctx, triInd, chosenColors[clrInd]);
      }

      if (animate && Math.random() < 0.1) {
        setTimeout(() => {
          const randClrInd = chooseRandomIndex(chosenColors);
          fading[i] = {
            stop: 0,
            colours: getGradient(
              hexToRGB(chosenColors[clrInd]),
              hexToRGB(chosenColors[randClrInd]),
              defaultNumStops,
            ),
            triInd,
          };
          polys[i].clrInd = randClrInd;
        }, 500);
      }
    }
  };

  ctx.lineWidth = 0.001;

  el.style.position = "relative";
  el.style.color = "transparent";
  el.classList.add("trianglify-rendered");

  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  canvas.className = "trianglify-canvas";
  canvas.style = `position:absolute;top:-1px;left:0;z-index:-1;pointer-events:none;clip-path:url(#${maskId})`;

  changeColorSet(colorSet);

  const textWrapper = document.createElement("span");
  textWrapper.classList.add("trianglify-text");
  textWrapper.append(...textParent.childNodes);
  
  textParent.appendChild(canvas);
  textParent.insertAdjacentHTML("beforeend", templ);
  textParent.appendChild(textWrapper);

  if (animate) {
    const animFrame = (timestamp: number) => {
      // randomly fade a few polygons
      for (const [i, entry] of fading.entries()) {
        if (!entry) {
          continue;
        }

        const { stop, colours, triInd } = entry;

        mesh.draw(ctx, triInd, RGBToHex(colours[stop]));

        if (stop + 1 < colours.length) {
          fading[i].stop = stop + 1;
        } else {
          delete fading[i];
        }
      }

      // every 1/2 second, fade a few more
      if (timestamp - lastTimestamp > 500) {
        for (const [i, { clrInd, triInd }] of polys.entries()) {
          if (!!fading[i]) {
            continue;
          }

          if (Math.random() < 0.03) {
            const randClrInd = chooseRandomIndex(chosenColors);
            fading[i] = {
              stop: 0,
              colours: getGradient(
                hexToRGB(chosenColors[clrInd]),
                hexToRGB(chosenColors[randClrInd]),
                defaultNumStops,
              ),
              triInd,
            };
            polys[i].clrInd = randClrInd;
          }
        }

        lastTimestamp = timestamp;
      }

      return requestAnimationFrame(animFrame);
    };

    animFrame(0);
  }

  textRange.detach();

  return {
    canvas,
    changeColorSet,
  };
};

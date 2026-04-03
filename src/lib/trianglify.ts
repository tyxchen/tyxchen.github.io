import Delaunator from 'delaunator';
import {
  hexToRGB,
  RGBToHex,
  getGradient,
  type Colour,
  choosableColors,
} from "$lib/colours.ts";
import {
  chooseRandomIndex,
  shuffle,
  wrapText,
} from "$lib/utils.ts";

export type Point = [number, number];

export type Triangle = {
  a: number,
  b: number,
  c: number,
};

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
export const generate_triangles = (width = 600, height = 400, cellSize = 75, variance = 0.75) => {
  const points = generate_grid(
    width,
    height,
    ((Math.floor((width + 4 * cellSize) / cellSize) * cellSize) - width) / 2,
    ((Math.floor((height + 4 * cellSize) / cellSize) * cellSize) - height) / 2,
    cellSize,
    cellSize * variance / 2,
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
};

export class Trianglify {
  static readonly #defaultNumStops = 75; // 4500 / 60; each change takes 4.5 seconds

  static changeColourSets: Record<string, Trianglify[]> = {};
  static shuffledColourInds: Record<string, number> = {};
  static shuffledColours = shuffle(
    Object.keys(choosableColors) as (keyof typeof choosableColors)[],
  );

  readonly controlKey: string;
  readonly animate: boolean;
  readonly canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #lastTimestamp: number;
  #chosenColors: string[];
  #fading: { stop: number; colours: Colour[]; triInd: number }[];
  #polys: { clrInd: number; triInd: number }[];
  #mesh: Mesh;

  static changeAllColours(controlKey: string, colourSet: string[]) {
    for (const tri of Trianglify.changeColourSets[controlKey]) {
      tri.changeColorSet(colourSet);
    }
  }

  static changeAllToNextShuffledColour(controlKey: string) {
    const chosenClr = ++Trianglify.shuffledColourInds[controlKey];

    Trianglify.changeAllColours(
      controlKey,
      choosableColors[Trianglify.shuffledColours[chosenClr]],
    );

    if (chosenClr + 1 >= Trianglify.shuffledColours.length) {
      Trianglify.shuffledColours = shuffle(
        Trianglify.shuffledColours,
        Trianglify.shuffledColours[chosenClr],
      );
      Trianglify.shuffledColourInds[controlKey] = -1;
    }
  }

  constructor(
    el: HTMLElement,
    controlKey: string,
    colorSet: string[],
    animate = false,
    cellSize = 32,
  ) {
    this.controlKey = controlKey;
    this.animate = animate;
    this.canvas = document.createElement("canvas");
    this.#ctx = this.canvas.getContext("2d")!;
    this.#lastTimestamp = 0; // for animation
    this.#chosenColors = [];
    this.#fading = [];
    this.#polys = [];

    if (!Trianglify.changeColourSets[controlKey]) {
      Trianglify.changeColourSets[controlKey] = [];
      Trianglify.shuffledColourInds[controlKey] = 0;
    }
    Trianglify.changeColourSets[controlKey].push(this);

    const textIterator = document.createNodeIterator(
      el,
      NodeFilter.SHOW_TEXT,
    );
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

    const { width, height } = (() => {
      // Get correct text bounding box dimensions
      const curDisplayStyle = textParent.style.display;
      textParent.style.display = "inline-block";
      const width = textParent.getBoundingClientRect().width;
      textParent.style.display = "inline";
      const height = textParent.getBoundingClientRect().height + 1;
      textParent.style.display = curDisplayStyle;
      return { width, height };
    })();

    this.#mesh = generate_triangles(
      width,
      height,
      cellSize, //Math.floor(parseInt(window.getComputedStyle(el, null).fontSize) / 4),
      0.69,
    );

    const maskId = "mask-" + Math.random().toString(36).slice(2);
    const templ =
      `<svg class="trianglify-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="0" height="0" style="-webkit-user-select:none;user-select:none">
          <defs>
            <clipPath id="${maskId}" x="0" y="0" width="100%" height="100%">
              <text x="0" y="0">${wrapText(text, textParent)}</text>
            </clipPath>
          </defs>
        </svg>`.replace(/>\s+</g, "><");

    this.#ctx.lineWidth = 0.001;

    el.style.position = "relative";
    el.style.color = "transparent";
    el.classList.add("trianglify-rendered");

    this.canvas.width = Math.ceil(width);
    this.canvas.height = Math.ceil(height);
    this.canvas.className = "trianglify-canvas";
    this.canvas.style = `position:absolute;top:-1px;left:0;z-index:-1;pointer-events:none;clip-path:url(#${maskId})`;
    this.canvas.ariaHidden = "true";

    this.changeColorSet(colorSet);

    const placeholder = document.createElement("span");
    placeholder.classList.add("trianglify-placeholder-text");
    placeholder.append(...textParent.childNodes);

    let inlineWrapper = document.createElement("span");
    inlineWrapper.classList.add("trianglify-inline-wrapper");
    inlineWrapper.appendChild(this.canvas);
    textParent.appendChild(inlineWrapper);

    inlineWrapper = inlineWrapper.cloneNode() as HTMLSpanElement;
    inlineWrapper.insertAdjacentHTML("beforeend", templ);
    textParent.appendChild(inlineWrapper);

    textParent.appendChild(placeholder);

    if (animate) {
      const animFrame = (timestamp: number) => {
        this.#animFrame(timestamp);
        return requestAnimationFrame(animFrame);
      };
      animFrame(0);
    }

    textRange.detach();
  }

  changeColorSet(set: string[]) {
    const oldChosenColors = this.#chosenColors;

    this.#chosenColors = set;
    this.#polys = this.#mesh.triangles.map((_, i) => ({
      clrInd: chooseRandomIndex(this.#chosenColors),
      triInd: i,
    }));
    this.#fading = new Array(this.#polys.length);

    for (const [i, { clrInd, triInd }] of this.#polys.entries()) {
      if (this.animate && oldChosenColors.length > 1) {
        setTimeout(
          () => {
            this.#fading[i] = {
              stop: 0,
              colours: getGradient(
                hexToRGB(oldChosenColors[clrInd]),
                hexToRGB(this.#chosenColors[clrInd]),
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
        this.#mesh.draw(this.#ctx, triInd, this.#chosenColors[clrInd]);
      }

      if (this.animate && Math.random() < 0.1) {
        setTimeout(() => {
          const randClrInd = chooseRandomIndex(this.#chosenColors);
          this.#fading[i] = {
            stop: 0,
            colours: getGradient(
              hexToRGB(this.#chosenColors[clrInd]),
              hexToRGB(this.#chosenColors[randClrInd]),
              Trianglify.#defaultNumStops,
            ),
            triInd,
          };
          this.#polys[i].clrInd = randClrInd;
        }, 500);
      }
    }
  }

  #animFrame(timestamp: number) {
    // randomly fade a few polygons
    for (const [i, entry] of this.#fading.entries()) {
      if (!entry) {
        continue;
      }

      const { stop, colours, triInd } = entry;

      this.#mesh.draw(this.#ctx, triInd, RGBToHex(colours[stop]));

      if (stop + 1 < colours.length) {
        this.#fading[i].stop = stop + 1;
      } else {
        delete this.#fading[i];
      }
    }

    // every 1/2 second, fade a few more
    if (timestamp - this.#lastTimestamp > 500) {
      for (const [i, { clrInd, triInd }] of this.#polys.entries()) {
        if (this.#fading[i]) {
          continue;
        }

        if (Math.random() < 0.03) {
          const randClrInd = chooseRandomIndex(this.#chosenColors);
          this.#fading[i] = {
            stop: 0,
            colours: getGradient(
              hexToRGB(this.#chosenColors[clrInd]),
              hexToRGB(this.#chosenColors[randClrInd]),
              Trianglify.#defaultNumStops,
            ),
            triInd,
          };
          this.#polys[i].clrInd = randClrInd;
        }
      }

      this.#lastTimestamp = timestamp;
    }
  }
}

import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import pdfWorkerProd from "pdfjs-dist/build/pdf.worker.min.js";
// @ts-ignore
import pdfWorkerDev from "pdfjs-dist/build/pdf.worker.js";


function mergePages(
  pages: [ImageData, number, number][],
  marginHeight: number
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const totalHeight = pages.reduce(
    (acc, [imageData, height, width], i) =>
      acc + height + (i + 1 < pages.length ? marginHeight : 0),
    0
  );
  const maxWidth = Math.max(
    ...pages.map(([imageData, height, width]) => width)
  );
  canvas.width = maxWidth;
  canvas.height = totalHeight;

  for (let i = 0; i < pages.length; i++) {
    ctx?.putImageData(
      pages[i][0],
      0,
      pages
        .slice(0, i)
        .reduce(
          (acc, [imageData, height, width]) => acc + height + marginHeight,
          0
        )
    );
  }

  return canvas;
}

const pageToImageData = async (
  page: any,
  scale: number
): Promise<[ImageData, number, number]> => {
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = { canvasContext: ctx, viewport };

  // @ts-ignore
  await page.render(renderContext).promise;

  // @ts-ignore
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return [imageData, canvas.height, canvas.width];
};

const convertCanvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  type: string
): File => {
  const blobBin = atob(canvas.toDataURL(type).split(",")[1]);
  const array = [];
  for (let i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }
  const blob = new Blob([new Uint8Array(array)], { type });
  return new File([blob], filename, { type });
};

export const pdfToImage = (
  file: File,
  type: string,
  marginHeight: number
): Promise<File> => {
  const scale = 1.5;

  return new Promise((resolve, reject) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = (() => {
      if (process.env.NODE_ENV === "production") {
        // use minified verion for production
        return `/${pdfWorkerProd}`;
      } else {
        return `/${pdfWorkerDev}`;
      }
    })();

    if (typeof pdfjsLib === "undefined") {
      const message = "The library PDF.js is required to convert PDF in image";
      console.warn(message);
      reject(message);
      return;
    }
    try {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        // @ts-ignore
        const typedarray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        

        const pages = await Promise.all(
          [...Array(pdf.numPages).keys()].map(
            async (i) => pageToImageData(await pdf.getPage(i + 1), scale)
          )
        );

        const canvas = mergePages(pages, marginHeight);
        const resultFile = convertCanvasToFile(canvas, file.name, type);
        resolve(resultFile);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (e) {
      reject(e);
    }
  });
};

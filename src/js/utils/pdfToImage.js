export const pdfToImage = (file, type) => {
  const pages = [];
  const heights = [];
  let width = 0;
  let height = 0;
  let currentPage = 1;
  const scale = 1.5;

  function mergePages() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    for (let i = 0; i < pages.length; i++) {
      ctx.putImageData(pages[i], 0, heights[i]);
    }
    return canvas;
  }
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        getPage();

        async function getPage() {
          const page = await pdf.getPage(currentPage);

          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const renderContext = { canvasContext: ctx, viewport: viewport };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render(renderContext).promise;
          pages.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

          heights.push(height);
          height += canvas.height;
          if (width < canvas.width) width = canvas.width;

          if (currentPage < pdf.numPages) {
            currentPage++;
            getPage();
          } else {
            const canvas = mergePages();
            const blobBin = atob(canvas.toDataURL(type).split(",")[1]);
            const array = [];
            for (let i = 0; i < blobBin.length; i++) {
              array.push(blobBin.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(array)], { type });
            resolve(new File([blob], file.name, { type }));
          }
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (e) {
      reject(e);
    }
  });
};

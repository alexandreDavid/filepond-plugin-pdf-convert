/*!
 * FilePondPluginPdfConvert 1.0.0
 * Licensed under ISC, https://opensource.org/licenses/ISC/
 * Please visit undefined for details.
 */
/* eslint-disable */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      (global.FilePondPluginPdfConvert = factory()));
})(this, function () {
  'use strict';

  const isPdf = (file) => /pdf$/.test(file.type);

  const pdfToImage = (file, type) => {
    const pages = [];
    const heights = [];
    let width = 0;
    let height = 0;
    let currentPage = 1;
    const scale = 1.5;

    function mergePages() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      for (let i = 0; i < pages.length; i++) {
        ctx.putImageData(pages[i], 0, heights[i]);
      }

      return canvas;
    }

    return new Promise((resolve, reject) => {
      if (typeof pdfjsLib === 'undefined') {
        const message =
          'The library PDF.js is required to convert PDF in image';
        console.warn(message);
        reject(message);
        return;
      }

      try {
        const fileReader = new FileReader();

        fileReader.onload = async function () {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          getPage();

          async function getPage() {
            const page = await pdf.getPage(currentPage);
            const viewport = page.getViewport({
              scale,
            });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const renderContext = {
              canvasContext: ctx,
              viewport: viewport,
            };
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
              const blobBin = atob(canvas.toDataURL(type).split(',')[1]);
              const array = [];

              for (let i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
              }

              const blob = new Blob([new Uint8Array(array)], {
                type,
              });
              resolve(
                new File([blob], file.name, {
                  type,
                })
              );
            }
          }
        };

        fileReader.readAsArrayBuffer(file);
      } catch (e) {
        reject(e);
      }
    });
  };

  const plugin = ({ addFilter, utils }) => {
    // get quick reference to Type utils
    const { Type } = utils; // called for each file that is loaded
    // right before it is set to the item state
    // should return a promise

    addFilter(
      'LOAD_FILE',
      (file, { query }) =>
        new Promise((resolve, reject) => {
          if (!isPdf(file)) {
            resolve(file);
            return;
          }

          pdfToImage(file, query('GET_PDF_CONVERT_TYPE'))
            .then(function (newFile) {
              resolve(newFile);
            })
            .catch(() => resolve(file));
        })
    ); // expose plugin

    return {
      // default options
      options: {
        // Set type convertor
        pdfConvertType: ['image/png', Type.STRING],
      },
    };
  }; // fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags

  const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (isBrowser) {
    document.dispatchEvent(
      new CustomEvent('FilePond:pluginloaded', {
        detail: plugin,
      })
    );
  }

  return plugin;
});

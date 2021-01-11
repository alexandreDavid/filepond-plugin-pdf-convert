import { isPdf } from "./utils/isPdf";
import { pdfToImage } from "./utils/pdfToImage";

const plugin = ({ addFilter, utils }) => {
  // get quick reference to Type utils
  const { Type } = utils;

  // called for each file that is loaded
  // right before it is set to the item state
  // should return a promise
  addFilter(
    "LOAD_FILE",
    (file, { query }) =>
      new Promise((resolve, reject) => {
        if (!isPdf(file)) {
          resolve(file);
          return;
        }
        pdfToImage(file, query('GET_PDF_CONVERT_TYPE')).then(function(newFile) {
          resolve(newFile);
        }).catch(() => resolve(file));
      })
  );

  // expose plugin
  return {
    // default options
    options: {
      // Set type convertor
      pdfConvertType: ['image/png', Type.STRING],
    },
  };
};

// fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags
const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser) {
  document.dispatchEvent(
    new CustomEvent("FilePond:pluginloaded", { detail: plugin })
  );
}

export default plugin;

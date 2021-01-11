declare module "filepond-plugin-pdf-convert" {
  const FilePondPluginPdfConvert: FilePondPluginPdfConvertProps;
  export interface FilePondPluginPdfConvertProps {
      /** Set type convertor. */
      pdfConvertType?: string;
      /** Margin betwen pages. */
      pdfConvertMarginHeight?: number;
  }
  export default FilePondPluginPdfConvert;
}

# PDF convert to image plugin for FilePond 

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/alexandreDavid/filepond-plugin-pdf-convert/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/filepond-plugin-pdf-convert.svg)](https://www.npmjs.com/package/filepond-plugin-pdf-convert)

The PDF Convert plugin is an Extenxion of FilePond that will convert a PDF file into an image. It will use library PDF.js.

<img src="https://raw.githubusercontent.com/alexandreDavid/filepond-plugin-pdf-convert/demo.gif" width="508" alt=""/>

## Quick Start

Requirement:
* FilePond (https://github.com/pqina/filepond)
* PDF.js (https://github.com/mozilla/pdf.js)

Install using npm:

```bash
npm install filepond-plugin-pdf-convert
```

Or install using Yarn:

```bash
yarn add filepond-plugin-pdf-convert
```
Or using a CDN refernce:

```js
https://unpkg.com/filepond-plugin-pdf-convert/dist/filepond-plugin-pdf-convert.min.js
```

Then import in your project:

```js
import * as FilePond from "filepond";
import FilePondPluginPdfConvert from "filepond-plugin-pdf-convert";
```

Or reference it by CDN

```html
<script src="https://unpkg.com/filepond-plugin-pdf-convert/dist/filepond-plugin-pdf-convert.min.js"></script>
```


Register the plugin:

```js
FilePond.registerPlugin(FilePondPluginPdfConvert);
```

Create a new FilePond instance as normal.

```js
const pond = FilePond.create({
  name: "filepond",
});

// Add it to the DOM
document.body.appendChild(pond.element);
```

The conversion will become active when uploading a PDF file.

## Change the defaults

If you want you can change the defaults for this plugin

in the javascript
```js
pond.setOptions({
    pdfConvertType: 'image/png',
    pdfConvertMarginHeight: 60
 });
```
or in the html with the 'data-' atributes in the html tag
```html
<input type="file"
    data-pdf-convert-type="image/png"
    data-pdf-convert-margin-height="60"
/>
```

[View the demo](https://alexandredavid.github.io/filepond-plugin-pdf-convert/)

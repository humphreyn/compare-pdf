import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as fs from "node:fs";
import Canvas from "@napi-rs/canvas";
import NodeCanvasFactory from "./NodeCanvasFactory.js";

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "../../node_modules/pdfjs-dist/standard_fonts/";

/**************************************************
 * Convert PDF page to PNG image
 *
 * @param pdfDocument
 * @param {number} pageNumber
 * @param {string} filename
 * @param {boolean} [isSinglePage=false]
 * @return {Promise<void>}
 */
const pdfPageToPng = async (pdfDocument, pageNumber, filename, isSinglePage = false) => {
	const page = await pdfDocument.getPage(pageNumber);
	const viewport = page.getViewport({ scale: 1.440026 });
	// const viewport = page.getViewport({ scale: 1.38889 });
	const canvasFactory = new NodeCanvasFactory();
	const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
	const renderContext = {
		canvasContext: canvasAndContext.context,
		viewport: viewport,
		canvas: canvasAndContext.canvas
	};

	await page.render(renderContext).promise;

	const image = canvasAndContext.canvas.toBuffer("image/png");
	const pngFileName = isSinglePage ? filename : filename.replace(".png", `-${pageNumber - 1}.png`);
	fs.writeFileSync(pngFileName, image);
};

/**************************************************
 * Convert PDF to PNG image
 *
 * @param {Buffer|string} pdfDetails
 * @param {string} pngFilePath
 * @param {ComparePdf.Config} config
 * @return {Promise<void>}
 */
const pdfToPng = async (pdfDetails, pngFilePath, config) => {
	const options = {
		disableFontFace: Object.prototype.hasOwnProperty.call(config.settings, "disableFontFace")
			? config.settings.disableFontFace
			: true,
		cMapUrl: CMAP_URL,
		cMapPacked: CMAP_PACKED,
		standardFontDataUrl: STANDARD_FONT_DATA_URL,
		verbosity: Object.prototype.hasOwnProperty.call(config.settings, "verbosity") ? config.settings.verbosity : 0
		// isOffscreenCanvasSupported: false,
		// useWorkerFetch: false
	};
	if (pdfDetails.buffer) {
		options.data = new Uint8Array(pdfDetails.buffer);
	} else {
		options.url = pdfDetails.filename;
	}
	if (Object.prototype.hasOwnProperty.call(config.settings, "password")) options.password = config.settings.password;
	const loadingTask = await pdfjsLib.getDocument(options);
	const pdfDocument = await loadingTask.promise;

	for (let index = 1; index <= pdfDocument.numPages; index++) {
		await pdfPageToPng(pdfDocument, index, pngFilePath, pdfDocument.numPages === 1);
	}
};

/**************************************************
 * Apply mask to PNG image
 *
 * @param {string} pngFilePath
 * @param {ComparePdf.Coordinates} coordinates
 * @param {string} [color="black"]
 * @return {Promise<boolean>}
 */
const applyMask = (pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") => {
	return new Promise((resolve, reject) => {
		try {
			const data = fs.readFileSync(pngFilePath);
			const img = new Canvas.Image();
			img.src = data;
			const canvas = Canvas.createCanvas(img.width, img.height);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.fillRect(coordinates.x0, coordinates.y0, coordinates.x1 - coordinates.x0, coordinates.y1 - coordinates.y0);
			fs.writeFileSync(pngFilePath, canvas.toBuffer("image/png"));
			resolve(true);
		} catch (error) {
			reject(error);
		}
	});
};

/**************************************************
 * Apply crop to PNG image
 *
 * @param {string} pngFilePath
 * @param {ComparePdf.Dimension} coordinates
 * @param {number} [index=0]
 * @return {Promise<unknown>}
 */
const applyCrop = (pngFilePath, coordinates = { width: 0, height: 0, x: 0, y: 0 }, index = 0) => {
	return new Promise((resolve, reject) => {
		try {
			const data = fs.readFileSync(pngFilePath);
			const img = new Canvas.Image();
			img.src = data;
			const canvas = Canvas.createCanvas(coordinates.width, coordinates.height);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(
				img,
				coordinates.x,
				coordinates.y,
				coordinates.width,
				coordinates.height,
				0,
				0,
				coordinates.width,
				coordinates.height
			);

			fs.writeFileSync(pngFilePath.replace(".png", `-${index}.png`), canvas.toBuffer("image/png"));
			resolve();
		} catch (error) {
			reject(error);
		}
	});
};

export default {
	applyMask,
	applyCrop,
	pdfToPng
};

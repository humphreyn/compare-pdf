import Canvas from "canvas";
import fs from "fs-extra";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "../../node_modules/pdfjs-dist/standard_fonts/";

const pdfPageToPng = async (pdfDocument, pageNumber, filename, isSinglePage = false) => {
	const page = await pdfDocument.getPage(pageNumber);
	const viewport = page.getViewport({ "scale": 1.38889 });
	const canvasFactory = pdfDocument.canvasFactory;
	const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
	const renderContext = {
		"canvasContext": canvasAndContext.context,
		"viewport": viewport
	};
	await page.render(renderContext).promise;

	const image = canvasAndContext.canvas.toBuffer("image/png");
	const pngFileName = isSinglePage ? filename : filename.replace(".png", `-${pageNumber - 1}.png`);
	fs.writeFileSync(pngFileName, image);
};

const pdfToPng = async (pdfDetails, pngFilePath, config) => {
	const pdfData = new Uint8Array(pdfDetails.buffer);
	const pdfOptions = {
		"disableFontFace": Object.prototype.hasOwnProperty.call(config.settings, "disableFontFace")
			? config.settings.disableFontFace
			: true,
		"data": pdfData,
		"cMapUrl": CMAP_URL,
		"cMapPacked": CMAP_PACKED,
		"standardFontDataUrl": STANDARD_FONT_DATA_URL,
		"verbosity": Object.prototype.hasOwnProperty.call(config.settings, "verbosity") ? config.settings.verbosity : 0
	};
	if (Object.prototype.hasOwnProperty.call(config.settings, "password")) pdfOptions.password = config.settings.password;
	const pdfDocument = await getDocument(pdfOptions).promise;

	for (let index = 1; index <= pdfDocument.numPages; index++) {
		await pdfPageToPng(pdfDocument, index, pngFilePath, pdfDocument.numPages === 1);
	}
};

// eslint-disable-next-line no-unused-vars
const applyMask = (pngFilePath, coordinates = { "x0": 0, "y0": 0, "x1": 0, "y1": 0 }, color = "black") => {
	return new Promise((resolve, reject) => {
		try {
			const data = fs.readFileSync(pngFilePath);
			const img = new Canvas.Image();
			img.src = data;
			const canvas = Canvas.createCanvas(img.width, img.height);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			ctx.beginPath();
			ctx.fillRect(coordinates.x0, coordinates.y0, coordinates.x1 - coordinates.x0, coordinates.y1 - coordinates.y0);
			fs.writeFileSync(pngFilePath, canvas.toBuffer());
			resolve();
		} catch (error) {
			reject(error);
		}
	});
};

const applyCrop = (pngFilePath, coordinates = { "width": 0, "height": 0, "x": 0, "y": 0 }, index = 0) => {
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

			fs.writeFileSync(pngFilePath.replace(".png", `-${index}.png`), canvas.toBuffer());
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

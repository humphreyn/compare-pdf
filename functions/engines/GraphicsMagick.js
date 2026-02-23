import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import gm from "gm";
import { Engine } from "../enums.js";

/**
 * @typedef {import("../typeDefs.js").Config} Config
 * @typedef {import("../typeDefs.js").Coordinates} Coordinates
 * @typedef {import("../typeDefs.js").Dimension} Dimension
 * @typedef {import("../typeDefs.js").GraphicMagickEngineType} GraphicMagickEngineType
 * @typedef {import("../typeDefs.js").PdfDetail} PdfDetail
 */

class GraphicsMagick {
	/**************************************************
	 * Constructor for GraphicsMagick class
	 *
	 * @param {GraphicMagickEngineType} [engine=Engine.GRAPHICS_MAGICK]  - optional engine, Default is Engine.GRAPHICS_MAGICK
	 * @returns {GraphicsMagick}
	 */
	constructor(engine = Engine.GRAPHICS_MAGICK) {
		this.gm = engine === Engine.GRAPHICS_MAGICK ? gm.subClass({ imageMagick: "7+" }) : gm;
	}

	/**************************************************
	 * Convert PDF to PNG image
	 *
	 * @param {PdfDetail} pdfDetails
	 * @param {string} pngFilePath
	 * @param {Config} config
	 * @return {Promise<void>}
	 */
	pdfToPng(pdfDetails, pngFilePath, config) {
		const options = pdfDetails.buffer ? { data: new Uint8Array(pdfDetails.buffer) } : { url: pdfDetails.filename };
		if (Object.prototype.hasOwnProperty.call(config.settings, "password")) options.password = config.settings.password;
		const loadingTask = pdfjsLib.getDocument(options);
		return loadingTask.promise.then((document) => {
			return new Promise((resolve, reject) => {
				const pdfBuffer = pdfDetails.buffer;
				const pdfFilename = path.parse(pdfDetails.filename).base;
				const pngFileObj = path.parse(pngFilePath);
				const multiPage = document.numPages > 1;
				const pngExtension = multiPage ? "-%d.png" : ".png";
				const pngFile = path.resolve(pngFileObj.dir, pngFileObj.name + pngExtension);

				if (config.settings.password) {
					this.gm(pdfBuffer, pdfFilename)
						.command("convert")
						.in("-authenticate", config.settings.password)
						.out(multiPage ? "+adjoin" : "-adjoin")
						.density(config.settings.density, config.settings.density)
						.quality(config.settings.quality)
						.write(pngFile, (err) => {
							if (err) return reject(err);
							return resolve();
						});
				} else {
					this.gm(pdfBuffer, pdfFilename)
						.command("convert")
						.out(multiPage ? "+adjoin" : "-adjoin")
						.density(config.settings.density, config.settings.density)
						.quality(config.settings.quality)
						.write(pngFile, (err) => {
							if (err) return reject(err);
							return resolve();
						});
				}
			});
		});
	}

	/**************************************************
	 * Function to apply mask
	 *
	 * @param {string} pngFilePath
	 * @param {Coordinates} coordinates
	 * @param {string} [color="black"]
	 * @return {Promise<unknown>}
	 */
	applyMask(pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") {
		return new Promise((resolve, reject) => {
			this.gm(pngFilePath)
				.command("convert")
				.drawRectangle(coordinates.x0, coordinates.y0, coordinates.x1, coordinates.y1)
				.fill(color)
				.write(pngFilePath, (err) => {
					err ? reject(err) : resolve();
				});
		});
	}

	/**************************************************
	 * Function to apply crop
	 *
	 * @param {string} pngFilePath
	 * @param {Dimension} dimension
	 * @param {number} index
	 * @return {Promise<unknown>}
	 */
	applyCrop(pngFilePath, dimension = { width: 0, height: 0, x: 0, y: 0 }, index = 0) {
		return new Promise((resolve, reject) => {
			this.gm(pngFilePath)
				.command("convert")
				.crop(dimension.width, dimension.height, dimension.x, dimension.y)
				.write(pngFilePath.replace(".png", `-${index}.png`), (err) => {
					err ? reject(err) : resolve();
				});
		});
	}
}

export default GraphicsMagick;

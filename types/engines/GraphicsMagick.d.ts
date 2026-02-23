export default GraphicsMagick;
export type Config = any;
export type Coordinates = any;
export type Dimension = any;
export type GraphicMagickEngineType = any;
export type PdfDetail = any;
/**
 * @typedef {import("../typeDefs.js").Config} Config
 * @typedef {import("../typeDefs.js").Coordinates} Coordinates
 * @typedef {import("../typeDefs.js").Dimension} Dimension
 * @typedef {import("../typeDefs.js").GraphicMagickEngineType} GraphicMagickEngineType
 * @typedef {import("../typeDefs.js").PdfDetail} PdfDetail
 */
declare class GraphicsMagick {
	/**************************************************
	 * Constructor for GraphicsMagick class
	 *
	 * @param {GraphicMagickEngineType} [engine=Engine.GRAPHICS_MAGICK]  - optional engine, Default is Engine.GRAPHICS_MAGICK
	 * @returns {GraphicsMagick}
	 */
	constructor(engine?: GraphicMagickEngineType);
	gm: any;
	/**************************************************
	 * Convert PDF to PNG image
	 *
	 * @param {PdfDetail} pdfDetails
	 * @param {string} pngFilePath
	 * @param {Config} config
	 * @return {Promise<void>}
	 */
	pdfToPng(pdfDetails: PdfDetail, pngFilePath: string, config: Config): Promise<void>;
	/**************************************************
	 * Function to apply mask
	 *
	 * @param {string} pngFilePath
	 * @param {Coordinates} coordinates
	 * @param {string} [color="black"]
	 * @return {Promise<unknown>}
	 */
	applyMask(pngFilePath: string, coordinates?: Coordinates, color?: string): Promise<unknown>;
	/**************************************************
	 * Function to apply crop
	 *
	 * @param {string} pngFilePath
	 * @param {Dimension} dimension
	 * @param {number} index
	 * @return {Promise<unknown>}
	 */
	applyCrop(pngFilePath: string, dimension?: Dimension, index?: number): Promise<unknown>;
}

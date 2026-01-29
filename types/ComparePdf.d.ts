export default ComparePdf;
export type Verbosity = 0 | 1 | 5;
export type Engine = "imageMagick" | "graphicsMagick" | "native";
export type CompareType = "Base64" | "Image";
export type Paths = {
	actualPdfRootFolder?: string;
	baselinePdfRootFolder?: string;
	actualPngRootFolder?: string;
	baselinePngRootFolder?: string;
	diffPngRootFolder?: string;
};
export type Settings = {
	imageEngine?: Engine;
	density?: number;
	quality?: number;
	tolerance?: number;
	threshold?: number;
	cleanPngPaths?: boolean;
	matchPageCount?: boolean;
	disableFontFace?: boolean;
	verbosity?: Verbosity;
	password?: string;
};
export type ComparePdfConfig = {
	paths?: Paths;
	settings?: Settings;
};
export type Coordinates = {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
};
export type Dimension = {
	width: number;
	height: number;
	x: number;
	y: number;
};
export type PageMask = {
	pageIndex: number;
	coordinates: Coordinates;
	color?: string;
};
export type PageCrop = {
	pageIndex: number;
	coordinates: Dimension;
};
export type ComparePdfOpts = {
	masks: PageMask[];
	crops: PageCrop[];
	onlyPageIndexes: Array<string | number>;
	skipPageIndexes: Array<string | number>;
};
export type Details = {
	status: string;
	numDiffPixels: number;
	diffPng: string;
};
export type Results = {
	status: string;
	message: string;
	details?: Details[];
};
declare class ComparePdf {
	constructor({
		paths: {
			actualPdfRootFolder,
			actualPngRootFolder,
			baselinePdfRootFolder,
			baselinePngRootFolder,
			diffPngRootFolder
		},
		settings: {
			imageEngine,
			density,
			quality,
			tolerance,
			threshold,
			cleanPngPaths,
			matchPageCount,
			disableFontFace,
			verbosity,
			password
		}
	}?: ComparePdfConfig);
	config: ComparePdfConfig;
	opts: ComparePdfOpts;
	result: Results;
	/**************************************************
	 * Initialisation method
	 * Should be chained first
	 *
	 * @return {ComparePdf}
	 */
	init(): ComparePdf;
	/****************************************************
	 *
	 * @param {Buffer} baselinePdfBuffer
	 * @param {string} [baselinePdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	baselinePdfBuffer(baselinePdfBuffer: Buffer, baselinePdfFilename?: string): ComparePdf;
	baselinePdfBufferData: Buffer<ArrayBufferLike>;
	baselinePdf: string;
	/****************************************************
	 *
	 * @param {string} baselinePdf
	 * @return {ComparePdf}
	 */
	baselinePdfFile(baselinePdf: string): ComparePdf;
	/****************************************************
	 *
	 * @param {Buffer} actualPdfBuffer
	 * @param {string} [actualPdfFilename=undefined]
	 * @return {ComparePdf}
	 */
	actualPdfBuffer(actualPdfBuffer: Buffer, actualPdfFilename?: string): ComparePdf;
	actualPdfBufferData: Buffer<ArrayBufferLike>;
	actualPdf: string;
	/****************************************************
	 *
	 * @param {string} actualPdf
	 * @return {ComparePdf}
	 */
	actualPdfFile(actualPdf: string): ComparePdf;
	/****************************************************
	 *
	 * @param {number} pageIndex
	 * @param {Coordinates} [coordinates]
	 * @param {string} [color="black"]
	 * @return {ComparePdf}
	 */
	addMask(pageIndex: number, coordinates?: Coordinates, color?: string): ComparePdf;
	/****************************************************
	 *
	 * @param {PageMask[]} masks
	 * @return {ComparePdf}
	 */
	addMasks(masks: PageMask[]): ComparePdf;
	/****************************************************
	 *
	 * @param {Array<string | number>} pageIndexes
	 * @return {ComparePdf}
	 */
	onlyPageIndexes(pageIndexes: Array<string | number>): ComparePdf;
	/****************************************************
	 *
	 * @param {Array<string | number>} pageIndexes
	 * @return {ComparePdf}
	 */
	skipPageIndexes(pageIndexes: Array<string | number>): ComparePdf;
	/****************************************************
	 *
	 * @param {number} pageIndex
	 * @param {Dimension} [coordinates]
	 * @return {ComparePdf}
	 */
	cropPage(pageIndex: number, coordinates?: Dimension): ComparePdf;
	/****************************************************
	 *
	 * @param {PageCrop[]} cropPagesList
	 * @return {ComparePdf}
	 */
	cropPages(cropPagesList: PageCrop[]): ComparePdf;
	/****************************************************
	 *
	 * @param {CompareType} [comparisonType=CompareBy.IMAGE]
	 * @return {Promise<Results>}
	 */
	compare(comparisonType?: CompareType): Promise<Results>;
}
/**
 * Enum for Image Compare Mode
 */
export type CompareBy = string;
/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum { string }
 */
export const CompareBy: Readonly<{
	BASE64: "Base64";
	IMAGE: "Image";
}>;
/**
 * Enum for Verbosity Levels
 */
export type ImageEngine = string;
/**
 * Enum for Verbosity Levels
 * @readonly
 * @enum { string }
 */
export const ImageEngine: Readonly<{
	IMAGE_MAGICK: "imageMagick";
	GRAPHICS_MAGICK: "graphicsMagick";
	NATIVE: "native";
}>;
/**
 * Enum for Verbosity Levels
 */
export type LogLevel = number;
/**
 * Enum for Verbosity Levels
 * @readonly
 * @enum { number }
 */
export const LogLevel: Readonly<{
	ERROR: 0;
	WARNING: 1;
	INFO: 5;
}>;

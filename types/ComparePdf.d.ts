export as namespace ComparePdf;

export default ComparePdf;

// export namespace ComparePDF {
/**
 * Logging verbosity levels
 * @readonly
 * @type {number}
 */
export type Verbosity = 0 | 1 | 5;
/**
 * Engines for image comparison
 * @readonly
 */
export type Engine = "imageMagick" | "graphicsMagick" | "native";
/**
 * PDF comparison modes
 * @readonly
 */
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

export type Config = {
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

export type Opts = {
	masks?: PageMask[];
	crops?: PageCrop[];
	onlyPageIndexes?: Array<number>;
	skipPageIndexes?: Array<number>;
};

export type Details = {
	status: string;
	numDiffPixels: number;
	diffPng: string;
};

export type Results = {
	status: string;
	message?: string;
	details?: Details[];
};

export type CompareDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
};

export type CompareImageDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
	config: Config;
	opts: Opts;
};

/**
 * ComparePdf class for comparing two PDF's by their images or by their base64 data. The class should be instantiated,
 * then the baseline and actual PDF's should be defined either by their file paths or by supplying their buffers.
 * Then any options for the comparison can be set such as masks, crops, page indexes to include or exclude.
 * Then the compare method should be called with the desired comparison type (by image or by Base64 data).
 * {Class<ComparePdf>}
 */
export class ComparePdf {
	constructor({ paths: Paths, settings: Settings }: Config);

	config: Config;
	opts: Opts;
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

	baselinePdfBufferData: Buffer;
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

	actualPdfBufferData: Buffer;
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
	 * @param {Array<number>} pageIndexes
	 * @return {ComparePdf}
	 */
	onlyPageIndexes(pageIndexes: Array<number>): ComparePdf;

	/****************************************************
	 *
	 * @param {Array<number>} pageIndexes
	 * @return {ComparePdf}
	 */
	skipPageIndexes(pageIndexes: Array<number>): ComparePdf;

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
	 * @param {CompareType} [comparisonType="Image"]
	 * @return {Promise<Results>}
	 */
	compare(comparisonType?: CompareType): Promise<Results>;
}
// }

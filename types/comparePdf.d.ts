export as namespace ComparePdf;

export default ComparePdf;

export enum Engine {
	IMAGE_MAGICK = "imageMagick",
	GRAPHICS_MAGICK = "graphicsMagick",
	NATIVE = "native"
}

export enum LogLevel {
	ERROR = 0,
	WARNING = 1,
	INFO = 5
}

export interface ComparePdfConfig {
	paths?: {
		actualPdfRootFolder?: string;
		baselinePdfRootFolder?: string;
		actualPngRootFolder?: string;
		baselinePngRootFolder?: string;
		diffPngRootFolder?: string;
	};
	settings?: {
		imageEngine?: Engine;
		density?: number;
		quality?: number;
		tolerance?: number;
		threshold?: number;
		cleanPngPaths?: boolean;
		matchPageCount?: boolean;
		disableFontFace?: boolean;
		verbosity?: LogLevel;
		password?: string;
	};
}

export interface ComparePdfOpts {
	masks: PageMask[];
	crops: PageCrop[];
	onlyPageIndexes: Array<string | number>;
	skipPageIndexes: Array<string | number>;
}

export interface Coordinates {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

export interface Dimension {
	width: number;
	height: number;
	x: number;
	y: number;
}

export interface PageMask {
	pageIndex: number;
	coordinates: Coordinates;
	color?: string;
}

export interface PageCrop {
	pageIndex: ComparePdfConfig;
	coordinates: Dimension;
}

export interface Details {
	status: string;
	numDiffPixels: string;
	diffPng: string;
}

export interface Results {
	status: string;
	message: string;
	details?: Details[];
}

declare class ComparePdf {
	constructor(config?: ComparePdfConfig);

	config: ComparePdfOpts;

	opts: ComparePdfOpts;

	init(): ComparePdf;

	baselinePdfBuffer(baselinePdfBuffer: Uint8Array, baselinePdfFilename?: string): ComparePdf;

	baselinePdfFile(baselinePdf: string): ComparePdf;

	actualPdfBuffer(actualPdfBuffer: Uint8Array, actualPdfFilename?: string): ComparePdf;

	actualPdfFile(actualPdf: string): ComparePdf;

	addMask(pageIndex: number, coordinates?: Coordinates, color?: string): ComparePdf;

	addMasks(masks: PageMask[]): ComparePdf;

	onlyPageIndexes(pageIndexes: Array<string | number>): ComparePdf;

	skipPageIndexes(pageIndexes: Array<string | number>): ComparePdf;

	cropPage(pageIndex: number, coordinates?: Dimension): ComparePdf;

	cropPages(cropPagesList: PageCrop[]): ComparePdf;

	compare(comparisonType?: string): Promise<Results>;
}

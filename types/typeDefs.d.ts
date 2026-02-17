type Canvas = import("@napi-rs/canvas").Canvas;
type SKRSContext2D = import("@napi-rs/canvas").SKRSContext2D;
/**
 * Logging verbosity levels
 */
type Verbosity = 0 | 1 | 5;
/**
 * Compare PDF Engines for image comparison
 */
type EngineType = "imageMagick" | "graphicsMagick" | "native";
/**
 * Compare PDF GraphicMagick Engines for image comparison
 */
type GraphicMagickEngineType = "imageMagick" | "graphicsMagick";
/**
 * Compare PDF comparison modes
 */
type CompareType = "Base64" | "Image";
/**
 * Compare PDF Config paths
 */
type Paths = {
	/**
	 * - optional, root folder of Actual PDF. Default "./data/actualPdfs"
	 */
	actualPdfRootFolder?: string;
	/**
	 * - optional, root folder of Baseline PDF. Default "./data/baselinePdfs"
	 */
	baselinePdfRootFolder?: string;
	/**
	 * - optional, root folder of Actual png/images. Default "./data/actualPngs"
	 */
	actualPngRootFolder?: string;
	/**
	 * - optional, root folder of Baseline png/images. Default "./data/baselinePngs"
	 */
	baselinePngRootFolder?: string;
	/**
	 * - optional, root folder of Difference png/images. Default "./data/diffPngs"
	 */
	diffPngRootFolder?: string;
};
/**
 * Compare PDF Config paths
 */
type Settings = {
	/**
	 * - optional, the image Engine to use: [ "imageMagick" | "graphicsMagick" | "native" ], Default "native"
	 */
	imageEngine?: EngineType;
	/**
	 * - optional, (from gm) the image resolution to store while encoding a raster image or the canvas resolution while rendering (reading) vector formats into an image. Default 100
	 */
	density?: number;
	/**
	 * - optional, (from gm) Adjusts the jpeg|miff|png|tiff compression level. val ranges from 0 to 100 (best). Default 70
	 */
	quality?: number;
	/**
	 * - optional, the allowable pixel count that is different between the compared images. Default 0
	 */
	tolerance?: number;
	/**
	 * - optional, (from pixelmatch) ranges from 0 to 1. Smaller values make the comparison more sensitive. Default 0.05
	 */
	threshold?: number;
	/**
	 * - optional, boolean flag for cleaning png folders automatically. Default true
	 */
	cleanPngPaths?: boolean;
	/**
	 * - optional, boolean flag that enables or disables the page count verification between the actual and baseline PDFs. Default true
	 */
	matchPageCount?: boolean;
	/**
	 * - optional, specifies if fonts are converted to OpenType fonts and loaded by the Font Loading API or
	 */
	disableFontFace?: boolean;
};
/**
 * Compare PDF Config
 */
type Config = {
	paths?: Paths;
	settings?: Settings;
};
/**
 * Compare PDF Coordinates
 */
type Coordinates = {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
};
/**
 * Compare PDF Dimensions
 */
type Dimension = {
	width: number;
	height: number;
	x: number;
	y: number;
};
/**
 * Compare PDF PageMask
 */
type PageMask = {
	pageIndex: number;
	coordinates: Coordinates;
	color?: string;
};
/**
 * Compare PDF PageCrop
 */
type PageCrop = {
	pageIndex: number;
	dimension: Dimension;
};
/**
 * Compare PDF Opts
 */
type Opts = {
	masks?: PageMask[];
	crops?: PageCrop[];
	onlyPageIndexes?: number[];
	skipPageIndexes?: number[];
};
/**
 * Compare PDF Details
 */
type Details = {
	status: string;
	numDiffPixels: number;
	diffPng: string;
};
/**
 * Compare PDF Results
 */
type Results = {
	status: string;
	message?: string;
	details?: Details[];
};
/**
 * Compare PDF CompareDetails
 */
type CompareDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
};
/**
 * Compare PDF CompareImageDetails
 */
type CompareImageDetails = {
	actualPdfFilename: string;
	baselinePdfFilename: string;
	actualPdfBuffer: Buffer;
	baselinePdfBuffer: Buffer;
	config: Config;
	opts: Opts;
};
/**
 * Compare PDF PdfDetail
 */
type PdfDetail = {
	filename: string;
	buffer?: Buffer;
};
/**
 * Compare PDF CanvasAndContext
 */
type CanvasAndContext = {
	canvas: Canvas;
	context: SKRSContext2D;
};

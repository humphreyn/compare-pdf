/**
 * Enum for Verbosity Levels
 * @readonly
 * @enum {ComparePdf.Verbosity}
 */
export const LogLevel = {
	ERROR: 0,
	WARNING: 1,
	INFO: 5
};

/**
 * Enum for accepted Engines
 * @readonly
 * @enum {ComparePdf.Engine}
 */
export const Engine = {
	IMAGE_MAGICK: "imageMagick",
	GRAPHICS_MAGICK: "graphicsMagick",
	NATIVE: "native"
};

/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum {ComparePdf.CompareType}
 */
export const CompareBy = {
	BASE64: "Base64",
	IMAGE: "Image"
};

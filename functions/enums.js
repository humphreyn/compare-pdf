/**
 * Enum for Verbosity Levels
 * @readonly
 * @enum {ComparePDF.Verbosity}
 */
export const LogLevel = {
	ERROR: 0,
	WARNING: 1,
	INFO: 5
};

/**
 * Enum for accepted Engines
 * @readonly
 * @enum {ComparePDF.Engine}
 */
export const Engine = {
	IMAGE_MAGICK: "imageMagick",
	GRAPHICS_MAGICK: "graphicsMagick",
	NATIVE: "native"
};

/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum {ComparePDF.CompareType}
 */
export const CompareBy = {
	BASE64: "Base64",
	IMAGE: "Image"
};

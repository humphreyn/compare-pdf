/**
 * Enum for Verbosity Levels
 * @readonly
 * @enum {number}
 */
export const enum LogLevel {
	ERROR = 0,
	WARNING = 1,
	INFO = 5
}

/**
 * Enum for accepted Engines
 * @readonly
 * @enum {string}
 */
export const enum Engine {
	IMAGE_MAGICK = "imageMagick",
	GRAPHICS_MAGICK = "graphicsMagick",
	NATIVE = "native"
}

/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum {string}
 */
export const enum CompareBy {
	BASE64 = "Base64",
	IMAGE = "Image"
}

/**
 * Logging verbosity levels
 * @readonly
 */
export type Verbosity = LogLevel.ERROR | LogLevel.WARNING | LogLevel.INFO;

/**
 * Engines for image comparison
 * @readonly
 */
export type EngineTypes = Engine.IMAGE_MAGICK | Engine.GRAPHICS_MAGICK | Engine.NATIVE;

/**
 * PDF comparison modes
 * @readonly
 */
export type CompareType = CompareBy.BASE64 | CompareBy.IMAGE;

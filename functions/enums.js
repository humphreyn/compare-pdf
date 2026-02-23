/**
 * @typedef {import("./typeDefs.js").EngineType} EngineType
 * @typedef {import("./typeDefs.js").Verbosity} Verbosity
 * @typedef {import("./typeDefs.js").CompareType} CompareType
 */

/**
 * Enum for Log Levels
 * @readonly
 * @enum {Verbosity}
 */
export const LogLevel = Object.freeze({
	ERROR: 0,
	WARNING: 1,
	INFO: 5
});

/**
 * Enum for accepted Engines
 * @readonly
 * @enum {EngineType}
 */
export const Engine = Object.freeze({
	IMAGE_MAGICK: "imageMagick",
	GRAPHICS_MAGICK: "graphicsMagick",
	NATIVE: "native"
});

/**
 * Enum for Image Compare Mode
 * @readonly
 * @enum {CompareType}
 */
export const CompareBy = Object.freeze({
	BASE64: "Base64",
	IMAGE: "Image"
});

import Canvas from "@napi-rs/canvas";

/**
 * @typedef {import("../typeDefs.js").CanvasAndContext} CanvasAndContext
 */

class NodeCanvasFactory {
	constructor() {}

	/**************************************************
	 * Creates a canvas and its 2D context with the specified width and height.
	 *
	 * @param {number} width
	 * @param {number} height
	 * @return {CanvasAndContext}
	 */
	create(width, height) {
		if (width <= 0 || height <= 0) {
			throw new Error("Invalid canvas size");
		}
		const canvas = Canvas.createCanvas(width, height);
		const context = canvas.getContext("2d");
		return {
			canvas: canvas,
			context: context
		};
	}

	/**************************************************
	 * Resets the canvas with the specified width and height.
	 *
	 * @param {CanvasAndContext} canvasAndContext
	 * @param {number} width
	 * @param {number} height
	 */
	reset(canvasAndContext, width, height) {
		if (!canvasAndContext.canvas) {
			throw new Error("Canvas is not specified");
		}
		if (width <= 0 || height <= 0) {
			throw new Error("Invalid canvas size");
		}
		canvasAndContext.canvas.width = width;
		canvasAndContext.canvas.height = height;
	}

	/**************************************************
	 * Destroys the canvas and context, allowing for garbage collection.
	 *
	 * @param {CanvasAndContext} canvasAndContext
	 */
	destroy(canvasAndContext) {
		if (!canvasAndContext.canvas) {
			throw new Error("Canvas is not specified");
		}
		canvasAndContext.canvas.width = 0;
		canvasAndContext.canvas.height = 0;
		canvasAndContext.canvas = null;
		canvasAndContext.context = null;
	}
}

export default NodeCanvasFactory;

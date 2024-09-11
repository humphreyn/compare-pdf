import Canvas from "canvas";
import { strict as assert } from "assert";

class NodeCanvasFactory {
	constructor() {}

	create(width, height) {
		assert(width > 0 && height > 0, "Invalid canvas size");
		const canvas = Canvas.createCanvas(width, height);
		const context = canvas.getContext("2d");
		return {
			"canvas": canvas,
			"context": context
		};
	}

	reset(canvasAndContext, width, height) {
		assert(canvasAndContext.canvas, "Canvas is not specified");
		assert(width > 0 && height > 0, "Invalid canvas size");
		canvasAndContext.canvas.width = width;
		canvasAndContext.canvas.height = height;
	}

	destroy(canvasAndContext) {
		assert(canvasAndContext.canvas, "Canvas is not specified");
		canvasAndContext.canvas.width = 0;
		canvasAndContext.canvas.height = 0;
		canvasAndContext.canvas = null;
		canvasAndContext.context = null;
	}
}

export default NodeCanvasFactory;

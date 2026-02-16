import GraphicsMagick from "./engines/GraphicsMagick.js";
import native from "./engines/native.js";
import { Engine } from "./enums.js";

/**************************************************
 * Factory function to get the appropriate engine based on the input
 *
 * @param {ComparePDF.EngineTypes} engine
 * @return {(GraphicsMagick|native)}
 */
export default function getEngine(engine) {
	if (engine === Engine.IMAGE_MAGICK) {
		return new GraphicsMagick(Engine.IMAGE_MAGICK);
	} else if (engine === Engine.GRAPHICS_MAGICK) {
		return new GraphicsMagick(Engine.GRAPHICS_MAGICK);
	}
	return native;
}

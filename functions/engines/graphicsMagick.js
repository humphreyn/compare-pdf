const gm = require('gm').subClass({ 'imageMagick': '7+' });
const path = require('path');

const pdfToPng = (pdfDetails, pngFilePath, config) => {
	return new Promise((resolve, reject) => {
		const pdfBuffer = pdfDetails.buffer;
		const pdfFilename = path.parse(pdfDetails.filename).name;

		gm(pdfBuffer, pdfFilename)
			.command('convert')
			.density(config.settings.density, config.settings.density)
			.quality(config.settings.quality)
			.write(pngFilePath, (err) => {
				err ? reject(err) : resolve();
			});
	});
};

const applyMask = (
	pngFilePath,
	coordinates = { 'x0': 0, 'y0': 0, 'x1': 0, 'y1': 0 },
	color = 'black'
) => {
	return new Promise((resolve, reject) => {
		gm(pngFilePath)
			.command('convert')
			.drawRectangle(
				coordinates.x0,
				coordinates.y0,
				coordinates.x1,
				coordinates.y1
			)
			.fill(color)
			.write(pngFilePath, (err) => {
				err ? reject(err) : resolve();
			});
	});
};

const applyCrop = (
	pngFilePath,
	coordinates = { 'width': 0, 'height': 0, 'x': 0, 'y': 0 },
	index = 0
) => {
	return new Promise((resolve, reject) => {
		gm(pngFilePath)
			.command('convert')
			.crop(coordinates.width, coordinates.height, coordinates.x, coordinates.y)
			.write(pngFilePath.replace('.png', `-${index}.png`), (err) => {
				err ? reject(err) : resolve();
			});
	});
};

module.exports = {
	applyMask,
	applyCrop,
	pdfToPng
};

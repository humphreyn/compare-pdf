import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import { PNG } from "pngjs";
import pixelMatch from "pixelmatch";
import utils from "./utils.js";
import native from "./engines/native.js";
import graphicsMagick from "./engines/graphicsMagick.js";

const comparePngs = (actual, baseline, diff, config) => {
	return new Promise((resolve) => {
		try {
			const actualPng = PNG.sync.read(fs.readFileSync(actual));
			const baselinePng = PNG.sync.read(fs.readFileSync(baseline));
			const { width, height } = actualPng;
			const diffPng = new PNG({ width, height });

			const threshold = config.settings && config.settings.threshold ? config.settings.threshold : 0.05;
			const tolerance = config.settings && config.settings.tolerance ? config.settings.tolerance : 0;

			const numDiffPixels = pixelMatch(actualPng.data, baselinePng.data, diffPng.data, width, height, {
				"threshold": threshold
			});

			if (numDiffPixels > tolerance) {
				fs.writeFileSync(diff, PNG.sync.write(diffPng));
				resolve({ "status": "failed", "numDiffPixels": numDiffPixels, "diffPng": diff });
			} else {
				resolve({ "status": "passed" });
			}
		} catch (error) {
			resolve({ "status": "failed", "actual": actual, "error": error });
		}
	});
};

const comparePdfByImage = async (compareDetails) => {
	try {
		const actualPdfFilename = compareDetails.actualPdfFilename;
		const baselinePdfFilename = compareDetails.baselinePdfFilename;
		const actualPdfBuffer = compareDetails.actualPdfBuffer;
		const baselinePdfBuffer = compareDetails.baselinePdfBuffer;
		const config = compareDetails.config;
		const opts = compareDetails.opts;

		const imageEngine = ["graphicsMagick", "imageMagick"].includes(config.settings.imageEngine)
			? graphicsMagick(config.settings.imageEngine)
			: native;

		const actualPdfBaseName = path.parse(actualPdfFilename).name;
		const baselinePdfBaseName = path.parse(baselinePdfFilename).name;

		if (config.paths.actualPngRootFolder && config.paths.baselinePngRootFolder && config.paths.diffPngRootFolder) {
			const actualPngDirPath = path.resolve(config.paths.actualPngRootFolder, actualPdfBaseName);
			const baselinePngDirPath = path.resolve(config.paths.baselinePngRootFolder, baselinePdfBaseName);
			const diffPngDirPath = path.resolve(config.paths.diffPngRootFolder, actualPdfBaseName);

			utils.ensureAndCleanupPath(actualPngDirPath);
			utils.ensureAndCleanupPath(baselinePngDirPath);
			utils.ensureAndCleanupPath(diffPngDirPath);

			const actualPngFilePath = path.resolve(actualPngDirPath, `${actualPdfBaseName}.png`);
			const baselinePngFilePath = path.resolve(baselinePngDirPath, `${baselinePdfBaseName}.png`);

			const actualPdfDetails = {
				"filename": actualPdfFilename,
				"buffer": actualPdfBuffer
			};
			await imageEngine.pdfToPng(actualPdfDetails, actualPngFilePath, config);

			const baselinePdfDetails = {
				"filename": baselinePdfFilename,
				"buffer": baselinePdfBuffer
			};
			await imageEngine.pdfToPng(baselinePdfDetails, baselinePngFilePath, config);

			const actualPngs = fs
				.readdirSync(actualPngDirPath)
				.filter((pngFile) => path.parse(pngFile).name.startsWith(actualPdfBaseName));
			const baselinePngs = fs
				.readdirSync(baselinePngDirPath)
				.filter((pngFile) => path.parse(pngFile).name.startsWith(baselinePdfBaseName));

			if (config.settings.matchPageCount === true) {
				if (actualPngs.length !== baselinePngs.length) {
					return Promise.resolve({
						"status": "failed",
						"message": `Actual pdf page count (${actualPngs.length}) is not the same as Baseline pdf (${baselinePngs.length}).`
					});
				}
			}

			const comparisonResults = [];
			for (let index = 0; index < baselinePngs.length; index++) {
				let suffix = "";
				if (baselinePngs.length > 1) {
					suffix = `-${index}`;
				}
				//Change for issue-27
				const actualPng =
					actualPngs.length > 1
						? path.resolve(actualPngDirPath, `${actualPdfBaseName}${suffix}.png`)
						: path.resolve(actualPngDirPath, `${actualPdfBaseName}.png`);
				const baselinePng = path.resolve(baselinePngDirPath, `${baselinePdfBaseName}${suffix}.png`);
				const diffPng = path.resolve(diffPngDirPath, `${actualPdfBaseName}_diff${suffix}.png`);

				if (opts.skipPageIndexes && opts.skipPageIndexes.length > 0) {
					if (opts.skipPageIndexes.includes(index)) {
						continue;
					}
				}

				if (opts.onlyPageIndexes && opts.onlyPageIndexes.length > 0) {
					if (!opts.onlyPageIndexes.includes(index)) {
						continue;
					}
				}

				if (opts.masks) {
					const pageMasks = _.filter(opts.masks, { "pageIndex": index });
					if (pageMasks && pageMasks.length > 0) {
						for (const pageMask of pageMasks) {
							await imageEngine.applyMask(actualPng, pageMask.coordinates, pageMask.color);
							await imageEngine.applyMask(baselinePng, pageMask.coordinates, pageMask.color);
						}
					}
				}

				if (opts.crops && opts.crops.length > 0) {
					const pageCroppings = _.filter(opts.crops, { "pageIndex": index });
					if (pageCroppings && pageCroppings.length > 0) {
						for (let cropIndex = 0; cropIndex < pageCroppings.length; cropIndex++) {
							await imageEngine.applyCrop(actualPng, pageCroppings[cropIndex].coordinates, cropIndex);
							await imageEngine.applyCrop(baselinePng, pageCroppings[cropIndex].coordinates, cropIndex);
							comparisonResults.push(
								await comparePngs(
									actualPng.replace(".png", `-${cropIndex}.png`),
									baselinePng.replace(".png", `-${cropIndex}.png`),
									diffPng,
									config
								)
							);
						}
					}
				} else {
					comparisonResults.push(await comparePngs(actualPng, baselinePng, diffPng, config));
				}
			}

			if (config.settings.cleanPngPaths) {
				utils.ensureAndCleanupPath(config.paths.actualPngRootFolder);
				utils.ensureAndCleanupPath(config.paths.baselinePngRootFolder);
			}

			const failedResults = _.filter(comparisonResults, (res) => res.status === "failed");
			if (failedResults.length > 0) {
				return Promise.resolve({
					"status": "failed",
					"message": `${actualPdfBaseName}.pdf is not the same as ${baselinePdfBaseName}.pdf compared by their images.`,
					"details": failedResults
				});
			} else {
				return Promise.resolve({ "status": "passed" });
			}
		} else {
			return Promise.resolve({
				"status": "failed",
				"message": `PNG directory is not set. Please define correctly then try again.`
			});
		}
	} catch (error) {
		return Promise.resolve({
			"status": "failed",
			"message": `An error occurred.\n${error}`
		});
	}
};

export default {
	comparePngs,
	comparePdfByImage
};

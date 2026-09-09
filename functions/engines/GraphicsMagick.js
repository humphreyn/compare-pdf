import path from "node:path";
import os from "node:os";
import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import spawn from "cross-spawn";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { Engine } from "../enums.js";

/**
 * @typedef {import("../typeDefs.js").Config} Config
 * @typedef {import("../typeDefs.js").Coordinates} Coordinates
 * @typedef {import("../typeDefs.js").Dimension} Dimension
 * @typedef {import("../typeDefs.js").GraphicMagickEngineType} GraphicMagickEngineType
 * @typedef {import("../typeDefs.js").PdfDetail} PdfDetail
 */

const formatCliCommand = (command, args) => {
	return `${command} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`;
};

const getBinaryCommand = (engine = Engine.GRAPHICS_MAGICK) => {
	return engine === Engine.IMAGE_MAGICK ? "magick" : "gm";
};

const getConvertOutputPath = (pngFilePath, multiPage = false) => {
	const pngFileObj = path.parse(pngFilePath);
	const pngExtension = multiPage ? "-%d.png" : ".png";

	return path.resolve(pngFileObj.dir, `${pngFileObj.name}${pngExtension}`);
};

const buildPdfToPngArgs = ({ inputPdfPath, pngFilePath, density, quality, password, multiPage }) => {
	const args = [
		"convert",
		"-density",
		`${density}x${density}`,
		"-quality",
		String(quality),
		inputPdfPath,
		multiPage ? "+adjoin" : "-adjoin",
		getConvertOutputPath(pngFilePath, multiPage)
	];

	if (password) {
		args.splice(1, 0, "-authenticate", password);
	}

	return args;
};

const buildApplyMaskArgs = ({ inputPngPath, outputPngPath, coordinates, color }) => {
	return [
		"convert",
		inputPngPath,
		"-fill",
		color,
		"-draw",
		`rectangle ${coordinates.x0},${coordinates.y0} ${coordinates.x1},${coordinates.y1}`,
		outputPngPath
	];
};

const buildApplyCropArgs = ({ inputPngPath, outputPngPath, dimension }) => {
	return [
		"convert",
		inputPngPath,
		"-crop",
		`${dimension.width}x${dimension.height}+${dimension.x}+${dimension.y}`,
		outputPngPath
	];
};

const executeCommand = (command, args) => {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
		const stdoutChunks = [];
		const stderrChunks = [];
		const commandString = formatCliCommand(command, args);

		childProcess.stdout.on("data", (chunk) => {
			stdoutChunks.push(chunk);
		});

		childProcess.stderr.on("data", (chunk) => {
			stderrChunks.push(chunk);
		});

		childProcess.once("error", (error) => {
			if (error.code === "ENOENT") {
				return reject(
					new Error(
						`Could not execute GraphicsMagick/ImageMagick: ${commandString} this most likely means the gm/convert binaries can't be found`
					)
				);
			}

			return reject(error);
		});

		childProcess.once("close", (code) => {
			if (code === 0) {
				return resolve(Buffer.concat(stdoutChunks));
			}

			const stderr = Buffer.concat(stderrChunks).toString("utf8").trim();
			const stdout = Buffer.concat(stdoutChunks).toString("utf8").trim();

			return reject(new Error(stderr || stdout || `Command failed: ${commandString}`));
		});
	});
};

const createTempPdfFromBuffer = async (pdfDetails) => {
	const tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "compare-pdf-"));
	const pdfFilename = path.parse(pdfDetails.filename ?? "document.pdf").base || "document.pdf";
	const safePdfFilename = pdfFilename.endsWith(".pdf") ? pdfFilename : `${pdfFilename}.pdf`;
	const tempPdfPath = path.join(tempDirPath, safePdfFilename);

	await fs.writeFile(tempPdfPath, pdfDetails.buffer);

	return {
		tempDirPath,
		tempPdfPath
	};
};

/**
 * @param {string} filename
 * @return {string}
 */
const getTemporaryOutputPath = (filename) => {
	const fileObj = path.parse(filename);

	return path.resolve(fileObj.dir, `${fileObj.name}.tmp${fileObj.ext}`);
};

class GraphicsMagick {
	/**************************************************
	 * Constructor for GraphicsMagick class
	 *
	 * @param {GraphicMagickEngineType} [engine=Engine.GRAPHICS_MAGICK]  - optional engine, Default is Engine.GRAPHICS_MAGICK
	 * @param {typeof executeCommand} [commandRunner=executeCommand]
	 * @returns {GraphicsMagick}
	 */
	constructor(engine = Engine.GRAPHICS_MAGICK, commandRunner = executeCommand) {
		this.engine = engine;
		this.command = getBinaryCommand(engine);
		this.commandRunner = commandRunner;
	}

	/**************************************************
	 * Convert PDF to PNG image
	 *
	 * @param {PdfDetail} pdfDetails
	 * @param {string} pngFilePath
	 * @param {Config} config
	 * @return {Promise<void>}
	 */
	async pdfToPng(pdfDetails, pngFilePath, config) {
		let tempDirPath;
		let inputPdfPath = pdfDetails.filename;
		let loadingTask;

		try {
			if (pdfDetails.buffer) {
				const tempPdf = await createTempPdfFromBuffer(pdfDetails);
				tempDirPath = tempPdf.tempDirPath;
				inputPdfPath = tempPdf.tempPdfPath;
			}

			const options = { url: inputPdfPath };
			if (Object.prototype.hasOwnProperty.call(config.settings, "password"))
				options.password = config.settings.password;
			loadingTask = pdfjsLib.getDocument(options);
			const document = await loadingTask.promise;
			const multiPage = document.numPages > 1;
			const args = buildPdfToPngArgs({
				inputPdfPath,
				pngFilePath,
				density: config.settings.density,
				quality: config.settings.quality,
				password: config.settings.password,
				multiPage
			});

			await this.commandRunner(this.command, args);
		} finally {
			if (loadingTask) {
				await loadingTask.destroy();
			}
			if (tempDirPath) {
				await fs.rm(tempDirPath, { recursive: true, force: true });
			}
		}
	}

	/**************************************************
	 * Function to apply mask
	 *
	 * @param {string} pngFilePath
	 * @param {Coordinates} coordinates
	 * @param {string} [color="black"]
	 * @return {Promise<unknown>}
	 */
	async applyMask(pngFilePath, coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 }, color = "black") {
		const tempOutputPath = getTemporaryOutputPath(pngFilePath);
		const args = buildApplyMaskArgs({
			inputPngPath: pngFilePath,
			outputPngPath: tempOutputPath,
			coordinates,
			color
		});

		await this.commandRunner(this.command, args);
		if (!existsSync(tempOutputPath)) {
			throw new Error(`Image engine did not create expected output file: ${tempOutputPath}`);
		}
		await fs.rename(tempOutputPath, pngFilePath);
	}

	/**************************************************
	 * Function to apply crop
	 *
	 * @param {string} pngFilePath
	 * @param {Dimension} dimension
	 * @param {number} index
	 * @return {Promise<unknown>}
	 */
	async applyCrop(pngFilePath, dimension = { width: 0, height: 0, x: 0, y: 0 }, index = 0) {
		const outputPngPath = pngFilePath.replace(".png", `-${index}.png`);
		const args = buildApplyCropArgs({
			inputPngPath: pngFilePath,
			outputPngPath,
			dimension
		});

		await this.commandRunner(this.command, args);
	}
}

export {
	buildApplyCropArgs,
	buildApplyMaskArgs,
	buildPdfToPngArgs,
	executeCommand,
	formatCliCommand,
	getBinaryCommand,
	getConvertOutputPath
};

export default GraphicsMagick;

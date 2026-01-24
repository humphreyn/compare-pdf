import * as fs from "node:fs";
import path from "node:path";

/**************************************************
 * Ensures that a directory is empty. Deletes directory contents
 * if the directory is not empty. If the directory does not exist,
 * it is created. The directory itself is not deleted.
 * Synchronous
 *
 * @param {string} dir        - directory to empty
 * @returns {undefined}
 */
function emptyDirSync(dir) {
	let items;
	try {
		items = fs.readdirSync(dir);
	} catch {
		fs.mkdirSync(dir, { "recursive": true, "mode": 0o777 });
		return undefined;
	}

	items.forEach((item) => {
		item = path.join(dir, item);
		fs.rmSync(item, { recursive: true, force: true, maxRetries: 3 });
	});
	return undefined;
}

const copyJsonObject = (jsonObject) => {
	return JSON.parse(JSON.stringify(jsonObject));
};

const ensureAndCleanupPath = (filepath) => {
	emptyDirSync(filepath);
};

const ensurePathsExist = (config) => {
	fs.mkdirSync(config.paths.actualPdfRootFolder, { "recursive": true, "mode": 0o777 });
	fs.mkdirSync(config.paths.baselinePdfRootFolder, { "recursive": true, "mode": 0o777 });
};

export default {
	copyJsonObject,
	ensureAndCleanupPath,
	ensurePathsExist
};

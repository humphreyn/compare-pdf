import fs from "fs-extra";
import { expect } from "chai";
import { describe, it, before, beforeEach } from "mocha";
import ComparePdf from "../functions/ComparePdf.js";
import _ from "lodash";
import config from "./config.js";
import newConfig from "./newConfig.js";

describe("Compare Pdf Common Tests", () => {
	it("Should be able to override default configs", async () => {
		const comparisonResults = await new ComparePdf(newConfig)
			.actualPdfFile("newSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare();
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to override specific config property", async () => {
		const comparePdf = new ComparePdf();
		comparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
		const comparisonResults = await comparePdf.actualPdfFile("newSame.pdf").baselinePdfFile("baseline.pdf").compare();
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to throw error when passing invalid actual pdf file path", async () => {
		const comparisonResults = await new ComparePdf()
			.actualPdfFile("missing.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare();
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"Actual pdf file path does not exists. Please define correctly then try again."
		);
	});

	["actualPngRootFolder", "baselinePngRootFolder", "diffPngRootFolder"].forEach((pngFolder) => {
		it(`Should be able to throw error when config has missing ${pngFolder}`, async () => {
			const missingConfig = _.cloneDeep(config);
			missingConfig.paths[pngFolder] = "";
			const comparisonResults = await new ComparePdf(missingConfig)
				.actualPdfFile("same")
				.baselinePdfFile("baseline")
				.compare();

			expect(comparisonResults.status).to.equal("failed");
			expect(comparisonResults.message).to.equal("PNG directory is not set. Please define correctly then try again.");
		});
	});

	it("Should be able to throw error when not passing actual pdf file path", async () => {
		const comparisonResults = await new ComparePdf().actualPdfFile("").baselinePdfFile("baseline.pdf").compare();
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"Actual pdf file path was not set. Please define correctly then try again."
		);
	});

	it("Should be able to throw error when passing invalid baseline pdf file path", async () => {
		const comparisonResults = await new ComparePdf().actualPdfFile("same.pdf").baselinePdfFile("missing.pdf").compare();
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"Baseline pdf file path does not exists. Please define correctly then try again."
		);
	});

	it("Should be able to throw error when not passing baseline pdf file path", async () => {
		const comparisonResults = await new ComparePdf().actualPdfFile("same.pdf").baselinePdfFile("").compare();
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"Baseline pdf file path was not set. Please define correctly then try again."
		);
	});

	it("Should be able to verify PDFs byBase64 and when it fails then byImage", async () => {
		const comparisonResultsByBase64 = await new ComparePdf()
			.actualPdfFile("notSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare("byBase64");
		expect(comparisonResultsByBase64.status).to.equal("failed");
		expect(comparisonResultsByBase64.message).to.equal(
			"notSame.pdf is not the same as baseline.pdf compared by their base64 values."
		);

		if (comparisonResultsByBase64.status === "failed") {
			const comparisonResultsByImage = await new ComparePdf()
				.actualPdfFile("notSame.pdf")
				.baselinePdfFile("baseline.pdf")
				.compare("byImage");
			expect(comparisonResultsByImage.status).to.equal("failed");
			expect(comparisonResultsByImage.message).to.equal(
				"notSame.pdf is not the same as baseline.pdf compared by their images."
			);
			expect(comparisonResultsByImage.details).to.not.be.null;
		}
	});
});

describe("Compare Pdf By Image Tests", () => {
	const engines = ["native", "graphicsMagick", "imageMagick"];
	for (const engine of engines) {
		describe(`Engine: ${engine}`, () => {
			let cloneConfig = undefined;

			beforeEach(() => {
				cloneConfig = _.cloneDeep(config);
				cloneConfig.settings.imageEngine = engine;
			});

			it("Should be able to verify same single page PDFs", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("singlePage.pdf")
					.baselinePdfFile("singlePage.pdf")
					.compare();
				console.log(comparisonResults);
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same multi-page PDFs", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("same.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same password protected multi-page PDFs ", async () => {
				const copiedConfig = JSON.parse(JSON.stringify(cloneConfig));
				copiedConfig.settings.password = "Password";
				const comparisonResults = await new ComparePdf(copiedConfig)
					.actualPdfFile("same-passwordProtected.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same password restricted to prevent printing, copying, modifying multi-page PDFs ", async () => {
				const copiedConfig = JSON.parse(JSON.stringify(cloneConfig));
				copiedConfig.settings.password = "Password";
				const comparisonResults = await new ComparePdf(copiedConfig)
					.actualPdfFile("same-passwordRestricted.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs without extension", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("same")
					.baselinePdfFile("baseline")
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs using relative paths", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("../data/actualPdfs/same.pdf")
					.baselinePdfFile("../data/baselinePdfs/baseline.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("notSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("failed");
				expect(comparisonResults.message).to.equal(
					"notSame.pdf is not the same as baseline.pdf compared by their images."
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it("Should be able to verify different PDFs when actual is single page and baseline is multiple[Issue-27]", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("singlePageForIssue27.pdf")
					.baselinePdfFile("multiPageForIssue27.pdf")
					.compare();
				expect(comparisonResults.status).to.equal("failed");
				expect(comparisonResults.message).to.equal("Actual pdf page count (1) is not the same as Baseline pdf (2).");
			});

			it("Should be able to verify same PDFs using direct buffer", async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${cloneConfig.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${cloneConfig.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				const comparisonResults = await new ComparePdf()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs using direct buffer passing filename in another way", async () => {
				const actualPdfFilename = "same.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${cloneConfig.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${cloneConfig.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				const comparisonResults = await new ComparePdf()
					.actualPdfBuffer(actualPdfBuffer)
					.actualPdfFile(actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer)
					.baselinePdfFile(baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs using direct buffer", async () => {
				const actualPdfFilename = "notSame.pdf";
				const baselinePdfFilename = "baseline.pdf";
				const actualPdfBuffer = fs.readFileSync(`${cloneConfig.paths.actualPdfRootFolder}/${actualPdfFilename}`);
				const baselinePdfBuffer = fs.readFileSync(`${cloneConfig.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

				const comparisonResults = await new ComparePdf()
					.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
					.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
					.compare();
				expect(comparisonResults.status).to.equal("failed");
				expect(comparisonResults.message).to.equal(
					"notSame.pdf is not the same as baseline.pdf compared by their images."
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it("Should be able to verify same PDFs with Croppings", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("same.pdf")
					.baselinePdfFile("baseline.pdf")
					.cropPage(1, { "width": 530, "height": 210, "x": 0, "y": 415 })
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs with Multiple Croppings", async () => {
				const croppings = [
					{ "pageIndex": 0, "coordinates": { "width": 210, "height": 180, "x": 615, "y": 265 } },
					{ "pageIndex": 0, "coordinates": { "width": 210, "height": 180, "x": 615, "y": 520 } },
					{ "pageIndex": 1, "coordinates": { "width": 530, "height": 210, "x": 0, "y": 415 } }
				];

				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("same.pdf")
					.baselinePdfFile("baseline.pdf")
					.cropPages(croppings)
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify same PDFs with Masks", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("maskedSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.addMask(1, { "x0": 20, "y0": 40, "x1": 100, "y1": 70 })
					.addMask(1, { "x0": 330, "y0": 40, "x1": 410, "y1": 70 })
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify different PDFs with Masks", async () => {
				const masks = [
					{ "pageIndex": 1, "coordinates": { "x0": 20, "y0": 40, "x1": 100, "y1": 70 } },
					{ "pageIndex": 1, "coordinates": { "x0": 330, "y0": 40, "x1": 410, "y1": 70 } }
				];
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("maskedNotSame.pdf")
					.baselinePdfFile("maskBaseline.pdf")
					.addMasks(masks)
					.compare();
				expect(comparisonResults.status).to.equal("failed");
				expect(comparisonResults.message).to.equal(
					"maskedNotSame.pdf is not the same as maskBaseline.pdf compared by their images."
				);
				expect(comparisonResults.details).to.not.be.null;
			});

			it("Should be able to verify only specific page indexes", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("notSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.onlyPageIndexes([1])
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to verify only specific page indexes with pdfs having different page count", async () => {
				cloneConfig.settings.matchPageCount = false;
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("notSamePageCount.pdf")
					.baselinePdfFile("notSamePageCount.pdf")
					.onlyPageIndexes([0])
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});

			it("Should be able to skip specific page indexes", async () => {
				const comparisonResults = await new ComparePdf(cloneConfig)
					.actualPdfFile("notSame.pdf")
					.baselinePdfFile("baseline.pdf")
					.skipPageIndexes([0])
					.compare();
				expect(comparisonResults.status).to.equal("passed");
			});
		});
	}
});

describe("Compare Pdf By Base64 Tests", () => {
	let cloneConfig = undefined;
	before(() => {
		cloneConfig = _.cloneDeep(config);
	});

	it("Should be able to verify same PDFs", async () => {
		const comparisonResults = await new ComparePdf()
			.actualPdfFile("same.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to verify same PDFs using direct buffer", async () => {
		const actualPdfFilename = "same.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const actualPdfBuffer = fs.readFileSync(`${cloneConfig.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(`${cloneConfig.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

		const comparisonResults = await new ComparePdf(cloneConfig)
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to verify different PDFs", async () => {
		const comparisonResults = await new ComparePdf()
			.actualPdfFile("notSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"notSame.pdf is not the same as baseline.pdf compared by their base64 values."
		);
	});

	it("Should be able to verify different PDFs using direct buffer", async () => {
		const actualPdfFilename = "notSame.pdf";
		const baselinePdfFilename = "baseline.pdf";
		const actualPdfBuffer = fs.readFileSync(`${cloneConfig.paths.actualPdfRootFolder}/${actualPdfFilename}`);
		const baselinePdfBuffer = fs.readFileSync(`${cloneConfig.paths.baselinePdfRootFolder}/${baselinePdfFilename}`);

		const comparisonResults = await new ComparePdf(cloneConfig)
			.actualPdfBuffer(actualPdfBuffer, actualPdfFilename)
			.baselinePdfBuffer(baselinePdfBuffer, baselinePdfFilename)
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("failed");
		expect(comparisonResults.message).to.equal(
			"notSame.pdf is not the same as baseline.pdf compared by their base64 values."
		);
	});
});

describe("Compare Pdf Image Opts", () => {
	let comparePdfUT;

	it("Should be able to set image opts", async () => {
		const croppings = [
			{ "pageIndex": 0, "coordinates": { "width": 210, "height": 180, "x": 615, "y": 265 } },
			{ "pageIndex": 0, "coordinates": { "width": 210, "height": 180, "x": 615, "y": 520 } },
			{ "pageIndex": 1, "coordinates": { "width": 530, "height": 210, "x": 0, "y": 415 } }
		];

		comparePdfUT = await new ComparePdf(config)
			.actualPdfFile("maskedSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.cropPages(croppings)
			.addMask(1, { "x0": 20, "y0": 40, "x1": 100, "y1": 70 })
			.addMask(1, { "x0": 330, "y0": 40, "x1": 410, "y1": 70 })
			.onlyPageIndexes([0])
			.skipPageIndexes([1]);
		expect(comparePdfUT.opts).to.eql({
			"masks": [
				{ "pageIndex": 1, "coordinates": { "x0": 20, "y0": 40, "x1": 100, "y1": 70 }, "color": "black" },
				{ "pageIndex": 1, "coordinates": { "x0": 330, "y0": 40, "x1": 410, "y1": 70 }, "color": "black" }
			],
			"crops": croppings,
			"onlyPageIndexes": [0],
			"skipPageIndexes": [1]
		});
	});

	it("Should be able to get different set of opts", async () => {
		comparePdfUT = await new ComparePdf(config)
			.actualPdfFile("maskedSame.pdf")
			.baselinePdfFile("baseline.pdf")
			.cropPage(1, { "width": 530, "height": 210, "x": 0, "y": 415 })
			.addMask(1, { "x0": 20, "y0": 40, "x1": 100, "y1": 70 });
		expect(comparePdfUT.opts).to.eql({
			"masks": [{ "pageIndex": 1, "coordinates": { "x0": 20, "y0": 40, "x1": 100, "y1": 70 }, "color": "black" }],
			"crops": [{ "pageIndex": 1, "coordinates": { "width": 530, "height": 210, "x": 0, "y": 415 } }],
			"onlyPageIndexes": [],
			"skipPageIndexes": []
		});
	});
});

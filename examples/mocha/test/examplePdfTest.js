import ComparePdf from "compare-pdf";
import { expect } from "chai";
import { describe, it } from "mocha";
import config from "../config.js";

describe("Compare Pdf Tests in Mocha + Chai", () => {
	it("Should be able to compare pdfs by image", async () => {
		const comparisonResults = await new ComparePdf(config)
			.actualPdfFile("actualPdf")
			.baselinePdfFile("baselinePdf")
			.compare();
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to compare pdfs by base64", async () => {
		const comparisonResults = await new ComparePdf(config)
			.actualPdfFile("actualPdf")
			.baselinePdfFile("baselinePdf")
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("passed");
	});
});

import { describe, it } from "mocha";
import ComparePdf from "compare-pdf";
import * as chai from "chai";
const config = require("../config");

describe("Compare Pdf Tests in Mocha + Chai", () => {
	it("Should be able to compare pdfs by image", async () => {
		const comparePdf = await new ComparePdf(config);
		const results = await comparePdf.actualPdfFile("actualPdf").baselinePdfFile("baselinePdf").compare();

		chai.expect(results.status).to.equal("passed");
	});

	it("Should be able to compare pdfs by base64", async () => {
		const comparePdf = await new ComparePdf(config);
		const results = await comparePdf.actualPdfFile("actualPdf").baselinePdfFile("baselinePdf").compare("byBase64");

		chai.expect(results.status).to.equal("passed");
	});
});

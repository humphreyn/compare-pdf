const comparePdf = require("compare-pdf");
const chai = require("chai");
const expect = chai.expect;
const config = require("../config");

describe("Compare Pdf Tests in Mocha + Chai", function () {
	it("Should be able to compare pdfs by image", async function () {
		let comparisonResults = await new comparePdf(config)
			.actualPdfFile("actualPdf")
			.baselinePdfFile("baselinePdf")
			.compare();
		expect(comparisonResults.status).to.equal("passed");
	});

	it("Should be able to compare pdfs by base64", async function () {
		let comparisonResults = await new comparePdf(config)
			.actualPdfFile("actualPdf")
			.baselinePdfFile("baselinePdf")
			.compare("byBase64");
		expect(comparisonResults.status).to.equal("passed");
	});
});

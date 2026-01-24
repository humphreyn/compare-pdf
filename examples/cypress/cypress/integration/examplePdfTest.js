import { describe, before, it } from "mocha";
import * as chai from "chai";
import { cy } from "cypress";

describe("ToDo React", () => {
	before(() => {});

	it("should show the correct page title", async () => {
		cy.task("pdfCompare", {
			actualPdf: "actualPdf.pdf",
			baselinePdf: "baselinePdf.pdf"
		}).then((result) => {
			chai.expect(result.status).to.equal("passed");
		});
	});
});

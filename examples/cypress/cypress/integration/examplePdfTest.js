describe("ToDo React", function () {
	before(function () {});

	it("should show the correct page title", async function () {
		cy.task("pdfCompare", {
			"actualPdf": "actualPdf.pdf",
			"baselinePdf": "baselinePdf.pdf"
		}).then((result) => {
			expect(result.status).to.equal("passed");
		});
	});
});

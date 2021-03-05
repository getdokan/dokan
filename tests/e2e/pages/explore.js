const { ifError, strict } = require("assert");
const { assert } = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');

const { I } = inject();

module.exports = {
    checkDashboardElements() {
        I.amOnPage('/dashboard');
        I.seeInCurrentUrl('/dashboard/');
        I.waitForElement(locator.VendorContent);
        I.checkError();
        I.seeElement(locator.ProgressBar);
        I.seeElement(locator.LeftDashboard);
        I.seeElementInDOM(locator.SaleGraph);
        I.seeElementInDOM(locator.DashAnnountment);
        I.seeElementInDOM(locator.ProductWidget);
        // .then((result) => {
        //     console.log("This is success");
        //     console.log(result);
        // }).catch((err) => {
        //     console.log(err);
        //     console.log("This is error");
        // });
        //I.dontSeeElementInDOM(locator.ProductWidget)
    },
    checkProductPage() {
        I.amOnPage('/dashboard');
        I.click('Products');
        I.seeInCurrentUrl('/dashboard/products/');
        I.waitForElement(locator.ProductArea);
        I.checkError();
        I.seeElement('.active');
        I.seeElement('.active', 'All');
        I.see('Online');
        I.seeElement(locator.AddProductSpan, 'Add new Product');
        I.seeElement(locator.AddProductSpan, 'Import');
        I.seeElement(locator.AddProductSpan, 'Export');
        I.seeElement('form', 'All dates');
        I.seeElement('form', 'Select a category');
        I.seeElement('form', 'Filter');
        I.seeElement('form', 'Search Products');
        I.seeElement('form', 'Search');
        I.seeElement('form', 'Bulk Actions');
        I.seeElement('form', 'Apply');
        I.seeElement('table', '.dokan-checkbox');
        I.seeElement('table', 'Image');
        I.seeElement('table', 'Name');
        I.seeElement('table', 'Status');
        I.seeElement('table', 'SKU');
        I.seeElement('table', 'Stock');
        I.seeElement('table', 'Price');
        I.seeElement('table', 'Earning');
        I.seeElement('table', 'Type');
        I.seeElement('table', 'Views');
        I.seeElement('table', 'Date');
    },


}
const helpers = require('../../pages/helpers');
const locator = require('../../pages/locator');
var Factory = require('rosie').Factory;
var faker = require('faker');

Feature('Vendor registration Functionality');

Scenario('Check Vendor Registration Functionality', async ({ I }) => {
    helpers.pageStatus();
    helpers.vendorRegisterSuccess();
    /* Why use this condition: New Vendor Buy a subscription pack, 
            if vendor subscription module enable then show subscriptio otherwise ignore this step*/
    let validateCheckoutPage = await I.grabNumberOfVisibleElements("#customer_details > div.col-1 > div > h3");
        if (validateCheckoutPage >= 1) {
            I.fillField(locator.BillingFirstName, locator.FirstName);
            I.fillField(locator.BillingLastName, locator.Lastname);
            I.fillField(locator.BillingCompanyName, faker.company.companyName());
            I.fillField(locator.BillingAddress, 'United States');
            I.fillField(locator.BillingCity, faker.address.city());
            I.fillField(locator.BillingPhone, faker.phone.phoneNumberFormat());
            I.fillField(locator.BillingEmail, locator.VendorEmailAddress);
            I.fillField('#billing_postcode',faker.random.arrayElement(['10010','10001','10005']));
            I.wait(5);
            I.click(locator.PlaceOrderBtn);
            I.waitForText(locator.OrderSuccessMsg, 30, '.woocommerce-order');
            I.waitInUrl('/?page=dokan-seller-setup', 5);
            I.click('Not right now');
            I.seeInCurrentUrl('/dashboard');
        }else{
            I.click('Not right now');
            I.seeInCurrentUrl('/dashboard');
        }
    helpers.checkVendor();
}).tag('@registration').tag('@multipleScenario');
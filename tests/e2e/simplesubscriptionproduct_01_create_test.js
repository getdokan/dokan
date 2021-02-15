Feature('simplesubscriptionproduct_01_create');
const locator = require('../../pages/product_locator');
 var faker = require('faker');
 const { fake } = require('faker');

Scenario('test something', ({ I, product }) => {
    I.loginAsVendor();
    product.CreateProduct('Dokan Online Class','100','Uncategorized');
    I.selectOption(locator.ProductTypeInput,'Simple subscription');
    I.fillField(locator.SimpleSubscriptionproductPrice,'100');
    I.selectOption(locator.SubscriptionInterval,'every');
    I.selectOption(locator.SubscriptionPeriod,'day');
    I.fillField(locator.SubscriptionDiscountPrice,'20');
    I.selectOption(locator.ExpirationSubscription,'Never expire');
    I.fillField(locator.SignUpfee,'10');
    I.fillField(locator.FreeTrial,'10');
    I.selectOption(locator.TrialPeriod,'day');
    I.click(locator.SaveProduct);

});

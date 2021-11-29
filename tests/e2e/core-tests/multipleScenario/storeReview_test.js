var faker = require('faker');
Feature('Store Review');

Scenario('Customer submit a review for vendor', ({ I }) => {
    I.registrationAsCustomer();
    I.amOnPage('/store/vendor-one/reviews/');
    I.click('Write a Review');
    // I.click('//*[@id="dokan-seller-rating"]/div/div[2]/svg[5]/polygon');
    I.fillField('#dokan-review-title', faker.lorem.sentence());
    I.fillField('#dokan-review-details', faker.lorem.paragraph());
    I.click('Submit');
}).tag('@store-review').tag('@multipleScenario');
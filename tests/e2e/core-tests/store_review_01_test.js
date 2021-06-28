var faker = require('faker');

Feature('Customer registration Functionality');

Scenario('test something', ({ I }) => {
    // I.amOnPage('/my-account/');
    // I.fillField('Email address', faker.internet.email());
    // I.fillField('#reg_password', faker.internet.password());
    // I.checkOption('I am a customer');
    // I.click('Register');
    // I.seeInCurrentUrl('/my-account');
    I.registrationAsCustomer();
    I.amOnPage('/store/vendor-one/reviews/');
    I.click('Write a Review');
    // I.click('//*[@id="dokan-seller-rating"]/div/div[2]/svg[5]/polygon');
    I.fillField('#dokan-review-title', 'very bad store');
    I.fillField('#dokan-review-details', 'this is the one of the bad store');
    I.click('Submit');
});
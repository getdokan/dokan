var faker = require('faker');

Feature('Customer registration Functionality');

Scenario('test something', ({ I }) => {
    I.amOnPage('/my-account/');
    I.fillField('Email address', faker.internet.email());
    // I.fillField('#reg_password', faker.internet.password());
    I.checkOption('I am a customer');
    I.click('Register');
    I.seeInCurrentUrl('/my-account');
});

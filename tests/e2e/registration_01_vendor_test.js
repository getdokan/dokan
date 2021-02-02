// var Factory = require('rosie').Factory;
var faker = require('faker');
// const { name } = require('faker');

Feature('Vendor registration Functionality');

Scenario('test something', ({ I }) => {
    I.amOnPage('/my-account/');
    I.fillField('Email address', faker.internet.email());
    // I.fillField('#reg_password', faker.internet.password());
    I.checkOption('I am a vendor');
    I.fillField('First Name', faker.name.firstName());
    I.fillField('Last Name', faker.name.lastName());
    I.fillField('Shop Name', faker.name.lastName());
    I.fillField('Phone Number', faker.phone.phoneNumber());
    I.click('Register');
    // I.see('Welcome to the Marketplace!', '.wc-setup-content');
    // I.click('Not right now');
    // I.click('/html/body/div[1]/p[3]/a[2]');
    I.seeInCurrentUrl('/dashboard/');
});


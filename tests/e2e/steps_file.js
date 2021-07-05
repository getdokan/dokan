// in this file you can append custom step methods to 'I' object
var faker = require('faker');

module.exports = function() {
    return actor({

        // Define custom steps here, use 'this' to access default methods of I.
        // It is recommended to place a general 'login' function here.
        checkError: function() {
            this.dontSee('Warning');
            this.dontSee('Fatal error');
            this.dontSee('Notice:');
        },
        loginAsAdmin: function() {
            this.amOnPage('/wp-admin/');
            //this.click('Log in');
            this.fillField('#user_login', 'admin');
            this.fillField('#user_pass', 'admin');
            this.click('Log In');
            this.amOnPage('/wp-admin/');
        },
        loginAsVendor: function() {
            this.amOnPage('/my-account/');
            // this.click('Log in');
            this.fillField('username', 'vendor-one');
            this.fillField('password', secret('123456'));
            this.click('login');
        },
        loginAsVendorTwo: function() {
            this.amOnPage('/my-account/');
            // this.click('Log in');
            this.fillField('username', 'vendor-two');
            this.fillField('password', '123456');
            this.click('login');
        },
        loginAsCustomer: function() {
            this.amOnPage('/my-account/');
            this.fillField('username', 'customer-one');
            this.fillField('password', secret('123456'));
            this.click('login');
        },
        registrationAsCustomer: function() {
            this.amOnPage('/my-account/');
            this.fillField('Email address', faker.internet.email());
            this.fillField('#reg_password', faker.internet.password());
            this.checkOption('I am a customer');
            this.click('Register');
            this.seeInCurrentUrl('/my-account');
        },

    });
}
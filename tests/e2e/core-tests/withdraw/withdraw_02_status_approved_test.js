var faker = require('faker');
Feature('withdraw request approved');

Scenario('Admin change status from withdraw menu', ({ I ,loginAs }) => {
    loginAs('admin');
    I.click('Dokan');
    I.click('#toplevel_page_dokan');
    I.click('Withdraw');
    I.wait(5);
    // I.checkOption(Locator::firstElement('//input[@name="item[]"]'));
    I.checkOption('//input[@name="item[]"]');
    I.selectOption('#bulk-action-selector-top',faker.random.arrayElement(['Approve','Cancel','delete']));
    I.click('Apply');

}).tag('@withdraw');

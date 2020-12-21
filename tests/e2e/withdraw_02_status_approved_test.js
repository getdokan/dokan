Feature('withdraw request approved');

Scenario('test something', ({ I }) => {
    I.loginAsAdmin();
    I.click('Dokan');
    I.click('#toplevel_page_dokan');
    I.click('Withdraw');
    I.wait(5);
    // I.checkOption(Locator::firstElement('//input[@name="item[]"]'));
    I.checkOption('//input[@name="item[]"]');
    I.selectOption('#bulk-action-selector-top','Approve');
    I.click('Apply');
});

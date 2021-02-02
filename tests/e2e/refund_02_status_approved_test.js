Feature('refund request approved');

Scenario('Approve Refund request', ({ I }) => {
    I.loginAsAdmin();
        I.click('#toplevel_page_dokan');
        I.click('Refunds');
        I.wait(5);
        // I.checkOption(Locator::firstElement('//input[@name="item[]"]'));
        I.checkOption('//table/tbody/tr/td[1]');
        I.selectOption('#bulk-action-selector-top','Approve Refund');
        I.click('Apply');       
        I.wait(10);
});

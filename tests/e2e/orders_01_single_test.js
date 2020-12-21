Feature('Single orders Functionality');

Scenario('Customer single Order', (I) => {
    I.loginAsCustomer();
    I.viewSingleProduct();
    I.placeOrder();
});

Scenario('Vendor Update Order Status', ({ I }) => {
    I.loginAsVendor();
    I.click('Orders');
        I.click('//form[@id="order-filter"]/table/tbody/tr/td[2]/a/strong');    
        I.wait(5);
        I.click('.dokan-edit-status');
        I.selectOption('#order_status','Completed');
        I.click('Update');
        I.wait('5');
        I.waitForElement('.dokan-panel-body.general-details', 30);
    I.see('Completed');
});

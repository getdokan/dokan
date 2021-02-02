Feature('refund Request Functionality');

Scenario('test something', ({ I }) => {
    I.loginAsVendor();
    	I.click('Orders');
        // I.click(Locator::elementAt('//table/tbody/tr/td[2]', 1));
       // I.click('//table/tbody/tr/td[2]');
        I.click({css:'tr:nth-child(1) strong'});   
        I.wait(5);
        I.click('Request Refund');
        I.fillField('.refund_order_item_qty','1');       
        I.click('#woocommerce-order-items');
        I.click('Submit Refund Request');
        I.acceptPopup();
        I.wait(5);
        I.acceptPopup();
});
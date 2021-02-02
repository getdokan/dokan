Feature('modules/auction_product_02_order');

Scenario('Order Auction Product', ({ I }) => {
    I.loginAsCustomer();
    I.amOnPage('/shop/');
    I.selectOption('//select[@name="orderby"]','Sort by latest');
    I.wait(5);
    I.click('//main[@id="main"]/ul/li/a/img');
    I.wait(5);
    I.click('Bid');
    I.wait(5);
    session('2nd Customer bid', () => { 
        I.loginAsCustomerTwo();
        I.amOnPage('/shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.wait(5);
        I.click('Bid');
        I.wait(2);
        I.click('Bid');
        I.click('Bid');
        I.click('Bid'); 
    });   

});

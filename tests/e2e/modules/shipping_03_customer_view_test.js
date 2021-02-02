Feature('modules/shipping_03_customer_view');

Scenario('customerViewShipping', ({ I }) => {
    I.loginAsCustomer();
        I.amOnPage('/shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.placeOrder();
});


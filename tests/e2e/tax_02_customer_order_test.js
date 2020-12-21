Feature('customer order with tax');

Scenario('Customer order', ( { I }) => {
    I.loginAsCustomer();
        I.amOnPage('/shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        // I.wait(5);
        // I.click('//button[@name="add-to-cart"]');
        // I.click('View cart');
        // I.click('Proceed to checkout');
        I.wait(5);
        I.placeOrder();
        //I.click('//div[@id="payment"]/div/button');
});

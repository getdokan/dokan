Feature('modules/product_addon_02_order');

Scenario('test something', ({ I }) => {
     session('Customer view',()=>{
        I.loginAsCustomer();
        I.click('Shop');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.click('.wc-pao-addon-field');
        I.appendfield('.wc-pao-addon-field','SAusage (+£10.00)');
        I.wait(3);
        I.placeOrder();
        I.wait(3);
    })
});

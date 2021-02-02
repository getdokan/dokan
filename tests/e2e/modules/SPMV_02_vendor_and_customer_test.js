Feature('modules/SPMV_02_vendor_and_customer');

Scenario('single product from multiple vendor & customer view', ({ I }) => {
    I.loginAsVendor();
    I.amOnPage('/dashboard/products/');
        I.addNewProduct();
        I.see('Online');

    session('Vendor Two', () => {
        I.loginAsVendorTwo();
        I.amOnPage('Shop');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.click('dokan_sell_this_item');
        I.wait(3);
        I.fillField('#_regular_price', '100');
        I.click('dokan_update_product');
    });

    session('Customer', () => {
        I.loginAsCustomer();
          I.click('Shop');
          I.selectOption('//select[@name="orderby"]','Sort by latest');
          I.wait(5);
          I.click('//main[@id="main"]/ul/li/a/img');
          I.scrollTo('#primary', 100,500);
          I.wait();
    });
});


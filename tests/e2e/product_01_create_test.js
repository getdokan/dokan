Feature('Add product Functionality');

// Before((I, loginAs) => { // or Background
// 	loginAs('vendor');
//   });

Scenario('Vendor Add New Product', ({ I,product}) => {
    // I.loginAsVendor();
    I.loginAsVendorTwo();
    product.CreateProduct('Burger','250','Uncategorized');
    I.fillField('_sale_price','250');
    I.click('Schedule');
    I.fillField('_sale_price_dates_from','2020-06-01');
    I.fillField('_sale_price_dates_to','2020-12-30');
    I.wait(2);
    // I.attachFile('.dokan-feat-image-btn', '/data/images.jpeg');
    I.selectOption('#product_cat', 'Uncategorized');
    I.click('Save Product');
    I.see('Edit Product');
    I.see('View Product');

});

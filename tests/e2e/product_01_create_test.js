Feature('Add product Functionality');

// Before((I, loginAs) => { // or Background
// 	loginAs('vendor');
//   });

Scenario('Vendor Add New Product', ({ I }) => {
    // I.loginAsVendor();
    I.loginAsVendor();
    I.amOnPage('/dashboard/products/');
    I.click('Add new product');
     // pause();
      // Add galeery photo
        // I.click('.dokan-product-gallery');
        // I.click('a.add-product-images');
        // I.click('//*[@id="__attachments-view-119"]/li[1]');
        // I.click('Add to gallery');
        // I.click('form .add-product-images');
        // I.click('//*[@id="__attachments-view-119"]/li[2]');
        // I.click('Add to gallery');
        // I.click('form .add-product-images');
        // I.click('//*[@id="__attachments-view-119"]/li[3]');
        // I.click('Add to gallery');
        //End gallery script
    I.fillField('post_title','Green Cap 20');
    I.fillField('_regular_price','300');
    I.fillField('_sale_price','250');
    I.click('Schedule');
    I.fillField('_sale_price_dates_from','2020-06-01');
    I.fillField('_sale_price_dates_to','2020-12-30');
    I.wait(2);
    I.attachFile('.dokan-feat-image-btn', '/data/images.jpeg');
    I.selectOption('#product_cat', 'c1');
    I.click('#dokan-create-new-product-btn');
    I.see('Edit Product');
    I.see('View Product');

});

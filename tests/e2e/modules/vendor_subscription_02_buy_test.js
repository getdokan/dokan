Feature('vendor_subscription_02_buy');

Scenario('vendorBuySubscription', ({ I }) => {
    I.loginAsVendorTwo();
        I.click('Products');
        // Check vendor have subscription or not 
        // if (I.tryToDontSeeLink('update your package'))
        // {
        //     I.see('Add new product');
        //     // I.closeBrowser();
        // }
        // // I.try
        // I.seeLink('update your package');
        I.click({ css : '.dokan-info > a'});
        I.wait(5);
        I.click({ css : '.product_pack_item:nth-child(1) .dokan-btn'});
        I.wait(3);
        //Fillup Form Field
        
        I.click('//*[@id="place_order"]');
        I.dontSee('.woocommerce-NoticeGroup.woocommerce-NoticeGroup-checkout');
        I.wait(5);

        ///Admin Approver Vendor Subscription Request
        session('Admin Approve', () => {
            I.loginAsAdmin();
            I.click('WooCommerce');
            I.wait(3);
            I.click('//td/a');
            I.wait(3);
            I.click('Completed');
        });

        // $AdminApprove = I.haveFriend('AdminApprove');
        // $AdminApprove->does(function(AcceptanceTester $I){
        //     I.loginAsAdmin();
        //     I.click('WooCommerce');
        //     I.wait(3);
        //     I.click('//td/a');
        //     I.wait(3);
        //     I.click('Completed');
        // });
        // $AdminApprove->leave();  

        I.click('Dashboard');
        I.click('Products');
            I.click('Add new product');
            I.fillField('post_title','Yellow Cap');
            I.fillField('_regular_price','200');
            I.fillField('_sale_price','180');
            I.click('Schedule');
            I.fillField('_sale_price_dates_from','2020-06-01');
            I.fillField('_sale_price_dates_to','2020-12-30');
            I.wait(2);
            I.selectOption('#product_cat', 'cloth');
            I.click('#dokan-create-new-product-btn');
            I.see('Edit Product');
            I.see('View Product');
        // $product->create('Red Shoe','1500','Uncategorized');
        // I.wait(5);
});

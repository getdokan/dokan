Feature('modules/auction_product_02_add_test');

Scenario('Create Auction Product', ({I}) => {
    I.loginAsVendor();
    I.click('Auction');
    I.click('Add New Auction Product');
    I.wait('5');
    I.fillField('#post-title','New Auction Product');
    I.selectOption('product_cat','Uncategorized');
    I.checkOption('#_auction_proxy');
    I.fillField('_auction_start_price','2');
    I.fillField('_auction_bid_increment','1');
    I.fillField('#_auction_reserved_price','3');
    I.fillField('#_regular_price','3');
    I.click('//input[@id="_auction_dates_from"]');
    I.wait(2);
    I.click('Now');
    I.click('//input[@id="_auction_dates_to"]');
     I.wait(2);
     I.click('Now');
     I.selectOption({css:'.ui_tpicker_minute_slider > .ui-timepicker-select'},'30');
    // I.pressKey('//dd[3]/div/select','50');
     I.wait(5);
    I.click('Add auction Product');
    I.wait(3);
    I.see('Success! The product has been updated successfully.');
});

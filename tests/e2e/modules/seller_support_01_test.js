Feature('modules/seller_support_01');

Scenario('test something', ({ I }) => {
    I.loginAsVendor();
    I.click('Settings');
    I.click('Store');
    I.wait(3);
    I.checkOption('#support_checkbox');
    I.scrollTo('#dokan_support_btn_name',20,40);
    I.fillField('#dokan_support_btn_name','Want to need support');
    I.click('Update Settings');
    I.wait(5);
    session('Customer send query through support', () => {
              I.loginAsCustomer();
              I.amOnPage('/store/vendor-one/');
          // I.click('Store List');
          // I.wait(2);
          // I.click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
          // I.wait(5);
          I.click('Want to need support');
          I.wait(5);
          I.fillField('#dokan-support-subject','need support');
         // I.click('//select[@name="order_id"]');
          //I.click({Locator:'elementAt("//option[2]", 1)'});
          I.fillField('#dokan-support-msg','This product is too bad');
          I.click('Submit');
          I.wait(5);

});
     I.wait(4);
     I.amOnPage('/dashboard/support/');
     I.wait(2);
     I.click({css:'tr:nth-child(1) > td:nth-child(2) > a'});
     I.wait(2);
     I.fillField('comment','ok done');
     I.selectOption('.dokan-support-topic-select','Close Ticket');
     I.click('Submit Reply');
     I.wait(5);

     session('Customer check vendor ticket Reply', () => {
              I.loginAsCustomer();
          //$I->click('Store List');
          I.wait(2);
          I.click('My account');
          I.wait(2);
          I.click('Seller Support Tickets');
          I.click('All Tickets');
          //I.click(Locator::elementAt('//td/a', 1));
          I.scrollTo('.woocommerce-MyAccount-content', 50,50);
          I.wait(5);
     });
});

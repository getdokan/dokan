Feature('stripe_03_customer_order');

Scenario('Customer payment with dokan stripe', ({ I }) => {
    // I.loginAsCustomer();
    I.amOnPage('/my-account/');
   // I.fillField('Username or email address', 'customer');
   // I.fillField('Password', 'aa');
   // I.click('Login');
   /*I.amOnPage('/shop/');
   I.selectOption('//select[@name="orderby"]','Sort by latest');
   I.wait(5);
   I.click('//main[@id="main"]/ul/li/a/img');
   I.click('Add to cart');
   I.click('View cart');
   I.click('Proceed to checkout');*/
   // I.amOnPage('/checkout/');
   // I.scrollPageToBottom();
   // I.click('#payment_method_dokan-stripe-connect');
   // // I.forceClick('cardnumber');
   // pause();
   // I.fillField('//input[@name="cardnumber"]', '4242 4242 4242 4242');
   // I.fillField('//input[@name="exp-date"]', '02/27');
   // I.fillField('cvc', '1234');         
   // I.click('Place order');
   // I.fillField('#dokan-stripe-connect-card-number','customerone@gmail.com');
   // I.fillField('#dokan-stripe-connect-card-number','4242 4242 4242 4242');
   // I.fillField('#dokan-stripe-connect-card-expiry','02/27');
   // I.fillField('#dokan-stripe-connect-card-cvc','1234');
   // I.click('Place order');
   // I.wait(3);
//   	I.waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
   // I.see('Thank you. Your order has been received.');
});


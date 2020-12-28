Feature('mdules/booking_02_customer module');

Scenario('Customer book product', ({ I }) => {
    I.loginAsCustomer();
        I.amOnPage('/shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.click('//main[@id="main"]/ul/li/a/img')
        I.click('//td/a');
        I.click('#wc-bookings-form-start-time');
        I.click('//select/option[2]');
        I.click('#wc-bookings-form-end-time');
        I.click('//select/option[2]');
        // I.wait(5);
        //  I.click('#wc-bookings-form-end-time');
        // I.selectOption('start_time', '12:00 am');
        // I.selectOption('end_time', '2:00 am (2 Hours)');
        //  I.click('//div[2]/select/option[2]');
         //select/option[2]
        //I.selectOption('#wc-bookings-form-end-time','10:00 pm (4 Hours)');
        // I.wait(6);
        I.click('Book now');
        I.wait(3);

        I.amOnPage('/cart/');
		I.click('Proceed to checkout');
		I.wait(5);
		I.click('//div[@id="payment"]/div/button');
		// I.waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
		I.see('Thank you. Your order has been received.');

});


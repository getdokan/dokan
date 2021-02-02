Feature('modules/Dokan stripe Payments Functionality');


Scenario('Admin settings with dokan stripe setup', ({ I }) => {
	I.amOnPage('/wp-admin');
	I.fillField('Username or Email Address', 'Dokan_Admin');
	I.fillField('Password', 'ohjcw6j3mLdN9q7s$f');
	I.checkOption('Remember Me');
	I.click('wp-submit');
		//admin settings
		I.click('WooCommerce');
        I.amOnPage('/wp-admin/admin.php?page=wc-settings');
        I.click('Payments');
        I.click({css: 'tr:nth-child(7) .wc-payment-gateway-method-title'});
        I.checkOption('#woocommerce_dokan-stripe-connect_enabled');
        I.checkOption('#woocommerce_dokan-stripe-connect_testmode');
        I.uncheckOption('Enable Stripe Checkout');
        I.fillField('#woocommerce_dokan-stripe-connect_test_secret_key','sk_test_DoMOe1KGxXxEqDi0DWqRqggp00zHAkctNi');
        I.fillField('#woocommerce_dokan-stripe-connect_test_publishable_key','pk_test_Hg1UlS12grPn9EMWCj3j9qng00VYJ7sx4w');
        I.fillField('#woocommerce_dokan-stripe-connect_test_client_id','ca_GNk3MaeyPFft911y4ruiyZeZirFMsSl5');
        I.click('Save changes');
	        I.click('Dokan');
	        I.wait(3);
	        I.click('Settings');
	        I.click('Withdraw Options');
	       	I.checkOption('Stripe');
         	I.click('Save Changes');
    I.moveCursorTo('#wp-admin-bar-top-secondary');
	I.click('Log Out');
});

Feature('stripe_02_vendor_connect');

Scenario('Vendor connect with dokan stripe', ({ I }) => {
	// I.loginAsVendor();
	I.amOnPage('/my-account/');
	I.fillField('Username or email address', 'vendor-one');
	I.fillField('Password', '123456');
	I.click('Login');
 	I.amOnPage('/dashboard/settings/payment/');
 	I.click('//a[@class="clear"]//img');
 	// I.dontSee('Your account is not connected to Stripe. Connect your Stripe account to receive payouts.');
 	I.click('#skip-account-app');
 	I.wait(5);
 	I.waitUrlEquals('dashboard/settings/payment/');
 	I.see('Your account is connected with Stripe');
});


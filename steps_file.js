// in this file you can append custom step methods to 'I' object
var faker = require('faker');
const { fake } = require('faker');

module.exports = function() {
  return actor({

    // Define custom steps here, use 'this' to access default methods of this.
    // It is recommended to place a general 'login' function here.
    checkError: function () {
        this.dontSee('Warning');
        this.dontSee('Fatal error');
        this.dontSee('Notice:');
      },
    loginAsAdmin: function () {
      this.amOnPage('/wp-admin');
      //this.click('Log in');
      this.fillField('#user_login', 'admin');
      this.fillField('#user_pass', 'admin');
      this.click('Log In');
    },
    loginAsVendor: function () {
      this.amOnPage('/my-account/');
        // this.click('Log in');
        this.fillField('username', 'vendor-one');
        this.fillField('password', '123456');
        this.click('login');
    },
    loginAsVendorTwo: function () {
      this.amOnPage('/');
        this.click('Log in');
        this.fillField('username', 'vendor-two');
        this.fillField('password', '123456');
        this.click('login');
    },
    loginAsCustomer: function () {
      this.amOnPage('/');
        this.click('Log in');
        this.fillField('username', 'customer');
        this.fillField('password', '123456');
        this.click('login');
    },
    addProduct: function () {
      this.click('.products');	
      this.dontSee('.dokan-alert.dokan-alert-warning');
      this.click('.dokan-add-product-link a');
      this.fillField('.dokan-form-control', 'Gold Color Shoe');
      this.fillField('_regular_price', '500');
      this.selectOption('#product_cat', 'Uncategorized');
      this.click('#dokan-create-new-product-btn');
    },
    viewSingleProduct: function () {
      this.click('Shop');
      this.amOnPage('/dokan/shop/?orderby=date');
      this.wait(5);
      this.click('//main[@id="main"]/ul/li/a/img');
    },

    viewMultipleProduct: function () {
      // this.click('Shop');
      // this.amOnPage('/dokan/shop/?orderby=date');
      //   this.click('//main[@id="main"]/ul/li/a/img');
      //   this.click('Add to cart');
      this.amOnPage('/store-listing/');
        this.click({ css :'.dokan-single-seller:nth-child(1) .store-content a'})
        this.click('//li[1]/a/img');
            this.click('Add to cart');
        this.click('Vendor Info');
        this.click('.details');
        this.click('.details a');
        this.click('//li[2]/a/img');
        this.waitForElement('.woocommerce-notices-wrapper', 30);
    },

    viewMultipleVendorMultipleProduct: function () {
      this.amOnPage('store-listing/');
			this.click({ css : '.dokan-single-seller:nth-child(2) .store-content a'});
			this.click('//li[2]/a/img');
			this.click('Add to cart');
		this.amOnPage('store-listing/');
			this.click({ css : '.dokan-single-seller:nth-child(2) .store-content a'});
			this.click('//li[2]/a/img');
			this.click('Add to cart');
    },
    placeOrder: function () {
        this.click('Add to cart');
      // this.click('View cart');
      this.amOnPage('/cart/');
      this.click('Proceed to checkout');
      this.seeInCurrentUrl('/checkout');
        this.fillField('#billing_first_name', faker.name.firstName());
        this.fillField('#billing_last_name', faker.name.lastName());
        this.fillField('#billing_company', faker.company.companyName());
        // this.selectOption('#select2-billing_country-container', randomGenerate()->country);
        this.fillField('#billing_address_1', faker.address.streetAddress());
        this.fillField('#billing_city', faker.address.city());
        this.fillField('#billing_phone', faker.phone.phoneNumberFormat());
        this.fillField('#billing_email', faker.internet.email());
      // this.waitForElementVisible('checkout', 30);
      // this.wait(10);
      // this.see('Place order');
      // this.click('//div[@id="payment"]/div/button');
      this.click('Place order');
      // this.wait(5);
      this.waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
      this.see('Thank you. Your order has been received.');
    },
    updateOrderStatus: function () {
      this.click('Orders');
          // this.click(Locator::elementAt('//table/tbody/tr/td[2]', 1));
          this.click('//table/tbody/tr/td[2]');
	        this.wait(5);
	        this.see('edit');
	        this.click('.dokan-edit-status');
	          // this.orderStatusTest();
	        this.selectOption('#order_status','Completed');
	        this.click('Update');
	        this.wait('5');
	        this.click('Orders');
          // this.click(Locator::elementAt('//table/tbody/tr/td[2]', 2));
          this.click('//table/tbody/tr/td[2]');
	        this.wait(5);
	        this.see('edit');
	        this.click('.dokan-edit-status');
	          // this.orderStatusTest();
	        this.selectOption('#order_status','Completed');
	        this.click('Update');
	        this.wait('5');
	        this.click('Orders');
          // this.click(Locator::elementAt('//table/tbody/tr/td[2]', 3));
          this.click('//table/tbody/tr/td[2]');
	        this.wait(5);
	        this.see('edit');
	        this.click('.dokan-edit-status');
	          // this.orderStatusTest();
	        this.selectOption('#order_status','Completed');
	        this.click('Update');
	        this.wait('5');
    },
    addNewProduct: function () {
      this.click('Add new product');
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
        this.fillField('post_title','Green Cap');
        this.fillField('_regular_price','300');
        this.fillField('_sale_price','250');
        this.click('Schedule');
        this.fillField('_sale_price_dates_from','2020-06-01');
        this.fillField('_sale_price_dates_to','2020-12-30');
        this.wait(2);
        this.selectOption('#product_cat', 'cloth');
        this.click('#dokan-create-new-product-btn');
        this.see('Edit Product');
        // I.see('View Product');
    },    
    stripePayment: function () {
      this.checkOption('Dokan Credit card (Stripe)');
          this.pressKey('Tab');
          this.pressKey('Tab');
          this.wait(5);
          this.type('4242424242424242');
          this.wait(2);
          this.type('12');
          this.wait(2);
          this.type('21');
          this.wait(2);
          this.type('121');
          this.wait(2);
    },
    wirecardCreditCardPayment: function () {
      this.checkOption('Wirecard Credit Card');
          this.pressKey('Tab');
          this.wait(5);
          this.fillField('dokan-moip-connect-card-number', '4012001037141112');
          this.wait(2);
          this.fillField('dokan-moip-connect-card-expiry', '1221');
          this.wait(2);
          this.fillField('dokan-moip-connect-card-cvc', '121');
          this.wait(2);
          this.fillField('#billing_cpf', '122323');
          this.wait(2);
    },
  });
}

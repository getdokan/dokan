<?php
namespace Step\Acceptance;
use Codeception\Util\Locator;

class MultiSteps extends \AcceptanceTester
{
	public function loginAsAdmin()
	{
		$I = $this;
		$I->amOnPage('/wp-admin');
         //$I->click('Log in');
         $I->fillField('#user_login', 'admin');
         $I->fillField('#user_pass', 'admin');
         $I->click('Log In');
	}
	public function loginAsVendor()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'vendor-one');
        $I->fillField('password', '123456');
        $I->click('login');
	}
	public function loginAsVendorTwo()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'vendor-two');
        $I->fillField('password', '123456');
        $I->click('login');
	}
	public function loginAsCustomer()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'customer');
        $I->fillField('password', '123456');
        $I->click('login');
	}
	public function addProduct()
	{
		$I = $this;
		$I->click('.products');	
		$I->dontSee('.dokan-alert.dokan-alert-warning');
		$I->click('.dokan-add-product-link a');
		$I->fillField('.dokan-form-control', 'Gold Color Shoe');
		$I->fillField('_regular_price', '500');
		$I->selectOption('#product_cat', 'Uncategorized');
		$I->click('#dokan-create-new-product-btn');
	}
	public function viewSingleProduct()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
    	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
     	$I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
     	// $I->click('//button[@name="add-to-cart"]');
	}
		public function viewMultipleProduct()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
		$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
		$I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
		$I->click('Add to cart');
		$I->amOnPage('store-listing/');
		$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
		$I->click('//div[@id="dokan-content"]/div[3]/ul/li[2]/a/img');
		// $I->click('//button[@name="add-to-cart"]');
	}
		public function viewMultipleVendorMultipleProduct()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
      	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      	$I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
      	$I->click('Add to cart');
      	$I->amOnPage('store-listing/');
      	$I->wait(5);
      	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li[2]/div/div[2]/a');
      	$I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
	}
	public function placeOrder()
	{
		$I = $this;
		$I->click('//button[@name="add-to-cart"]');
		$I->click('View cart');
		$I->click('Proceed to checkout');
		// $I->fillField('#billing_first_name', randomGenerate()->firstName);
		// $I->fillField('#billing_last_name', randomGenerate()->lastName);
		// $I->fillField('#billing_company', randomGenerate()->company);
		// // $I->selectOption('#select2-billing_country-container', randomGenerate()->country);
		// $I->fillField('#billing_address_1', randomGenerate()->address);
		// $I->fillField('#billing_city', randomGenerate()->city);
		// $I->fillField('#billing_phone', randomGenerate()->phoneNumber);
		// $I->fillField('#billing_email', randomGenerate()->email);
		$I->wait(5);
		$I->click('//div[@id="payment"]/div/button');

		// $I->click('//div[@id="payment"]/div/button', 'Place order');
		// $I->wait(10);

	}
	public function updateOrderStatus()
		{
	    	$I =$this;
	    	$I->click('Orders');
	        $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 1));
	        $I->wait(5);
	        $I->see('edit');
	        $I->click('.dokan-edit-status');
	          // $I->orderStatusTest();
	        $I->selectOption('#order_status','Completed');
	        $I->click('Update');
	        $I->wait('5');
	        $I->click('Orders');
	        $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 2));
	        $I->wait(5);
	        $I->see('edit');
	        $I->click('.dokan-edit-status');
	          // $I->orderStatusTest();
	        $I->selectOption('#order_status','Completed');
	        $I->click('Update');
	        $I->wait('5');
	        $I->click('Orders');
	        $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 3));
	        $I->wait(5);
	        $I->see('edit');
	        $I->click('.dokan-edit-status');
	          // $I->orderStatusTest();
	        $I->selectOption('#order_status','Completed');
	        $I->click('Update');
	        $I->wait('5');
		}
}
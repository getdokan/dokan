<?php
namespace Step\Acceptance;

class Product extends \AcceptanceTester
{
	public function viewSingleProduct()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
    	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
     	$I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
     	// $I->click('//button[@name="add-to-cart"]');
     	
	}
		public function viewMultipleProduct()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
		$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
		$I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
		$I->click('Add to cart');
		$I->amOnPage('store-listing/');
		$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
		$I->click('//div[@id="dokan-content"]/div[4]/ul/li[2]/a/img');
		// $I->click('//button[@name="add-to-cart"]');
	}
		public function viewMultipleVendorMultipleProduct1()
	{
		$I = $this;
		$I->amOnPage('store-listing/');
      	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      	$I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
      	$I->click('Add to cart');
      	$I->amOnPage('store-listing/');
      	$I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li[2]/div/div[2]/a');
      	$I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
	}
}
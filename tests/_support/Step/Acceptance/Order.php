<?php
namespace Step\Acceptance;

class Order extends \AcceptanceTester
{
	public function orderProcessing()
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
}
	function randomGenerate() {
			return \Faker\Factory::create();
	}

<?php
namespace Step\Acceptance;

class Commissions extends \AcceptanceTester
{
	public function chooseGlobalCommission()
	{
		$I = $this;
		$I->click('Dokan');
        $I->click('Settings');
        $I->wait(5);
        $I->click(['link' => 'Selling Options']);
	}
	public function setFlatCommission()
	{
		$I = $this;
		$I->wait(5);
		$I->selectOption('#dokan_selling[commission_type]', 'Flat');
        $I->fillField('#dokan_selling[admin_percentage]', '15');
        $I->click('#dokan_selling #submit');
        $I->waitForElementVisible('#setting-message_updated', 5);
        $I->waitForElement('.metabox-holder', 30);
	}
	public function setPercentageCommission()
	{
		$I = $this;
		$I->wait(5);
        $I->selectOption('#dokan_selling[commission_type]', 'Percentage');
        $I->fillField('#dokan_selling[admin_percentage]', '10');
        $I->click('#dokan_selling #submit');
	}
		public function setCombineCommission()
	{
		$I = $this;
		$I->wait(5);
        $I->selectOption('#dokan_selling[commission_type]', 'Combine');
        $I->fillField('#dokan_selling[additional_fee][percent_fee]', '5');
        $I->fillField('#dokan_selling[additional_fee][fixed_fee]', '10');
        $I->click('#dokan_selling #submit');
	}

}
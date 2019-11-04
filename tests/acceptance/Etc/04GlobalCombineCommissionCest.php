<?php 
// namespace Commissions;


class GlobalCombineCommissionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function setCommission(\Step\Acceptance\Login $I)
    {
    	$I->loginAsAdmin();
    	$I->click('Dokan');
        $I->click('Settings');
        $I->wait(5);
        $I->click(['link' => 'Selling Options']);
        $I->wait(5);
        $I->selectOption('#dokan_selling[commission_type]', 'Combine');
        $I->fillField('#dokan_selling[additional_fee][percent_fee]', '5');
        $I->fillField('#dokan_selling[additional_fee][fixed_fee]', '10');
        // $I->fillField('#dokan_selling[admin_percentage]', '10');
        $I->click('#dokan_selling #submit');
    }
}

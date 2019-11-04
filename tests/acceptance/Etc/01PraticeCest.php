<?php
// namespace Admin;


class PraticeCest
{
    public function _before(AcceptanceTester $I)
    {
    }
    // tests
    public function checkPermission(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsAdmin();
      $I->amOnPage('/wp-admin/options-general.php');
      $I->seeCheckboxIsChecked('#users_can_register');
      $I->click('Dokan');
      $I->click('Settings');
      $I->wait(5);
      // $I->scrollTo('.dokan-settings-sub-section-title', 20, 50);
        $I->click(['link' => 'Selling Options']);
        // $I->seeCheckboxIsChecked('#dokan_selling[new_seller_enable_selling]');
        // $I->seeCheckboxIsChecked('#dokan_selling[order_status_change]');
        // $I->seeOptionIsSelected('#dokan_selling[product_status]', 'Published');
        $I->performOn('#dokan_selling[new_seller_enable_selling]', Codeception\Util\ActionSequence::build()
            ->click('#dokan_selling[new_seller_enable_selling]')
            ->click('#dokan_selling[order_status_change]')
            ->click('#dokan_selling[product_status]')
            ->wait(5)
    );
    }

}

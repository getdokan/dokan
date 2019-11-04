<?php
// namespace Pratice;


class CreateCategoryAndSetPermissionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Create Category
    public function createCategory(AcceptanceTester $I,
                                    \Step\Acceptance\Login $admin,
                                      \Page\Acceptance\AdminPage $adminCreate)
    {
      $admin->loginAsAdmin();
      $I->amOnPage($adminCreate::$URL);
      $adminCreate->category('t-shirt');
      // $I->amOnPage('/wp-admin/admin.php?page=dokan#/settings');
      // $I->seeCheckboxIsChecked('#dokan_selling[new_seller_enable_selling]');
      // $I->seeCheckboxIsChecked('#dokan_selling[order_status_change]');

    }
    public function module(\Step\Acceptance\Login $I)
    {
      $I->loginAsAdmin();
       $I->click('Dokan');
       $I->click('Modules');
       $I->wait(3);
       $I->seeCheckboxIsChecked('//div[14]/div/div[2]/ul/li/label/span');
       // $I->checkOption('//div[14]/div/div[2]/ul/li/label/span');
       $I->wait(3);
       $I->click('Settings');
       $I->wait(5);
       $I->click(['link' => 'Single Product MultiVendor']);
       $I->seeCheckboxIsChecked('#dokan_spmv[enable_pricing]');
    }
}
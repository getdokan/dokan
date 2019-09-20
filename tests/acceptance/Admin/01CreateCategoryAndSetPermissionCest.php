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
}

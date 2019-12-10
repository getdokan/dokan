<?php 
// namespace Scenario;


class checkPermmissionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // 
    public function checkPermission(\Step\Acceptance\MultiSteps $I)
    {
    	$I->loginAsAdmin();
    	$I->amOnPage('/wp-admin/options-general.php');
        if ($I->tryToDontSeeCheckboxIsChecked('#users_can_register')){
            $I->checkOption('#users_can_register');
        }
        $I->click('//input[@id="submit"]');
        $I->waitForElement('#setting-error-settings_updated', 30);
    	$I->click('Dokan');
    	$I->click('Settings');
    	$I->wait(5);
        $I->click(['link' => 'Selling Options']);
        $I->selectOption('#dokan_selling[commission_type]', 'Flat');
        $I->fillField('#dokan_selling[admin_percentage]', '15');
        if ($I->tryToDontSeeCheckboxIsChecked('#dokan_selling[new_seller_enable_selling]')){
            $I->checkOption('#dokan_selling[new_seller_enable_selling]');
        }
        if ($I->tryToDontSeeCheckboxIsChecked('#dokan_selling[order_status_change]')){
            $I->checkOption('#dokan_selling[order_status_change]');
        }
        if ($I->tryToDontseeOptionIsSelected('#dokan_selling[product_status]', 'Published')){
            $I->appendField('#dokan_selling[product_status]', 'Published');
        }
        $I->click('#dokan_selling #submit');
        $I->waitForElementVisible('#setting-message_updated', 5);
        $I->waitForElement('.metabox-holder', 30);

        //tax
        // $I->loginAsAdmin();
        // $I->amOnPage('/wp-admin/admin.php?page=wc-settings');
        // if ($I->tryToDontSeeCheckboxIsChecked('#woocommerce_calc_taxes')){
        //     $I->checkOption('#woocommerce_calc_taxes');
        // }
        // $I->click('Save changes');
    }
}

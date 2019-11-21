<?php 
// namespace Modules;


class EnableAllModulesCest
{
    public function _before(AcceptanceTester $I)
    {

    }

    // All Module Enable
    public function enableAllModules(\Step\Acceptance\MultiSteps $I)
    {
    	$I->loginAsAdmin();
    	$I->click('Dokan');
    	$I->wait(3);
    	$I->click('Modules');
    	$I->wait(5);
    	$I->click('#view-switch-list');
    	$I->click('//input[@type="checkbox"]');
    	$I->checkOption('#bulk-action-selector-top','Active');
    	$I->click('Apply');
    }
}

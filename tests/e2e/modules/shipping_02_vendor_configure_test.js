Feature('vendor_02_configure');

Scenario('VendorSettings', ({ I }) => {
    I.loginAsVendorTwo();
    	I.amOnPage('/dashboard/settings/shipping/#/');
        I.wait(3);
        I.click('//td/a');
        I.wait(3);
    	I.click('//a[contains(text(),"Add Shipping Method")]');
    	I.wait(3);
        I.selectOption('#shipping_method','Flat Rate');
    	I.click('//button[contains(.,"Add Shipping Method")]');
        I.wait(5);
        // pause();
        I.moveCursorTo('//td[1]');
        I.wait(3);
        I.click('Edit');
        I.wait(10);
        I.fillField('#method_cost','20');
        I.click('Save Settings');
        I.wait(3);
        I.click('Save Changes');
});

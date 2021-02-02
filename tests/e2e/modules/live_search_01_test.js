Feature('modules/live_search_01 module');

Scenario('Admin settings', ({ I }) => {
	I.loginAsAdmin();
	I.amOnPage('/wp-admin/admin.php?page=dokan#/settings');
	I.wait(4);
	I.click('Live Search');
	I.selectOption('//select[@id="dokan_live_search_setting[live_search_option]"]','Search with Suggestion Box');
    I.click('Save Changes');
    I.amOnPage('/wp-admin/widgets.php');
    I.click('//div[@id="widget-21_dokna_product_search-__i__"]/div/div[2]/h3');
    I.click('//button[contains(.,"Dokan Store Sidebar")]');
    I.click('Add Widget');

});
Scenario('Customer Perspectives', ({ I }) => {
	I.loginAsCustomer();
	I.click('//input[@name="s"]');
	I.fillField('//input[@name="s"]','white Dress');
	I.wait(5);
	I.click('//div[@id="dokan-ajax-search-suggestion-result"]/ul/li/a/div[2]/h3');
	I.placeOrder();
});

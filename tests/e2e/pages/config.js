const {
  ifError,
  strict
} = require("assert");
const {
  assert
} = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');

const {
  I
} = inject();

module.exports = {



  async EnableAuction() {
    I.click('Dokan');
    I.wait(3);
    I.amOnPage('/wp-admin/admin.php?page=dokan#/settings/');
    I.click('Selling Options');
    tryTo(() => {
      I.see("//*[@id='dokan_selling']/form/table/tbody/tr[21]/td/fieldset/label").then((result) => {
        I.click('#dokan_selling #submit');
      }).catch((err) => {
        I.checkOption("//*[@id='dokan_selling']/form/table/tbody/tr[21]/td/fieldset/label");
        I.click('#dokan_selling #submit');
      });
    });

  },

  EnableSpmv() {
    I.click('Dokan');
    I.wait(3);
    I.amOnPage('/wp-admin/admin.php?page=dokan#/settings/');
    I.wait(5);
    I.click('Single Product MultiVendor');
    tryTo(() => {
      I.seeElement('#dokan_spmv[enable_pricing]').then((result) => {
        I.checkOption('#dokan_spmv[enable_pricing]');
      }).catch((err) => {
        I.checkOption('#dokan_spmv[enable_pricing]');
      });
    });
    I.fillField(locator.SpmvSellItemButton, 'sell this one');
    I.fillField(locator.SpmvAvailableVendorListTitle, 'Available');
    I.selectOption(locator.SpmvAvailableVendorListPosition, 'Above Single Product Tabs');
    I.selectOption(locator.SpmvShowOrder, 'min_price');
    I.click({
      css: '#dokan_spmv #submit'
    });

  },
  EnableWholesaleProduct() {
    I.click('Dokan');
    I.wait(3);
    I.amOnPage('/wp-admin/admin.php?page=dokan#/settings/');
    I.wait(5);
    I.click('Wholesale');
    I.scrollTo('.dokan-settings', 0, 0);
    I.checkOption({
      CSS: 'input.radio[name="wholesale_customer"]'
    });
    I.click('Save Changes');
    I.waitForElement('#setting-message_updated', 5);

  },
  EnableLiveSearch() {
    I.amOnPage('/wp-admin/admin.php?page=dokan#/settings');
    I.wait(4);
    I.click('Live Search');
    I.selectOption(locator.SelectSearchwithSuggestionBox, 'Search with Suggestion Box');
    I.click('Save Changes');
    I.amOnPage('/wp-admin/widgets.php');
    I.click(locator.LiveSearchWidget);
    I.click(locator.DokanSideBarWidget);
    I.click('Add Widget');
  },

  configureTax() {
    I.checkOption('#woocommerce_calc_taxes');
    I.click("Save changes");
    I.see('Your settings have been saved.');
    I.wait(5);
    I.click('Tax');
    I.click('Standard rates');
    I.click('Insert row');
    I.fillField('//td[5]/input', faker.random.arrayElement(['6', '7', '5']));
    I.click('Save changes');
    I.wait(5);
    I.click('Dokan');
    I.wait(3);
    I.click('Settings');
    I.click('Selling Options');
    I.selectOption('dokan_selling[tax_fee_recipient]', faker.random.arrayElement(['Vendor', 'Admin']));
    I.click('#dokan_selling #submit');
    I.waitForElement('.metabox-holder', 30);
  }

}

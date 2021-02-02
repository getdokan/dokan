Feature('modules/wholesale_02_add_product');

Scenario('test something', ({ I,product }) => {
    I.loginAsVendor();
    product.CreateProduct('TDress','230','Uncategorized');
    I.wait(5);
    I.checkOption({css:'input.wholesaleCheckbox'});
    I.wait(3);
    I.fillField('#dokan-wholesale-price', 450);
    I.fillField('#dokan-wholesale-qty', 5);
    I.click('Save Product');

});

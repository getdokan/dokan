Feature('variable_product');

Scenario('test something', ({ I,product }) => {
    I.loginAsVendor();
    product.CreateProduct('Red Shoe','1500','Uncategorized');
    I.wait(5);
    I.selectOption('#product_type','variable');
    I.wait(2);
    // I.scrollTo(['css' => '.add_new_attribute'], 20, 60);
    // I.wait(3);
    I.click('Add attribute');
    I.wait(3);
    I.fillField('attribute_names[0]','colour');
    I.fillField('//li/div[2]/div[2]/span/span/span/ul/li/input', 'orang');
    I.pressKey('Enter');
    I.fillField('//li/div[2]/div[2]/span/span/span/ul/li/input','green');
    I.pressKey('Enter');
    I.checkOption('attribute_visibility[0]');
    I.checkOption('attribute_variation[0]');
    I.click('Save attribute ');
    I.wait(4);
    I.click('Go');
    I.wait(3);
    I.click('//div[@id="dokan-variable-product-options-inner"]/div/div/div/a');
    I.click('//div[@id="dokan-variable-product-options-inner"]/div[2]/div/h3/select/option[2]');
    I.fillField('variable_sku[0]','10');
    I.fillField('variable_regular_price[0]','400');
    I.wait(3);
    I.checkOption('//div[2]/div[2]/div/div[11]/div/label/input[2]');
    I.wait(2);
    I.fillField('variable_wholesale_price[0]','120');
    I.fillField('variable_wholesale_quantity[0]','10');
    I.click('Save Variations');
    I.wait(2);
    I.click('Save Product');

    session('Customer view', () => {  
        I.loginAsCustomer();
        I.amOnPage('/store-listing');
        I.click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
        I.wait(3);
        I.click('/html/body/div[1]/div/div/div/div/main/div[2]/div/div[3]/ul/li[1]/a');
        I.wait(3);
        I.selectOption('#colour','orange');
        I.wait(5);
        I.click('Add to cart');
    });
});

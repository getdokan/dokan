Feature('GroupProduct');

Scenario('GroupProduct', ({ I })=> {
    I.loginAsVendorTwo();
     I.amOnPage('/dashboard/products/');
     I.wait(2);
     I.click('Add new product');
     I.wait(4);
      I.fillField('post_title',' Cap');
      I.fillField('_regular_price','350');
      I.selectOption('#product_cat', 'Uncategorized');
      I.click('Create product');
      //I.wait(4);
      //I.click('//table[@id="dokan-product-list-table"]/tbody/tr/td[3]/p/a');
     // I.click({link:'Edit'});
      I.selectOption('#product_type','Simple');
      I.selectOption('#_visibility','Hidden');
      I.click('Save Product');
      I.amOnPage('/dashboard/products/');
      I.wait(2);
      I.click('Add new product');
      I.wait(4);
      I.fillField('post_title',' Dress');
      I.fillField('_regular_price','350');
      I.selectOption('#product_cat', 'Uncategorized');
     I.click('Create product');
    //I.wait(4);
    //I.click('//table[@id="dokan-product-list-table"]/tbody/tr/td[3]/p/a');
   // I.click({link:'Edit'});
    I.selectOption('#_visibility','Hidden');
    I.click('Save Product');
    I.amOnPage('/dashboard/products/');
    I.wait(2);
    I.click('Add new product');
    I.wait(4);
    I.fillField('post_title',' Group Product');
    I.fillField('_regular_price','350');
    I.selectOption('#product_cat', 'Uncategorized');
    I.click('Create product');
    I.selectOption('#product_type','Group Product');
    I.wait(4);
    I.fillField({css: '.dokan-group-product-content .select2-search__field'},'Dress');
    I.wait(4);
    I.pressKey('Enter');
    I.fillField({css: '.dokan-group-product-content .select2-search__field'},'Cap');
    I.pressKey('Enter');
    I.click('Save Product');
});

    Scenario('Customer order', ({ I }) => {
    I.loginAsCustomer();
    I.wait(4);
    I.amOnPage('https://dokan.ajaira.website/shop/');
    I.amOnPage('/dokan/shop/?orderby=date');
    I.wait(5);
    I.click('/html/body/div[2]/div/div[1]/main/article/div/div/ul/li[1]/a/img');
    I.placeOrder();
    

});

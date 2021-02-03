Feature('variable_01_product_explore');

Scenario('test something', ({ I,product }) => {
    I.loginAsVendor();
    product.CreateProduct('Shirt','100','Uncategorized');
    
});

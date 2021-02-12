const { I } = inject();

module.exports = {

  fields:{

    viewProduct:'.products',
    alertMassage:'',
    adddProduct:'Add new product',
    addTitle:'//input[@name="post_title"]',
    productPrice:'_regular_price',
    productCategory:'#product_cat',
    createProduct:'Create Product'
 
 
 },
 
 CreateProduct(title,price,category)
 {
         // I.click(this.fields.viewProduct);
         // I.dontSee(this.fields.alertMassage);
         I.wait(10);
         I.click(this.fields.adddProduct);
         I.fillField(this.fields.addTitle,title);
         I.fillField(this.fields.productPrice, price);
         // I.fillField(self::$fileUpload, $upload);
         I.selectOption(this.fields.productCategory, category);
         I.wait(2);
         I.click(this.fields.createProduct);
         I.wait(2);
 
 
 },
 createvariation()
 {
  I.click({css:'.variation-topbar-heading > .dokan-clearfix'});
  I.selectOption({css:'.variation-topbar-heading > select:nth-child(2)'},'green');
  I.click({css:'.variation-topbar-heading > select:nth-child(2)'});
  I.fillField('variable_sku[0]','10');
  I.fillField('variable_regular_price[0]','400');
  I.fillField('//input[@name="variable_weight[0]"]',faker.random.number());
  I.fillField('//input[@id="product_length[0]"]',faker.random.number());
  I.fillField({css:'//input[@name="variable_width[0]"]'},faker.random.number());
  I.fillField('//input[@name="variable_height[0]"]',faker.random.number());
  I.selectOption('//select[@id="variable_shipping_class[0]"]','Flat rate');
  I.fillField('//textarea[@name="variable_description[0]"]',faker.random.words());
  I.click('Save Variations');
  
   
 },
 clearvariationproduct()
 {
  I.click({css:'.variation-topbar-heading > .dokan-clearfix'});
  I.selectOption({css:'.variation-topbar-heading > select:nth-child(2)'},'green');
  I.click({css:'.variation-topbar-heading > select:nth-child(2)'});
  I.click({css:'.variation-topbar-heading > select:nth-child(2)'});
  I.wait(5);
  I.clearField('variable_sku[0]');
  I.clearField('variable_regular_price[0]');
  I.clearField('//input[@name="variable_weight[0]"]');
  I.clearField('//input[@id="product_length[0]"]');
  I.clearField({css:'//input[@name="variable_width[0]"]'});
  I.clearField('//input[@name="variable_height[0]"]');
  I.clearField('//textarea[@name="variable_description[0]"]');
  I.click('Save Variations');

 }

  // insert your locators and methods here
}

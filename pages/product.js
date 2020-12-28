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
         I.click(this.fields.adddProduct);
         I.fillField(this.fields.addTitle,title);
         I.fillField(this.fields.productPrice, price);
         // I.fillField(self::$fileUpload, $upload);
         I.selectOption(this.fields.productCategory, category);
         I.wait(2);
         I.click(this.fields.createProduct);
         I.wait(2);
 
 
 }
 

  // insert your locators and methods here
}

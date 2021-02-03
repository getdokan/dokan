Feature('Group/Variable product explore');
Scenario('product edit explore test', ({ I }) => {
    I.amOnPage('http://dokan-pro.test/');
    I.checkError();
    I.click('Login / Register');
    I.fillField('Username or email address','alvitazwar@wedevs.com');
    I.fillField('Password','alvitazwar1122334456');
    I.click('.login > p:nth-child(4) > button:nth-child(3)');
    I.click('Products');
    I.click('group_product');
    // Starting to explore
    //Check Error
    I.checkError();
    //Product label
    I.seeElementInDOM('span.dokan-label.dokan-label-success.dokan-product-status-label');
    //view product button
    I.seeElementInDOM('h1 > span.dokan-right > a');
    //Title section
    I.see('Title');
    I.seeElementInDOM('#post_title');
    //Product type
    I.see('Product Type');
    I.seeElementInDOM('#product_type');
    I.seeElementInDOM('div.content-half-part.dokan-product-meta > div:nth-child(2) > label > i'); //fav icon check
    //Category
    I.see('Category');
    I.seeElementInDOM('#select2-product_cat-container');
    //Tags
    I.see('Tags');
    I.seeElementInDOM('div.content-half-part.dokan-product-meta > div:nth-child(6) > span');
    //View Image Box
    I.seeElementInDOM('div.instruction-inside');
    I.seeElementInDOM('div.instruction-inside > a');
    I.seeElementInDOM('#product_images_container > ul > li');
    //All description field
    I.see('Short Description');
    I.seeElementInDOM('div.dokan-product-short-description');
    I.see('Description');
    I.seeElementInDOM('div.dokan-product-description');
    //Inventory Section
    I.seeElementInDOM('div.dokan-product-inventory.dokan-edit-row > div.dokan-section-heading');
    I.seeElementInDOM('div.dokan-product-inventory.dokan-edit-row > div.dokan-section-content');
    I.see('SKU (Stock Keeping Unit)');
    I.seeElementInDOM('#_sku');
    I.see('Stock Status');
    I.seeElementInDOM('#_stock_status');
    //Linked Products section
    I.seeElementInDOM('div.dokan-linked-product-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading');
    I.seeElementInDOM('div.dokan-linked-product-options.dokan-edit-row.dokan-clearfix > div.dokan-section-content');
    I.see('Upsells');
    I.see('Cross-sells');
    I.see('Grouped products');
    //Attribute
    I.seeElementInDOM('div.dokan-attribute-variation-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading');
    I.seeElementInDOM('#predefined_attribute#predefined_attribute');
    I.seeElementInDOM('a.dokan-btn.dokan-btn-default.add_new_attribute');
    I.seeElementInDOM('a.dokan-btn.dokan-btn-default.dokan-btn-theme.dokan-save-attribute');
    //RMA
    I.seeElementInDOM('div.dokan-rma-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading');
    I.seeElementInDOM('div.dokan-rma-options.dokan-edit-row.dokan-clearfix > div.dokan-section-content');
    //Other Options
    I.seeElementInDOM('div.dokan-other-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading');
    I.see('Product Status');
    I.see('Visibility');
    I.seeElementInDOM('#post_status');
    I.seeElementInDOM('#_visibility');
    I.see('Purchase Note');
    I.seeElementInDOM('div.dokan-section-content > div:nth-child(5) > label');
    console.log('All Elemennts Are present');








    








  
    
  
  });
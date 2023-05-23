import { MySqlConnection, DbContext } from 'mysqlconnector';
// import {serialize, unserialize} from 'php-serialize';


const mySql =  new MySqlConnection({
    hostname: "localhost",
    username: "root",
    password: "01dokan01",
    db: "dokan5",
    port: 3306,
});


export const dbUtils = {



async dbQuery(query: string) {
   const dbContext: DbContext = new DbContext(mySql);
   return await dbContext.inTransactionAsync(async (dbContext) => {
    const result = await dbContext.executeAsync(query);
    return JSON.parse(JSON.stringify(result))
    });
}
  








};










// const select = Select.Properties("meta_key").table("dok_usermeta")
// const query = 'Select meta_key From dok_usermeta'





// let a = {"admin_percentage":"10","shipping_fee_recipient":"seller","tax_fee_recipient":"seller","automatic_process_api_refund":"off","selling_capabilities":"","new_seller_enable_selling":"on","disable_product_popup":"off","order_status_change":"on","dokan_any_category_selection":"off","product_status":"publish","vendor_duplicate_product":"on","edited_product_status":"off","product_add_mail":"on","product_category_style":"single","product_vendors_can_create_tags":"on","add_new_attribute":"off","discount_edit":{"order-discount":"order-discount","product-discount":"product-discount"},"hide_customer_info":"off","seller_review_manage":"on","new_seller_enable_auction":"on","enable_guest_user_enquiry":"on","enable_min_max_quantity":"on","enable_min_max_amount":"on","disable_shipping_tab":"off","catalog_mode_settings":"","catalog_mode_hide_add_to_cart_button":"off","catalog_mode_hide_product_price":"off","commission_type":"percentage","additional_fee":""}
// let c = 'a:29:{s:16:"admin_percentage";s:2:"10";s:22:"shipping_fee_recipient";s:6:"seller";s:17:"tax_fee_recipient";s:6:"seller";s:28:"automatic_process_api_refund";s:3:"off";s:20:"selling_capabilities";s:0:"";s:25:"new_seller_enable_selling";s:2:"on";s:21:"disable_product_popup";s:3:"off";s:19:"order_status_change";s:2:"on";s:28:"dokan_any_category_selection";s:3:"off";s:14:"product_status";s:7:"publish";s:24:"vendor_duplicate_product";s:2:"on";s:21:"edited_product_status";s:3:"off";s:16:"product_add_mail";s:2:"on";s:22:"product_category_style";s:6:"single";s:31:"product_vendors_can_create_tags";s:2:"on";s:17:"add_new_attribute";s:3:"off";s:13:"discount_edit";a:2:{s:14:"order-discount";s:14:"order-discount";s:16:"product-discount";s:16:"product-discount";}s:18:"hide_customer_info";s:3:"off";s:20:"seller_review_manage";s:2:"on";s:25:"new_seller_enable_auction";s:2:"on";s:25:"enable_guest_user_enquiry";s:2:"on";s:23:"enable_min_max_quantity";s:2:"on";s:21:"enable_min_max_amount";s:2:"on";s:20:"disable_shipping_tab";s:3:"off";s:21:"catalog_mode_settings";s:0:"";s:36:"catalog_mode_hide_add_to_cart_button";s:3:"off";s:31:"catalog_mode_hide_product_price";s:3:"off";s:15:"commission_type";s:10:"percentage";s:14:"additional_fee";s:0:"";}'


// console.log(serialize(a))
// console.log(unserialize(c))
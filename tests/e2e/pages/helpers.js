const { ifError, strict } = require("assert");
const { assert } = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');
var existing_balance;
var current_earnings;
var current_balance;
var actual_balance;
var admin_existing_balance;
var admin_current_commission;
var admin_current_balance;
var admin_actual_balance;
var auction_check_box;
var auction_proxy_check;


const { I, loginAs } = inject();

module.exports = {

    pageStatus() {
        I.amOnPage('/my-account');
        // I.click('Login / Register');
        I.seeElement(locator.RegisterLocator);
    },
    customerRegisterSuccess() {
        I.fillField(locator.EmailAdressLocator, locator.CustomerEmailAddress);
        I.fillField(locator.PasswordInput, locator.PasswordValue);
        I.click('Register');
    },
    vendorRegisterSuccess() {
        I.fillField(locator.EmailAdressLocator, locator.VendorEmailAddress);
        I.fillField(locator.PasswordInput, locator.PasswordValue);
        I.checkOption('I am a vendor');
        I.fillField('First Name', locator.FirstName);
        I.fillField('Last Name', locator.Lastname);
        I.fillField('Shop Name', locator.Shopname);
        I.scrollTo(locator.PhoneNumberInput);
        I.click(locator.PhoneNumberInput);
        I.fillField(locator.PhoneNumberInput, locator.PhoneNumberValue);
        I.click('Register');
    },
   
    createProduct(){
      I.amOnPage('/dashboard/products/');
      I.click('Add new product');
      
      I.fillField(locator.ProductTitleInput,faker.commerce.productName());
      I.fillField(locator.ProductPrice,faker.commerce.price());
      I.wait(2);
      // I.attachFile('.dokan-feat-image-btn', '/data/images.jpeg');
      I.selectOption(locator.ProductCategory, 'Uncategorized');
      I.click(locator.AddProduct);
      I.wait(4);
    //   I.see('Edit Product');
    //   I.see('View Product');
    },
    checkVendor() {
        // I.amOnPage('/dashboard');
        // I.moveCursorTo(locator.MenuHoverDropdown);
        // I.click(locator.MyAccount);
        // I.click(locator.EditAccount);
        I.amOnPage('/my-account/edit-account/');
        I.seeInField('Email address', locator.VendorEmailAddress);
    },
    loginAsVendor() {
        I.fillField('Username or email address ', 'vendor-one');
        I.fillField('Password', '123456');
        I.click('Login');
        I.seeInCurrentUrl('/dashboard');
    },
    async checkExistingBalance() {
        I.amOnPage('/dashboard/withdraw');
        const bal = await I.grabTextFrom(locator.VendorBalance);
        existing_balance = parseInt(bal.replace(/[, \$৳]+/g, ""));
        console.log('Existing Balance:', existing_balance);
    },
    SelectSingleProduct() {
        I.amOnPage('/shop/');
        I.click('//main[@id="main"]/ul/li/a/img');
        I.click('Add to cart');
        // I.click('simple_product');
    },
    SelectMultipleProduct() {
        I.amOnPage('/shop/');
        // I.selectOption(locator.SortingDropdown, 'price-desc');
        // I.click(locator.ThirdProductLocator);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.click('Add to cart');
    },
    SelectMultipleProductMultiplrVendor() {
        I.amOnPage('/store/');
        I.click({css:'#dokan-seller-listing-wrap > div > ul > li:nth-child(1) > div > div.store-footer > a > span'});
        I.click({css: 'li.product:nth-child(1) > span:nth-child(2) > span:nth-child(2) > a:nth-child(1) > i:nth-child(1)'});
        I.wait(5);
        I.amOnPage('/store/');
        I.click({css:'li.dokan-single-seller:nth-child(2) > div:nth-child(1) > div:nth-child(3) > a:nth-child(2) > span:nth-child(1'});
        I.click({css: 'li.product:nth-child(1) > span:nth-child(2) > span:nth-child(2) > a:nth-child(1) > i:nth-child(1)'});
        I.wait(5);
        
    },
    createvariation() {
        I.fillField(locator.ProductAttributeName,'Color');
        I.fillField(locator.ProductAttributeValue,'red');
        I.pressKey('Enter');
        I.fillField(locator.ProductAttributeValue,'blue');
        I.pressKey('Enter');
        I.checkOption(locator.ProductAttributeVisibility);
        I.checkOption(locator.ProductAttributeVariation);
        I.click('Save attribute');
        I.wait(4);
        I.click('Go');

    },


    async placeOrder() {
        I.amOnPage('/cart/');
        // I.click(locator.ViewCart); //View Cart
        I.click(locator.ProceedCheckout); // Proceed To checkout
        I.seeInCurrentUrl('/checkout');
        I.fillField(locator.BillingFirstName, locator.FirstName);
        I.fillField(locator.BillingLastName, locator.Lastname);
        I.fillField(locator.BillingCompanyName, faker.company.companyName());
        I.fillField(locator.BillingAddress, 'United States');
        I.fillField(locator.BillingCity, faker.address.city());
        I.fillField(locator.BillingPhone, faker.phone.phoneNumberFormat());
        I.fillField(locator.BillingEmail, locator.EmailAddress);
        I.fillField('#billing_postcode',faker.random.arrayElement(['10010','10001','10005']));
        I.wait(5);

        //I.checkOption('Direct bank transfer'); // This will be Replaced Soon.
        I.click(locator.PlaceOrderBtn);
        I.waitForText(locator.OrderSuccessMsg, 30, '.woocommerce-order');
    },
    updateOrderStatus() {
        I.amOnPage('/dashboard/orders');
        I.click(locator.FirstOrderRow);
        // I.wait(5);
        I.click(locator.EditStatusLink);
        I.selectOption('#order_status', 'Completed');
        I.click('Update');
        // I.wait('5');
        // I.waitForElement(locator.GeneralDetails, 30);
        I.see('Completed');
    },



    async grabCurrentEarnings() {
        I.amOnPage('/dashboard/orders');
        //I.click('Orders');
        let earning = await I.grabTextFrom(locator.CurrentEarning);
        current_earnings = parseInt(earning.replace(/[, \$৳]+/g, ""));
        console.log('Current Earning ', current_earnings);

    },

    productsorting()
    { 
        I.amOnPage('/shop/');
        I.selectOption('//select[@name="orderby"]', 'Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.wait(5);
        I.click('//button[@name="add-to-cart"]');
        I.click('View cart');
        I.wait(5);

    },
    async balanceAssertEqual() {
        // this.grabCurrentEarnings();
        I.amOnPage('/dashboard/withdraw');
        current_balance = existing_balance + current_earnings;
        console.log('Current balance', current_balance);
        const up_bal = await I.grabTextFrom(locator.VendorBalance);
        actual_balance = parseInt(up_bal.replace(/[, \$৳]+/g, ""));
        strict.equal(current_balance, actual_balance);
        I.say('Calculation matched');
        console.log('Existing Balance', existing_balance, '+', 'Current Earning', current_earnings, '=', 'Actual Balance', existing_balance + current_earnings);

    },
    async adminBalanceCheck() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.scrollTo(locator.AdminBalance);
        let ad_bal = await I.grabTextFrom(locator.AdminBalance);
        admin_existing_balance = parseInt(ad_bal.replace('৳', "").replace('$', "").trim());
        console.log('Admin Existing Balance:', admin_existing_balance);
    },
    async getAdminComission() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports?tab=logs');
        let ad_com = await I.grabTextFrom(locator.AdminComission);
        admin_current_commission = parseInt(ad_com.replace('৳', "").replace('$', "").trim());
        console.log('Admin Current Commission:', admin_current_commission);
    },
    async checkAdminCalculation() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.scrollTo(locator.AdminBalance);
        admin_current_balance = admin_existing_balance + admin_current_commission;
        console.log('Admin Current Balance:', admin_current_balance);
        let ad_actual_bal = await I.grabTextFrom(locator.AdminBalance);
        admin_actual_balance = parseInt(ad_actual_bal.replace('৳', "").replace('$', "").trim());
        strict.equal(admin_current_balance, admin_actual_balance, "Message Done");
        console.log('Admin Existing Balance', admin_existing_balance, '+', 'Current Comission', admin_current_commission, '=', 'Admin Actual Balance', admin_existing_balance + admin_current_commission);
        I.say('Calculation matched');
    },
    vendorlogout() {
        I.moveCursorTo(locator.VendorMoveCursor);
        I.click(locator.VendorLogout);
    },
    customerlogout() {
        I.moveCursorTo(locator.CustomerMoveCursor);
        I.click('Log out');
    },
    adminlogout() {
        I.moveCursorTo(locator.AdminMoveCursor);
        I.wait(1);
        I.click(locator.AdminLogout);
    },
    //Simple Product Functionalities
    setregularprice() {
        I.fillField('Price', '20');
        I.fillField('Discounted Price', '15');
        I.click(locator.SaveProduct);
    },

    cancelschedule() {
        I.seeElement(locator.CancelLink);
        I.click(locator.CancelLink);
        I.click(locator.SaveProduct);

    },
    setSchedule() {
        I.click('Schedule');
        I.fillField(locator.CalenderFrom, '2021-01-01');
        I.fillField(locator.CaldenderTO, '2021-12-31');
        I.wait(3);
        I.click(locator.SaveProduct);

    },
    checkVirtual() {
        I.wait(2);
        I.checkOption(locator.Virtual);
        I.wait(3);
        I.dontSeeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },
    uncheckVirtual() {
        I.wait(2);
        I.uncheckOption(locator.Virtual);
        I.wait(2);
        I.seeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },

   async checkWrongPrice() {
        I.fillField('Price', '12');
        I.fillField('Discounted Price','15');
        I.click(locator.SaveProduct);
        const result = await tryTo(() => I.see('.wc_error_tip'));
        console.log(result);
        if(result == true)
        {
            console.log('Product save successfully');
        }
        else{
            console.log('Regular Price should not be lower than discount price. Validation neededs');
        }
       
        I.see(locator.SuccessMsg);
        
    },
    checkmulticat() {
        I.refreshPage();
        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput, 'multiple');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('multiple');
    },
    checksinglecat() {

        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput,'single');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('single');
    },
    checktags() {
        I.refreshPage();
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'single');
        I.wait(2);
        //I.click('li.select2-results__option.select2-results__option--highlighted');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
        //I.clearField('div:nth-child(6) > span > span.selection > span > ul > li > input');
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'gadgets');
        I.wait(2);
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    shortDesc() {
        var sdesc = faker.lorem.sentences();
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.fillField(locator.ShortDescInput, sdesc);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    desc() {
        var desc = faker.lorem.text();
        I.scrollTo(locator.DescLabel);
        within({
            frame: locator.DescFrame
        }, () => {
            I.fillField(locator.DescInput, desc);
        });
        I.click(locator.SaveProduct);
        I.wait(4);
    },
    clearDesc() {
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.wait(2);
            I.click(locator.ShortDescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        within({
            frame: locator.DescFrame
        }, () => {
            I.wait(2);
            I.click(locator.DescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    wholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.checkOption(locator.WholeSaleCheck);
        I.fillField(locator.WholeSalePrice, faker.random.number(10, 20));
        I.fillField(locator.WholeSaleQty, faker.random.number(5, 10));
        I.click(locator.SaveProduct);
       // I.wait(3);
    },
    clearwholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.clearField(locator.WholeSalePrice);
        I.clearField(locator.WholeSaleQty);
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    // Start of Group product Functionalities
    checkrmalimited() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty limited');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty Included');
        I.selectOption(locator.RmaLengthDropdown, 'Limited');
        I.fillField(locator.RmaLengthValue, '10');
        I.selectOption(locator.RmaLengthDuration, 'Months');
        I.scrollTo(locator.RmaContentDiv);
        within({
            frame: locator.RmaPolicyIframe
        }, () => {
            I.fillField(locator.RmaPolicyInput, 'policy added');
        });
        I.click(locator.SaveProduct);
    },
    checkrmalifetime() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty Lifetime');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty Included');
        I.selectOption(locator.RmaLengthDropdown, 'Lifetime');
        I.click(locator.SaveProduct);
    },
    checkrmawarrentyaddon() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty Addon');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty as Add-On');
        I.fillField(locator.RmaAddonCostInput, '50');
        I.fillField(locator.RmaAddonDurationInput, '1');
        I.selectOption(locator.RmaAddonDurationDropdown, 'Days');
        I.click(locator.RmaWarrentyAddonBtn);
        I.click(locator.SaveProduct);
    },
    clearrma() {
        I.uncheckOption(locator.RmaCheckBox);
        I.click(locator.SaveProduct);
    },
    checknotes() {
        I.fillField(locator.PurchaseNotesInput, faker.lorem.text());
        I.click(locator.SaveProduct);
        I.clearField(locator.PurchaseNotesInput);
    },
    // checkgroup() {
    //     I.scrollTo(locator.LinkedProductSection);
    //     I.click(locator.LinkedProductUpsells);
    //     I.fillField(locator.LinkedProductUpsells, 'simple_pro_1');
    //     I.wait(1);
    //     I.pressKey('Enter');
    //     I.wait(1);
    //     I.fillField(locator.LinkedProductUpsells, 'simple_pro_2');
    //     I.wait(1);
    //     I.pressKey('Enter');
    //     I.clearField(locator.LinkedProductUpsells);
    //     I.click(locator.LinkedProductCrossSells);
    //     I.fillField(locator.LinkedProductCrossSells, 'simple_pro_3');
    //     I.wait(1);
    //     I.pressKey('Enter');
    //     I.clearField(locator.LinkedProductCrossSells);
    //     I.click(locator.LinkedProductGrouped);
    //     I.fillField(locator.LinkedProductGrouped, 'group_product_2');
    //     I.wait(1);
    //     I.pressKey('Enter');
    //     //I.clearField(locator.LinkedProductGrouped);
    //     I.wait(3);
    //     I.click(locator.SaveProduct);
    // },
    async createauctionproduct()
    {
        I.click('Auction');
        I.click('Add New Auction Product');
        I.wait(4);
        I.fillField('post_title', locator.AuctionProduct);
        I.selectOption('product_cat','Uncategorized');
            I.checkOption(locator.AddAuctionProxy);
            I.fillField(locator.AuctionStartPrice,'5');
            I.fillField(locator.BidAuctionProduct,'1');
            I.fillField(locator.ReservePrice,'6');
            I.fillField(locator.RegularPrice,'19');
            I.click(locator.StartDate);
            I.wait(2);
            I.click('Now');
            I.click(locator.EndDate);
            I.wait(2);
            I.click('Now');
            // I.selectOption('#ui-datepicker-div > div.ui-timepicker-div > dl > dd.ui_tpicker_hour > div > select', '01');
            I.selectOption('#ui-datepicker-div > div.ui-timepicker-div > dl > dd.ui_tpicker_minute > div > select', '59');
            // I.selectOption({css:'.ui_tpicker_minute_slider > .ui-timepicker-select'},'30');
            I.wait(5);
            I.click('Add auction Product');
            I.wait(3);
            I.see('Success! The product has been updated successfully.');
        
    },
    PurchaseAuctionProduct(){
        I.amOnPage('/store/vendor-one/');
        // I.amOnPage('/shop');
        // I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.click(locator.AuctionProduct);
        for(let x=0; x<=3; x++){
            I.click('Bid');
       }
        session('2nd Customer bid', () => { 
            loginAs('CustomerTwo');
            I.amOnPage('/store/vendor-one/');
                    /* Facing problems, latest auction products not found in 'Sort by latest' list */
                // I.amOnPage('/shop');
                // I.selectOption('//select[@name="orderby"]','Sort by latest'); 
            I.click(locator.AuctionProduct);
            for(let x=0; x<=4; x++){
                 I.click('Bid');
            }
        });   
    },
    createBookingProduct()
    {
         I.click('Booking');
    	 I.wait(3);
    	 I.click(' Add New Booking Product');
    	 I.wait(2);
    	 I.fillField(locator.BookingProductTitle,'Hotel Seagull Booking 3');
    	 I.wait(3);
    	 I.selectOption(locator.BookingDurationType,'Customer defined blocks of');
    	 I.fillField(locator.BookingDuration,'2');
    	 I.selectOption(locator.BookingDurationUnit,'Hour(s)');
    	 I.fillField(locator.BookingMinDuration,'1');
    	 I.fillField(locator.BookingMaxDuration,'2');
    	 I.selectOption(locator.BookingCalendarDisplay,'Calendar always visible');
    	 I.checkOption(locator.BookingEnableRangePicker);
    	 I.fillField(locator.BookingQuantity,'2');
    	 I.fillField(locator.BookingMinDate,'2');
    	 I.selectOption(locator.BookingMinDateUnit,'week');
    	 I.fillField(locator.BookingMaxDate,'1');
    	 I.selectOption(locator.BookingMaxDateUnit,'month');
    	 I.fillField(locator.BookingBufferPeriod,'1');
    	 I.fillField(locator.BookingCost,'200');
    	 I.fillField(locator.BookingBlockCost,'250');
    	 I.fillField(locator.BookingDisplayCost,'100');
    	 I.click('Save Product');
         I.see('Edit Booking Product');
       
    },
    PurchaseBookableProduct()
    {
        I.amOnPage('/shop/');
        I.selectOption(locator.DateFilter,'Sort by latest');
        I.click(locator.BookingButtonClick);
        I.click('//td/a');
        I.click(locator.BookingStartTime);
        I.click('//select/option[2]');
        I.click(locator.BookingEndTime);
        I.click('//select/option[2]');
        I.click('Book now');
        I.acceptPopup('Ok');
        I.click('Book now');
        // I.amOnPage('/cart/');
		// I.click('Proceed to checkout');
		// I.wait(5);
		// I.click('//div[@id="payment"]/div/button');
		// I.see('Thank you. Your order has been received.');
    },
    Sellthisproduct()
    {
        I.amOnPage('/Shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.click('dokan_sell_this_item');
        I.wait(3);
        I.fillField('#_regular_price', '100');
        I.click('dokan_update_product');

    },
    customerviewproduct()
    {
        I.amOnPage('/Shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click('//main[@id="main"]/ul/li/a/img');
        I.scrollTo('#primary', 100,500);
        I.wait();

    },
    vendorsetvacation()
    {
        I.click('Settings');
        I.checkOption(locator.SetVacation);
        I.selectOption(locator.StoreCloseStyle, 'Date Wise Close');
        I.fillField(locator.StoreCloseFrom,'2020-07-01');
        I.fillField(locator.StoreCloseTo,'2020-07-09');
        I.fillField(locator.SellerVacationMessage,'Eid Vacation');
        I.click(locator.SellerVacationSave);
        I.waitForElement('.dokan-seller-vacation-list-action', 5);
    I.click('Update Settings');
    I.see('Your information has been saved successfully');
    },
    
    Customerviewvacationmessage()
    {
    I.wait(3);
    I.amOnPage('/store-listing/');
    I.click({ css : '.dokan-single-seller:nth-child(1) .dashicons'});
    I.scrollTo('#primary', 100,600);
    I.wait(5);
    },
    CreateWholesaleProduct()
    {
    I.wait(5);
    I.checkOption({css:'input.wholesaleCheckbox'});
    I.wait(3);
    I.fillField(locator.WholeSalePrice, 450);
    I.fillField(locator.WholeSaleProductQuantity, 5);
    I.click('Save Product');
    },
    vendoraddsupporticket()
    {
    I.click('Settings');
    I.click('Store');
    I.wait(3);
    I.checkOption('#support_checkbox');
    I.scrollTo('#dokan_support_btn_name',20,40);
    I.fillField('#dokan_support_btn_name','Get Support');
    I.click('Update Settings');
    },
    Getsupport()
    {
        I.amOnPage('/store/vendor-one/');
        I.click('Get Support');
        I.wait(5);
        I.fillField('#dokan-support-subject', faker.lorem.sentence());
        I.click('div:nth-child(2) > select');
        I.click('div:nth-child(2) > select > option:nth-child(2)');
        I.fillField('#dokan-support-msg', faker.lorem.paragraphs());
        I.click('Submit');
        I.wait(5);
    },
    ReplyTicket()
    {
     I.wait(4);
     I.amOnPage('/dashboard/support/');
     I.wait(2);
     I.click({css:'tr:nth-child(1) > td:nth-child(2) > a'});
     I.wait(2);
     I.fillField('comment','ok done');
     I.selectOption('.dokan-support-topic-select','Close Ticket');
     I.click('Submit Reply');
     I.wait(5);
    },
    CustomerCheckSupportTicket()
    {
        I.wait(2);
        I.click('My account');
        I.wait(2);
        I.click('Seller Support Tickets');
        I.click('All Tickets');
        I.scrollTo('.woocommerce-MyAccount-content', 50,50);
        I.wait(5);
    },
    CreateProduct()
    {
        I.click('.products');	
        I.dontSee('.dokan-alert.dokan-alert-warning');
        I.click('.dokan-add-product-link a');
        I.fillField('.dokan-form-control', 'Gold Color Shoe');
        I.fillField('_regular_price', '500');
        I.selectOption('#product_cat', 'Uncategorized');
        I.click('#dokan-create-new-product-btn');
    },
    SearchProductwithsuggestion()
    {
        I.click(locator.ClickSearchBox);
        I.fillField(locator.ClickSearchBox,'white Dress');
        I.wait(5);
        I.click('//div[@id="dokan-ajax-search-suggestion-result"]/ul/li/a/div[2]/h3');
        I.placeOrder();
    },
    Productaddoncategory()
    {
        I.click('Settings');
    	I.click('Addons');
    	I.click('Create New addon');
    	I.wait(3);
    	I.fillField('#addon-reference','Addon2-Vendor1');
        I.fillField('addon-priority','10');
        I.click({css : '.select2-selection__rendered'});
        I.click('Add Field');
    	I.wait(2);
        I.selectOption('//*[@id="wc-pao-addon-content-type-0"]','Checkboxes');
        I.fillField('product_addon_option_label[0][]','Mashroom');
        I.selectOption('#wc-pao-addon-content-title-format','Heading');
        I.checkOption('#wc-pao-addon-description-enable-0');
        I.fillField('#wc-pao-addon-description-0','Mashroom with cheese');
        I.fillField('product_addon_option_label[0][]','Mashroom');
        I.selectOption('.wc-pao-addon-option-price-type','percentage_based');
        I.fillField('product_addon_option_price[0][]','5');
        I.click('Publish');
    } ,
    PurchaseProductWithAddon()
    {

        I.amOnPage('/Shop/');
        I.selectOption('//select[@name="orderby"]','Sort by latest');
        I.wait(5);
        I.click({css:'.product:nth-child(1) > .item-content .flaticon'});
        I.click('.wc-pao-addon-field');
        I.appendfield('.wc-pao-addon-field','SAusage (+£10.00)');
        I.wait(3);
        I.placeOrder();
        I.wait(3);
    },
    CreateSubscriptionProduct()
    {
        I.checkOption(locator.EnableSubscription);
        I.checkOption(locator.EnableSubscriptionPack);
        I.checkOption(locator.EnableSubscriptionByMail);
        I.fillField(locator.SubscriptionEndMail,'5');
        I.selectOption(locator.SubscriptionStatus,'Pending Review');
        I.click(locator.SubmitDokanSubscription);
        I.waitForElement('#setting-message_updated', 5);
        I.waitForElement('#setting-message_updated', 5);
            I.amOnPage('/wp-admin/post-new.php?post_type=product');
            I.fillField(locator.SubscriptionPack,'Bronze Subscription Pack');
            I.pressKey('Tab');
            I.type('This is special pack for all vendor');
            I.selectOption(locator.SubscriptionPack,'Dokan Subscription');
            I.fillField(locator.SubscriptionPrice,'400');
            I.appendField(locator.NumberOfSubscriptionProduct,'500');
            I.fillField(locator.SubscriptionPackValidaty,'250');
            I.selectOption(locator.SubscriptionProductCommission, 'Flat');
            I.fillField(locator.AdminComission, '15');
            I.scrollTo('#wpbody-content', 0, 0);
            I.click('publish');
    },
    PurchaseSubscriptionPackage()
    {
        I.click('Products');
        I.click({ css : '.dokan-info > a'});
        I.wait(5);
        I.click({ css : '.product_pack_item:nth-child(1) .dokan-btn'});
        I.wait(3);
        
        I.click('//*[@id="place_order"]');
        I.dontSee('.woocommerce-NoticeGroup.woocommerce-NoticeGroup-checkout');
        I.wait(5);

    },
    AdminApproveSubscription()
    {
        I.click('WooCommerce');
            I.wait(3);
            I.click('//td/a');
            I.wait(3);
            I.click('Completed');
    },
    CreateProductForSubscription()
    {
        I.click('Dashboard');
        I.click('Products');
            I.click('Add new product');
            I.fillField('post_title','Yellow Cap');
            I.fillField('_regular_price','200');
            I.fillField('_sale_price','180');
            I.click('Schedule');
            I.fillField('_sale_price_dates_from','2020-06-01');
            I.fillField('_sale_price_dates_to','2020-12-30');
            I.wait(2);
            I.selectOption('#product_cat', 'cloth');
            I.click('#dokan-create-new-product-btn');
            I.see('Edit Product');
            I.see('View Product');
        
    },
    ConfigureStripePayment()
    {
        I.click('WooCommerce');
        I.amOnPage('/wp-admin/admin.php?page=wc-settings');
        I.click('Payments');
        I.click(locator.StripePaymentTitle);
        I.checkOption(locator.EnableStripe);
        I.checkOption(locator.ConnectOnTestMode);
        I.uncheckOption(locator.EnableStripeCheckOut);
        I.fillField(locator.StripeSecretKey,'sk_test_DoMOe1KGxXxEqDi0DWqRqggp00zHAkctNi');
        I.fillField(locator.StripePublicKey,'pk_test_Hg1UlS12grPn9EMWCj3j9qng00VYJ7sx4w');
        I.fillField(locator.StripeClientId,'ca_GNk3MaeyPFft911y4ruiyZeZirFMsSl5');
        I.click('Save changes');
	        I.click('Dokan');
	        I.wait(3);
	        I.click('Settings');
	        I.click('Withdraw Options');
	       	I.checkOption('Stripe');
         	I.click('Save Changes');
    I.moveCursorTo('#wp-admin-bar-top-secondary');
	I.click('Log Out');
    },
    VendorConnectStripe()
    {
        
            I.amOnPage('/dashboard/settings/payment/');
            I.click({css:'.dokan-stripe-connect-link > img:nth-child(1)'});
            // I.dontSee('Your account is not connected to Stripe. Connect your Stripe account to receive payouts.');
            // I.click('#skip-account-app');
            // I.wait(5);
            // I.waitUrlEquals('dashboard/settings/payment/');
            // I.see('Your account is connected with Stripe');
    },
    CustomerPurchasewithStripe()
    {
   I.amOnPage('/shop/');
   I.selectOption('//select[@name="orderby"]','Sort by latest');
   I.wait(5);
   I.click('//main[@id="main"]/ul/li/a/img');
   I.click('Add to cart');
   I.click('View cart');
   I.click('Proceed to checkout');
        I.amOnPage('/checkout/');
        I.scrollPageToBottom();
        I.click('#payment_method_dokan-stripe-connect');
        // I.forceClick('cardnumber');
        pause();
        I.fillField('//input[@name="cardnumber"]', '4242 4242 4242 4242');
        I.fillField('//input[@name="exp-date"]', '02/27');
        I.fillField('cvc', '1234');         
        I.click('Place order');
        I.fillField('#dokan-stripe-connect-card-number','customerone@gmail.com');
        I.fillField('#dokan-stripe-connect-card-number','4242 4242 4242 4242');
        I.fillField('#dokan-stripe-connect-card-expiry','02/27');
        I.fillField('#dokan-stripe-connect-card-cvc','1234');
        I.click('Place order');
        I.wait(3);
          	I.waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
        I.see('Thank you. Your order has been received.');
    },
    SentRefundRequest()
    {
        I.click(locator.firstOrder); 
        I.wait(5);  
        I.click(locator.EditOrderStatus);
        I.selectOption(locator.ChangeOrderStatus,faker.random.arrayElement(['Completed','Processing']));
        I.click('Update');
        I.click('Request Refund');
        I.fillField('.refund_order_item_qty','1');       
        I.click('#woocommerce-order-items');
        I.click('Submit Refund Request');
        I.click('OK');
        I.click('OK');
    },
    CheckRefund(){
        I.click('#toplevel_page_dokan');
        I.click('Refunds');
        I.wait(5);
        I.checkOption('//table/tbody/tr/td[1]');
        I.selectOption('#bulk-action-selector-top','Approve Refund');
        I.click('Apply');       
        I.wait(5);
        I.click('#post-search-input');
        I.type('vendor-two');
        I.type('123');
        I.wait(5);
        I.clearField('#post-search-input');
        I.refreshPage();
        I.wait(3);
    },
    SetPaymentInfo(){
        I.amOnPage('/dashboard/settings/payment/');
        I.fillField('settings[paypal][email]','vendor-one@gmail.com')
        I.fillField('settings[bank][ac_name]','Standerd Bank')
        I.fillField('settings[bank][ac_number]','110001')
        I.fillField('settings[bank][bank_name]','abc')
        I.fillField('settings[bank][bank_addr]','dhaka,bangladesh')
        I.fillField('settings[bank][routing_number]','12244')
        I.fillField('settings[bank][iban]','788')
        I.fillField('settings[bank][swift]','1123')
        I.click('Update Settings')
        I.see('Your information has been saved successfully')
    },
    SentWithdrawRequest()
    {
        I.amOnPage('/dashboard/withdraw/');
        I.fillField('#withdraw-amount','200');
        I.selectOption('#withdraw-method',faker.random.arrayElement(['Bank Transfer','PayPal']));
        I.click('Submit Request');
        I.wait('5');
        I.see('Your request has been received successfully and being reviewed!');
    },
}
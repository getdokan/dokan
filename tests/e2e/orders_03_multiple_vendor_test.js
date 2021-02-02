Feature('Multiple order Multiple vendor Functionality');

Scenario('test something 1', ({ I }) => {
    I.loginAsCustomer();
    I.viewMultipleVendorMultipleProduct();
    I.placeOrder();
    
});

Scenario('test something', ({ I }) => {
    I.loginAsVendor();
    I.updateOrderStatus(); //need to update
    
});

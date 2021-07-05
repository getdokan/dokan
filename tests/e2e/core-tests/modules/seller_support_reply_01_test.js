const helpers = require("../../pages/helpers");
Feature('sellersupport reply');

Scenario('Seller Support', ({ I }) => {
    I.loginAsVendor();
    helpers.vendoraddsupporticket();
    I.wait(5);
    session('Customer send query through support', () => {
              I.loginAsCustomer();
              helpers.Getsupport();
});
    helpers.ReplyTicket();
    //  session('Customer check vendor ticket Reply', () => {
    //           helpers.CustomerCheckSupportTicket();
    //  });
});

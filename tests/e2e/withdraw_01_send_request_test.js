Feature('Vendor Send withdraw Request Functionality');

Scenario('test something', ({ I }) => {
    I.loginAsVendorTwo();
        //I.wait(10);
        I.click('Withdraw');
        I.fillField('#withdraw-amount','200');
        I.selectOption('#withdraw-method','Bank Transfer');
        I.click('Submit Request');
        I.wait('5');
        I.see('Your request has been received successfully and being reviewed!');
});
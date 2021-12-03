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
var regex= /[$,]/gm;

const { I, loginAs } = inject();

module.exports = {
    async adminBalanceCheck() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.wait(5);
        I.scrollTo(locator.AdminBalance);
        let ad_bal = await I.grabTextFrom(locator.AdminBalance);
        // admin_existing_balance = parseInt(ad_bal.replace('৳', "").replace('$', "").trim());
        // console.log('Admin Existing Balance:', admin_existing_balance);
        
        admin_existing_balance = +parseFloat(ad_bal.replace(regex, '')).toFixed(2);
        console.log('Admin Existing Balance:', admin_existing_balance);
    },
    adminlogout() {
        I.moveCursorTo(locator.AdminMoveCursor);
        I.wait(1);
        I.click(locator.AdminLogout);
    },
    async getAdminComission() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports?tab=logs');
        I.wait(5);
        let ad_com = await I.grabTextFrom(locator.AdminComission);
        // admin_current_commission = parseInt(ad_com.replace('৳', "").replace('$', "").trim());
        // console.log('Admin Current Commission:', admin_current_commission);


        admin_current_commission = +parseFloat(ad_com.replace(regex, '')).toFixed(2);
        console.log('Admin Current Commission:', admin_current_commission);
    },
    async checkAdminCalculation() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.wait(5);
        I.scrollTo(locator.AdminBalance);
        admin_current_balance = admin_existing_balance + admin_current_commission;
        console.log('Admin Current Balance:', admin_current_balance);
        let ad_actual_bal = await I.grabTextFrom(locator.AdminBalance);
        // admin_actual_balance = parseInt(ad_actual_bal.replace('৳', "").replace('$', "").trim());
        let admin_current_balance_afterparse = +admin_current_balance.toFixed(2);
        console.log('Admin Current Balance after parse:', admin_current_balance_afterparse);

        admin_actual_balance = +parseFloat(ad_actual_bal.replace(regex, '')).toFixed(2);
        strict.equal(admin_current_balance_afterparse, admin_actual_balance, "Message Done");
        console.log('Admin Existing Balance', admin_existing_balance, '+', 'Current Comission', admin_current_commission, '=', 'Admin Actual Balance', admin_existing_balance + admin_current_commission);
        I.say('Calculation matched');
    },
    async checkExistingBalance() {
        I.amOnPage('/dashboard/withdraw');
        const bal = await I.grabTextFrom(locator.VendorBalance);
        // existing_balance = parseInt(bal.replace(/[, \$৳]+/g, ""));
        existing_balance = +parseFloat(bal.replace(regex, '')).toFixed(2);
        console.log('Existing Balance:', existing_balance);
    },
    async grabCurrentEarnings() {
        I.amOnPage('/dashboard/orders');
        //I.click('Orders');
        let earning = await I.grabTextFrom(locator.CurrentEarning);
        // current_earnings = parseInt(earning.replace(/[, \$৳]+/g, ""));
        current_earnings = +parseFloat(earning.replace(regex, '')).toFixed(2);
        console.log('Current Earning ', current_earnings);

    },
        async balanceAssertEqual() {
        // this.grabCurrentEarnings();
        I.amOnPage('/dashboard/withdraw');
        current_balance = existing_balance + current_earnings;
        console.log('Current balance', current_balance);
        // console.log('Current balance2', existing_balance ,current_earnings);
        
        const up_bal = await I.grabTextFrom(locator.VendorBalance);
        // actual_balance = parseInt(up_bal.replace(/[, \$৳]+/g, ""));
        let current_balance_afterparse = +current_balance.toFixed(2);
        actual_balance = +parseFloat(up_bal.replace(regex, '')).toFixed(2);
        strict.equal(current_balance_afterparse, actual_balance);
        I.say('Calculation matched');
        console.log('Existing Balance', existing_balance, '+', 'Current Earning', current_earnings, '=', 'Actual Balance', existing_balance + current_earnings);

    },

}
# The Withdraw page and manual Withdraw requests are always on in Lite, and only add-ons switch them off

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Some marketplaces pay Vendors automatically (for example through a payment gateway that splits the payment) and do not want Vendors to see a Withdraw page at all; others want Withdraws created on a schedule instead of on request. Lite has no settings for either, but it defines two switches that add-ons flip. Teammates ask why a Withdraw page or a "Request Withdraw" button is missing on one site and present on another.

## Rule

- **The whole Withdraw feature for Vendors** is governed by `dokan_withdraw_is_disabled()` (`lite:includes/Withdraw/functions.php::dokan_withdraw_is_disabled()`), which returns the `dokan_withdraw_disable` filter with default `false`. When an add-on turns the Withdraw feature off, Vendors do not create Withdraw requests at all, and the vendor dashboard Withdraw page redirects to the dashboard (`Dashboard\Templates\Withdraw::__construct()`, `lite:includes/Dashboard/Templates/Withdraw.php::__construct()`).
- **Manual requests** are governed by `dokan_withdraw_is_manual_request_enabled()` (`lite:includes/Withdraw/functions.php::dokan_withdraw_is_manual_request_enabled()`), which returns the `dokan_withdraw_manual_request_enable` filter with default `true`. When an add-on turns manual requests off, Vendors do not create requests by hand, and Withdraws arrive by another route (for example scheduled requests created by the add-on). The "Request Withdraw" controls are then not rendered in the legacy templates (`lite:templates/withdraw/withdraw-dashboard.php` and `lite:templates/withdraw/status-listing.php`, the `dokan_withdraw_is_manual_request_enabled()` checks) or the React dashboard, which receives the flag as `withdraw.isManualWithdrawEnable` (`lite:includes/Withdraw/Hooks.php::localize_withdraw_scripts()`; `lite:src/dashboard/withdraw/RequestWithdrawBtn.tsx::RequestWithdraw()`, `lite:src/dashboard/withdraw/Balance.tsx::Balance()`). The Balance, history and payment-method sections stay visible.
- **Lite on its own** leaves both switches at their defaults: the Withdraw page is shown and Vendors request Withdraws manually.

## Settings that change it

None in Lite. Add-ons attach their own settings to the two filters above, for example:

- a "hide the Withdraw option" setting that returns `true` from `dokan_withdraw_disable` and removes the Withdraw menu items;
- a "manual withdraw" disbursement toggle that drives `dokan_withdraw_manual_request_enable`.

`WithdrawControllerV2::get_withdraw_settings()` also reports `is_manual_withdraw_enable` from an add-on's `dokan_withdraw[disbursement][manual]` option (`lite:includes/REST/WithdrawControllerV2.php::get_withdraw_settings()`). On a site without such an add-on that key does not exist, so this field reads `false` even though manual requests are enabled; Lite's own dashboards use the filter-based flag instead.

## Worked example

- Lite only: a Vendor opens Dashboard → Withdraw and sees the Balance and a "Request Withdraw" button.
- An add-on returns `false` from `dokan_withdraw_manual_request_enable`: the same page shows the Balance and history, but no request button, and the Vendor does not create requests by hand.
- An add-on returns `true` from `dokan_withdraw_disable`: visiting Dashboard → Withdraw redirects to the dashboard home, and the Vendor does not create Withdraw requests.

## Edge cases

- **API clients** that read `GET dokan/v2/withdraw/settings` should treat `is_manual_withdraw_enable` as meaningful only when an add-on manages disbursement settings.
- **Reverse withdrawal** can independently hide the Withdraw menu for an overdue Vendor; see [ADR-0060](./0060-overdue-reverse-withdrawal-debt-can-block-withdraws-but-is-never-deducted-from-the-balance.md).

## Why

No recorded decision. Keeping the switches as filters lets Lite stay free of disbursement settings while add-ons that change how Vendors are paid can hide what no longer applies.

## Consequences & risks

- The source of a hidden Withdraw page is never visible in Lite's settings; support must check which add-on hooks the filters.
- Two different "manual enabled" signals exist (the filter and the REST settings field), which can disagree on a site without the add-on.

## Recommendations

- Make `get_withdraw_settings()` report `dokan_withdraw_is_manual_request_enabled()` so both signals agree.
- Surface, in the Lite settings screen, a read-only note when an add-on has switched either flag, so admins can see why the page or button is missing.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._

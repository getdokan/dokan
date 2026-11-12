# The Withdraw page and manual Withdraw requests are always on in Lite, and only add-ons switch them off

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

Some marketplaces pay Vendors automatically (for example through a payment gateway that splits the payment) and do not want Vendors to see a Withdraw page at all; others want Withdraws created on a schedule instead of on request. Lite has no settings for either, but it defines two switches that add-ons flip. Teammates ask why a Withdraw page or a "Request Withdraw" button is missing on one site and present on another.

## Rule

- **The whole Withdraw feature for Vendors** is governed by `dokan_withdraw_is_disabled()` (`lite:includes/Withdraw/functions.php:477-479`), which returns the `dokan_withdraw_disable` filter with default `false`. When it is true, the vendor dashboard Withdraw page redirects to the dashboard (`Dashboard\Templates\Withdraw::__construct()`, `lite:includes/Dashboard/Templates/Withdraw.php:43-46`).
- **Manual requests** are governed by `dokan_withdraw_is_manual_request_enabled()` (`lite:includes/Withdraw/functions.php:466-468`), which returns the `dokan_withdraw_manual_request_enable` filter with default `true`. When it is false, the "Request Withdraw" controls are not rendered in the legacy templates (`lite:templates/withdraw/withdraw-dashboard.php:49`, `lite:templates/withdraw/status-listing.php:39`) or the React dashboard, which receives the flag as `withdraw.isManualWithdrawEnable` (`lite:includes/Withdraw/Hooks.php:60-70`; `lite:src/dashboard/withdraw/RequestWithdrawBtn.tsx:339`, `lite:src/dashboard/withdraw/Balance.tsx:94`). The Balance, history and payment-method sections stay visible.
- **The switches act on the screens only.** `dokan_withdraw_is_disabled()` is read only by the legacy dashboard page above, and `dokan_withdraw_is_manual_request_enabled()` only by the legacy templates and the React localisation (`lite:includes/Withdraw/Hooks.php:65`). The AJAX handler and `POST dokan/v1/withdraw` check neither, and the React `/withdraw` route is gated only by the `dokan_view_withdraw_menu` capability (`lite:src/routing/routes.tsx:31-37`). A Vendor can therefore still create a request through the API while an add-on has switched either one off.
- **Intended meaning.** When an add-on turns the Withdraw feature off, Vendors are not to create Withdraw requests at all; when it turns manual requests off, Vendors are not to create requests by hand, and Withdraws arrive by another route (for example scheduled requests created by the add-on).
- **Lite on its own** leaves both switches at their defaults: the Withdraw page is shown and Vendors request Withdraws manually.

## Settings that change it

None in Lite. Add-ons attach their own settings to the two filters above. In Pro:

- **Hide Withdraw Option** (`dokan_withdraw[hide_withdraw_option]`, default `off`; "Withdraw Option Visibility" on the new screen) returns `true` from `dokan_withdraw_disable` and removes the Withdraw menu items (`pro:includes/Hooks.php:21`, `:35-41`; `pro:includes/Withdraw/Manager.php:1198-1211`).
- The **Manual Withdraw** disbursement toggle (`dokan_withdraw[disbursement][manual]`, on by default) drives `dokan_withdraw_manual_request_enable` (`pro:includes/Withdraw/Manager.php:51`, `:1256-1258`; `pro:includes/Withdraw/Helper.php:232-234`, `:290-292`).

`WithdrawControllerV2::get_withdraw_settings()` also reports `is_manual_withdraw_enable` from an add-on's `dokan_withdraw[disbursement][manual]` option (`lite:includes/REST/WithdrawControllerV2.php:103`). On a site without such an add-on that key does not exist, so this field reads `false` even though manual requests are enabled; Lite's own dashboards use the filter-based flag instead.

## Worked example

- Lite only: a Vendor opens Dashboard → Withdraw and sees the Balance and a "Request Withdraw" button.
- An add-on returns `false` from `dokan_withdraw_manual_request_enable`: the same page shows the Balance and history, but no request button.
- An add-on returns `true` from `dokan_withdraw_disable`: visiting Dashboard → Withdraw redirects to the dashboard home.

## Edge cases

- **API clients** that read `GET dokan/v2/withdraw/settings` should treat `is_manual_withdraw_enable` as meaningful only when an add-on manages disbursement settings.
- **Reverse withdrawal** can independently hide the Withdraw menu for an overdue Vendor; see [ADR-0060](./0060-overdue-reverse-withdrawal-debt-can-block-withdraws-but-is-never-deducted-from-the-balance.md).

## Why

No recorded decision. Keeping the switches as filters lets Lite stay free of disbursement settings while add-ons that change how Vendors are paid can hide what no longer applies.

## Consequences & risks

- The source of a hidden Withdraw page is never visible in Lite's settings; support must check which add-on hooks the filters.
- Hiding the page or the request button does not stop requests sent to the AJAX handler or the REST API.
- Two different "manual enabled" signals exist (the filter and the REST settings field), which can disagree on a site without the add-on.

## Recommendations

- Make `get_withdraw_settings()` report `dokan_withdraw_is_manual_request_enabled()` so both signals agree.
- Surface, in the Lite settings screen, a read-only note when an add-on has switched either flag, so admins can see why the page or button is missing.

_Verified against Lite @1808fb2ac / Pro @c6096e669 / WooCommerce 11.2.1 — 2026-11-12._

# In Dokan Lite Vendors cannot create coupons and every coupon is a Store Admin WooCommerce coupon

Status: Accepted (retroactive — documents existing code)

## Context

Teammates and support staff regularly ask "can a Vendor make their own coupon?" and "if the admin makes a coupon, which stores does it apply to?" The answer differs between Dokan Lite on its own and Dokan Lite with an add-on. This ADR records the Lite-only behaviour and the seams Lite provides for add-ons.

## Rule

**Dokan Lite has no Vendor coupon screen, endpoint or editor. The only coupons in a Lite-only marketplace are ordinary WooCommerce coupons created by the Store Admin, and they apply to any Vendor's products according to WooCommerce's own restrictions, with one Dokan restriction for fixed cart coupons.**

- **No Vendor coupon UI.** Lite registers no "Coupons" Vendor dashboard menu, no coupon form and no Vendor coupon REST route. It only reserves the pieces an add-on needs:
  - the Vendor capabilities `dokan_add_coupon`, `dokan_edit_coupon`, `dokan_delete_coupon` and `dokan_view_coupon_menu` in `dokan_get_all_caps()` (`lite:includes/functions.php:2859-2863`, `:2885`), which the installer grants to the `seller`, `administrator` and `shop_manager` roles (`lite:includes/Install/Installer.php:204-217`); holding them has no effect until an add-on adds a coupon screen;
  - `dokan_get_coupon_edit_url()`, which builds a link to a `coupons` Vendor dashboard page (`lite:includes/functions.php:2027-2044`).
- **Store Admin coupons cross Vendors.** A coupon created in WooCommerce → Marketing → Coupons is validated by WooCommerce (`WC_Discounts::is_coupon_valid()`, `wc:includes/class-wc-discounts.php:1246-1291`). Lite adds no Vendor scoping: a `percent` or `fixed_product` coupon with no product restrictions discounts eligible items of every Vendor in the cart.
- **Fixed cart coupons stay single-vendor.** See [ADR-0088](./0088-a-fixed-cart-coupon-can-be-used-only-when-every-product-in-the-cart-comes-from-one-vendor.md).
- **Every coupon is Vendor-funded in commission** unless an add-on writes the funding meta; see [ADR-0024](./0024-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md).
- **Add-on seams.** Add-ons may add Vendor coupons and Vendor limits through `dokan_coupon_is_valid` (`lite:includes/Order/Hooks.php:491`), `dokan_wc_coupon_applied` (`lite:includes/Vendor/Coupon.php:124`), `dokan_coupon_should_validate` (`lite:includes/Vendor/Coupon.php:119`) and the coupon meta keys copied into `_dokan_coupon_info` (`lite:includes/Vendor/Coupon.php:172-181`).

## Settings that change it

None in Lite. WooCommerce's "Enable the use of coupon codes" setting (`woocommerce_enable_coupons`) switches coupons off for the whole store, Vendors included.

## Worked example

Lite only. The Store Admin creates `SPRING15` (`percent`, 15 %, no product restrictions, usage limit per user 1). A Customer buys Vendor A's jacket (200.00) and Vendor B's scarf (40.00) and applies `SPRING15`:

- jacket −30.00, scarf −6.00 (WooCommerce's percentage per item);
- Suborder A carries a `SPRING15` line of 30.00, Suborder B one of 6.00;
- in commission both discounts are Vendor-funded (no funding meta), so each Vendor's Earning is computed on the discounted line total.

## Edge cases

- **Store Admin–owned products** are discounted like any Vendor's products.
- **Product restrictions** set by the Store Admin (products, categories, exclusions, sale items) work exactly as in WooCommerce and are the only way to aim a coupon at one Vendor in Lite.
- **Usage limits** are counted per order, including Suborders; see [ADR-0087](./0087-a-coupon-used-on-a-multi-vendor-order-counts-one-use-for-the-order-and-one-for-each-suborder.md).

## Why

Lite keeps the marketplace core (orders, Suborders, commission, Balance) and leaves Vendor-facing promotion tools to add-ons, while still recording per-line coupon data so that any add-on's coupons split correctly across Vendor orders.

## Consequences & risks

- A Lite-only marketplace that wants a "store-specific" coupon must create it as Store Admin and restrict it to that Vendor's products by hand.
- Vendors hold coupon capabilities that do nothing in Lite; capability-based UI checks should not be read as "the Vendor can make coupons".

## Recommendations

- Grant the coupon capabilities only when a coupon screen is actually available, or label them as add-on capabilities in the staff-permission UI.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._

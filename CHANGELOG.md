### v4.0.5 ( Jul 24, 2025 ) ###
- **fix:** Improved script loading to ensure compatibility with WooCommerce versions above 10.0.2, preventing potential issues with script dependencies.

### v4.0.4 ( Jul 17, 2025 ) ###

- **update:** Admin Notice UI with Modern Design and Improved User Experience.
- **update:** Enhanced Product Brand Integration with Dedicated Template and Manager Methods.
- **update:** Enhanced product featured image selection with cropping functionality in the product editor.
- **fix:** Vendor/store names with special characters (e.g., apostrophes) now display correctly in the vendor dropdown on the admin product edit screen.
- **fix:** Display correct earning in vendor dashboard product add/edit page for different category.
- **fix:** Update table header style for mobile display in order details page item list and withdraw approve, pending and cancel list.
- **fix:** Improved how product inventory information is retrieved, ensuring more accurate and consistent display of stock values.
- **fix:** Update table header style for mobile display in order details page item list and withdraw approve, pending and cancel list.
- **fix:** Resolve an issue for "sold individually" option does not save on create or update a product.

### v4.0.3 ( Jul 02, 2025 ) ###

- **fix:** Add gradient background style for fa-threads social icon.
- **fix** Resolved an issue where array access warnings in vendor balance calculation were being triggered.
- **fix** Resolved an issue where incorrect timestamp on sale price schedule hampering product sales schedule added from vendor dashboard.
- **fix** Resolved an issue where stock quantity always shows 0 in vendor dashboard product edit screen.
- **fix** Improved the format of payment methods in the withdrawal settings to ensure they are consistently returned as a zero-based indexed list in the REST API response.


### v4.0.2 ( Jun 03, 2025 ) ###

- **fix:** Resolved an issue where the single store page header style was broken on multiple themes.
- **fix:** Added proper type checking for product and author objects in the product tab template to prevent potential errors when invalid data is passed.
- **fix:** Skip cart validation for reverse withdrawal in Stripe Express.
- **fix:** Fix admin dashboard order details page items meta-box content and commission meta-box content  not showing properly.
- **fix:** Fixed analytics view permissions to access analytics data for users. Thanks to @oliviertassinari for the contribution.
- **fix:** Adjust the admin commission and order total to exclude partial refund for display where needed.
- **fix:** Clarify output language in AI response based on the input language.

### v4.0.1 ( May 08, 2025 ) ###

- **update**: Replaced the WordPress.org banner image with a new version for improved branding.
- **fix:** Added number value data type casting in order commission.

### v4.0.0 ( May 06, 2025 ) ###

- **new:** AI-powered auto-completion for product content (titles, short and long descriptions). Integrated with OpenAI and Gemini GPT models, improves content creation speed and consistency, allows selection of preferred AI provider
- **new:** WooCommerce Brand management support in Vendor Panel, Vendors can assign brands during product creation, editing
- **new:** Introduced Dokan link components with success, warning, info, and danger variants using Tailwind utility classes
- **new:** Introduced Dokan button components with success, warning, info, and danger variants using Tailwind utility classes
- **new:** Introduced Dokan badge components with primary, secondary, success, warning, info, and danger variants using Tailwind utility classes
- **new:** Introduced Dokan alert components with success, warning, info, and danger variants using Tailwind utility classes
- **new:** Created Dokan price input component formatted according to WooCommerce settings
- **new:** Implemented internal error React component for error boundary and integrated with Analytics feature
- **new:** Introduce product & product categories data store
- **new:** Introduced comprehensive setup guide panel with multiple steps for admin
- **new:** Introduce vendor analytics feature integrating with WooCommerce analytics system.
- **update:** Migrated color scheme from 'default' to 'Majestic Orange' for improved visual consistency
- **update:** Enhanced withdrawal display with proper currency symbols and formatting according to WooCommerce settings
- **update:** Refined Dokan primary and secondary button colors including text, background, border and shadow for tertiary button
- **update:** Updated color scheme in the dummy data importer to align with Dokan's brand color
- **update:** Redesign the upgrade modal using ReactJS framework for improved performance and user experience
- **update:** Enhanced withdraw with modern UI for better user experience
- **update:** Optimized withdraw request process with reduced loading times
- **update:** Reimagined withdraw management interface with cleaner layouts
- **update:** Skeleton loaders for withdraw screens to improve perceived performance during data fetching
- **update:** UI inconsistencies in withdraw request and history views
- **update:** Better error handling for withdraw actions
- **update:** Improved onboarding experience with modern UI and intuitive setup flow.
- **fix:** Resolved an issue where the vendor dashboard menus  UI with submenus and notification counters were breaking
- **fix:** Product reviews not working from admin
- 
### v3.14.11 ( Mar 14, 2025 ) ###

- **update:** Dokan now displays prices based on the decimal points setup in WooCommerce.
- **update:** Added charge and receivable amount in withdraw email templates.
- **fix:** Resolve an issue when displaying admin earning in admin order list.
- **fix:** Dokan registration form asset loading issue on Elementor My Account widget.
- **fix:** Resolved an issue where revoking access to digital product content from order details page reverts on page reload.
- **fix:** Vendor setup wizard form validation added to properly handle countries without states.

### v3.14.10 ( Feb 28, 2025 ) ###

- **fix:** Prevented wrong store URL generation for staff managers on admin dashboard.
- **fix:** Restoring parent order with restore related child orders.
- **fix:** Store settings API data storing inconsistencies.

### v3.14.9 ( Feb 12, 2025 ) ###

- **fix:** Fix earning suggestion in vendor dashboard when product edit page loads initially.
- **fix:** Fix vendor earning suggestion currency, currency position, decimal separator in vendor dashboard product edit page.
- **fix:** Fix vendor earning suggestion for invalid product price.
- **fix:** Tax calculation for shipping based on tax status
- **feat:** Rollback support for product statues on dokan pro deactivation.
- **refactor:** Improved dokan_is_user_seller function by adding strict comparison to differentiate between vendor and staff.

### v3.14.8 ( Jan 29, 2025 ) ###

- **update:** Missing parameters support added for the reverse-withdrawal API endpoints.
- **update:** Missing parameters support added for the Settings API endpoints.
- **fix:** Fixed an error when navigating to the product edit page with an invalid (non-numeric) product ID.
- **fix:** Fixed a misspelling typo vendor contact form input field.
- **fix:** Fixed and updated analytics cache modifier for seller analytics filter.

### v3.14.6 ( Jan 09, 2025 ) ###

- **fix:** Translations on Admin Commission Setup Wizard, Withdraw, Withdraw Log, Add Reverse Withdraw, Dummy Data, and Vendor Single pages were not working due to wrong text-domains.

### v3.14.5 ( Jan 06, 2025 ) ###

- **update:** Improvement vendor setup wizard ui.
- **update:** Improvement withdraw approved email template.
- **update:** Dokan admin settings page responsive & update ui design.

### v3.14.4 ( Dec 27, 2024 ) ###

- **fix:** Added tweaks to improve system stability and smoothness.

### v3.14.3 ( Dec 11, 2024 ) ###

- **update:** Updated Dokan admin header to display current pro plan and version with upgrading option.

### v3.14.2 ( Dec 06, 2024 ) ###

- **update:** Added commission setting option in product bulk edit for Admin.

### v3.14.1 ( Dec 04, 2024 ) ###

- **fix:** Fixed a issue in the commission upgrader to deal with empty values for product and vendor.

### v3.14.0 ( Dec 02, 2024 ) ###

- **new:** Commission amount now displayed in the product list within the admin dashboard.
- **new:** Vendor earning amount displayed in the product list within the vendor dashboard.
- **new:** Vendor earning suggestions on the product add and edit pages in the vendor dashboard for simple and variable products.
- **new:** Commission details metabox on the order details page in the admin dashboard is now visible for child orders or orders without a parent.
- **new:** Related order metabox on the order details page in the admin dashboard, displaying sibling orders for child orders and child orders for parent orders.
- **new:** Backward compatibility for flat, percentage, and combine commission types for older orders.
- **update:** Updated commission types from flat, percentage, and combine to fixed and category-based commissions.
- **update:** Overhauled the commission UI across Dokan global settings, vendor settings, product settings, Dokan subscription product settings, and the admin setup wizard.
- **update:** Updated the commission settings in the admin setup wizard.
- **update:** Enhanced responsiveness of the UI for Dokan admin dashboard settings menus.
- **update:** Product is rebranded with new branding.
- **update:** As per new branding of Dokan Multivendor Plugin, full product is rebranded with new theme color.
- **fix:** Moved the vendor edit page from Dokan Pro to Dokan Lite and eliminated the commission setting from the WordPress default user profile page.
- **fix:** Removed the commission from every category, introducing category-based commission in global settings, vendor settings, Dokan subscription products, and the admin setup wizard.

### v3.13.1 ( Nov 11, 2024 ) ###

- **update:** Compatibility with the Printful Integration Module added.
- **fix:** Improved logic to ensure the `add new category` button only appears when appropriate conditions are met, enhancing user experience.


### v3.13.0 ( Nov 06, 2024 ) ###

- **feat:** Replaced the Dokan array container with the League Container, ensuring backward compatibility for seamless performance and enhanced flexibility.
- **feat:** Updated Dokan to be fully compatible with WooCommerce Analytics Reports

### v3.12.6 ( Oct 24, 2024 ) ###

- **fix:** Fixed js error on frontend pages.

### v3.12.5 ( Oct 16, 2024 ) ###

- **fix:** Implement order trash and untrash handling for Dokan
- **fix:** Added WordPress native i18n support

### v3.12.4 ( Oct 03, 2024 ) ###

- **update:** Added `$data` parameter to `dokan_update_vendor` hook.

### v3.12.3 ( Sep 30, 2024 ) ###

- **update:** Added compatibility with RFQ state field ui.

### v3.12.2 ( Sep 23, 2024 ) ###

- **fix:** Product gallery image uploader close button style fix.
- **fix:** Fix incorrect sub-order status updates when the main order status changed specifically for cancelled sub-orders.
- **fix:** Fixed vendor coupon validation for various discount item types.

### v3.12.1 ( Aug 30, 2024 ) ###
- **fix:** Resolve fatal error when updating Dokan Lite to 3.12.0 with Dokan Pro 3.9.7.

### v3.12.0 ( Aug 29, 2024 ) ###

- **fix:** Displaying incorrect withdrawal amount when using decimal separator as thousand.
- **fix:** Removed multiple invoice button for dokan sub-orders.
- **fix:** Ensure accurate stock updates when vendors edit products while sales occur. Thanks @brunomendespereira

### v3.11.5 ( Aug 7, 2024 ) ###

- **fix:** Fixed data updating issue on Admin color picker settings.
- **fix:** Fixed extra slashes issue on store url when translated via WPML.

### v3.11.4 ( Jul 10, 2024 ) ###

- **update:** Direct links to the relevant settings from vendor progress bar added.
- **fix:** Some deprecation warning resolved.
- **fix:** Shop URL rendered double slash when using WPML on vendor registration.
- **fix:** Fatal error in block editor on adding and editing page with customer-migration shortcode.

### v3.11.3 ( Jun 10, 2024 ) ###

- **fix:** Responsive issue on vendor dashboard tabs preview.

### v3.11.2 ( May 27, 2024 ) ###

- **update:** WooCommerce 8.9.1 Compatibility added.

### v3.11.1 ( May 16, 2024 ) ###

- **new:** Action hook `dokan_dashboard_sidebar_start` added.
- **new:** Action hook `dokan_dashboard_sidebar_end` added.

### v3.11.0 ( May 10, 2024 ) ###

- **fix:** The status of sub-orders does not update to completed if it contains only virtual products.

### v3.10.4 ( Apr 25, 2024 ) ###

- **fix:** Vendor dashboard Order status filter menu displayed a duplicate border.
- **fix:** Vendor dashboard withdraw page display get hidden.

### v3.10.3 ( Apr 17, 2024 ) ###

- **update:** Notification count support added for vendor dashboard
- **update:** added a new filter to set a default value for I am a customer / I am a vendor radio button
- **update:** Processing Order count added for vendor dashboard orders menu
- **update:** Performance improvements for vendor dashboard -> order details page -> downloadable product permission section
- **update:** Admin can change product author from REST API
  Previously, product_author was read-only property, now admin can change product_author for an existing product or create a new product for another author.
- **update:** Warning message styling for selecting fixed cart discount on admin coupon add edit page
- **fix:** Advertisement product not purchasable for own product purchasing restriction
- **fix:** Header Template number one breaks without background image
- **fix:** html entity showing in product tag selection in vendor dashboard.
- **fix:** Vendor add notification switch in admin dashboard
- **fix:** Under wooCommerce my-account registration section, `I am a customer` was forced to be set as the default value. With this PR this problem has been fixed.

### v3.10.2 ( Apr 01, 2024 ) ###

- **update:** Email placeholder, additional content support and formatting added
- **update:** Add requires plugin header for dokan so that required plugin check can be initiated.
- **fix:** Vendor profile progress bar doesn't update if the address is filled from the vendor registration form
- **fix:** Color synchronization issue in vendor dashboard order notes
- **fix:** product review email cannot be disabled without also disabling Contact Vendor email
- **fix:** Order Export to CSV on the filtered list not working

### v3.10.1 ( Mar 18, 2024 ) ###

- **update:** Update Categories Easily from Vendor Edit Page
  In earlier versions of the Dokan plugin for WordPress and WooCommerce, editing store categories was limited to the vendor details view page. This approach created confusion and made it difficult for users to manage their store categories effectively. However, with the latest update, a significant improvement has been introduced.
  Now, you can conveniently edit and update your store categories directly from the vendor edit page in the admin dashboard. This enhancement provides a more intuitive and user-friendly experience, allowing you to efficiently manage and organize your store categories in one central location.
- **update:** Threads social media platform added as a Store Socials Option. Thanks `@fisher2470`
- **update:** Vendor Dashboard settings submenu translation support added

### v3.10.0 ( Mar 04, 2024 ) ###

- **new:** Added a new filter hook named `dokan_product_cache_delete_all_data`, by using this one can prevent deleting product cache if necessary.
- **update:** Updated FontAwesome library to version 6.5.1
- **fix:** Fixed Elementor mega menu z-index conflict and removed line break from address fields

### v3.9.9 ( Feb 12, 2024 ) ###

- **new:** Added PHP 8.2 support
- **fix:** Fixed an issue where the Dokan seller setup wizard does not display a warning message when a seller fails to provide the state for a country that has a state.
- **fix:** Vendor setup wizard issue [#1976] - Properly closed the style tag in the Store Setup step to avoid conflicts with customizations.
- **fix:** Fixed a bug in the store-lists-filter.php template that used the wrong escaping function for the placeholder attribute. [#1984]
- **fix:** Withdrawal class check-in Templates/Withdraw.php.
  This fixes a fatal error that could occur when creating a withdrawal request with cache-enabled sites.
- **fix:** The `Share Essentials` field’s description was missing from the Dokan admin setup wizard. This pull request fixes an issue where the description field was not showing up in the Dokan admin setup wizard. It also adds a new hook and admin options to store the `Share Essentials` settings.
- **fix:** Fixed an issue where the sub-orders disappear from the WooCommerce order lists page when orders are filtered by a specific vendor or by sub-order ID when the HPOS feature is enabled.
- **update:** Added validation for bank payments and address data in Dokan Seller Setup Wizard.

### v3.9.8 ( Jan 30, 2024 ) ###

- **fix:** Updated Appsero Client SDK library to version 2.0.2 which will fix a security issue with the previous version of the library and a fatal error caused by the library.

### v3.9.7 ( Jan 29, 2024 ) ###

- **update:** Added WooCommerce Cart and Checkout Block supports for Dokan Lite
- **fix:** Fixed an issue where the vendor’s store map address was not saved during vendor setup wizard configuration
- **fix:** Some links under the vendor dashboard weren't working properly due to a nonce mismatch. With this release, those issues have been fixed.
- **fix:** Fixed an issue where the valid store name required check was missing from the customer-to-vendor migration form.
- **fix:** Fixed an issue where the customer buys digital and physical products from different vendors, shipping charges are applied separately to each vendor.
- **fix:** Fixed some translation-related issues with the date range picker
- **fix:** Fixed some translation-related issues with Dokan Sweetalert


### v3.9.6 ( Jan 11, 2024 ) ###

- **new** Features: Withdraw Charge
  Dokan has introduced a new feature that allows the admin to set a withdrawal charge for vendors. This charge can be either a flat rate or a percentage of the withdrawal amount based on the payment gateway used. The charge will be reflected in the details report, and vendors can see how many charges will apply when they request a withdrawal. The vendor dashboard list will also show the charge and receivable amount. This feature provides greater flexibility and transparency in managing vendor withdrawals.

### v3.9.5 ( Dec 28, 2023 ) ###

- **fix:** API request on get all orders returns empty results for the endpoint http://dev.test/wp-json/dokan/v1/orders due to default customer id was set to 0.

### v3.9.4 ( Dec 12, 2023 ) ###

- **fix:** Fixed an issue where the Vendor class shop_data persistence is broken on save()
- **fix:** Fixed a fatal error while trying to edit a subscription under WordPress Admin Panel → WooCommerce → Subscription menu of the WooCommerce Subscription Plugin.
- **fix:** Toggle Sub-Orders and Show Sub-Orders buttons are not working if HPOS feature is disabled.

### v3.9.3 ( Nov 30, 2023 ) ###

- **fix:** Fixed an issue where the Tab fields under the product Add/Edit page don’t display predefined tags until users start typing to select tags.

### v3.9.2 ( Nov 13, 2023 ) ###

- **new:** A new email template has been introduced named Dokan Vendor Product Review. After a product has been reviewed, an email containing information about the review is sent to the vendor. The email includes details such as the reviewer’s name, product name, review rating, and text. The email also contains a link to the review page where the vendor can view the review and respond if necessary.
- **update:** Display a non-purchasable notice for the vendor’s own products.
- **fix:** [RestAPI] Fixed an issue where getting a single order via API gives an 'invalid ID' error If the compatibility mode isn't enabled for the HPOS feature on WooCOmmerce Order data storage settings
- **fix:** [ProductReview] Previously the email notification sent by WordPress when a review was added to a product, was sent to the product owner. This was wrong in the context of a marketplace. Because the email sent by WordPress includes some sensitive information, like the admin dashboard URL, customer email address, etc. With these changes, we are making sure that only the marketplace admin gets the new review emails sent by WordPress.
- **fix:** Previously, there was an issue where selecting “All,” then “None,” and subsequently “All” again didn’t function as expected. This occurred on the vendor product edit page for simple products, specifically within the Attributes section. However, following this update, all special cases of the “Select All” feature now work flawlessly.

### v3.9.1 ( Oct 17, 2023 ) ###

- **update:** Removed flaticon packages and replace used icons with fontAwesome icons. This will reduce the plugin zip size.
- **update:** Added a new settings to disable fontAwesome library
- **update:** Changed all the single date picker fields with daterange picker. This updates will keep the design consistent throughout the plugin.
- **fix:** [StoreOpenCloseTime] An issue where invalid store opening or closing times generate warning and fatal error on single store page.
- **fix:** [Email] Fixed an issue where the product edit link on email template redirects to the products listing instead of single product edit page
- **fix:** Fixed some responsive issue under vendor dashboard product edit page.
- **fix:** Fixed some responsive issue under vendor dashboard withdraw page.

### v3.9.0 ( Oct 06, 2023 ) ###

- **new:** Added two new hooks named `dokan_get_admin_report_data` and `dokan_get_overview_data` to extend Dokan reports functionality.
- **fix:** Resolved an issue where the `Tracking Number` button was still visible under the `Vendor Dashboard → Order Details → Order Note section` even after the `Shipment Tracking` feature was enabled by the admin.
- **fix:** [WidgetProductAttribute] Fixed an issue where the `Filter Products by Attribute` widget was not working for Multi-Word Attributes.
- **update:** Added a new filter named `dokan_get_store_url` to filter store URLs for a single store.
- **update:** Removed some redundant or not required settings from vendor store settings page, also rearranged some admin settings and added some settings under Admin dashboard.
  Details:
1. Removed `Show Vendor Info` settings under the `WordPress Admin Dashboard → Dokan → Settings → Appearance` and added it back under the `WordPress Admin Dashboard → Dokan → Settings → General → Product Page Settings` section.
2. Removed the  `More Products` setting under `Vendor Dashboard → Settings → Store Settings` and added it back as a new Admin setting under `WordPress Admin Dashboard → Dokan → Settings → General → Product Page Settings` section. Now, only the admin can control this setting.
3. Removed redundant `Store Products Per Page` setting under `Vendor Dashboard → Settings → Store Settings`. Since the admin already has this setting under `WordPress Admin Dashboard → Dokan → Settings → General`, this setting will be used from now on and only the admin can control this setting.
4. Removed redundant `Store Page Product Section` settings under `Vendor Dashboard → Settings → Store Page Product Section`. Now, only the admin can control these settings under Theme Customizer settings.

### v3.8.3 ( Sep 26, 2023 ) ###

- **update:** Added advanced filtering and CSV export feature for vendor withdraws under Admin Dashboard → Dokan → Withdraw menu.
  The ‘Withdraw’ page on the admin dashboard has been updated with advanced filtering and log exporting features. This allows admins to filter transactions based on payment method and date range, which enhances their ability to analyze and manage withdrawals. The feature to export CSV logs is also included, which makes tracking and record-keeping easier. These integrations aim to empower marketplace owners with comprehensive tools for efficient withdrawal management within the dashboard.
- **update:** [Dokan Invoice] Added PDF invoice links on Sub Order section
  Previously PDF invoice links  was not visible on Sub Order section under customer order view. After this update customer will be able to view invoice link on sub order section.
- **update:** Added backend validation of phone number used on entire Dokan plugin.
- **update:** Store category widget list default state set to collapse.
  Previously, if a store has a product count over 100 or more and the store has many product categories, the store category widget would display those categories and subcategories in an open state rather than collapsed state that the sidebar style gets broken. Now the list has a max height of 500px, which will be visible, and other elements will be visible by scrolling and the parent category that has a submenu will be in collapse mode.
- **update:** Various style improvements of Dokan frontend including Vendor Dashboard, Single Store Page, Single Product Page etc.
- **fix:** [Refund] Earlier, when refunding an order under the vendor dashboard, the tax amount decimal point rounding precision was inconsistent with WooCommerce. However, it has now been updated to be consistent with WooCommerce.
- **fix** Fixed an issue where the order status label was missing on vendor dashboard for draft orders.

### v3.8.2 ( Sep 13, 2023 ) ###

- **new:** Feature: Single-page product creation form.
  Before this release, vendors had to go through a two-step process to create a product. However, with this release, a single-page product creation form has been introduced. To enable this feature, you need to navigate to the WordPress admin panel → Dokan → Settings → Selling Options → One Page Product Creation.
  It’s important to note that in the next version of Dokan, the Add New Product popup and the Add New Product form will be removed. After that, the Single-Page product form will be the default system for creating a product from the vendor dashboard.
- **new:** Feature: Ask for product review
  The Ask for Product Review feature in Dokan allows vendors to set the product status to draft while creating a product using the single-page product creation form. After the vendor is satisfied with the edit, they can either ask for a review or publish the product directly based on the admin settings and vendor capability.
- **fix:** Fixed an issue where orders can’t be filtered by vendor under Admin Dashboard → WooCommerce → Order lists page if HPOS feature is enabled
- **fix:** Fixed an issue where multiple sub-orders has been created for a single parent order.
- **fix:** Fixed and issue while trying to delete all demo products also deleting non-dummy products while calling the API endpoints multiple times
- **fix:** Fixed an issue where Dokan Pro’s Product Status setting were used even though Dokan Pro plugin is deactivated.
- **fix:** Fixed an issue where products were visible beyond Simple Products in the product list page under the vendor dashboard when Dokan Pro was deactivated or not installed.
- **update:** Removed unnecessary product type filter from Vendor Dashboard product list page since there is only one product type available in Dokan Lite
- **update:** [VendorRegistration] Improved Compatibility with WooCommerce Password Settings
  In the past, when vendors registered using the [dokan-vendor-registration] shortcode, the process did not align with WooCommerce's automatic password generation settings. However, in the latest update, we've enhanced this process. The vendor registration form presented through the [dokan-vendor-registration] shortcode now seamlessly adheres to WooCommerce's automatic password generation settings. This enhancement ensures a more unified and user-friendly registration experience for vendors, in line with WooCommerce's standard practices.
- **update:** Added shipping tax fee recipient field setting under admin setup wizard.

### v3.8.1 ( Aug 25, 2023 ) ###

- **fix:** Fixed a console warning under Dokan admin settings for Google Map integration
- **fix:** [ReverseWithdrawal] Fixed an issue where Vendor/Admin cannot pay for reverse withdrawal balance due to a rule that vendor’s can’t purchase their own products.

### v3.8.0 ( Aug 18, 2023 ) ###

- **update:** Added HPOS (High-Performance Order Storage) support for Dokan Lite.
- **fix:** Resolved an issue where traces of order data were left on the Dokan end even after the order had been deleted from the WordPress admin panel.
  Previously, deleted orders were still visible under the Dashboard Overview menu, Reports menu, and under Withdraw menu. This issue has been fixed in the current release.
- **fix:** Multiple issues have been fixed after a product of an order has been deleted.

### v3.7.24 ( Jul 25, 2023 ) ###

- **update:** Restrictions added for vendors to review and purchase their own products.
  Previously, vendors could purchase and post reviews for their own product. Which is not logical and could manipulate the search results of a product in a marketplace. With this update, vendors will not be able to purchase or post reviews for their own product.
- **update:** [ReverseWithdrawal] Now Admin can request payment from vendors using the Reverse Withdrawal feature.
  Currently, there is no way for Site admins to request payments from vendors. For some use cases, it is essential for admins to request money from vendors. For example: In Stripe 3DS mode, if customers ask for a refund, refund will be given from the admin Stripe account, after that vendor transfer will be reversed. But if the vendor doesn't have enough money in their stripe account transfer reversal will fail, in that case, vendor balance will be negative. Another case would be for non-connected vendors, in that case, admin will be responsible for refund and admin needs to request money from vendors.
- **update:** [AdminSettings] Added a toggle switch for Google ReCaptcha in the appearance settings for better control.
- **update:** [AdminSettings] Sensitive information like API keys, client secrets, etc., are now displayed as password fields with an unhide button to improve security.
- **update:** [AdminCommission] Now, "percentage" is selected by default if the admin setup wizard is skipped in the commission setting.
- **fix:** Added some missing translations.
  Previously, the template folder at dokan-lite was missing when the .pot file was generated. With this fix template folder will be respected while generating the pot file.


### v3.7.23 ( Jul 14, 2023 ) ###

- **fix:** Fixed an issue where the withdraw request could not be approved from the Admin Dashboard via REST API.

### v3.7.22 ( Jul 12, 2023 ) ###

- **fix:** Fixed an issue where multiple withdrawal requests can be placed via API.
  If a withdrawal request was placed by a vendor until that request was approved or rejected by Admin, making another withdrawal request wasn’t possible via frontend. However, the admin was able to make a withdrawal request via REST API. With this fix, this problem now has been resolved.
- **fix:** Fixed a PHP notice for importing dummy data without providing any data via REST API
  endpoint: {{SERVER_URL}}/wp-json/dokan/v1/dummy-data/import
- **fix:** While updating the withdrawal request via REST API, the minimum withdrawal amount limit wasn’t considered. For example, if the minimum withdrawal limit was set to 50, for an existing withdrawal request, the admin can set the withdrawal value to less than 50. This issue has been fixed now.
  endpoint: {{SERVER_URL}}/wp-json/dokan/v1/withdraw/{withdraw_id}
- **fix:** Fixed an issue where store products API was returning all products instead of published products.
  endpoint: {{SERVER_URL}}/wp-json/dokan/v1/stores/{store_id}/products
- **fix:** Fixed some CSS issues on the vendor store settings page for the store banner image.
- **fix:** [Withdraw] Fixed an issue where PayPal withdraw method status was displaying default but the corresponding vendor didn’t set up the payment method yet. With this fix, we marked the payment method as needing setup instead of the default payment method.
- **fix:** [Withdraw] After connecting to a payment method, the button text changes from `Setup` to `Make default` or `default` if selected. But after disconnecting that method button text doesn't change back to `Setup`. Now this issue has been fixed.
- **update:** Updated vendor store API to support profile picture and banner delete feature. To delete one of these fields, one needs to set a 0 (zero) value while making the API request.
  endpoint: {{SERVER_URL}}/wp-json/dokan/{{version}}/stores/{store_Id}
- **update:** Added various html tag support for rich text editors on various places of vendor dashboard.
  Previously, the product editor on the vendor's side was a lot more limited than the one available on the admin side. With this update, we’ve included various tags, like heading elements, paragraphs, etc support for rich text editors.
- **update:** Added random ordering for store REST API endpoint,
  Previously, random ordering for stores wasn’t available for store API. With this update, we’ve added this feature.
  endpoint: {{SERVER_URL}}/wp-json/dokan/v1/stores/
- **update:** Added phone number validation for vendor dashboard store settings page and vendor registration form.
  Previously, for phone numbers only numeric values were accepted, now a valid phone number including spaces, -, _, (, ), etc also supports phone number fields.
- **update:** [Withdraw] Fixed an issue where withdraw payment method wasn't enabled but can be used for both manual withdrawal and auto withdraw disbursement schedules from the vendor dashboard payment settings page.

### v3.7.21 ( Jun 23, 2023 ) ###

- **fix:** Fixed an issue where gateway fees from WooCommerce PayPal Payments were not being deducted from vendors’ earnings.
  Previously, Dokan deducted PayPal Checkout fees from vendors’ earnings but did not deduct PayPal Payments fees. This was due to the fact that PayPal Payments did not set transaction fee metadata at the time. With this fix, Dokan now correctly deducts PayPal Payments fees from vendors’ earnings.
- **fix:** [VendorDashboard] Fixed some CSS issues under the vendor dashboard.
  Previously, the positioning of the mobile navigation icon on the vendor dashboard was problematic on mobile screens. Additionally, there were inconsistencies in some table columns, including the order ID column, causing visual issues. These issues have now been fixed.
- **fix:** [DokanVendorRegistration] Registration page's user selection modal is not working properly when any theme tries to use the modal for the vendor registration form.
  In earlier versions, there was a lack of synchronization between the user registration form on the "My Account" page and the user registration forms inside the modal implemented within the theme. This inconsistency created confusion and hindered the seamless registration process. However, with the latest update, significant improvements have been made to address this issue.
- **update:** Added `Become A Vendor` feature to Dokan Lite.
  Previously, this option was only available in Dokan Pro. This enhancement ensures that even customers of the Lite version can easily become vendors and start selling their products through the platform.
- **update:** [SellerSetupWizard] Added store location map on the seller setup wizard
  Introducing a new enhancement in the seller setup wizard: seamless integration of a store location map. This enhancement allows sellers to effortlessly navigate and locate their store's position within the wizard interface.

### v3.7.20 ( Jun 8, 2023 ) ###

- **new:** Added two new filter hooks named `dokan_get_vendor_orders_args` and `dokan_get_vendor_orders` to filter vendor’s order data.
  You can now filter orders returned by the `dokan()->order->all()` method using the dokan_get_vendor_orders hook.
- **new:** Added a new filter named `dokan_get_new_post_status` for the function dokan_get_new_post_status()
  Now you’ll be able to use your desired status for new products created by vendors using this filter.
- **fix:** Fixed a security issue related to insecure deserialization in the Dummy Data importer API endpoint.
- **fix:** Resolved an issue where the dokan_is_seller_dashboard() method was returning false when called from a WP Post Query Loop.
- **fix:** Ensured that the correct order status is displayed for vendors after updating an order.
  Previously, in some cases, plugin or theme authors would hook into actions like woocommerce_order_status_changed and change the order status after it had been updated by the vendor. This update ensures that the correct order status is displayed to vendors after they update an order. Thanks to https://github.com/rmilesson for your contribution to fixing this issue.
- **fix:** Resolved an issue where store categories filtering was not showing proper results due to nonce validation fails.
  Previously, when using store categories as a direct link to filter vendors with no valid nonce key attached to it, the filtering was not working correctly and vendors were not being displayed under their assigned store category. This issue has been addressed and store categories filtering now shows the correct results.
- **fix:** Resolved inconsistent behavior of pagination on the Single Store Page.
  Previously, there were several issues with the pagination on the Single Store Page, including the “Previous” text displaying like the “Next” icon, the Last Page Menu icon not showing when all menus were visible, and the Active Page Menu background color not changing from the 4th page. These issues have been addressed and the pagination behavior is now consistent.
- **fix:** Resolved an issue where the discounted price field was not displayed correctly according to the theme used.
  Previously, when viewing the “Add/Edit a product” page on the Vendor Dashboard, the discounted price field was not displayed in the same way as the price field box when using certain themes. This issue has been addressed and the discounted price field now displays correctly according to the theme used.
- **fix:** [AdminSetupWizard] The custom withdrawal method is now conditionally displayed in the admin setup wizard.
  Previously, the custom withdrawal method could not be enabled in the wizard because it required the method name and type to be populated. Now, if the admin has previously saved these values, the custom withdrawal method will be displayed and can be activated in the wizard.

### v3.7.19 ( May 24, 2023 ) ###

- **update:** Separated shipping tax fee recipient from the product tax fee recipient
- **update:** Added support for multiple shipping line items for suborders
- **update:** Moved shipping splitting functionality to Dokan Lite from Dokan Pro.Previously, this feature was only available on Dokan Pro.
- **update:** Improved the responsiveness of tables on the Vendor Dashboard by making them horizontally scrollable on smaller-sized screens.
- **fix:** Disabling product review from WooCommerce settings doesn’t remove the review section from the vendor profile.
- **fix:** Broken layout of Discounted Price section in Vendor Dashboard product edit page on full-width page layout themes.
- **fix:** Fixed some warnings and fatal errors for PHP versions 8.1 and 8.2.
- **fix:** Fixed incorrectly closed product category menu after_widget args
- **fix:** [VendorSetupWizard] Fixed an issue where the ‘Hide Email Address’ option was still displayed on the Vendor Setup wizard page even when it was enabled from Dokan Admin Settings.
- **fix:** Email notification for withdrawal approval no longer shows HTML code in its header.


### v3.7.18 ( May 10, 2023 ) ###

- **fix:** Fixed product getting published after enabling vendor selling status from admin dashboard
- **update:** [ReverseWithdrawal] Added sold individually param to true for reverse withdrawal base product when creating it, so that quantity can't be changed
- **update:** [ColorSchemeCustomizer] Used color set by Color Scheme Customizer Module instead of hardcoded value for login form popup and withdraw schedule popup header color
- **update:** Remove expected earning calculation from product listing and editing pages
- **update:** Added a notice before deleting products via bulk action under Vendor Dashboard → Product listing page
- **update:** Added dokan_store_name meta-key for all users with administrator and shop_manager roles during plugin activation

### v3.7.17 ( Apr 17, 2023 ) ###

- **fix:** JS console error while uploading non-image files to product gallery under vendor dashboard product add/edit page
- **fix:** Fixed order invoice and packaging slip broken CSS under vendor dashboard order list page
- **fix:** Fixed users are unable to register as customers on some themes, also fixed a JS console error on the My Account page
- **fix:** Fixed TinyMCE editor and search box overlap under Dokan Admin Settings page.
- **update:** Allow whitelisted countries in location selectors based on admin-allowed countries under WooCommerce settings.

### v3.7.16 ( Apr 10, 2023 ) ###

- **fix:** [VendorDashboardAPI] Fixed an issue where the seller lifetime sales report wasn’t possible to retrieve via API.
- **fix:** [VendorDashboard]: Fixed wrong product count showing under vendor dashboard product listing page.
- **update:** [ReverseWithdrawalAPI] Added a new API Endpoint `dokan/v1/reverse-withdrawal/vendor-due-status` to get reverse balance due status for a vendor
- **update:** [ReverseWithdrawalAPI] Added a new API Endpoint `dokan/v1/reverse-withdrawal/add-to-cart` to add reverse balance to the cart.
- **update:** Allow only image format files as product featured and gallery images on vendor dashboard
- **update:** Added multistep category support in product API

### v3.7.15 ( Mar 23, 2023 ) ###

- **new:** [CategoryPopup] Added a new settings to select any category from frontend
- **fix:** [VendorSignup] Fixed vendor can sign up even though store URL is not available
- **fix:** [ProductsRestAPI] Fixed in_stock, featured, on_sale filter for products rest API wasn't working

### v3.7.14 ( Mar 09, 2023 ) ###

- **fix:** [RestAPI] Fatal error while activating Dokan Lite via wp-cli
- **fix:** [VendorStoreSettings] State option appear while choosing the country with no state

### v3.7.13 ( Mar 01, 2023 ) ###

- **fix:** fixed a SQL injection issue

### v3.7.12 ( Feb 23, 2023 ) ###

- **new:** Added a new js hook `dokan_middle_category_selection` by using this hook if anyone passes true in this hook user will be able to select any category in Dokan multi-step category and a new WordPress hook `dokan_middle_category_selection` where you also have to pass true select middle category.
- **update:** [LoginRedirection] Keep the sellers on the checkout page if they login from the checkout page.
- **update:** Added sub-description to the `hide vendor info` section under Dokan admin appearance settings
- **fix:** [AddNewProductPopup] Create & Add a new product button does not allow adding a product image during the time of adding more than one product has been fixed
- **fix:** Fixed a fatal error if the order is created from WooCommerce admin dashboard without adding any line items.
- **fix:** Fixed admin user permission/capability issue after permanently deleting the Dokan plugin.
- **fix:** [ReverseWithdrawal] Refund amount wasn’t subtracted from `Total Collected Values` for reverse withdrawal under the Admin Reverse Withdrawal menu.
- **fix:** [ReverseWithdrawal] The decimal value is not included under the `Total Collected` section of the admin dashboard Reverse Withdrawal menu.
- **fix:** Dokan Dashboard menu wasn’t loading if the permalink doesn’t include / at the end of the URL
- **fix:** Fixed product image thumbnail gets image height squeezed on add new product popup under vendor dashboard

### v3.7.11 ( Feb 13, 2023 ) ###

- **fix:** Vendor search doesn't work correctly while admin assigns a vendor to a product from WooCommerce → Products → Add New page
- **fix:** The number of orders on the backend is not appearing depending on the vendor's own order count.
- **fix:** Fixed a fatal error while creating an order from the admin dashboard with no data

- **update:** Added vendor address-related fields under vendor registration form
- **update:** Changed text `New Vendor Product Upload` to `Enable Selling`. Also changed field description from `Allow newly registered vendors to add products` to  `Immediately enable selling for newly registered vendors`

### v3.7.10 ( Jan 26, 2023 ) ###

- **new:** Extended REST API support for Dokan
  -- https://example.com/wp-json/dokan/v1/orders?after=2022-10-01&before=2022-10-30
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/sales?from=2021-08-02T04:13:05Z&to=2021-12-02T04:13:05Z
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/orders
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/products
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/profile
  -- https://example.com/wp-json/dokan/v1/vendor-dashboard/preferences
  -- https://example.com/wp-json/dokan/v2/orders/{order_id}/downloads
  -- https://example.com/wp-json/dokan/v2/orders/
  -- https://example.com/wp-json/dokan//v2/orders/bulk-actions
  -- https://example.com/wp-json/dokan/v1/products/attributes/edit-product/{id}
  -- https://example.com/wp-json/dokan/v1/products/attributes/set-default/{id}
  -- https://example.com/wp-json/dokan/v1/blocks/products/{id}
  -- https://example.com/wp-json/dokan/v2/settings
  -- https://example.com/wp-json/dokan/v2/settings/{group_id}/{id}
  -- https://example.com/wp-json/dokan/v2/settings/{group_id}/{parent_id}/{id}
  -- https://example.com/wp-json/dokan/v2/withdraw/settings
  -- https://example.com/wp-json/dokan/v2/withdraw/summary
  -- https://example.com/wp-json/dokan/v2/products  (new param added: author, post_status, date, product_cat, product_type, stock_status, filter_by_other)
  -- https://example.com/wp-json/dokan/v2/products/filter-by-data

- **fix:** Multiple store category modal wasn’t working for some theme
- **fix:** Recreate reverse withdrawal payment product if no product found with stored product id

### v3.7.9 ( Jan 10, 2023 ) ###

- **update:** Last-page and first-page pagination icon inconsistency under single store page product listing
- **update:** Adjusted store banner image stretching issue under store list page
- **fix:** Vendor email address is not showing up on the store header.

### v3.7.8 ( Dec 27, 2022 ) ###

- **fix:** Single Store Page store header menu and search fields style break on mobile devices
- **fix:** Vendor dashboard total sales wasn’t displaying decimal values
- **fix:** Set user role as seller while creating vendor from api call
- **fix:** order note date issue under vendor dashboard order details page


### v3.7.7 ( Nov 30, 2022 ) ###

- **update:** Added  date filter - `after/before` for Order REST API
- **update:** Added `dokan_bank_payment_fields_placeholders` Filter to change the label and placeholder of bank payment fields
- **update:** Updated UI/UX of vendor dashboard submenu
- **update:** Added section, sub-section label, description search under Dokan admin settings

### v3.7.6 ( Nov 14, 2022 ) ###

- **fix:** Fixed a sql security issue while searching for products via ajax from vendor dashboard

### v3.7.5 ( Nov 03, 2022 ) ###

- **new:** Added a new hook named dokan_store_product_search_results to filter out store product search results closes
- **update:** Sort product categories under the vendor dashboard alphabetically
- **fix:** SweetAlert library is conflicting with the WooCommerce Conversion Tracking plugin
- **fix:** [BestSellingProductWidget] Products are being shown on the widget even when the catalog visibility is set to hidden.
- **fix:** [VendorDashboardProducts] Products of different statuses are not displayed in the appropriate tab from the vendor dashboard.
- **fix:** [ProductCategoryWidget] Sub Category dropdown on the Dokan Product Category widget doesn't work
- **fix:** [AdminProduct] When editing a product in the WordPress backend, the vendor select dropdown doesn't contain any data.
- **fix:** Fixed a fatal error on the report page if the same day is selected for both the start and end date to generate reports
- **fix:** [VendorSoreSettings] Store settings update button wasn't working if the Dokan Pro plugin isn't activated.
- **fix:** Store filtering using category was not working

### v3.7.4 ( Oct 27, 2022 ) ###

- **fix:** Fixed a fatal error update updating to Dokan if Dokan Pro version is outdated

### v3.7.3 ( Oct 27, 2022 ) ###

- **fix:** Fixed a fatal error due to a function moved from dokan pro

### v3.7.2 ( Oct 27, 2022 ) ###

- **new:** Added a new filter hooked named `dokan_rest_api_store_collection_params` for StoreController request parameters
- **new:** Introduced `dokanVendorFilterSectionStart` and `DokanGetVendorArgs` js filter hooks
- **fix:** [AdminCommission] - Percentage Commission does not support "comma" as decimal separator under Dokan admin settings `Selling Options` page
- **fix:** [Products] Product author is assigned to the shop manager when the shop manager publishes a product drafted by the admin.
- **fix:** Spaces between paragraphs are too large under the store terms and condition page.

### v3.7.1 ( Oct 11, 2022 ) ###

- **fix:** [VariableProduct] Fixed variable product's variation image uploading height size overlapping on price field.
- **fix:** [ProductSearch] Fixed product search of the product listing page of the vendor dashboard is not working.
- **fix:** [OrderEmail] Fixed multiple emails are sent to the customer when a parent order's status is changed to processing from failed payment.
- **fix:** Removed unwanted popup code from the SweetAlert library
- **fix:** Fixed the vendor dashboard adds new products' discount prices set to 0 by default.
- **fix:** Fixed vendor order page not showing line item qty and totals

### v3.7.0 ( Sep 27, 2022 ) ###

- **new:** Added `dokan_selected_multistep_category` js hook after a category has been selected
- **update:** Fixed some security issues
- **update:** Performance enhancement for dokan
- **update:** Updated some JS libraries
- **update:** Vendor dashboard `add-product-single.php` file is renamed to `edit-product-single.php`
- **fix:** Select2 spacing issue CSS fix
- **fix:** Fixed vendor single store page profile picture CSS issue
- **fix:** Fixed vendor product page extra table field issue
- **fix:** Fixed admin dashboard vendor details page: social profile Twitter icon is not showing issue
- **fix:** Fixed multiple sub-categories of the same parent category is assigned to a product, they are not saved issue
- **fix:** [Store settings]: Not being able to add "+" or "-" sign to the phone number filed of the store on Firefox web browser.
- **fix:** Bank withdrawal method required field updated, Added a new filter hook `dokan_bank_payment_required_fields` so that site owner can manage required fields as they pleased
- **fix:** Category-based commission is not working when a category has child categories.

### v3.6.5 ( Aug 25, 2022 ) ###

- **fix:** [WPML] Added WPML support for the multistep product category.
- **fix:** Order REST API endpoint displays other vendors orders.

### v3.6.4 ( Aug 10, 2022 ) ###

- **new:** Added Catalog Mode Feature to Dokan Doc Link:
- **update:** Load asset (CSS/JS) files only on required pages
- **update:** Added $user_id as parameter for filter hook `dokan_is_store_open`
- **fix:** [security]  Removed unfiltered_html capabilities from vendor user role
- **fix:** Fixed responsive issue of multistep product category UI.
- **fix:** [WPML] Vendor Dashboard Submenu not loading if translated to another language
- **fix:** Account Type for bank payment method is missing when admin is creating/editing a vendor
- **fix:** Paypal shows as connected for new vendors even though it is not connected
- **fix:** Can't skip seller setup wizard's Payment step by keeping some fields empty
- **fix:** Fixed Order By sorting parameters for Orders
- **fix:** Vendor Dashboard Add New Product URL changed to the product list page
- **fix:** Single store page default order by filtering wasn't working
- **fix:** Fixed third store header styling issue
- **fix:** When the admin updates or saves a product from the admin panel multistep product category feature wasn't working

### v3.6.3 ( Jul 26, 2022 ) ###

- **update:** Added DateRange filter for vendor dashboard Orders page
- **new:** Added search by order id filter for vendor dashboard Orders page

### v3.6.2 ( Jul 15, 2022 ) ###

- **new:** Added dummy data import feature for Dokan
- **update:** Multistep category modal for product add and edit page under vendor dashboard
- **update:** Added 'Back To Top' button & fix some design broken issue under Dokan admin settings page.

### v3.6.1 ( Jun 30, 2022 ) ###

- **fix:** Fixed some empty method names in Payment Methods section of Vendor Dashboard > Withdraw
- **fix:** Fixed incorrect alignment of withdraw method title in Dokan setup wizard
- **fix:** Vendor Store breadcrumb URL redirecting to 404 page
- **update:** Added disconnect button to payment methods
- **update:** Removed 'Dokan' Prefix from the payment method name under vendor dashboard payment settings page.
- **update:** Added a new setting to change Vendor Setup Wizard welcome message under Dokan General Settings page.

### v3.6.0 ( Jun 14, 2022 ) ###

**new:** Added a new filter named ‘dokan_bank_payment_validation_error’ so that payment validation errors can be filtered.
**update:** Entirely redesigned Dokan Admin Settings page
**fix:** WPML translated endpoints not working in payment settings page

### v3.5.1 ( May 31, 2022 ) ###

**new:** Added Reverse Withdrawal feature
**update:** Determine if a seller is connected to a payment method
**update:** improved UI of Payment settings page
**update:** Correctly determine the vendor a product belongs to, so the "dokan_get_vendor_by_product" filter hook is called.
**fix:** Simple > Variable > External/Affiliate > Group Product > Fatal error.
**fix:** changing dokan vendor dashboard page slug gives 404 error

### v3.5.0 ( May 18, 2022 ) ###

- **chore:** Minimum php version is set to 7.0
- **chore:** Minimum WooCommerce version is set to 5.0
- **chore:** Minimum WordPress version is set to 5.4
- **new:** Added a new product attributes widget, by which users/customers will be able to search products by vendors used attributes.
- **fix:** Fixed vendor store settings page phone number validation js console error
- **fix:** payment settings page 404 if dashboard url slug is changed

### v3.4.3 ( Apr 26, 2022 ) ###

- **fix:** Store Contact Form widget submits the contact form directly instead of ajax submission
- **fix:** Stop sending new order emails to selected recipients (including admin) when the New Order email is disabled in WooCommerce Settings
- **update:** Updated design for the payment settings page of vendor dashboard to separate the management of different payment methods
- **new:** Added option to select a default payment method
- **fix:** Fixed some validation logic under vendor dashboard payment settings page

### v3.4.2 ( Apr 13, 2022 ) ###

- **fix:** Fixed switching product type from variable to external doesn't remove product stock management options
- **fix:** Fixed store order by latest inconsistency

### v3.4.1 ( Mar 18, 2022 ) ###

- **new:** Introduced two new filter hooks dokan_shipping_fee_recipient and dokan_tax_fee_recipient
- **fix:**  Remove unnecessary error_log codes #1570
- **fix:** Promotional notice cache expiration date is set to one day
- **fix:** Fatal error on store closet time widget if store open/close time wasn’t set
- **fix:** Updated jQuery form validate library from v1.11.0 to v1.19.3
- **fix:** Fixed popup not appearing after clicking withdraw button under vendor dashboard
- **fix:** Product table css fix for error class

### v3.4.0 ( Mar 08, 2022 ) ###

- **update:** Stop loading unnecessary style and script files on every page #1450
- **update:** Added random as store list orderby parameter
- **update:** Dokan store shortcode orderby parameter now reflect store filter.
- **fix:** Store open/close time hover feature wasn’t working for specific single store page templates #1549
- **fix:** Variable products stock status wasn’t updating by quick edit from vendor dashboard, now has been fixed #1553
- **fix:** Fixed Dokan conflict with WP Project Manager #1546
- **fix:** Store product per page value wasn’t saving, now has been fixed #1548
- **fix:** Fixed fatal error while getting store open close time under single store page
- **fix:** Remove background process files from database if file doesn’t exists on server due to server migration

### v3.3.9 ( Feb 28, 2022 ) ###

- **update:** Added theme customizer settings to set default order by filter for store listing page #1505
- **update:** Added seller information under single product page, also added an admin setting entry to enable/disable this feature #1506
- **update:** Display store open/close time list  on hover under single store page. #1517
- **fix:**  Added post_date_gmt and post_modified_gmt fields data when creating a product from frontend dashboard #1514
- **fix:**  Create order API with coupon lines data giving fatal error, thanks to James Bechet for this fix #1441

### v3.3.8 ( Feb 17, 2022 ) ###

- **fix:** Store open close time widget wasn't working

### v3.3.7 ( Feb 03, 2022 ) ###

- **feat:** Added Featured, Latest, Best Selling, Top Rated Product sections under single store page
- **update:** Updated UI for Withdraw menu
- **update:** Updated design for Upgrade to PRO popup
- **update:** Added Dokan upgrader to change dokan_withdraw table details column null
- **update:** Added per_page and page param support on store products rest api
- **update:** Updated FontAwesome library from V4.7 to V5.15
- **update:** Updated chartjs library, this was causing conflict issue with various js files
- **fix:** Fixed a css issue under Select2 library
- **fix:** Make Hello text translatable under product published email template
- **fix:** Fixed a warning under single store page if store slug was invalid
- **fix:** prevent recursion while loading template if $name param is not empty
- **fix:** When setting bulk regular prices from the vendor dashboard in a variable product the product stock status becomes out of stock. This issue has been fixed now.

### v3.3.6 ( Jan 10, 2022 ) ###

- **fix:** css class added for styling order details page #1468
- **fix:** Item meta is not being deleted from the order details page of the WordPress dashboard #1458
- **fix:** Showing Vendor or Store Name on the order details page of WooCommerce #1456
- **fix:** Conflict with Siteground optimizer plugin #1474

### v3.3.5 ( Dec 23, 2021 ) ###

- **fix:** Fatal error while creating new vendor.
- **fix:** Conflict Dokan admin notices scripts with customizer page and WPML string translation page.

### v3.3.4 ( Dec 15, 2021 ) ###

- **fix:** Asset loading issue for admin notice

### v3.3.3 ( Dec 15, 2021 ) ###

- **new:** Added what’s New page for Dokan Lite #1427
- **new:** Grouped all Dokan admin notices into a single notice with slider #1427
- **update:** reCaptcha integration added to store contact form #1422
- **update:** Redesigned Dokan admin header section. Also added some useful links under admin bar. #1427
- **fix:** select2 dropdown margin issue fixed #1446
- **fix:** Fix loading issue while loading Dokan pages when permalink sets to plain text, Also added a notice to instruct users to change permalink setting. #1444

### v3.3.2 ( Nov 30, 2021 ) ###

- **update:** Caching Enhancement and Fixes
- **update:** Added tooltips for setting options
- **update:** Google Map and Mapbox setting fields will be always visible
- **fix:** Product was creating via API even selling option was disabled for a vendor
- **fix:** Withdraw details field value conflict with old withdraw data

### v3.3.1 ( Nov 12, 2021 ) ###

- **new:** Added Vue DateRangePicker library #1409
- **update:** updated vendor store per page placeholder text #1396
- **update:** Removed user switch setting from Dokan selling setting, now user switching will work if plugin exists #1394
- **fix:** Added missing param on woocommerce_admin_order_item_headers #1414
- **fix:** Fixed WC mail template overwrite wasn’t working #1403
- **fix:** add call to filter dokan_product_cat_dropdown_args to listing-filter.php #1408 (thanks to David Marín )
- **fix:** updated dokan_product_seller_info() function to not to add vendor data if vendor id doesn’t exists #1401 (thanks to David Marín )
- **fix:** Hide `Show email address in store` settings from store settings page if admin disable this settings from customiser. #1393
- **fix:** added upgrader to change refund and withdraw database table column #1391
- **add:** Black Friday promotion 2021 #1411

### v3.3.0 ( Oct 31, 2021 ) ###

- **update:** Added integration of sweetalert2 for alert, prompt, confirm, toast notification
- **fix:**  Fixed typo in vendor earning tooltip.
- **fix** Vendor wasn't getting a notification when order status change from cancelled to processing, on-hold, or completed. This has been fixed now

### v3.2.15 ( Oct 13, 2021 ) ###

- **feat:** Permanently delete Dokan related data (custom tables, options, pages, user roles and capabilities etc) after plugin delete based on admin Setting
- **new:** added filter hook dokan_store_banner_default_width and dokan_store_banner_default_height so that theme/plugin author can change store banner with and height based on their needs
- **new:** Added Dokan stores page link under Admin bar menu, from now on “Visit Store” redirects to Dokan store list page and “Visit Shop” directs to WooCommerce Product list page.
- **new:** Added integration of sweetalert2 to replace default javascript alert, prompt, confirm, and toast notifications
- **update:** Added a new tooltip in vendor dashboard product listing page after earning column to clarify vendors about possible earning from their products
- **update:** Added localization support for text "Calculating"
- **update:** Now Dokan page view count will be stored in the browser’s Local Storage instead of browser Cookies. Some caching plugins weren't able to cache single product pages due to this. This fix will let caching plugins to cache single product pages from now on
- **fix:** Single product page used to display the seller's real name instead of store name on the vendor info tab. Issue has been resolved now.
- **fix:** When a vendor adds a new product If the form has any validation error then old selected tags went missing. This issue has been resolved now.
- **fix:** Store Address input fields were missing in vendor dashboard’s store setting form when the Dokan Pro plugin was not installed. Now this issue has been fixed.
- **fix:** Removed vendor verification verified status check from vendor dashboard’s store settings page if dokan pro is not installed or vendor verification module is not active
- **fix:** Single Store product category wasn’t working if WPML plugin was installed. Now this issue has been fixed.,
- **fix:** Added validation for withdraw limit
- **fix:** Corrected spelling to 'picture' from 'picutre'
- **fix:** In the latest version of Divi, theme assets weren’t loading if a single store page doesn’t contain any product. This issue has been fixed now.
- **fix:** Vendor Contact form didn't contain “Reply To” email address when a customer would contact a vendor via the vendor contact form widget. Issue has been resolved now.

### v3.2.14 ( Oct 04, 2021 ) ###

- **fix:** multiple issue fixed in WPML integration with Dokan


### v3.2.13 ( Sep 30, 2021 ) ###

- **fix:** fixed warning on product listing page due to filter data type mismatch
- **update:** added dynamic filter named: dokan_manage_shop_order_custom_columns_%s hook under shop_order_custom_columns method
- **feat:** Set limitation for how many product tags that vendor can input, admin can set tag limit via filter hook: dokan_product_tags_select_max_length
- **fix:** fixed localization issue on attribute label
- **fix:** fixed Single store product search not working for logged out users

### v3.2.12 ( Sep 13, 2021 ) ###

- ***new*** Withdraw details keep save as log
- ***new*** Vendor settings update REST api support
- ***new*** New Filter hook added for Order status list allowed for withdrawal 'dokan_settings_withdraw_order_status_options'
- ***fix*** Check if pagination_base post is empty
- ***fix*** Single store page map hide based on setting
- ***fix*** added upgrader to reassign dokan_store_name meta because it was missing for some vendor
- ***fix*** JS deprecated warnings fixed

### v3.2.11 ( Aug 31, 2021 ) ###

- **new:** Added new shortcode attribute named random to display store list randomly [dokan-stores orderby="random"]
- **fix:** Fixed fatal error when vendor registration shortcode used from API
- **fix:** Added Map API selection section on Dokan admin setup wizard page
- **new:** Added **'Texty – SMS Notification for WordPress, WooCommerce, Dokan and more'** plugin as recommended plugins under Dokan admin setup wizard page
- **new:** Added vendor filter on admin Withdraw page
- **new:** Added a new REST route to get corresponding vendor's product categories under StoreController API (GET: wp-json/dokan/v1/stores/3/categories)
- **new:** Added a new REST route to get corresponding vendor's popular product categories under StoreController API (GET: wp-json/dokan/v1/stores/3/categories?best_selling=1)
- **new:** Added REST API route to create withdrawal request (POST: /wp-json/dokan/v1/withdraw/ )
- **Fix:** fixed unable to remove downloadable file when there is only one file exists
- **fix:** fixed fatal error with deleted product of an order
- **new:** What's new button added under dokan admin page top bar section

### v3.2.10 ( Aug 10, 2021 ) ###

- **update:** Hide customer billing email and ip address from vendor order export data based on admin setting
- **update:** Default Category order by set to name and order by as ascending
- **fix:** After submitting the Create Product from the selected category is not selected

### v3.2.9 ( Aug 2, 2021 ) ###

- **New:** Added customize settings for store product filter option to show/hide
- **Fix:** Product tag search not working in variable product after adding new attribute
- **New:** added a new hook dokan_earning_by_order_item_price
- **Fix:** display shipping widget though virtual checkbox selected
- **Fix:** Children IDs not showing on REST API
- **Fix:** fixed a js error while refunding from vendor dashboard: size() is not a function

### v3.2.8 ( Jul 12, 2021 ) ###

- **update:** Added Composer 2 support
- **fix:** Fixed rewrite rules issues after Dokan plugin is installed and after change store slug
- **new:** Added dokan summer sale promotion
- **new:** Added a new action hook named dokan_store_customizer_after_vendor_info under Dokan Store Customizer
- **update:** added $data parameter to existing dokan_vendor_create_data action hook
- **new:** added a new action hook named dokan_before_create_vendor
- **new:** added a new action hook named dokan_seller_registration_after_shopurl_field
- **new:** added a new action hook named dokan_settings_after_store_phone
- **new:** added a new action hook dokan_settings_before_store_email
- **new:** added a new action hook dokan_product_gallery_image_count

### v3.2.7 ( Jul 01, 2021 ) ###

- **new:** Added Orderby filtering for single store product listing page
- **new:** Added custom ip address lookup link
- **new:** Added a success message after creating a product from add new product modal window
- **new:** Added - - for category listing in add new product page and add new product modal window
- **new:** Added a new shortcode attribute named with_products_only in [dokan-stores] shortcode so that vendor without product can be filtered out from store listing page
- **new(api):** Add support to send objects to trash, thanks to @Mário Valney
- **fix:** Fixed duplicate tag create issue, if new tag is searched with mixed character case
- **fix:** Wrong hooks used on Elementor widgets
- **fix:** Typo in Staff - Manage Menu Permissions fixed
- **fix:** Fixed an error in Dokan setting for new installation of Dokan Lite
- **fix:** Fixed vendor order page pagination issue for date and customer filter
- **fix:** Fixed “In stock" and "Out of stock" translation issue
- **fix:** Email template override directory location correction for dokan vendor completed order
- **fix:** delete cache data after updating dokan vendor balance table
- **fix:** Fixed a bug that would allow vendors to change order status even if they don't have permission to do so, thanks to @CODLOP

### v3.2.6 ( May 8, 2021 ) ###

- **new:** Added new action hooks on order details sidebar
- **new:** Dokan admin setting warning type field added on Dokan admin setting
- **new:** Dokan admin setting repeatable field added 2 new options must-use and desc
- **new:** Introduce the filter hook dokan_dashboard_nav_settings_key for store settings slug
- **new:** Eid 2021 promotion added
- **new:** New hook: Vendor dashboard custom CSV orders export
- **new:** Vendor Order export CSV file earnings column added
- **fix:** Decimal as comma separated sale price does not save
- **fix:** Product variation pagination for post type pending
- **fix:** product published date displaying current date in local language

### v3.2.5 ( April 30, 2021 ) ###

- **fix:** Fix single store page template layout
- **fix:** [wpml] Fix malformed dashboard subpage URL when page_link is filtered to add a query parameter
- **fix:** product count exclude booking product
- **fix:** order export not filtered customer filtered data
- **fix:** [wpml] Fix malformed store URL when the home URL contains a query parameter
- **fix:** capitalise vendor url in add new vendor
- **new:** Sub orders set dynamic post status on WooCommerce my account order details page
- **new:** Store listing shortcode enhancements, Store Category wise: [dokan-stores category="clothing"] Order wise: [dokan-stores order="ASC"] Orderby wise: [dokan-stores orderby="registered"] Store_id wise: [dokan-stores store_id="1, 2, 3"
- **new:** Vendor product listing page added 2 new filters options stock wise and product type wise
- **new:** Order status for withdraw option added on dokan admin setting page
- **new:** Store open close option disabled by default when a vendor register
- **fix:** Vendor setup wizard page broken issue fixed
- **fix:** Inconsistency template CSS class dokan-w3 issue fixed on vendor setting page
- **fix:** Unable to add multiple lines to the short Description field issue fixed
- **fix:** AZERTY keyboard restrict registration issue fixed for vendor register form

### v3.2.4 ( April 01, 2021 ) ###

- **new:** Enter key allow for vendor search on store listing page
- **feat:** Vendors able to edit product slug from their product edit page
- **update:** Set default values withdraw methods, limit, order status, commissions on the setup wizard
- **refactor:** product create update redundant check
- **fix:** time format with a forward slash (\) wasn't parsing correctly on store open/close time dropdown
- **fix:** Products: Preview of text is not appearing instantly while adding Product Tags
- **fix:** Withdraw: IBAN number is not showing on the Dokan Admin
- **fix:** Warning showing on all widget when use on Elementor
- **fix:** Divi theme store single page showing warning issue fixed
- **fix:** Store listing filter most recent is not working issue fixed

### v3.2.3 ( March 13, 2021 ) ###

- **notice:** limited time promotion for weDevs birthday
- **update:** WordPress 5.7 and WooCommerce 5.1 compatibility

### v3.2.2 ( March 5, 2021 ) ###

- **new:** Added order completed email notification for vendors
- **new:** Added Vendor individual withdraw threshold option
- **new:** Added a new hook (dokan_admin_setup_wizard_save_step_setup_selling) after admin setup wizard save setup selling step
- **new:** Added a new action hook (dokan_create_sub_order_before_calculate_totals) when creating a suborder
- **update:** Added sales price validation check for subscription product
- **update:** Added a new filter hook (dokan_order_status_count) in order status to support custom order status
- **update:** WP kses added new allowed arguments for image tag
- **fix:** Product update and delete permission error via REST API
- **fix:** Fixed some PHP 8 warnings
- **fix:** Store settings error on save in vendor dashboard area
- **fix:** Order delivery tracking number wasn't saving as order notes
- **fix:** Export order by status on vendor dashboard issue fixed
- **fix:** Product discount price is set empty if regular price is lower than discount price
- **fix:** Fatal error on product tab's post per page in more products section
- **fix:** Store/products orderby query parameter
- **fix:** Dokan store open time timezone mismatch
- **fix:** Prices fields showing for external product
- **fix:** Unable to save stock value for variation product
- **fix:** Deprecated Gplus cleanup
- **fix:** Unable to save stock value for variation product
- **fix:** Different edit url for publish products in vendor dashbboard
- **fix:** SKU wasn't saving from vendor dashboard

### v3.2.1 ( February 12, 2021 ) ###

- **fix:** Optimized code for better security
- **update:** performance improvements on vendor dashboard end
- **fix:** fixed conflict with user frontend menu position with Dokan

### v3.2.0 ( January 29, 2021 ) ###

- **new:** Added blank product page new UI on vendor dashboard
- **new:** Added Store open and closed status on dokan store listing page
- **new:** Added a setting where admin can set how many products to display on vendor single store page
- **new:** Added a new validation message after upload a banner/profile picture, show a browser alert if user tries to leave the current page without saving the changes.
- **new:** Added a new update setting button on top of the vendor setting form
- **new:** Added downloadable and virtual product type support for subscription products
- **update:** Dokan withdrawal request promotion
- **fix:** While registering as a vendor, radio button should work only when user click mouse cursor on the top of the radio button.
- **fix:** Product add pop-up validation error message style
- **fix:** Vendor pending tab keeps loading issue fixed
- **fix:** Improved the mapbox address search input field and make it same as google map search box
- **fix:** Keep old vendor as product author while duplicating product from the admin area
- **fix:** Fixed rounded vendor balance can not be withdrawn
- **fix:** Fixed resetting geolocation address is not selecting default location address
- **fix:** Fixed featured attribute of the store list shortcode doesn't work
- **fix:** Fixed vendors count not working on autoload in admin vendor listing page
- **fix:** Fixed downloadable product "Grant Access" JS error
- **fix:** Added filter for $allowed_roles in vendor registration which was missing
- **fix:** If the vendor has a rounded value in their balance then vendors are unable to request a withdrawal of the full amount
- **fix:** When order data is retrieved via API, the "total" order value is gets rounded
- **fix:** Elementor conflict with Dokan best and top selling product shortcodes issue fixed
- **fix:** More product tab showing other vendors product issue fixed

### v3.1.2 ( January 12, 2021 ) ###

- **fix:** Store listing page displaying disabled vendors
- **notice:** Added Paypal adaptive modules removal notice

### v3.1.1 ( January 11, 2021 ) ###

- **feat:** Added searching feature for Dokan admin settings
- **new:** Added "Visit Vendor Dashboard" link to admin bar
- **new:** Added current_datetime() compatible dokan functions for WordPress version < 5.3
- **update:** Updated refund table item_totals and item_tax_totals fields via Dokan upgrader
- **perf:** Optimized Dokan admin settings page to load setting page faster
- **fix:** Added vendor search feature for disabled vendors
- **fix:** Product discount showing wrong when a product that has a limited time discount and sets a schedule on the calendar on the frontend dashboard
- **fix:** Fixed creating addon by vendor staff was not working for product
- **fix:** Fixed coupons created by the vendor can not be modified
- **fix:** Fixed admin dashboard wasn't loading due to use of sprintf for some translatable strings
- **fix:** Fixed display issue for State and Country multi-select of Dokan vendor create modal
- **fix:** Translation issue fixed on store listing page
- **fix:** Store product category not showing properly
- **fix:** Fixed missing text-domain on product listing delete confirmation alert
- **fix:** Responsive dashboard product and order table

### v3.1.0 ( December 20, 2020 ) ###

- [new] Store page customizer and better theme support
- [fix] Stock level wrong calculation in order notes
- [fix] Improve search with store name in Dokan admin vendor listing and store listing page
- [fix] Store listing page avatar image not showing properly on store listing page
- [fix] Store and store term and conditions template make high priority
- [fix] Store settings page url issue when vendor dashboard use as child page
- [fix] Vendor dashboard menu not selected when vendor dashboard use as a child page
- [fix] Ordering issue on category dropdown on product listing filter area
- [fix] Vue wp list table package updated, translation support for list tables
- [fix] Dokan vendor dashboard big counter warning issue fixed
- [fix] Vendor dashboard product table column issue fixed
- [fix] Update custom deactivation reason placeholder text
- [fix] Vendor biography formatting issue when update any vendor from Dokan admin area
- [fix] Added attribute slug with product REST API
- [fix] Vendor listing and withdraw page not loading correctly in admin area when use others languages
- [fix] Upgrade to pro module page overlapping issue with admin notice, css & changed svg
- [fix] Withdraw methods toggle options not working on Dokan setup wizard
- [fix] Withdraw methods are not saving for some users, fixed via Dokan upgrader

### v3.0.16 ( December 01, 2020 ) ###

- **fix:** Search by store name not working on store listing page when store created from admin area
- **fix:** Store reviews REST API issue fix and improve
- **fix:** Order fetching REST API issue fix and improve
- **new:** Dokan upgrade to pro modules page added
- **update:** weMail plugin added on recommended plugins list when run Dokan setup wizard
- **fix:** Deactivation reasons icons and placeholder updated

### v3.0.15 (November 21, 2020) ###

- **fix** updated codebase to fix timezone mismatch

### v3.0.14 (November 20, 2020) ###

- **fix** Vendor edit admin commission on decimal separator as comma
- **update** Limited time promotion admin notice

### v3.0.13 (November 12, 2020) ###

- **New:** Added new filter `dokan_is_product_author`
- **New:** Apply new filter `dokan_product_listing_post_statuses` on product listing status
- **Fix:** Store name search was not working when the vendor account was created by admin
- **Fix:** Vendor was not changing when trying to change on product quick edit section from admin area
- **Fix:** Some translation issue fixed on admin setting page

### v3.0.12 (November 5, 2020) ###

- **Fix:** Refactor upgrade to pro banner.
- **Fix:** Temporary disable WooCommerce payment and shipping setup step from vendor setup wizard section. It was throwing a lot of deprecated warnings, we will fix it in the next version.

### v3.0.11 (October 22, 2020) ###

* **Fix:** Fixes a JS loading issue when `SCRIPT_DEBUG` is enabled

### v3.0.10 (October 20, 2020) ###

- **Fix:** Vendor balance remains same after refund
- **Fix:** Vendor name is not showing correctly on WooCommerce product list quick edit
- **Fix:** CSS conflicting with the YITH Badge Management Plugin
- **Fix:** Added postbox header div in postbox component
- **Fix:** Guest checkout name in vendor order details
- **Fix:** Phone field pasting option enabled settings page
- **Fix:** Admin dashboard feed REST Request error
- **Fix:** Prevent admin email for sub-order
- **Fix:** Multiple category commission issue fallback to vendor commission
- **Fix:** Admin vendor total count
- **Fix:** Default order sorting issue
- **Fix:** WC deprecate notice for using order parent_id directly
- **Fix:** Label changed for external product type
- **Fix:** Product tag add if do not exist
- **Fix:** Store category widget not translate problem with WPML
- **Fix:** On RESTful order creation, only single store is added into the response even if there are multiple stores
- **Fix:** Product variation author id update for product quick save
- **Fix:** Translation issue on Select2
- **Fix:** Price schedule selection date added
- **Fix:** Remove duplicate capabilities form seller role
- **Fix:** Dashboard header add new button not showing with theme conflict
- **Fix:** Order details page showing warning issue
- **Fix:** After withdraw approval, sometimes it's not inserting in balance table
- **Fix:** Redirect to 404 if vendor do not exist for TOC template
- **Fix:** Withdrawal current balance is incorrect cause of cache issue

### v3.0.9 (August 25, 2020) ###

- **Fix:** Some security issues fixed
- **Fix:** Loading issue when long tags list on add/edit product page (Vendor Dashboard)
- **Fix:** Add missing permission callback in REST routes to make WordPress 5.5 compatible
- **Fix:** Vendor can send multiple withdraw request from vendor dashboard
- **Fix:** API endpoint added

### v3.0.8 (August 12, 2020) ###

- **Fix:** WordPress v5.5 compatibility issue fixed
- **Fix:** Namespacing issues on class declaration

### v3.0.7 (July 23, 2020) ###

- **Fix:** Showing fatal error for user switching

### v3.0.6 (July 23, 2020) ###

- **Feat:** Vendor user switching (User Switching plugin support)
- **Feat:** Decimal and Thousand Separator with Comma
- **Fix:** Add system to refresh options for select fields in admin settings
- **Fix:** Admin settings input field type for common types of fields
- **Fix:** Shop name not showing on product listing quick edit section
- **Fix:** Order notes in vendor dashboard insert wrong author data

= v3.0.5 (June 11, 2020) =

- **New:** Exclude cash on delivery payments from vendor withdrawal balance (COD)
- **Fix:** Remove vendor folder from the excluded list
- **Fix:** Earning column missing on vendor dashboard order list
- **Fix:** Default location not working in vendor dashboard
- **Fix:** Remove link from customer name in vendor order details
- **Fix:** Custom header, footer template does not work in Dokan store page (Divi Theme)

= v3.0.4 (May 15, 2020) =

- **Fix:** Rename google plus to google as google plus is deprecated #807
- **Fix:** Unable to set store trams and condition settings through REST API #808
- **Fix:** Vendor order email does not have the TAX details #809
- **Fix:** Withdraw request email is not send to admin #810
- **Fix:** Typo in backend add and edit vendor page #811
- **Fix:** On updating commission type in backend vendor dashboard, translated commission type is getting saved into database #814
- **Fix:** Store listing filter does not work when its saved as frontpage #815
- **Fix:** When a product is purchased with a price of more than 8 digit the calculation is wrong #819
- **Fix:** Caching issue on vendor's order listing page #821
- **Fix:** Filter out empty seller ids when a product is deleted `dokan_get_sellers_by` function #827
- **Fix:** Deduct PayPal gateway fee from vendor's earning #830
- **Feat:** Hide vendor info if admin wants to #829
- **Improvement:** Pass vendor id in dokan_get_seller_active_withdraw_methods hook #813

### v3.0.3 (April 03, 2020) ###

- **Fix:** Clear caches on product update #804
- **Fix:** Vendor is not receiving email for new order #803
- **Fix:** Remove weForms promotion from admin setup wizard #798

### v3.0.2 (March 23, 2020) ###

- **Fix:** Unable to remove attributes in vendor product edit page #637
- **Fix:** Feature image is not saving on quick edit
- **Fix:** Vendor image issue #769
- **Fix:** Set vendor eamil on new vendor creation #787
- **Fix:** Return content from shotcode instead of being outputting #752
- **Fix:** Map still showing on vendor dashabord settings page even if there is no API key
- **Fix:** Product type not saving when quick edit #767
- **Fix:** Render withdraw methods dynamically in setup wizard #771
- **Fix:** Show vendor email to admin and actual vendor #773
- **Fix:** Product type error in dokan_save_product function
- **Fix:** Admin is unable to see the setup wizard on new dokan installation when WooCommerce is not installed #783
- **Fix:** Add missing add_meta_query method in dokan REST API #788
- **Fix:** Only render map if api key is availabe in store settings page #774
- **Feat:** Add dokan_get_all_cap_labels function #781
- **Improvement:** Added group description to exporters and updated privacy policy guide to drop use of deprecated classes #755
- **Improvement:** dokan_get_shipping_processing_times function #785
- **Improvement:** Add filter on withdraw export csv args #786
- **Improvement:** Get correct product thumbnail size in vendor product list page #795

### v3.0.1 (February 07, 2020) ###

- **Fix:** Fixed yoast seo causing conflict issue in single store page
- **Fix:** Permission issue fixed for shop manager
- **Fix:** Handle sales price error if its greater than regular price or empty
- **Fix:** Change placholder text for filter by customer to registered customer

### v3.0.0 (February 03, 2020) ###

- **Fix:** Add mapbox option in dokan admin setup wizard
- **Fix:** Pass order object into woocommerce_order_item_{type}_html hook
- **Fix:** Allow vendor to update store terms and condition with REST API #714
- **Fix:** If show_email is truned off don't show the eamil in REST API response #748
- **Fix:** Remove space while generating user_name via dokan_generate_username function #749
- **Fix:** If a product is deleted and no vendor is found for that product display (no name) in backend order listing page #746
- **Improvement:** Store listing filter styles so that it works with almost any theme
- **Improvement:** Show notice in dokan admin setup wizard if minimum PHP version is not met for WooCommerce
- **Improvement:** If dokan pro doesn't exist but commmision type is found in database, ignore that saved commission type #746
- **Improvement:** Code quality and performance

### v2.9.31 (January 14, 2020) ###

- **Fix:** Add option to set dokan store listing page for rendering all stores

### v2.9.30 (January 10, 2020) ###

- **Feat:** Grid and List view for store listing page #712
- **Feat:** Store sorting options in store listing page #712
- **Feat:** Add Mapbox as Google map alternative
- **Feat:** Add Enfold theme support
- **Improvement:** dokan_get_vendor_by_product function so that it reruns vendor for product variation #726

### v2.9.29 (December 26, 2019) ###

- **Fix:** Don't show the admin setup wizard who ran the setup wizard before
- **Fix:** Remove non-ascii characters from some file names
- **Fix:** Dokan dashboard hamburger menu is not working fixed
- **Fix:** Downloadable product grunt and revoke access issue is fixed
- **Tweak:** Added privacy policy info in setup wizard for admin

### v2.9.28 (December 19, 2019) ###

- **Fix:** Sanitize and Escape data before saving and rendering #717
- **Improvement:** Add privacy policy in readme.

### v2.9.27 (December 11, 2019) ###

- **Feat:** Run Dokan Admin Setup Wizard without being WooCommerce installed #708
- **Improvement:** Remove empty div from vendor payment settings page #695
- **Improvement:** Deleting a attribute from predefined attributes and add the attribute again mess up attributes #703
- **Improvement:** Add hooks in order details and admin setup wizard #715
- **Improvement:*  Pass post_type as a second parameter to the months_dropdown_results hook #710

### v2.9.26 (November 19, 2019) ###

- **Feat:** Add option to hide out of stock products in best selling widget #697.
- **Improvement:** Make dokan add vendor UI consistent to WordPress UI #696.

### v2.9.25 (November 12, 2019) ###

- **Dev:** Add dokan backend settings input required field validation.
- **Improvement:** Dokan_Commission::prepare_for_calculation() method.

### v2.9.24 (November 08, 2019) ###

- **Fix:** Assets URL localization was creating a problem in frontend vendor shipping area, this has been fixed.
- **Improvement:** Added a new filter `dokan_get_edit_product_url` to override the product edit URL.

### v2.9.23 (November 07, 2019) ###

-   **Feat:** Add REST API support for store contact form widget
-   **Feat:** Add Vendor listing page in dokan backend
-   **Feat:** Add vendor active inactive REST API
-   **Fix:**  Increase refund table data length to allow more refund items
-   **Fix:**  Withdraw threshold field disappears when commission type is selected in dokan settings
-   **Fix:**  Order listing page shows the same orders when object cache is enabled
-   **Fix:**  Best selling widgets warning in store sidebar
-   **Fix:**  Save store name in vendor's user_meta so that store search form widget works correctly
-   **Fix:**  If percent commission rate is not set while using combine commission calculation is not correct
-   **Dev:**  Add filter to modify current page id in dokan_is_seller_dashboard function
-   **Localization:** Store open and close notice placeholder strings remains untranslated

v2.9.22 -> October 03, 2019
-----------------------------------
-   **fix:**   Remove duplicate inpute filed in dokan admin settings form
-   **fix:**   Make commissison value to 0 if no product found
-   **fix:**   Attribute value's are swapped after changing the order of the attributes

v2.9.21 -> September 24, 2019
-----------------------------------
-   **fix:**   If state is not found for a country in store settings, remove the state field on reload
-   **fix:**   Only show vendor's own uploaded media to a vendor.
-   **fix:**   Add required attribute for various input field in dokan_post_input_box function.
-   **fix:**   Calculate commission for item by quantity when the commission is set to flat.
-   **Tweak:** Introduce Dokan_Commission class to calculate admin and vendor's commission.
-   **Tweak:** Remove unnecessary placeholder in admin commission field.

v2.9.20 -> August 23, 2019
------------------------------------
-   **Fix:**   Geolocation map settings value is not saving
-   **Fix:**   Fix warning in vendor dashboard widget when seller setup wizard is not run
-   **Fix:**   Store banner height in vendor settings page it not honouring the saved settings
-   **Fix:**   Conflict with avada theme fution builder
-   **Tweak:** Use WordPress backend date format while printing date in approved and cancelled withdraw request

v2.9.19 -> July 29, 2019
------------------------------------
-   **Fix:**    Split orders created from admin dashboard
-   **Fix:**    Add on backorder in product stock management
-   **Fix:**    Dokan dashboard menu returning 404 with the latest version of visual composer plugin
-   **Tweak:**  Dokan admin settings rearrange
-   **Tweak:**  Add compatibility with ultimate member plugin
-   **Tweak:**  Add few hooks in product listing template

v2.9.18 -> July 10, 2019
------------------------------------
-   **Feat:**  Add google map type option field component
-   **Feat:**  Add dokan_array_after helper function
-   **Fix:**   Admin settings default value for multicheck field
-   **Tweek:** Remove unnecessary code and add hook after creating parent order
-   **Tweek:** Refactor dokan_get_vendor_by_product function and explicit error checking while using it

v2.9.17 -> June 13, 2019
------------------------------------
-   **Fix:**   Remove unwanted code to fix conflict with yith plugin
-   **Tweak:** Dokan theme support and responsive menu

v2.9.16 -> June 11, 2019
------------------------------------
-   **Fix:**   Hide hidden and out of stock products in vendor store page
-   **Fix:**   A non-numeric value encountered warning in vendor product listing page, if product price is not given
-   **Fix:**   Add failed order in vendor order listing page
-   **Fix:**   Creating product from admin backend returns 2 instance of the product author
-   **Tweak:** Ensure dokan_get_seller_id_by_order filter is always taking effect
-   **Tweak:** Make dokan vendor dashboard responsive
-   **Tweak:** Show admin notice stating WooCommerce is required if not found on dokan installation
-   **Tweak:** Add hook after creating and updating object via dokan REST API
-   **Tweak:** Add dokan_ensure_vendor_coupon filter while ensuring vendor coupon restriction
-   **Tweak:** Add updater class to fix banner issue where store settings and listing template was overridden
-   **Tweak:** Add filter hook while fetching vendor products
-   **Tweak:** Add define method to define plugin constants

v2.9.15 -> May 08, 2019
------------------------------------
-   **Fix:**   Vendor banner is not showing in the backend edit user profile page
-   **Fix:**   Add filter to allow or skip nonce checking while registering new user
-   **Tweak:** Update appsero SDK

v2.9.14 -> Apr 26, 2019
------------------------------------
-   **Fix:**  Schedule product price not showing correctly
-   **Fix:**  Backward compatibility for banner and store time

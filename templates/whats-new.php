<?php
/**
 * When you are adding new version please follow this sequence for changes: New Feature, New, Improvement, Fix...
 */
$changelog = [
    [
        'version'  => 'Version 4.0.5',
        'released' => '2025-07-25',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Improved script loading to ensure compatibility with WooCommerce versions above 10.0.2, preventing potential issues with script dependencies.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 4.0.4',
        'released' => '2025-07-17',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Admin Notice UI with Modern Design and Improved User Experience.',
                    'description' => '',
                ],
                [
                    'title'       => 'Enhanced Product Brand Integration with Dedicated Template and Manager Methods.',
                    'description' => '',
                ],
                [
                    'title'       => 'Enhanced product featured image selection with cropping functionality in the product editor.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Vendor/store names with special characters (e.g., apostrophes) now display correctly in the vendor dropdown on the admin product edit screen.',
                    'description' => '',
                ],
                [
                    'title'       => 'Display correct earning in vendor dashboard product add/edit page for different category.',
                    'description' => '',
                ],
                [
                    'title'       => 'Update table header style for mobile display in order details page item list and withdraw approve, pending and cancel list.',
                    'description' => '',
                ],
                [
                    'title'       => 'Improved how product inventory information is retrieved, ensuring more accurate and consistent display of stock values.',
                    'description' => '',
                ],
                [
                    'title'       => 'Update table header style for mobile display in order details page item list and withdraw approve, pending and cancel list.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolve an issue for "sold individually" option does not save on create or update a product.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 4.0.3',
        'released' => '2025-07-02',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Add gradient background style for fa-threads social icon.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolved an issue where array access warnings in vendor balance calculation were being triggered.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolved an issue where incorrect timestamp on sale price schedule hampering product sales schedule added from vendor dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolved an issue where stock quantity always shows 0 in vendor dashboard product edit screen.',
                    'description' => '',
                ],
                [
                    'title'       => 'Improved the format of payment methods in the withdrawal settings to ensure they are consistently returned as a zero-based indexed list in the REST API response.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 4.0.2',
        'released' => '2025-06-03',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Resolved an issue where the single store page header style was broken on multiple themes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added proper type checking for product and author objects in the product tab template to prevent potential errors when invalid data is passed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Skip cart validation for reverse withdrawal in Stripe Express.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix admin dashboard order details page items meta-box content and commission meta-box content  not showing properly.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed analytics view permissions to access analytics data for users. Thanks to @oliviertassinari for the contribution.',
                    'description' => '',
                ],
                [
                    'title'       => 'Adjust the admin commission and order total to exclude partial refund for display where needed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Clarify output language in AI response based on the input language.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 4.0.1',
        'released' => '2025-05-08',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Replaced the WordPress.org banner image with a new version for improved branding.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Added number value data type casting in order commission.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 4.0.0',
        'released' => '2025-05-06',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'AI-powered auto-completion for product content including titles, short and long descriptions - Integrated with OpenAI and Gemini GPT models to improve content creation speed and consistency while allowing vendors to select their preferred AI provider.',
                    'description' => '',
                ],
                [
                    'title'       => 'WooCommerce Brand management support in Vendor Panel enabling vendors to assign brands during product creation and editing.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced Dokan link components with success, warning, info, and danger variants using Tailwind utility classes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced Dokan button components with success, warning, info, and danger variants using Tailwind utility classes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced Dokan badge components with primary, secondary, success, warning, info, and danger variants using Tailwind utility classes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced Dokan alert components with success, warning, info, and danger variants using Tailwind utility classes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Created Dokan price input component formatted according to WooCommerce settings - Implemented internal error React component for error boundary and integrated with Analytics feature.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced product & product categories data store.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced comprehensive setup guide panel with multiple steps for admin.',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced vendor analytics feature integrating with WooCommerce analytics system.',
                    'description' => '',
                ],
            ],
            'Improvement'  => [
                [
                    'title'       => 'Migrated color scheme from \'default\' to \'Majestic Orange\' for improved visual consistency.',
                    'description' => '',
                ],
                [
                    'title'       => 'Enhanced withdrawal display with proper currency symbols and formatting according to WooCommerce settings.',
                    'description' => '',
                ],
                [
                    'title'       => 'Refined Dokan primary and secondary button colors including text, background, border and shadow for tertiary button.',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated color scheme in the dummy data importer to align with Dokan\'s brand color.',
                    'description' => '',
                ],
                [
                    'title'       => 'Redesigned the upgrade modal using ReactJS framework for improved performance and user experience.',
                    'description' => '',
                ],
                [
                    'title'       => 'Enhanced withdraw with modern UI for better user experience.',
                    'description' => '',
                ],
                [
                    'title'       => 'Optimized withdraw request process with reduced loading times.',
                    'description' => '',
                ],
                [
                    'title'       => 'Reimagined withdraw management interface with cleaner layouts.',
                    'description' => '',
                ],
                [
                    'title'       => 'Skeleton loaders for withdraw screens to improve perceived performance during data fetching.',
                    'description' => '',
                ],
                [
                    'title'       => 'UI inconsistencies in withdraw request and history views.',
                    'description' => '',
                ],
                [
                    'title'       => 'Better error handling for withdraw actions.',
                    'description' => '',
                ],
                [
                    'title'       => 'Improved onboarding experience with modern UI and intuitive setup flow.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Resolved an issue where vendor dashboard menus UI with submenus and notification counters were breaking.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed product reviews not working from admin panel.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.11',
        'released' => '2025-03-14',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Dokan now displays prices based on the decimal points setup in WooCommerce.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added charge and receivable amount in withdraw email templates.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Resolve an issue when displaying admin earning in admin order list.',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan registration form asset loading issue on Elementor My Account widget.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolved an issue where revoking access to digital product content from order details page reverts on page reload.',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor setup wizard form validation added to properly handle countries without states.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.10',
        'released' => '2025-02-28',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Prevented wrong store URL generation for staff managers on admin dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Restoring parent order with restore related child orders.',
                    'description' => '',
                ],
                [
                    'title'       => 'Store settings API data storing inconsistencies.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.9',
        'released' => '2025-02-12',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Rollback support for product statues on dokan pro deactivation.',
                    'description' => '',
                ],
            ],
            'Improvement'  => [
                [
                    'title'       => 'Improved dokan_is_user_seller function by adding strict comparison to differentiate between vendor and staff.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Fix earning suggestion in vendor dashboard when product edit page loads initially.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix vendor earning suggestion currency, currency position, decimal separator in vendor dashboard product edit page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix vendor earning suggestion for invalid product price.',
                    'description' => '',
                ],
                [
                    'title'       => 'Tax calculation for shipping based on tax status',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.8',
        'released' => '2025-01-29',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Missing parameters support added for the reverse-withdrawal API endpoints.',
                    'description' => '',
                ],
                [
                    'title'       => 'Missing parameters support added for the Settings API endpoints.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Fixed an error when navigating to the product edit page with an invalid (non-numeric) product ID.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a misspelling typo vendor contact form input field.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed and updated analytics cache modifier for seller analytics filter.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.6',
        'released' => '2025-01-09',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Translations on Admin Commission Setup Wizard, Withdraw, Withdraw Log, Add Reverse Withdraw, Dummy Data, and Vendor Single pages were not working due to wrong text-domains.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.5',
        'released' => '2025-01-06',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Improvement vendor setup wizard ui.',
                    'description' => '',
                ],
                [
                    'title'       => 'Improvement withdraw approved email template.',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan admin settings page responsive & update ui design.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.4',
        'released' => '2024-12-27',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Added tweaks to improve system stability and smoothness',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.3',
        'released' => '2024-12-11',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Updated Dokan admin header to display current pro plan and version with upgrading option.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.2',
        'released' => '2024-12-06',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Added commission setting option in product bulk edit for Admin.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.1',
        'released' => '2024-12-04',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Fixed a issue in the commission upgrader to deal with empty values for product and vendor.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.14.0',
        'released' => '2024-12-02',
        'changes'  => [
            'New'  => [
                [
                    'title'       => 'Commission amount now displayed in the product list within the admin dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor earning amount displayed in the product list within the vendor dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor earning suggestions on the product add and edit pages in the vendor dashboard for simple and variable products.',
                    'description' => '',
                ],
                [
                    'title'       => 'Commission details metabox on the order details page in the admin dashboard is now visible for child orders or orders without a parent.',
                    'description' => '',
                ],
                [
                    'title'       => 'Related order metabox on the order details page in the admin dashboard, displaying sibling orders for child orders and child orders for parent orders.',
                    'description' => '',
                ],
                [
                    'title'       => 'Backward compatibility for flat, percentage, and combine commission types for older orders.',
                    'description' => '',
                ],
            ],
            'Improvement'  => [
                [
                    'title'       => 'Updated commission types from flat, percentage, and combine to fixed and category-based commissions.',
                    'description' => '',
                ],
                [
                    'title'       => 'Overhauled the commission UI across Dokan global settings, vendor settings, product settings, Dokan subscription product settings, and the admin setup wizard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated the commission settings in the admin setup wizard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Enhanced responsiveness of the UI for Dokan admin dashboard settings menus.',
                    'description' => '',
                ],
                [
                    'title'       => 'Product is rebranded with new branding.',
                    'description' => '',
                ],
                [
                    'title'       => 'As per new branding of Dokan Multivendor Plugin, full product is rebranded with new theme color.',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Moved the vendor edit page from Dokan Pro to Dokan Lite and eliminated the commission setting from the WordPress default user profile page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed the commission from every category, introducing category-based commission in global settings, vendor settings, Dokan subscription products, and the admin setup wizard.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.13.1',
        'released' => '2024-11-11',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Compatibility with the Printful Integration Module added',
                    'description' => '',
                ],
            ],
            'Fix'  => [
                [
                    'title'       => 'Improved logic to ensure the `add new category` button only appears when appropriate conditions are met, enhancing user experience.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.13.0',
        'released' => '2024-11-06',
        'changes'  => [
            'New'  => [
                [
                    'title'       => 'Replaced the Dokan array container with the League Container, ensuring backward compatibility for seamless performance and enhanced flexibility.',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated Dokan to be fully compatible with WooCommerce Analytics Reports',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.6',
        'released' => '2024-10-24',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Fixed js error on frontend pages.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.5',
        'released' => '2024-10-16',
        'changes'  => [
            'Fix'  => [
                [
                    'title'       => 'Implement order trash and untrash handling for Dokan',
                    'description' => '',
                ],
                [
                    'title'       => 'Added wordpress native i18n support',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.4',
        'released' => '2024-10-03',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Added `$data` parameter to `dokan_update_vendor` hook.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.3',
        'released' => '2024-09-30',
        'changes'  => [
            'Improvement'  => [
                [
                    'title'       => 'Added compatibility with RFQ state field ui.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.2',
        'released' => '2024-09-23',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Product gallery image uploader close button style fix.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix incorrect sub-order status updates when the main order status changed specifically for cancelled sub-orders.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendor coupon validation for various discount item types.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.1',
        'released' => '2024-08-30',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Resolve fatal error when updating Dokan Lite to 3.12.0 with Dokan Pro 3.9.7.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.12.0',
        'released' => '2024-08-29',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Displaying incorrect withdrawal amount when using decimal separator as thousand.',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed multiple invoice button for dokan sub-orders.',
                    'description' => '',
                ],
                [
                    'title'       => 'Ensure accurate stock updates when vendors edit products while sales occur. Thanks @brunomendespereira',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.5',
        'released' => '2024-08-07',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Fixed data updating issue on Admin color picker settings.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed extra slashes issue on store url when translated via WPML.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.4',
        'released' => '2024-07-10',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Direct links to the relevant settings from vendor progress bar added.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Some deprecation warning resolved.',
                    'description' => '',
                ],
                [
                    'title'       => 'Shop URL rendered double slash when using WPML on vendor registration.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fatal error in block editor on adding and editing page with customer-migration shortcode.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.3',
        'released' => '2024-06-10',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Responsive issue on vendor dashboard tabs preview.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.2',
        'released' => '2024-05-27',
        'changes'  => [
            'Improvement'         => [
                [
                    'title'       => 'WooCommerce 8.9.1 Compatibility added.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.1',
        'released' => '2024-05-16',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Action hook `dokan_dashboard_sidebar_start` added.',
                    'description' => '',
                ],
                [
                    'title'       => 'Action hook `dokan_dashboard_sidebar_end` added.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.11.0',
        'released' => '2024-05-10',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'The status of sub-orders does not update to completed if it contains only virtual products.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.10.4',
        'released' => '2024-04-25',
        'changes'  => [
            'Fix'         => [
                [
                    'title'       => 'Vendor dashboard Order status filter menu displayed a duplicate border',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor dashboard withdraw page display get hidden',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.10.3',
        'released' => '2024-04-17',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Notification count support added for vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new filter to set a default value for I am a customer / I am a vendor radio button',
                    'description' => '',
                ],
                [
                    'title'       => 'Processing Order count added for vendor dashboard orders menu',
                    'description' => '',
                ],
                [
                    'title'       => 'Performance improvements for vendor dashboard -> order details page -> downloadable product permission section',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin can change product author from REST API',
                    'description' => 'Previously, product_author was read-only property, now admin can change product_author for an existing product or create a new product for another author.',
                ],
                [
                    'title'       => 'Warning message styling for selecting fixed cart discount on admin coupon add edit page',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Advertisement product not purchasable for own product purchasing restriction',
                    'description' => '',
                ],
                [
                    'title'       => 'Header Template number one breaks without background image',
                    'description' => '',
                ],
                [
                    'title'       => 'HTML entity showing in product tag selection in vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor add notification switch in admin dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Under wooCommerce my-account registration section, `I am a customer` was forced to be set as the default value. With this PR this problem has been fixed',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.10.2',
        'released' => '2024-04-01',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Email placeholder, additional content support and formatting added',
                    'description' => '',
                ],
                [
                    'title'       => 'Add requires plugin header for dokan so that required plugin check can be initiated',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Vendor profile progress bar doesn\'t update if the address is filled from the vendor registration form',
                    'description' => '',
                ],
                [
                    'title'       => 'Color synchronization issue in vendor dashboard order notes',
                    'description' => '',
                ],
                [
                    'title'       => 'Product review email cannot be disabled without also disabling Contact Vendor email',
                    'description' => '',
                ],
                [
                    'title'       => 'Order Export to CSV on the filtered list not working',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.10.1',
        'released' => '2024-03-18',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Update Categories Easily from Vendor Edit Page',
                    'description' => 'In earlier versions of the Dokan plugin for WordPress and WooCommerce, editing store categories was limited to the vendor details view page. This approach created confusion and made it difficult for users to manage their store categories effectively. However, with the latest update, a significant improvement has been introduced.
                    Now, you can conveniently edit and update your store categories directly from the vendor edit page in the admin dashboard. This enhancement provides a more intuitive and user-friendly experience, allowing you to efficiently manage and organize your store categories in one central location.',
                ],
                [
                    'title'       => 'Threads social media platform added as a Store Socials Option. Thanks `@fisher2470`',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor Dashboard settings submenu translation support added',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.10.0',
        'released' => '2024-03-04',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added a new filter hook named `dokan_product_cache_delete_all_data`, by using this one can prevent deleting product cache if necessary.',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Updated FontAwesome library to version 6.5.1',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed Elementor mega menu z-index conflict and removed line break from address fields',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.9',
        'released' => '2024-02-12',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added PHP 8.2 support',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added validation for bank payments and address data in Dokan Seller Setup Wizard.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed an issue where the Dokan seller setup wizard does not display a warning message when a seller fails to provide the state for a country that has a state.',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor setup wizard issue [#1976] - Properly closed the style tag in the Store Setup step to avoid conflicts with customizations.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a bug in the store-lists-filter.php template that used the wrong escaping function for the placeholder attribute. [#1984]',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdrawal class check-in Templates/Withdraw.php.',
                    'description' => 'This fixes a fatal error that could occur when creating a withdrawal request with cache-enabled sites.',
                ],
                [
                    'title'       => 'The `Share Essentials` field’s description was missing from the Dokan admin setup wizard. This pull request fixes an issue where the description field was not showing up in the Dokan admin setup wizard. It also adds a new hook and admin options to store the `Share Essentials` settings.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where the sub-orders disappear from the WooCommerce order lists page when orders are filtered by a specific vendor or by sub-order ID when the HPOS feature is enabled.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.8',
        'released' => '2024-01-30',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Updated Appsero Client SDK library to version 2.0.2 which will fix a security issue with the previous version of the library and a fatal error caused by the library.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.7',
        'released' => '2024-01-29',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added WooCommerce Cart and Checkout Block supports for Dokan Lite',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed an issue where the vendor’s store map address was not saved during vendor setup wizard configuration',
                    'description' => '',
                ],
                [
                    'title'       => 'Some links under the vendor dashboard weren\'t working properly due to a nonce mismatch. With this release, those issues have been fixed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where the valid store name required check was missing from the customer-to-vendor migration form.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where the customer buys digital and physical products from different vendors, shipping charges are applied separately to each vendor.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some translation-related issues with the date range picker',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some translation-related issues with Dokan Sweetalert',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.6',
        'released' => '2024-01-11',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Features: Withdraw Charge',
                    'description' => 'Dokan has introduced a new feature that allows the admin to set a withdrawal charge for vendors. This charge can be either a flat rate or a percentage of the withdrawal amount based on the payment gateway used. The charge will be reflected in the details report, and vendors can see how many charges will apply when they request a withdrawal. The vendor dashboard list will also show the charge and receivable amount. This feature provides greater flexibility and transparency in managing vendor withdrawals.',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.5',
        'released' => '2023-12-28',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'API request on get all orders returns empty results for the endpoint http://dev.test/wp-json/dokan/v1/orders due to default customer id was set to 0.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.4',
        'released' => '2023-12-12',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed an issue where the Vendor class shop_data persistence is broken on save()',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a fatal error while trying to edit a subscription under WordPress Admin Panel → WooCommerce → Subscription menu of the WooCommerce Subscription Plugin.',
                    'description' => '',
                ],
                [
                    'title'       => 'Toggle Sub-Orders and Show Sub-Orders buttons are not working if HPOS feature is disabled.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.3',
        'released' => '2023-11-30',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed an issue where the Tab fields under the product Add/Edit page don’t display predefined tags until users start typing to select tags.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.2',
        'released' => '2023-11-13',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'A new email template has been introduced named Dokan Vendor Product Review. After a product has been reviewed, an email containing information about the review is sent to the vendor. The email includes details such as the reviewer’s name, product name, review rating, and text. The email also contains a link to the review page where the vendor can view the review and respond if necessary.',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Display a non-purchasable notice for the vendor’s own products.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[RestAPI] Fixed an issue where getting a single order via API gives an \'invalid ID\' error If the compatibility mode isn\'t enabled for the HPOS feature on WooCOmmerce Order data storage settings',
                    'description' => '',
                ],
                [
                    'title'       => '[ProductReview] Previously the email notification sent by WordPress when a review was added to a product, was sent to the product owner. This was wrong in the context of a marketplace. Because the email sent by WordPress includes some sensitive information, like the admin dashboard URL, customer email address, etc. With these changes, we are making sure that only the marketplace admin gets the new review emails sent by WordPress.',
                    'description' => '',
                ],
                [
                    'title'       => 'Previously, there was an issue where selecting “All,” then “None,” and subsequently “All” again didn’t function as expected. This occurred on the vendor product edit page for simple products, specifically within the Attributes section. However, following this update, all special cases of the “Select All” feature now work flawlessly.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.1',
        'released' => '2023-10-17',
        'changes'  => [
            'New'         => [
                [
                    'title'       => '',
                    'description' => '',
                ],
                [
                    'title'       => '',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Removed flaticon packages and replace used icons with fontAwesome icons. This will reduce the plugin zip size.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new settings to disable fontAwesome library',
                    'description' => '',
                ],
                [
                    'title'       => 'Changed all the single date picker fields with daterange picker. This updates will keep the design consistent throughout the plugin.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[StoreOpenCloseTime] An issue where invalid store opening or closing times generate warning and fatal error on single store page.',
                    'description' => '',
                ],
                [
                    'title'       => '[Email] Fixed an issue where the product edit link on email template redirects to the products listing instead of single product edit page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some responsive issue under vendor dashboard product edit page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some responsive issue under vendor dashboard withdraw page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.9.0',
        'released' => '2023-10-06',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added two new hooks named `dokan_get_admin_report_data` and `dokan_get_overview_data` to extend Dokan reports functionality.',
                    'description' => '',
                ],
                [
                    'title'       => '',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added a new filter named `dokan_get_store_url` to filter store URLs for a single store.',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed some redundant or not required settings from vendor store settings page, also rearranged some admin settings and added some settings under Admin dashboard.',
                    'description' => 'Details:
1. Removed `Show Vendor Info` settings under the `WordPress Admin Dashboard → Dokan → Settings → Appearance` and added it back under the `WordPress Admin Dashboard → Dokan → Settings → General → Product Page Settings` section.
2. Removed the  `More Products` setting under `Vendor Dashboard → Settings → Store Settings` and added it back as a new Admin setting under `WordPress Admin Dashboard → Dokan → Settings → General → Product Page Settings` section. Now, only the admin can control this setting.
3. Removed redundant `Store Products Per Page` setting under `Vendor Dashboard → Settings → Store Settings`. Since the admin already has this setting under `WordPress Admin Dashboard → Dokan → Settings → General`, this setting will be used from now on and only the admin can control this setting.
4. Removed redundant `Store Page Product Section` settings under `Vendor Dashboard → Settings → Store Page Product Section`. Now, only the admin can control these settings under Theme Customizer settings.
',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Resolved an issue where the `Tracking Number` button was still visible under the `Vendor Dashboard → Order Details → Order Note section` even after the `Shipment Tracking` feature was enabled by the admin.',
                    'description' => '',
                ],
                [
                    'title'       => '[WidgetProductAttribute] Fixed an issue where the `Filter Products by Attribute` widget was not working for Multi-Word Attributes.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.8.3',
        'released' => '2023-09-26',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added advanced filtering and CSV export feature for vendor withdraws under Admin Dashboard → Dokan → Withdraw menu.',
                    'description' => 'The ‘Withdraw’ page on the admin dashboard has been updated with advanced filtering and log exporting features. This allows admins to filter transactions based on payment method and date range, which enhances their ability to analyze and manage withdrawals. The feature to export CSV logs is also included, which makes tracking and record-keeping easier. These integrations aim to empower marketplace owners with comprehensive tools for efficient withdrawal management within the dashboard.',
                ],
                [
                    'title'       => '[Dokan Invoice] Added PDF invoice links on Sub Order section',
                    'description' => 'Previously PDF invoice links  was not visible on Sub Order section under customer order view. After this update customer will be able to view invoice link on sub order section.',
                ],
                [
                    'title'       => 'Added backend validation of phone number used on entire Dokan plugin.',
                    'description' => '',
                ],
                [
                    'title'       => 'Store category widget list default state set to collapse.',
                    'description' => 'Previously, if a store has a product count over 100 or more and the store has many product categories, the store category widget would display those categories and subcategories in an open state rather than collapsed state that the sidebar style gets broken. Now the list has a max height of 500px, which will be visible, and other elements will be visible by scrolling and the parent category that has a submenu will be in collapse mode.',
                ],
                [
                    'title'       => 'Various style improvements of Dokan frontend including Vendor Dashboard, Single Store Page, Single Product Page etc.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[Refund] Earlier, when refunding an order under the vendor dashboard, the tax amount decimal point rounding precision was inconsistent with WooCommerce. However, it has now been updated to be consistent with WooCommerce.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where the order status label was missing on vendor dashboard for draft orders.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.8.2',
        'released' => '2023-09-13',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Feature: Single-page product creation form.',
                    'description' => 'Before this release, vendors had to go through a two-step process to create a product. However, with this release, a single-page product creation form has been introduced. To enable this feature, you need to navigate to the WordPress admin panel → Dokan → Settings → Selling Options → One Page Product Creation.
It’s important to note that in the next version of Dokan, the Add New Product popup and the Add New Product form will be removed. After that, the Single-Page product form will be the default system for creating a product from the vendor dashboard.',
                ],
                [
                    'title'       => 'Feature: Ask for product review',
                    'description' => 'The Ask for Product Review feature in Dokan allows vendors to set the product status to draft while creating a product using the single-page product creation form. After the vendor is satisfied with the edit, they can either ask for a review or publish the product directly based on the admin settings and vendor capability.',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Removed unnecessary product type filter from Vendor Dashboard product list page since there is only one product type available in Dokan Lite',
                    'description' => '',
                ],
                [
                    'title'       => '[VendorRegistration] Improved Compatibility with WooCommerce Password Settings',
                    'description' => 'In the past, when vendors registered using the [dokan-vendor-registration] shortcode, the process did not align with WooCommerce\'s automatic password generation settings. However, in the latest update, we\'ve enhanced this process. The vendor registration form presented through the [dokan-vendor-registration] shortcode now seamlessly adheres to WooCommerce\'s automatic password generation settings. This enhancement ensures a more unified and user-friendly registration experience for vendors, in line with WooCommerce\'s standard practices.',
                ],
                [
                    'title'       => 'Added shipping tax fee recipient field setting under admin setup wizard.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed an issue where orders can’t be filtered by vendor under Admin Dashboard → WooCommerce → Order lists page if HPOS feature is enabled',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where multiple sub-orders has been created for a single parent order.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed and issue while trying to delete all demo products also deleting non-dummy products while calling the API endpoints multiple times',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where Dokan Pro’s Product Status setting were used even though Dokan Pro plugin is deactivated.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an issue where products were visible beyond Simple Products in the product list page under the vendor dashboard when Dokan Pro was deactivated or not installed.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.8.1',
        'released' => '2023-08-25',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed a console warning under Dokan admin settings for Google Map integration',
                    'description' => '',
                ],
                [
                    'title'       => '[ReverseWithdrawal] Fixed an issue where Vendor/Admin cannot pay for reverse withdrawal balance due to a rule that vendor’s can’t purchase their own products.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.8.0',
        'released' => '2023-08-18',
        'changes'  => [
            'Update' => [
                [
                    'title'       => 'Added HPOS (High-Performance Order Storage) support for Dokan Lite',
                    'description' => 'The High-Performance Order Storage (HPOS) feature is a solution that provides an easy-to-understand and solid database structure specifically designed for eCommerce needs. It uses the WooCommerce CRUD design to store order data in custom tables optimized for WooCommerce queries with minimal impact on the store’s performance. This feature enables eCommerce stores of all shapes and sizes to scale their business to their maximum potential without expert intervention. It also facilitates implementing read/write locks and prevents race conditions. You can enable High-Performance Order Storage by navigating to WooCommerce > Settings > Advanced > Features and choosing the suitable data storage options for orders.',
                ],
                [
                    'title'       => 'Updated minimum PHP version requirement to 7.3',
                    'description' => '',
                ],
            ],
            'Fix'    => [
                [
                    'title'       => 'Resolved an issue where traces of order data were left on the Dokan end even after the order had been deleted from the WordPress admin panel.',
                    'description' => 'Previously, deleted orders were still visible under the Dashboard Overview menu, Reports menu, and under Withdraw menu. This issue has been fixed in the current release.',
                ],
                [
                    'title'       => 'Multiple issues have been fixed after a product of an order has been deleted.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.24',
        'released' => '2023-07-25',
        'changes'  => [
            'Update' => [
                [
                    'title'       => 'Restrictions added for vendors to review and purchase their own products.',
                    'description' => 'Previously, vendors could purchase and post reviews for their own product. Which is not logical and could manipulate the search results of a product in a marketplace. With this update, vendors will not be able to purchase or post reviews for their own product.',
                ],
                [
                    'title'       => '[ReverseWithdrawal] Now Admin can request payment from vendors using the Reverse Withdrawal feature',
                    'description' => "Currently, there is no way for Site admins to request payments from vendors. For some use cases, it is essential for admins to request money from vendors. For example: In Stripe 3DS mode, if customers ask for a refund, refund will be given from the admin Stripe account, after that vendor transfer will be reversed. But if the vendor doesn't have enough money in their stripe account transfer reversal will fail, in that case, vendor balance will be negative. Another case would be for non-connected vendors, in that case, admin will be responsible for refund and admin needs to request money from vendors.",
                ],
                [
                    'title'       => '[AdminSettings] Added a toggle switch for Google ReCaptcha in the appearance settings for better control.',
                    'description' => '',
                ],
                [
                    'title'       => '[AdminSettings] Sensitive information like API keys, client secrets, etc., are now displayed as password fields with an unhide button to improve security.',
                    'description' => '',
                ],
                [
                    'title'       => '[AdminCommission] Now, "percentage" is selected by default if the admin setup wizard is skipped in the commission setting.',
                    'description' => '',
                ],
            ],
            'Fix'    => [
                [
                    'title'       => 'Added some missing translations.',
                    'description' => 'Previously, the template folder at dokan-lite was missing when the .pot file was generated. With this fix template folder will be respected while generating the pot file.',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.23',
        'released' => '2023-07-14',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed an issue where the withdraw request could not be approved from the Admin Dashboard via REST API.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.22',
        'released' => '2023-07-12',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Updated vendor store API to support profile picture and banner delete feature. To delete one of these fields, one needs to set a 0 (zero) value while making the API request.',
                    'description' => 'endpoint: {{SERVER_URL}}/wp-json/dokan/{{version}}/stores/{store_Id}',
                ],
                [
                    'title'       => 'Added various html tag support for rich text editors on various places of vendor dashboard.',
                    'description' => 'Previously, the product editor on the vendor\'s side was a lot more limited than the one available on the admin side. With this update, we’ve included various tags, like heading elements, paragraphs, etc support for rich text editors.',
                ],
                [
                    'title'       => 'Added random ordering for store REST API endpoint.',
                    'description' => 'Previously, random ordering for stores wasn’t available for store API. With this update, we’ve added this feature. <br>endpoint: {{SERVER_URL}}/wp-json/dokan/v1/stores/',
                ],
                [
                    'title'       => 'Added phone number validation for vendor dashboard store settings page and vendor registration form.',
                    'description' => 'Previously, for phone numbers only numeric values were accepted, now a valid phone number including spaces, -, _, (, ), etc also supports phone number fields.',
                ],
                [
                    'title'       => '[Withdraw] Fixed an issue where withdraw payment method wasn\'t enabled but can be used for both manual withdrawal and auto withdraw disbursement schedules from the vendor dashboard payment settings page.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed an issue where multiple withdrawal requests can be placed via API.',
                    'description' => 'If a withdrawal request was placed by a vendor until that request was approved or rejected by Admin, making another withdrawal request wasn’t possible via frontend. However, the admin was able to make a withdrawal request via REST API. With this fix, this problem now has been resolved.',
                ],
                [
                    'title'       => 'Fixed a PHP notice for importing dummy data without providing any data via REST API',
                    'description' => 'endpoint: {{SERVER_URL}}/wp-json/dokan/v1/dummy-data/import',
                ],
                [
                    'title'       => 'While updating the withdrawal request via REST API, the minimum withdrawal amount limit wasn’t considered. For example, if the minimum withdrawal limit was set to 50, for an existing withdrawal request, the admin can set the withdrawal value to less than 50. This issue has been fixed now.',
                    'description' => 'endpoint: {{SERVER_URL}}/wp-json/dokan/v1/withdraw/{withdraw_id}',
                ],
                [
                    'title'       => 'Fixed an issue where store products API was returning all products instead of published products.',
                    'description' => 'endpoint: {{SERVER_URL}}/wp-json/dokan/v1/stores/{store_id}/products',
                ],
                [
                    'title'       => 'Fixed some CSS issues on the vendor store settings page for the store banner image.',
                    'description' => '',
                ],
                [
                    'title'       => '[Withdraw] Fixed an issue where PayPal withdraw method status was displaying default but the corresponding vendor didn’t set up the payment method yet. With this fix, we marked the payment method as needing setup instead of the default payment method.',
                    'description' => '',
                ],
                [
                    'title'       => '[Withdraw] After connecting to a payment method, the button text changes from `Setup` to `Make default` or `default` if selected. But after disconnecting that method button text doesn\'t change back to `Setup`. Now this issue has been fixed.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.21',
        'released' => '2023-06-23',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added `Become A Vendor` feature to Dokan Lite.',
                    'description' => 'Previously, this option was only available in Dokan Pro. This enhancement ensures that even customers of the Lite version can easily become vendors and start selling their products through the platform.',
                ],
                [
                    'title'       => '[SellerSetupWizard] Added store location map on the seller setup wizard',
                    'description' => 'Introducing a new enhancement in the seller setup wizard: seamless integration of a store location map. This enhancement allows sellers to effortlessly navigate and locate their store\'s position within the wizard interface.',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed an issue where gateway fees from WooCommerce PayPal Payments were not being deducted from vendors’ earnings.',
                    'description' => 'Previously, Dokan deducted PayPal Checkout fees from vendors’ earnings but did not deduct PayPal Payments fees. This was due to the fact that PayPal Payments did not set transaction fee metadata at the time. With this fix, Dokan now correctly deducts PayPal Payments fees from vendors’ earnings.',
                ],
                [
                    'title'       => '[VendorDashboard] Fixed some CSS issues under the vendor dashboard.',
                    'description' => 'Previously, the positioning of the mobile navigation icon on the vendor dashboard was problematic on mobile screens. Additionally, there were inconsistencies in some table columns, including the order ID column, causing visual issues. These issues have now been fixed.',
                ],
                [
                    'title'       => '[DokanVendorRegistration] Registration page\'s user selection modal is not working properly when any theme tries to use the modal for the vendor registration form.',
                    'description' => 'In earlier versions, there was a lack of synchronization between the user registration form on the "My Account" page and the user registration forms inside the modal implemented within the theme. This inconsistency created confusion and hindered the seamless registration process. However, with the latest update, significant improvements have been made to address this issue.',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.20',
        'released' => '2023-06-08',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added two new filter hooks named `dokan_get_vendor_orders_args` and `dokan_get_vendor_orders` to filter vendor’s order data.',
                    'description' => 'You can now filter orders returned by the `dokan()->order->all()` method using the dokan_get_vendor_orders hook.',
                ],
                [
                    'title'       => 'Added a new filter named `dokan_get_new_post_status` for the function dokan_get_new_post_status()',
                    'description' => 'Now you’ll be able to use your desired status for new products created by vendors using this filter.',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Fixed a security issue related to insecure deserialization in the Dummy Data importer API endpoint.',
                    'description' => '',
                ],
                [
                    'title'       => 'Resolved an issue where the dokan_is_seller_dashboard() method was returning false when called from a WP Post Query Loop.',
                    'description' => '',
                ],
                [
                    'title'       => 'Ensured that the correct order status is displayed for vendors after updating an order.',
                    'description' => 'Previously, in some cases, plugin or theme authors would hook into actions like woocommerce_order_status_changed and change the order status after it had been updated by the vendor. This update ensures that the correct order status is displayed to vendors after they update an order. Thanks to https://github.com/rmilesson for your contribution to fixing this issue.',
                ],
                [
                    'title'       => 'Resolved an issue where store categories filtering was not showing proper results due to nonce validation fails.',
                    'description' => 'Previously, when using store categories as a direct link to filter vendors with no valid nonce key attached to it, the filtering was not working correctly and vendors were not being displayed under their assigned store category. This issue has been addressed and store categories filtering now shows the correct results.',
                ],
                [
                    'title'       => 'Resolved inconsistent behavior of pagination on the Single Store Page.',
                    'description' => 'Previously, there were several issues with the pagination on the Single Store Page, including the “Previous” text displaying like the “Next” icon, the Last Page Menu icon not showing when all menus were visible, and the Active Page Menu background color not changing from the 4th page. These issues have been addressed and the pagination behavior is now consistent.',
                ],
                [
                    'title'       => 'Resolved an issue where the discounted price field was not displayed correctly according to the theme used.',
                    'description' => 'Previously, when viewing the “Add/Edit a product” page on the Vendor Dashboard, the discounted price field was not displayed in the same way as the price field box when using certain themes. This issue has been addressed and the discounted price field now displays correctly according to the theme used.',
                ],
                [
                    'title'       => '[AdminSetupWizard] The custom withdrawal method is now conditionally displayed in the admin setup wizard.',
                    'description' => 'Previously, the custom withdrawal method could not be enabled in the wizard because it required the method name and type to be populated. Now, if the admin has previously saved these values, the custom withdrawal method will be displayed and can be activated in the wizard.',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.19',
        'released' => '2023-05-24',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Separated shipping tax fee recipient from the product tax fee recipient.',
                    'description' => 'According to the <a href="https://wedevs.com/docs/dokan/settings/selling-options/">Selling Options</a> section of the Dokan documentation, you can set the recipient (Admin or Vendor) who will be receiving the shipping fee using the “Shipping Fee Recipient” option. Similarly, you can set the recipient (Admin or Vendor) who will be receiving the Tax fee using the “Tax Fee Recipient” option. <br>
                                      It seems that there was a <a href="https://github.com/weDevsOfficial/dokan/issues/1384">bug</a>  where if the Shipping Fee Recipient is the Admin and Tax Fee Recipient is the Vendor, then the Shipping Tax adds to the Vendor Earnings instead of Admin Commission. This issue has been resolved by separating shipping tax fee recipient from tax fee recipient by adding a new settings field named: Shipping Tax Fee Recipient under Dokan —> Settings —> Selling Options —> Commission section where admin will be able to select who will receive the shipping tax fee.',
                ],
                [
                    'title'       => 'Added support for multiple shipping line items for suborders',
                    'description' => 'It seems that when products from two or more sellers are placed in the cart and two products from the same seller with two different shipping methods are ordered, the sub-order that should have two shipping methods ends up losing the second freight. More details on the issue are mentioned <a href="https://github.com/weDevsOfficial/dokan/issues/1690">here</a>',
                ],
                [
                    'title'       => 'Moved shipping splitting functionality to Dokan Lite from Dokan Pro. Previously, this feature was only available on Dokan Pro.',
                    'description' => 'With this release, we have moved this feature to Dokan Lite. Note that the built-in <a href="https://woocommerce.com/documentation/plugins/woocommerce/getting-started/shipping/core-shipping-options/">shipping gateways</a> of WooCommerce can only be configured by the admin and will be automatically applied to the vendor order. Vendors will not be able to configure any shipping methods. The Dokan <a href="https://wedevs.com/docs/dokan/dokan-zone-wise-shipping/">Vendor Shipping</a> feature is still available with Dokan Pro.',
                ],
                [
                    'title'       => 'Improved the responsiveness of tables on the Vendor Dashboard by making them horizontally scrollable on smaller-sized screens.',
                    'description' => 'Previously, the order listing, product listing, and all other tables on the Vendor Dashboard were not responsive on smaller-sized screens. With this update, all of the tables are now made horizontally scrollable on smaller-sized screens.',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Disabling product review from WooCommerce settings doesn’t remove the review section from the vendor profile.',
                    'description' => 'Fixed an issue where disabling product reviews in WooCommerce by going to WP-Admin > WooCommerce > Settings > Products does not remove the review section from the vendor profile. Additionally, disabling product reviews in WooCommerce does not hide the message “No ratings found yet!” from the single product page under the vendor info tab.',
                ],
                [
                    'title'       => 'Broken layout of Discounted Price section in Vendor Dashboard product edit page on full-width page layout themes.',
                    'description' => 'Fixed an issue where the layout of the Discounted Price section in the Vendor Dashboard product edit page was broken on full-width page layout themes. The issue was caused by the CSS styles of the theme that were conflicting with the Dokan plugin styles. With this fix, the Discounted Price section will now display correctly on full-width page layout themes.',
                ],
                [
                    'title'       => 'Fixed some warnings and fatal errors for PHP versions 8.1 and 8.2.',
                    'description' => 'The issue was caused by the Dokan plugin code that was not compatible with the latest PHP versions. With this fix, the Dokan plugin code is now compatible with PHP versions 8.1 and 8.2. Note that, WordPress and WooCommerce still doesn’t support PHP version 8.1 and 8.2',
                ],
                [
                    'title'       => 'Fixed incorrectly closed product category menu after_widget args',
                    'description' => 'Fixed an issue where the product category menu was incorrectly closed due to reassigned arguments that left after_widget undefined and broke the layout.',
                ],
                [
                    'title'       => '[VendorSetupWizard] Fixed an issue where the ‘Hide Email Address’ option was still displayed on the Vendor Setup wizard page even when it was enabled from Dokan Admin Settings.',
                    'description' => '',
                ],
                [
                    'title'       => 'Email notification for withdrawal approval no longer shows HTML code in its header.',
                    'description' => 'Previously when the site admin approves a withdrawal request, an email is sent to the corresponding vendor. However, in the email header, the text appears including its HTML elements. This issue now has been fixed.',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.18',
        'released' => '2023-05-10',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => ' [ReverseWithdrawal] Added sold individually param to true for advertisement base product when creating it, so that quantity can\'t be changed',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove expected earning calculation from product listing and editing pages',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a notice before deleting products via bulk action under Vendor Dashboard → Product listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added dokan_store_name meta-key for all users with administrator and shop_manager roles during plugin activation',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed product getting published after enabling vendor selling status from admin dashboard',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.17',
        'released' => '2023-04-17',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Allow whitelisted countries in location selectors based on admin-allowed countries under WooCommerce settings.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'JS console error while uploading non-image files to product gallery under vendor dashboard product add/edit page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed order invoice and packaging slip broken CSS under vendor dashboard order list page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed users are unable to register as customers on some themes, also fixed a JS console error on the My Account page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed TinyMCE editor and search box overlap under Dokan Admin Settings page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.16',
        'released' => '2023-04-10',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => '[ReverseWithdrawalAPI] Added a new API Endpoint `dokan/v1/reverse-withdrawal/vendor-due-status` to get reverse balance due status for a vendor',
                    'description' => '',
                ],
                [
                    'title'       => '[ReverseWithdrawalAPI] Added a new API Endpoint `dokan/v1/reverse-withdrawal/add-to-cart` to add reverse balance to the cart.',
                    'description' => '',
                ],
                [
                    'title'       => 'Allow only image format files as product featured and gallery images on vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Added multistep category support in product API',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[VendorDashboardAPI] Fixed an issue where the seller lifetime sales report wasn’t possible to retrieve via API.',
                    'description' => '',
                ],
                [
                    'title'       => '[VendorDashboard]: Fixed wrong product count showing under vendor dashboard product listing page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.15',
        'released' => '2023-03-23',
        'changes'  => [
            'New' => [
                [
                    'title'       => '[CategoryPopup] Added a new settings to select any category from frontend',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => '[VendorSignup] Fixed vendor can sign up even though store URL is not available',
                    'description' => '',
                ],
                [
                    'title'       => '[ProductsRestAPI] Fixed in_stock, featured, on_sale filter for products rest API wasn\'t working',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.14',
        'released' => '2023-03-09',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => '[RestAPI] Fatal error while activating Dokan Lite via wp-cli',
                    'description' => '',
                ],
                [
                    'title'       => '[VendorStoreSettings] State option appear while choosing the country with no state',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.13',
        'released' => '2023-03-01',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed a SQL injection issue',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.12',
        'released' => '2023-02-23',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added a new js hook `dokan_middle_category_selection` by using this hook if anyone passes true in this hook user will be able to select any category in Dokan multi-step category and a new WordPress hook `dokan_middle_category_selection` where you also have to pass true select middle category.',
                    'description' => '',
                ],

            ],
            'Improvement' => [
                [
                    'title'       => '[LoginRedirection] Keep the sellers on the checkout page if they login from the checkout page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added sub-description to the `hide vendor info` section under Dokan admin appearance settings',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[AddNewProductPopup] Create & Add a new product button does not allow adding a product image during the time of adding more than one product has been fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a fatal error if the order is created from WooCommerce admin dashboard without adding any line items.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed admin user permission/capability issue after permanently deleting the Dokan plugin.',
                    'description' => '',
                ],
                [
                    'title'       => '[ReverseWithdrawal] Refund amount wasn’t subtracted from `Total Collected Values` for reverse withdrawal under the Admin Reverse Withdrawal menu.',
                    'description' => '',
                ],
                [
                    'title'       => '[ReverseWithdrawal] The decimal value is not included under the `Total Collected` section of the admin dashboard Reverse Withdrawal menu.',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan Dashboard menu wasn’t loading if the permalink doesn’t include / at the end of the URL',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed product image thumbnail gets image height squeezed on add new product popup under vendor dashboard',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.11',
        'released' => '2023-02-13',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Vendor search doesn\'t work correctly while admin assigns a vendor to a product from WooCommerce → Products → Add New page',
                    'description' => '',
                ],
                [
                    'title'       => 'The number of orders on the backend is not appearing depending on the vendor\'s own order count.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a fatal error while creating an order from the admin dashboard with no data',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Added vendor address-related fields under vendor registration form',
                    'description' => '',
                ],
                [
                    'title'       => 'Changed text `New Vendor Product Upload` to `Enable Selling`. Also changed field description from `Allow newly registered vendors to add products` to  `Immediately enable selling for newly registered vendors`',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.10',
        'released' => '2023-01-26',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Extended REST API support for Dokan',
                    'description' => '-- https://example.com/wp-json/dokan/v1/orders?after=2022-10-01&before=2022-10-30
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
-- https://example.com/wp-json/dokan/v2/products/filter-by-data',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Multiple store category modal wasn’t working for some theme',
                    'description' => '',
                ],
                [
                    'title'       => 'Recreate reverse withdrawal payment product if no product found with stored product id',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.9',
        'released' => '2023-01-10',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Last-page and first-page pagination icon inconsistency under single store page product listing.',
                    'description' => '',
                ],
                [
                    'title'       => 'Adjusted store banner image stretching issue under store list page',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Vendor email address is not showing up on the store header',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.8',
        'released' => '2022-12-26',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Single Store Page store header menu and search fields style break on mobile devices',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor dashboard total sales wasn’t displaying decimal values',
                    'description' => '',
                ],
                [
                    'title'       => 'Set user role as seller while creating vendor from api call',
                    'description' => '',
                ],
                [
                    'title'       => 'order note date issue under vendor dashboard order details page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.7',
        'released' => '2022-11-30',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added  date filter - `after/before` for Order REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Added `dokan_bank_payment_fields_placeholders` Filter to change the label and placeholder of bank payment fields',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated UI/UX of vendor dashboard submenu',
                    'description' => '',
                ],
                [
                    'title'       => 'Added section, sub-section label, description search under Dokan admin settings',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.6',
        'released' => '2022-11-14',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed a sql security issue while searching for products via ajax from vendor dashboard',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.5',
        'released' => '2022-11-03',
        'changes'  => [
            'New'    => [
                [
                    'title'       => 'Added a new hook named dokan_store_product_search_results to filter out store product search results closes.',
                    'description' => '',
                ],
            ],
            'Update' => [
                [
                    'title'       => 'Sort product categories under the vendor dashboard alphabetically.',
                    'description' => '',
                ],
            ],
            'Fix'    => [
                [
                    'title'       => 'SweetAlert library is conflicting with the WooCommerce Conversion Tracking plugin',
                    'description' => '',
                ],
                [
                    'title'       => '[BestSellingProductWidget] Products are being shown on the widget even when the catalog visibility is set to hidden.',
                    'description' => '',
                ],
                [
                    'title'       => '[VendorDashboardProducts] Products of different statuses are not displayed in the appropriate tab from the vendor dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => '[ProductCategoryWidget] Sub Category dropdown on the Dokan Product Category widget doesn\'t work',
                    'description' => '',
                ],
                [
                    'title'       => '[AdminProduct] When editing a product in the WordPress backend, the vendor select dropdown doesn\'t contain any data.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a fatal error on the report page if the same day is selected for both the start and end date to generate reports',
                    'description' => '',
                ],
                [
                    'title'       => '[VendorSoreSettings] Store settings update button wasn\'t working if the Dokan Pro plugin isn\'t activated.',
                    'description' => '',
                ],
                [
                    'title'       => 'Store filtering using category was not working',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.3',
        'released' => '2022-10-27',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Fixed a fatal error due to a function moved from dokan pro',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.2',
        'released' => '2022-10-27',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added a new filter hooked named `dokan_rest_api_store_collection_params` for StoreController request parameters',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduced `dokanVendorFilterSectionStart` and `DokanGetVendorArgs` js filter hooks',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => '[AdminCommission] - Percentage Commission does not support "comma" as decimal separator under Dokan admin settings `Selling Options` page',
                    'description' => '',
                ],
                [
                    'title'       => '[Products] Product author is assigned to the shop manager when the shop manager publishes a product drafted by the admin.',
                    'description' => '',
                ],
                [
                    'title'       => 'Spaces between paragraphs are too large under the store terms and condition page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.1',
        'released' => '2022-10-11',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => '[VariableProduct] Fixed variable product\'s variation image uploading height size overlapping on price field.',
                    'description' => '',
                ],
                [
                    'title'       => '[ProductSearch] Fixed product search of the product listing page of the vendor dashboard is not working.',
                    'description' => '',
                ],
                [
                    'title'       => '[OrderEmail] Fixed multiple emails are sent to the customer when a parent order\'s status is changed to processing from failed payment.',
                    'description' => '',
                ],
                [
                    'title'       => '**fix:** Removed unwanted popup code from the SweetAlert library',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed the vendor dashboard adds new products\' discount prices set to 0 by default.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendor order page not showing line item qty and totals',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.7.0',
        'released' => '2022-09-27',
        'changes'  => [
            'New'    => [
                [
                    'title'       => 'Added `dokan_selected_multistep_category` js hook after a category has been selected',
                    'description' => '',
                ],
            ],
            'Update' => [
                [
                    'title'       => 'Fixed some security issues',
                    'description' => '',
                ],
                [
                    'title'       => 'Performance enhancement for dokan',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated some JS libraries',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor dashboard `add-product-single.php` file is renamed to `edit-product-single.php`',
                    'description' => '',
                ],
            ],
            'Fix'    => [
                [
                    'title'       => 'Select2 spacing issue CSS fix',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendor single store page profile picture CSS issue',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendor product page extra table field issue',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed admin dashboard vendor details page: social profile Twitter icon is not showing issue',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed multiple sub-categories of the same parent category is assigned to a product, they are not saved issue',
                    'description' => '',
                ],
                [
                    'title'       => '[Store settings]: Not being able to add "+" or "-" sign to the phone number filed of the store on Firefox web browser.',
                    'description' => '',
                ],
                [
                    'title'       => 'Bank withdrawal method required field updated, Added a new filter hook `dokan_bank_payment_required_fields` so that site owner can manage required fields as they pleased',
                    'description' => '',
                ],
                [
                    'title'       => 'Category-based commission is not working when a category has child categories.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.5',
        'released' => '2022-08-25',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => '[WPML] Added WPML support for the multistep product category.',
                    'description' => '',
                ],
                [
                    'title'       => 'Order REST API endpoint displays other vendors orders.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.4',
        'released' => '2022-08-10',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added Catalog Mode Feature to Dokan',
                    'description' => 'For detailed information about catalog mode please check <a href="https://wedevs.com/docs/dokan/settings/product-catalog-mode/" target="_blank">here</a>',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Load asset (CSS/JS) files only on required pages',
                    'description' => '',
                ],
                [
                    'title'       => 'Added $user_id as parameter for filter hook `dokan_is_store_open`',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => '[security]  Removed unfiltered_html capabilities from vendor user role',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed responsive issue of multistep product category UI',
                    'description' => '',
                ],
                [
                    'title'       => '[WPML] Vendor Dashboard Submenu not loading if translated to another language',
                    'description' => '',
                ],
                [
                    'title'       => 'Account Type for bank payment method is missing when admin is creating/editing a vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Paypal shows as connected for new vendors even though it is not connected',
                    'description' => '',
                ],
                [
                    'title'       => 'Can\'t skip seller setup wizard\'s Payment step by keeping some fields empty',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed Order By sorting parameters for Orders',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor Dashboard Add New Product URL changed to the product list page',
                    'description' => '',
                ],
                [
                    'title'       => 'Single store page default order by filtering wasn\'t working',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed third store header styling issue',
                    'description' => '',
                ],
                [
                    'title'       => 'When the admin updates or saves a product from the admin panel multistep product category feature wasn\'t working',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.3',
        'released' => '2022-07-26',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added search by order id filter for vendor dashboard Orders page',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added DateRange filter for vendor dashboard Orders page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.2',
        'released' => '2022-07-15',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added dummy data import feature for Dokan',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Multistep category modal for product add and edit page under vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Added \'Back To Top\' button & fix some design broken issue under Dokan admin settings page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.1',
        'released' => '2022-06-30',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added disconnect button to payment methods',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed \'Dokan\' Prefix from the payment method name under vendor dashboard payment settings page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new setting to change Vendor Setup Wizard welcome message under Dokan General Settings page.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed some empty method names in Payment Methods section of Vendor Dashboard > Withdraw',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed incorrect alignment of withdraw method title in Dokan setup wizard',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor Store breadcrumb URL redirecting to 404 page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.6.0',
        'released' => '2022-06-14',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added a new filter named ‘dokan_bank_payment_validation_error’ so that payment validation errors can be filtered.',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Entirely redesigned Dokan Admin Settings page',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'WPML translated endpoints not working in payment settings page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.5.1',
        'released' => '2022-05-31',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added Reverse Withdrawal feature.',
                    'description' => 'Kindly read the <a href="https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/" target="_blank">documentation</a> for more details.',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Improved UI of Payment settings page',
                    'description' => '',
                ],
                [
                    'title'       => 'Correctly determine the vendor a product belongs to, so the "dokan_get_vendor_by_product" filter hook is called. ',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed a fatal error while changing product types to Simple > Variable > External/Affiliate > Group Product',
                    'description' => '',
                ],
                [
                    'title'       => 'Changing dokan vendor dashboard page slug gives 404 error',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.5.0',
        'released' => '2022-05-18',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added a new product attributes widget, by which users/customers will be able to search products by vendors used attributes.',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Fixed vendor store settings page phone number validation js console error.',
                    'description' => '',
                ],
                [
                    'title'       => 'Payment settings page 404 if dashboard url slug is changed.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.4.3',
        'released' => '2022-04-26',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added option to select a default payment method',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Updated design for the payment settings page of vendor dashboard to separate the management of different payment methods',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Store Contact Form widget submits the contact form directly instead of ajax submission',
                    'description' => '',
                ],
                [
                    'title'       => 'Stop sending new order emails to selected recipients (including admin) when the New Order email is disabled in WooCommerce Settings',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some validation logic under vendor dashboard payment settings page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.4.2',
        'released' => '2022-04-13',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed switching product type from variable to external doesn\'t remove product stock management options',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed store order by latest inconsistency',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.4.1',
        'released' => '2022-03-18',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Introduced two new filter hooks dokan_shipping_fee_recipient and dokan_tax_fee_recipient',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Remove unnecessary error_log codes',
                    'description' => '',
                ],
                [
                    'title'       => 'Promotional notice cache expiration date is set to one day',
                    'description' => '',
                ],
                [
                    'title'       => 'Fatal error on store closet time widget if store open/close time wasn’t set',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated jQuery form validate library from v1.11.0 to v1.19.3',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed popup not appearing after clicking withdraw button under vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Product table css fix for error class',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.4.0',
        'released' => '2022-03-08',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Stop loading unnecessary style and script files on every page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added random as store list orderby parameter',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan store shortcode orderby parameter now reflect store filter',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Store open/close time hover feature wasn’t working for specific single store page templates',
                    'description' => '',
                ],
                [
                    'title'       => 'Variable products stock status wasn’t updating by quick edit from vendor dashboard, now has been fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed Dokan conflict with WP Project Manager',
                    'description' => '',
                ],
                [
                    'title'       => 'Store product per page value wasn’t saving, now has been fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed fatal error while getting store open close time under single store page',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove background process files from database if file doesn’t exists on server due to server migration',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.9',
        'released' => '2022-02-28',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added new theme customizer settings to set default order by filter for store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added seller information under single product page, also added an admin setting entry to enable/disable this feature',
                    'description' => '',
                ],
                [
                    'title'       => 'Display store open/close time list on hover under single store page.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Added post_date_gmt and post_modified_gmt fields data when creating a product from frontend dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Create order API with coupon lines data giving fatal error',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.8',
        'released' => '2022-02-17',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Store open close time widget wasn\'t working',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.7',
        'released' => '2022-02-03',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Added Featured, Latest, Best Selling and Top Rated Product sections under single store page',
                    'description' => 'Now admin/vendor will be able to add multiple product sections under single store page. Kindly visit <a href="https://wedevs.com/docs/dokan/tutorials/how-to-create-product-sections-in-single-store-page" target="_blank">documentation</a> page to learn more about this feature.',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Updated UI for Withdraw menu',
                    'description' => 'Withdraw page design has been updated.',
                ],
                [
                    'title'       => 'Added Dokan upgrader to change dokan_withdraw table details column null',
                    'description' => '',
                ],
                [
                    'title'       => 'Added per_page and page param support on store products rest api',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated design for Upgrade to PRO popup',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated FontAwesome library from V4.7 to V5.15',
                    'description' => '',
                ],
                [
                    'title'       => 'Updated chartjs library',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'fixed a css issue under Select2 library',
                    'description' => '',
                ],
                [
                    'title'       => 'Make Hello text translatable under product published email template',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a warning under single store page if store slug was invalid',
                    'description' => '',
                ],
                [
                    'title'       => 'prevent recursion while loading template if $name param is not empty',
                    'description' => 'It was causing template to load multiple times if only store.php file was copied to theme folder, now has been fixed',
                ],
                [
                    'title'       => 'When setting bulk regular prices from the vendor dashboard in a variable product the product stock status becomes out of stock. This issue has been fixed now.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.6',
        'released' => '2022-01-10',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'CSS class added for styling order details page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Item meta is not being deleted from the order details page of the WordPress dashboard.',
                    'description' => '',
                ],
                [
                    'title'       => 'Showing Vendor Name instead of vendor id on the order details page of WooCommerce.',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed conflict with Siteground Optimizer plugin.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.5',
        'released' => '2021-12-23',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fatal error while creating new vendor.',
                    'description' => '',
                ],
                [
                    'title'       => 'Conflict Dokan admin notices scripts with customizer page and WPML string translation page.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.4',
        'released' => '2021-12-15',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Asset loading issue for admin notices',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.3',
        'released' => '2021-12-15',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added what’s New page for Dokan',
                    'description' => '',
                ],
                [
                    'title'       => 'Grouped all Dokan admin notices into a single notice with slider',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'reCaptcha integration added to store contact form',
                    'description' => '',
                ],
                [
                    'title'       => 'Redesigned Dokan admin header section. Also added some useful links under admin bar.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'select2 dropdown margin issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix loading issue while loading Dokan pages when permalink sets to plain text, Also added a notice to instruct users to change permalink setting.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.2',
        'released' => '2021-11-30',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Caching Enhancement and Fixes',
                    'description' => '',
                ],
                [
                    'title'       => 'Added tooltips for setting options',
                    'description' => '',
                ],
                [
                    'title'       => 'Google Map and Mapbox setting fields will be always visible',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Product was creating via API even selling option was disabled for a vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw details field value conflict with old withdraw data',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.1',
        'released' => '2021-11-12',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Updated vendor store per page placeholder text',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed user switch setting from Dokan selling setting, now user switching will work if plugin exists',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Added Vue DateRangePicker library',
                    'description' => '',
                ],
                [
                    'title'       => 'Added missing param on woocommerce_admin_order_item_headers',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed WC mail template overwrite was not working',
                    'description' => '',
                ],
                [
                    'title'       => 'add call to filter dokan_product_cat_dropdown_args to listing-filter.php (thanks to David Marin)',
                    'description' => '',
                ],
                [
                    'title'       => 'updated dokan_product_seller_info() function to not to add vendor data if vendor id doesn\'t exists (thanks to David Marin)',
                    'description' => '',
                ],
                [
                    'title'       => 'Hide Show email address in store settings from store settings page if admin disable this settings from customizer.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added upgrader to change refund and withdraw database table column',
                    'description' => '',
                ],
            ],
            'Add'         => [
                [
                    'title'       => 'Black Friday promotion 2021',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.3.0',
        'released' => '2021-10-31',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added integration of sweetalert2 for alert, prompt, confirm, toast notification',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed typo in vendor earning tooltip',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor was not getting a notification when order status change from cancelled to processing, on-hold, or completed. This has been fixed now',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.15',
        'released' => '2021-10-13',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Permanently delete Dokan related data (custom tables, options, pages, user roles and capabilities etc) after plugin delete based on admin Setting',
                    'description' => '',
                ],
            ],
            'New'         => [
                [
                    'title'       => 'Added filter hook dokan_store_banner_default_width and dokan_store_banner_default_height so that theme/plugin author can change store banner with and height based on their needs',
                    'description' => '',
                ],
                [
                    'title'       => 'Added Dokan stores page link under Admin bar menu, from now on “Visit Store” redirects to Dokan store list page and “Visit Shop” directs to WooCommerce Product list page.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added integration of sweetalert2 to replace default javascript alert, prompt, confirm, and toast notifications',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added a new tooltip in vendor dashboard product listing page after earning column to clarify vendors about possible earning from their products',
                    'description' => '',
                ],
                [
                    'title'       => 'Added localization support for text "Calculating"',
                    'description' => '',
                ],
                [
                    'title'       => 'Now Dokan page view count will be stored in the browser’s Local Storage instead of browser Cookies. Some caching plugins weren\'t able to cache single product pages due to this. This fix will let caching plugins to cache single product pages from now on',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Single product page used to display the seller\'s real name instead of store name on the vendor info tab. Issue has been resolved now.',
                    'description' => '',
                ],
                [
                    'title'       => 'When a vendor adds a new product If the form has any validation error then old selected tags went missing. This issue has been resolved now.',
                    'description' => '',
                ],
                [
                    'title'       => 'Store Address input fields were missing in vendor dashboard’s store setting form when the Dokan Pro plugin was not installed. Now this issue has been fixed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Removed vendor verification verified status check from vendor dashboard’s store settings page if dokan pro is not installed or vendor verification module is not active',
                    'description' => '',
                ],
                [
                    'title'       => 'Single Store product category wasn\'t working if WPML plugin was installed. Now this issue has been fixed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added validation for withdraw limit',
                    'description' => '',
                ],
                [
                    'title'       => 'Corrected spelling to \'picture\' from \'picutre\'',
                    'description' => '',
                ],
                [
                    'title'       => 'In the latest version of Divi, theme assets weren’t loading if a single store page doesn’t contain any product. This issue has been fixed now.',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor Contact form didn\'t contain “Reply To” email address when a customer would contact a vendor via the vendor contact form widget. Issue has been resolved now.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.14',
        'released' => '2021-10-04',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Multiple issue fixed in WPML integration with Dokan',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.13',
        'released' => '2020-09-30',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Set limitation for how many product tags that vendor can input, admin can set tag limit via filter hook: dokan_product_tags_select_max_length',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added dynamic filter named: dokan_manage_shop_order_custom_columns_%s hook under shop_order_custom_columns method',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed warning on product listing page due to filter data type mismatch',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed localization issue on attribute label',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed Single store product search not working for logged out users',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.12',
        'released' => '2020-09-13',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Withdraw details keep save as log',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor settings update REST api support',
                    'description' => '',
                ],
                [
                    'title'       => 'New Filter hook added for Order status list allowed for withdrawal \'dokan_settings_withdraw_order_status_options\'',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Check if pagination_base post is empty',
                    'description' => '',
                ],
                [
                    'title'       => 'Single store page map hide based on setting',
                    'description' => '',
                ],
                [
                    'title'       => 'added upgrader to reassign dokan_store_name meta because it was missing for some vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Dashboard header add new button issue fixed',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.11',
        'released' => '2020-08-31',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added new shortcode attribute named random to display store list randomly [dokan-stores orderby="random"]',
                    'description' => '',
                ],
                [
                    'title'       => 'Added \'Texty – SMS Notification for WordPress, WooCommerce, Dokan and more\' plugin as recommended plugins under Dokan admin setup wizard page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added vendor filter on admin Withdraw page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new REST route to get corresponding vendor\'s product categories under StoreController API (GET: wp-json/dokan/v1/stores/3/categories)',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new REST route to get corresponding vendor\'s popular product categories under StoreController API (GET: wp-json/dokan/v1/stores/3/categories?best_selling=1)',
                    'description' => '',
                ],
                [
                    'title'       => 'Added REST API route to create withdrawal request (POST: /wp-json/dokan/v1/withdraw/ )',
                    'description' => '',
                ],
                [
                    'title'       => 'What\'s new button added under dokan admin page top bar section',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Fixed fatal error when vendor registration shortcode used from API',
                    'description' => '',
                ],
                [
                    'title'       => 'Added Map API selection section on Dokan admin setup wizard page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed unable to remove downloadable file when there is only one file exists',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed fatal error with deleted product of an order',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.10',
        'released' => '2021-08-10',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Hide customer billing email and ip address from vendor order export data based on admin setting',
                    'description' => '',
                ],
                [
                    'title'       => 'Default Category order by set to name and order by as ascending',
                    'description' => '',
                ],

            ],
            'Fix'         => [
                [
                    'title'       => 'After submitting the Create Product from the selected category is not selected',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.9',
        'released' => '2021-08-02',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added customize settings for store product filter option to show/hide',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new hook dokan_earning_by_order_item_price',
                    'description' => '',
                ],

            ],
            'Fix' => [
                [
                    'title'       => 'Product tag search not working in variable product after adding new attribute',
                    'description' => '',
                ],
                [
                    'title'       => 'Display shipping widget though virtual checkbox selected',
                    'description' => '',
                ],
                [
                    'title'       => 'Children IDs not showing on REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a js error while refunding from vendor dashboard: size() is not a function',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.8',
        'released' => '2021-07-12',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added dokan summer sale promotion',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook named dokan_store_customizer_after_vendor_info under Dokan Store Customizer',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook named dokan_before_create_vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook named dokan_seller_registration_after_shopurl_field',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook named dokan_settings_after_store_phone',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook dokan_settings_before_store_email',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook dokan_product_gallery_image_count',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added Composer 2 support',
                    'description' => '',
                ],
                [
                    'title'       => 'Added $data parameter to existing dokan_vendor_create_data action hook',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Fixed rewrite rules issues after Dokan plugin is installed and after change store slug',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.7',
        'released' => '2021-07-01',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added Order by filtering for single store product listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added custom ip address lookup link',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a success message after creating a product from add new product modal window',
                    'description' => '',
                ],
                [
                    'title'       => 'Added - - for category listing in add new product page and add new product modal window',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new shortcode attribute named with_products_only in [dokan-stores] shortcode so that vendor without product can be filtered out from store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Add support to send objects to trash, thanks to @Mário Valney',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Fixed duplicate tag create issue, if new tag is searched with mixed character case',
                    'description' => '',
                ],
                [
                    'title'       => 'Wrong hooks used on Elementor widgets',
                    'description' => '',
                ],
                [
                    'title'       => 'Typo in Staff - Manage Menu Permissions fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed an error in Dokan setting for new installation of Dokan Lite',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendor order page pagination issue for date and customer filter',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed “In stock" and "Out of stock" translation issue',
                    'description' => '',
                ],
                [
                    'title'       => 'Email template override directory location correction for dokan vendor completed order',
                    'description' => '',
                ],
                [
                    'title'       => 'Delete cache data after updating dokan vendor balance table',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed a bug that would allow vendors to change order status even if they don\'t have permission to do so, thanks to @CODLOP',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.6',
        'released' => '2021-05-08',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added new action hooks on order details sidebar',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan admin setting warning type field added on Dokan admin setting',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan admin setting repeatable field added 2 new options must-use and desc',
                    'description' => '',
                ],
                [
                    'title'       => 'Introduce the filter hook dokan_dashboard_nav_settings_key for store settings slug',
                    'description' => '',
                ],
                [
                    'title'       => 'Eid 2021 promotion added',
                    'description' => '',
                ],
                [
                    'title'       => 'New hook: Vendor dashboard custom CSV orders export',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor Order export CSV file earnings column added',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Decimal as comma separated sale price does not save',
                    'description' => '',
                ],
                [
                    'title'       => 'Product variation pagination for post type pending',
                    'description' => '',
                ],
                [
                    'title'       => 'Product published date displaying current date in local language',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.5',
        'released' => '2021-04-30',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Sub orders set dynamic post status on WooCommerce my account order details page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store listing shortcode enhancements, Store Category wise: [dokan-stores category="clothing"] Order wise: [dokan-stores order="ASC"] Orderby wise: [dokan-stores orderby="registered"] Store_id wise: [dokan-stores store_id="1, 2, 3"',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor product listing page added 2 new filters options stock wise and product type wise',
                    'description' => '',
                ],
                [
                    'title'       => 'Order status for withdraw option added on dokan admin setting page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store open close option disabled by default when a vendor register',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Fix single store page template layout',
                    'description' => '',
                ],
                [
                    'title'       => '[WPML] Fix malformed dashboard subpage URL when page_link is filtered to add a query parameter',
                    'description' => '',
                ],
                [
                    'title'       => 'Product count exclude booking product',
                    'description' => '',
                ],
                [
                    'title'       => 'Order export not filtered customer filtered data',
                    'description' => '',
                ],
                [
                    'title'       => '[WPML] Fix malformed store URL when the home URL contains a query parameter',
                    'description' => '',
                ],
                [
                    'title'       => 'Capitalise vendor url in add new vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor setup wizard page broken issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Inconsistency template CSS class dokan-w3 issue fixed on vendor setting page',
                    'description' => '',
                ],
                [
                    'title'       => 'Unable to add multiple lines to the short Description field issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'AZERTY keyboard restrict registration issue fixed for vendor register form',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.4',
        'released' => '2021-04-01',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Vendors able to edit product slug from their product edit page',
                    'description' => '',
                ],

            ],
            'New'         => [
                [
                    'title'       => 'Enter key allow for vendor search on store listing page',
                    'description' => '',
                ],

            ],
            'Improvement' => [
                [
                    'title'       => 'Set default values withdraw methods, limit, order status, commissions on the setup wizard',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Time format with a forward slash (\) wasn\'t parsing correctly on store open/close time dropdown',
                    'description' => '',
                ],
                [
                    'title'       => 'Products: Preview of text is not appearing instantly while adding Product Tags',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw: IBAN number is not showing on the Dokan Admin',
                    'description' => '',
                ],
                [
                    'title'       => 'Warning showing on all widget when use on Elementor',
                    'description' => '',
                ],
                [
                    'title'       => 'Divi theme store single page showing warning issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Store listing filter most recent is not working issue fixed',
                    'description' => '',
                ],
            ],
            'Refector'    => [
                [
                    'title'       => 'Product create update redundant check',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.3',
        'released' => '2021-03-13',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Wordpress 5.7 and WooCommerce 5.1 compatibility',
                    'description' => '',
                ],
            ],
            'Add'         => [
                [
                    'title'       => 'Limited time promotion for weDevs birthday',
                    'description' => '',
                ],

            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.2',
        'released' => '2021-03-05',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added order completed email notification for vendors',
                    'description' => '',
                ],
                [
                    'title'       => 'Added Vendor individual withdraw threshold option',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new hook (dokan_admin_setup_wizard_save_step_setup_selling) after admin setup wizard save setup selling step',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new action hook (dokan_create_sub_order_before_calculate_totals) when creating a suborder',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Added sales price validation check for subscription product',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new filter hook (dokan_order_status_count) in order status to support custom order status',
                    'description' => '',
                ],
                [
                    'title'       => 'WP kses added new allowed arguments for image tag',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Product update and delete permission error via REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed some PHP 8 warnings',
                    'description' => '',
                ],
                [
                    'title'       => 'Store settings error on save in vendor dashboard area',
                    'description' => '',
                ],
                [
                    'title'       => 'Order delivery tracking number wasn\'t saving as order notes',
                    'description' => '',
                ],
                [
                    'title'       => 'Export order by status on vendor dashboard issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Product discount price is set empty if regular price is lower than discount price',
                    'description' => '',
                ],
                [
                    'title'       => 'Fatal error on product tab\'s post per page in more products section',
                    'description' => '',
                ],
                [
                    'title'       => 'Store/products orderby query parameter',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan store open time timezone mismatch',
                    'description' => '',
                ],
                [
                    'title'       => 'Prices fields showing for external product',
                    'description' => '',
                ],
                [
                    'title'       => 'Unable to save stock value for variation product',
                    'description' => '',
                ],
                [
                    'title'       => 'Deprecated Gplus cleanup',
                    'description' => '',
                ],
                [
                    'title'       => 'Unable to save stock value for variation product',
                    'description' => '',
                ],
                [
                    'title'       => 'Different edit url for publish products in vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'SKU wasn\'t saving from vendor dashboard',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.1',
        'released' => '2021-02-12',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Performance improvements on vendor dashboard end',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Optimized code for better security',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed conflict with user frontend menu position with Dokan',
                    'description' => '',
                ],

            ],
        ],
    ],
    [
        'version'  => 'Version 3.2.0',
        'released' => '2021-01-29',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Added blank product page new UI on vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Added Store open and closed status on dokan store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a setting where admin can set how many products to display on vendor single store page',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new validation message after upload a banner/profile picture, show a browser alert if user tries to leave the current page without saving the changes.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new update setting button on top of the vendor setting form',
                    'description' => '',
                ],
                [
                    'title'       => 'Added downloadable and virtual product type support for subscription products',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Dokan withdrawal request promotion',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'While registering as a vendor, radio button should work only when user click mouse cursor on the top of the radio button.',
                    'description' => '',
                ],
                [
                    'title'       => 'Product add pop-up validation error message style',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor pending tab keeps loading issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Improved the mapbox address search input field and make it same as google map search box',
                    'description' => '',
                ],
                [
                    'title'       => 'Keep old vendor as product author while duplicating product from the admin area',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed rounded vendor balance can not be withdrawn',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed resetting geolocation address is not selecting default location address',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed featured attribute of the store list shortcode doesn\'t work',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed vendors count not working on autoload in admin vendor listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed downloadable product "Grant Access" JS error',
                    'description' => '',
                ],
                [
                    'title'       => 'Added filter for $allowed_roles in vendor registration which was missing',
                    'description' => '',
                ],
                [
                    'title'       => 'If the vendor has a rounded value in their balance then vendors are unable to request a withdrawal of the full amount',
                    'description' => '',
                ],
                [
                    'title'       => 'When order data is retrieved via API, the "total" order value is gets rounded',
                    'description' => '',
                ],
                [
                    'title'       => 'Elementor conflict with Dokan best and top selling product shortcodes issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'More product tab showing other vendors product issue fixed',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.1.2',
        'released' => '2021-01-12',
        'changes'  => [
            'Fix'    => [
                [
                    'title'       => 'Store listing page displaying disabled vendors',
                    'description' => '',
                ],

            ],
            'Notice' => [
                [
                    'title'       => 'Added Paypal adaptive modules removal notice',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.1.1',
        'released' => '2021-01-11',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Added searching feature for Dokan admin settings',
                    'description' => '',
                ],
            ],
            'New'         => [
                [
                    'title'       => 'Added "Visit Vendor Dashboard" link to admin bar',
                    'description' => '',
                ],
                [
                    'title'       => 'Added current_datetime() compatible dokan functions for WordPress version < 5.3',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Updated refund table item_totals and item_tax_totals fields via Dokan upgrader',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Optimized Dokan admin settings page to load setting page faster',
                    'description' => '',
                ],
                [
                    'title'       => 'Added vendor search feature for disabled vendors',
                    'description' => '',
                ],
                [
                    'title'       => 'Product discount showing wrong when a product that has a limited time discount and sets a schedule on the calendar on the frontend dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed creating addon by vendor staff was not working for product',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed coupons created by the vendor can not be modified',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed admin dashboard wasn\'t loading due to use of sprintf for some translatable strings',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed display issue for State and Country multi-select of Dokan vendor create modal',
                    'description' => '',
                ],
                [
                    'title'       => 'Translation issue fixed on store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store product category not showing properly',
                    'description' => '',
                ],
                [
                    'title'       => 'Fixed missing text-domain on product listing delete confirmation alert',
                    'description' => '',
                ],
                [
                    'title'       => 'Responsive dashboard product and order table',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.1.0',
        'released' => '2020-12-20',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Store page customizer and better theme support',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Stock level wrong calculation in order notes',
                    'description' => '',
                ],
                [
                    'title'       => 'Improve search with store name in Dokan admin vendor listing and store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store listing page avatar image not showing properly on store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store and store term and conditions template make high priority',
                    'description' => '',
                ],
                [
                    'title'       => 'Store settings page url issue when vendor dashboard use as child page',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor dashboard menu not selected when vendor dashboard use as a child page',
                    'description' => '',
                ],
                [
                    'title'       => 'Ordering issue on category dropdown on product listing filter area',
                    'description' => '',
                ],
                [
                    'title'       => 'Vue wp list table package updated, translation support for list tables',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan vendor dashboard big counter warning issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor dashboard product table column issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Update custom deactivation reason placeholder text',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor biography formatting issue when update any vendor from Dokan admin area',
                    'description' => '',
                ],
                [
                    'title'       => 'Added attribute slug with product REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor listing and withdraw page not loading correctly in admin area when use others languages',
                    'description' => '',
                ],
                [
                    'title'       => 'Upgrade to pro module page overlapping issue with admin notice, css & changed svg',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw methods toggle options not working on Dokan setup wizard',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw methods are not saving for some users, fixed via Dokan upgrader',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.16',
        'released' => '2020-12-01',
        'changes'  => [
            'New'         => [
                [
                    'title'       => 'Dokan upgrade to pro modules page added',
                    'description' => '',
                ],

            ],
            'Improvement' => [
                [
                    'title'       => 'weMail plugin added on recommended plugins list when run Dokan setup wizard',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Search by store name not working on store listing page when store created from admin area',
                    'description' => '',
                ],
                [
                    'title'       => 'Store reviews REST API issue fix and improve',
                    'description' => '',
                ],
                [
                    'title'       => 'Order fetching REST API issue fix and improve',
                    'description' => '',
                ],
                [
                    'title'       => 'Deactivation reasons icons and placeholder updated',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.15',
        'released' => '2020-11-21',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'updated codebase to fix timezone mismatch',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.14',
        'released' => '2020-11-20',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Limited time promotion admin notice',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Vendor edit admin commission on decimal separator as comma',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.13',
        'released' => '2020-11-12',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Added new filter `dokan_is_product_author`',
                    'description' => '',
                ],
                [
                    'title'       => 'Apply new filter `dokan_product_listing_post_statuses` on product listing status',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Store name search was not working when the vendor account was created by admin',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor was not changing when trying to change on product quick edit section from admin area',
                    'description' => '',
                ],
                [
                    'title'       => 'Some translation issue fixed on admin setting page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.12',
        'released' => '2020-11-05',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Refactor upgrade to pro banner.',
                    'description' => '',
                ],
                [
                    'title'       => 'Temporary disable WooCommerce payment and shipping setup step from vendor setup wizard section. It was throwing a lot of deprecated warnings, we will fix it in the next version.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.11',
        'released' => '2020-10-22',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Fixes a JS loading issue when `SCRIPT_DEBUG` is enabled',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.10',
        'released' => '2020-10-20',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Vendor balance remains same after refund',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor name is not showing correctly on WooCommerce product list quick edit',
                    'description' => '',
                ],
                [
                    'title'       => 'CSS conflicting with the YITH Badge Management Plugin',
                    'description' => '',
                ],
                [
                    'title'       => 'Added postbox header div in postbox component',
                    'description' => '',
                ],
                [
                    'title'       => 'Guest checkout name in vendor order details',
                    'description' => '',
                ],
                [
                    'title'       => 'Phone field pasting option enabled settings page',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin dashboard feed REST Request error',
                    'description' => '',
                ],
                [
                    'title'       => 'Prevent admin email for sub-order',
                    'description' => '',
                ],
                [
                    'title'       => 'Multiple category commission issue fallback to vendor commission',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin vendor total count',
                    'description' => '',
                ],
                [
                    'title'       => 'Default order sorting issue',
                    'description' => '',
                ],
                [
                    'title'       => 'WC deprecate notice for using order parent_id directly',
                    'description' => '',
                ],
                [
                    'title'       => 'Label changed for external product type',
                    'description' => '',
                ],
                [
                    'title'       => 'Product tag add if do not exist',
                    'description' => '',
                ],
                [
                    'title'       => 'Store category widget not translate problem with WPML',
                    'description' => '',
                ],
                [
                    'title'       => 'On RESTFul order creation, only single store is added into the response even if there are multiple stores',
                    'description' => '',
                ],
                [
                    'title'       => 'Product variation author id update for product quick save',
                    'description' => '',
                ],
                [
                    'title'       => 'Translation issue on Select2',
                    'description' => '',
                ],
                [
                    'title'       => 'Price schedule selection date added',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove duplicate capabilities form seller role',
                    'description' => '',
                ],
                [
                    'title'       => 'Dashboard header add new button not showing with theme conflict',
                    'description' => '',
                ],
                [
                    'title'       => 'Order details page showing warning issue',
                    'description' => '',
                ],
                [
                    'title'       => 'After withdraw approval, sometimes it\'s not inserting in balance table',
                    'description' => '',
                ],
                [
                    'title'       => 'Redirect to 404 if vendor do not exist for TOC template',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdrawal current balance is incorrect cause of cache issue',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.9',
        'released' => '2020-08-25',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Some security issues fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Loading issue when long tags list on add/edit product page (Vendor Dashboard)',
                    'description' => '',
                ],
                [
                    'title'       => 'Add missing permission callback in REST routes to make WordPress 5.5 compatible',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor can send multiple withdraw request from vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'API endpoint added',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.8',
        'released' => '2020-08-12',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'WordPress v5.5 compatibility issue fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Namespacing issues on class declaration',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.7',
        'released' => '2020-07-23',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Showing fatal error for user switching',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.6',
        'released' => '2020-07-23',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Vendor user switching (User Switching plugin support)',
                    'description' => '',
                ],
                [
                    'title'       => 'Decimal and Thousand Separator with Comma',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Add system to refresh options for select fields in admin settings',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin settings input field type for common types of fields',
                    'description' => '',
                ],
                [
                    'title'       => 'Shop name not showing on product listing quick edit section',
                    'description' => '',
                ],
                [
                    'title'       => 'Order notes in vendor dashboard insert wrong author data',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.5',
        'released' => '2020-06-11',
        'changes'  => [
            'New' => [
                [
                    'title'       => 'Exclude cash on delivery payments from vendor withdrawal balance (COD)',
                    'description' => '',
                ],
            ],
            'Fix' => [
                [
                    'title'       => 'Remove vendor folder from the excluded list',
                    'description' => '',
                ],
                [
                    'title'       => 'Earning column missing on vendor dashboard order list',
                    'description' => '',
                ],
                [
                    'title'       => 'Default location not working in vendor dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove link from customer name in vendor order details',
                    'description' => '',
                ],
                [
                    'title'       => 'Custom header, footer template does not work in Dokan store page (Divi Theme)',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.4',
        'released' => '2020-05-15',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Pass vendor id in dokan_get_seller_active_withdraw_methods hook',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Rename google plus to google as google plus is deprecated',
                    'description' => '',
                ],
                [
                    'title'       => 'Unable to set store trams and condition settings through REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor order email does not have the TAX details',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw request email is not send to admin',
                    'description' => '',
                ],
                [
                    'title'       => 'Typo in backend add and edit vendor page',
                    'description' => '',
                ],
                [
                    'title'       => 'On updating commission type in backend vendor dashboard, translated commission type is getting saved into database',
                    'description' => '',
                ],
                [
                    'title'       => 'Store listing filter does not work when its saved as frontpage',
                    'description' => '',
                ],
                [
                    'title'       => 'When a product is purchased with a price of more than 8 digit the calculation is wrong',
                    'description' => '',
                ],
                [
                    'title'       => 'Caching issue on vendor\'s order listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Filter out empty seller ids when a product is deleted `dokan_get_sellers_by` function',
                    'description' => '',
                ],
                [
                    'title'       => 'Deduct PayPal gateway fee from vendor\'s earning',
                    'description' => '',
                ],
                [
                    'title'       => 'Hide vendor info if admin wants to',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.3',
        'released' => '2020-04-03',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Clear caches on product update',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor is not receiving email for new order',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove weForms promotion from admin setup wizard',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.2',
        'released' => '2020-03-23',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Added group description to exporters and updated privacy policy guide to drop use of deprecated classes',
                    'description' => '',
                ],
                [
                    'title'       => 'dokan_get_shipping_processing_times function',
                    'description' => '',
                ],
                [
                    'title'       => 'Add filter on withdraw export csv args',
                    'description' => '',
                ],
                [
                    'title'       => 'Get correct product thumbnail size in vendor product list page',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Unable to remove attributes in vendor product edit page',
                    'description' => '',
                ],
                [
                    'title'       => 'Feature image is not saving on quick edit',
                    'description' => '',
                ],
                [
                    'title'       => 'Vendor image issue',
                    'description' => '',
                ],
                [
                    'title'       => 'Set vendor email on new vendor creation',
                    'description' => '',
                ],
                [
                    'title'       => 'Return content from shortcode instead of being outputting',
                    'description' => '',
                ],
                [
                    'title'       => 'Map still showing on vendor dashboard settings page even if there is no API key',
                    'description' => '',
                ],
                [
                    'title'       => 'Product type not saving when quick edit',
                    'description' => '',
                ],
                [
                    'title'       => 'Render withdraw methods dynamically in setup wizard',
                    'description' => '',
                ],
                [
                    'title'       => 'Show vendor email to admin and actual vendor',
                    'description' => '',
                ],
                [
                    'title'       => 'Product type error in dokan_save_product function',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin is unable to see the setup wizard on new dokan installation when WooCommerce is not installed',
                    'description' => '',
                ],
                [
                    'title'       => 'Add missing add_meta_query method in dokan REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Only render map if api key is availabe in store settings page',
                    'description' => '',
                ],
                [
                    'title'       => 'Add dokan_get_all_cap_labels function',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.1',
        'released' => '2020-02-07',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Fixed yoast seo causing conflict issue in single store page',
                    'description' => '',
                ],
                [
                    'title'       => 'Permission issue fixed for shop manager',
                    'description' => '',
                ],
                [
                    'title'       => 'Handle sales price error if its greater than regular price or empty',
                    'description' => '',
                ],
                [
                    'title'       => 'Change placeholder text for filter by customer to registered customer',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 3.0.0',
        'released' => '2020-02-03',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Store listing filter styles so that it works with almost any theme',
                    'description' => '',
                ],
                [
                    'title'       => 'Show notice in dokan admin setup wizard if minimum PHP version is not met for WooCommerce',
                    'description' => '',
                ],
                [
                    'title'       => 'If dokan pro doesn\'t exist but commission type is found in database, ignore that saved commission type',
                    'description' => '',
                ],
                [
                    'title'       => 'Code quality and performance',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Add mapbox option in dokan admin setup wizard',
                    'description' => '',
                ],
                [
                    'title'       => 'Pass order object into woocommerce_order_item_{type}_html hook',
                    'description' => '',
                ],
                [
                    'title'       => 'Allow vendor to update store terms and condition with REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'If show_email is turned off don\'t show the email in REST API response',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove space while generating user_name via dokan_generate_username function',
                    'description' => '',
                ],
                [
                    'title'       => 'If a product is deleted and no vendor is found for that product display (no name) in backend order listing page',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.31',
        'released' => '2020-01-14',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Add option to set dokan store listing page for rendering all stores',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.30',
        'released' => '2020-01-10',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Grid and List view for store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Store sorting options in store listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Add Mapbox as Google map alternative',
                    'description' => '',
                ],
                [
                    'title'       => 'Add Enfold theme support',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'dokan_get_vendor_by_product function so that it reruns vendor for product variation',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.29',
        'released' => '2019-12-26',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Don\'t show the admin setup wizard who ran the setup wizard before',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove non-ascii characters from some file names',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan dashboard hamburger menu is not working fixed',
                    'description' => '',
                ],
                [
                    'title'       => 'Downloadable product grunt and revoke access issue is fixed',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Added privacy policy info in setup wizard for admin',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.28',
        'released' => '2019-12-19',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Add privacy policy in readme.',
                    'description' => '',
                ],
            ],
            'Fix'         => [
                [
                    'title'       => 'Sanitize and Escape data before saving and rendering',
                    'description' => '',
                ],

            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.27',
        'released' => '2019-12-11',
        'changes'  => [
            'New Feature' => [
                [
                    'title'       => 'Run Dokan Admin Setup Wizard without being WooCommerce installed',
                    'description' => '',
                ],
            ],
            'Improvement' => [
                [
                    'title'       => 'Remove empty div from vendor payment settings page',
                    'description' => '',
                ],
                [
                    'title'       => 'Deleting a attribute from predefined attributes and add the attribute again mess up attributes',
                    'description' => '',
                ],
                [
                    'title'       => 'Add hooks in order details and admin setup wizard',
                    'description' => '',
                ],
                [
                    'title'       => 'Pass post_type as a second parameter to the months_dropdown_results hook',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.26',
        'released' => '2019-11-19',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Add option to hide out of stock products in best selling widget.',
                    'description' => '',
                ],
                [
                    'title'       => 'Make dokan add vendor UI consistent to WordPress UI.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.25',
        'released' => '2019-11-12',
        'changes'  => [
            'Improvement' => [
                [
                    'title'       => 'Dokan_Commission::prepare_for_calculation() method.',
                    'description' => '',
                ],
            ],
            'Dev'         => [
                [
                    'title'       => 'Add dokan backend settings input required field validation.',
                    'description' => '',
                ],

            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.24',
        'released' => '2019-11-08',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Assets URL localization was creating a problem in frontend vendor shipping area, this has been fixed.',
                    'description' => '',
                ],
                [
                    'title'       => 'Added a new filter `dokan_get_edit_product_url` to override the product edit URL.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.23 ',
        'released' => '2019-11-07',
        'changes'  => [
            'New Feature'  => [
                [
                    'title'       => 'Add REST API support for store contact form widget',
                    'description' => '',
                ],
                [
                    'title'       => 'Add Vendor listing page in dokan backend',
                    'description' => '',
                ],
                [
                    'title'       => 'Add vendor active inactive REST API',
                    'description' => '',
                ],
            ],
            'Fix'          => [
                [
                    'title'       => 'Increase refund table data length to allow more refund items',
                    'description' => '',
                ],
                [
                    'title'       => 'Withdraw threshold field disappears when commission type is selected in dokan settings',
                    'description' => '',
                ],
                [
                    'title'       => 'Order listing page shows the same orders when object cache is enabled',
                    'description' => '',
                ],
                [
                    'title'       => 'Best selling widgets warning in store sidebar',
                    'description' => '',
                ],
                [
                    'title'       => 'Save store name in vendor\'s user_meta so that store search form widget works correctly',
                    'description' => '',
                ],
                [
                    'title'       => 'If percent commission rate is not set while using combine commission calculation is not correct',
                    'description' => '',
                ],
            ],
            'Dev'          => [
                [
                    'title'       => 'Add filter to modify current page id in dokan_is_seller_dashboard function',
                    'description' => '',
                ],
            ],
            'Localization' => [
                [
                    'title'       => 'Store open and close notice placeholder strings remains untranslated',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.22',
        'released' => '2019-10-03',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Remove duplicate input filed in dokan admin settings form',
                    'description' => '',
                ],
                [
                    'title'       => 'Make commission value to 0 if no product found',
                    'description' => '',
                ],
                [
                    'title'       => 'Attribute value\'s are swapped after changing the order of the attributes',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.21',
        'released' => '2019-09-24',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'If state is not found for a country in store settings, remove the state field on reload',
                    'description' => '',
                ],
                [
                    'title'       => 'Only show vendor\'s own uploaded media to a vendor.',
                    'description' => '',
                ],
                [
                    'title'       => 'Add required attribute for various input field in dokan_post_input_box function.',
                    'description' => '',
                ],
                [
                    'title'       => 'Calculate commission for item by quantity when the commission is set to flat.',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Introduce Dokan_Commission class to calculate admin and vendor\'s commission.',
                    'description' => '',
                ],
                [
                    'title'       => 'Remove unnecessary placeholder in admin commission field.',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.20',
        'released' => '2019-08-23',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Geolocation map settings value is not saving',
                    'description' => '',
                ],
                [
                    'title'       => 'Fix warning in vendor dashboard widget when seller setup wizard is not run',
                    'description' => '',
                ],
                [
                    'title'       => 'Store banner height in vendor settings page it not honouring the saved settings',
                    'description' => '',
                ],
                [
                    'title'       => 'Conflict with avada theme fution builder',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Use WordPress backend date format while printing date in approved and cancelled withdraw request',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.19',
        'released' => '2019-07-29',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Split orders created from admin dashboard',
                    'description' => '',
                ],
                [
                    'title'       => 'Add on backorder in product stock management',
                    'description' => '',
                ],
                [
                    'title'       => 'Dokan dashboard menu returning 404 with the latest version of visual composer plugin',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Dokan admin settings rearrange',
                    'description' => '',
                ],
                [
                    'title'       => 'Add compatibility with ultimate member plugin',
                    'description' => '',
                ],
                [
                    'title'       => 'Add few hooks in product listing template',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.18',
        'released' => '2019-07-10',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Add google map type option field component',
                    'description' => '',
                ],
                [
                    'title'       => 'Add dokan_array_after helper function',
                    'description' => '',
                ],
                [
                    'title'       => 'Admin settings default value for multicheck field',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Remove unnecessary code and add hook after creating parent order',
                    'description' => '',
                ],
                [
                    'title'       => 'Refactor dokan_get_vendor_by_product function and explicit error checking while using it',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.17',
        'released' => '2019-06-13',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Remove unwanted code to fix conflict with yith plugin',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Dokan theme support and responsive menu',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.16',
        'released' => '2019-06-11',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Hide hidden and out of stock products in vendor store page',
                    'description' => '',
                ],
                [
                    'title'       => 'A non-numeric value encountered warning in vendor product listing page, if product price is not given',
                    'description' => '',
                ],
                [
                    'title'       => 'Add failed order in vendor order listing page',
                    'description' => '',
                ],
                [
                    'title'       => 'Creating product from admin backend returns 2 instance of the product author',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Ensure dokan_get_seller_id_by_order filter is always taking effect',
                    'description' => '',
                ],
                [
                    'title'       => 'Make dokan vendor dashboard responsive',
                    'description' => '',
                ],
                [
                    'title'       => 'Show admin notice stating WooCommerce is required if not found on dokan installation',
                    'description' => '',
                ],
                [
                    'title'       => 'Add hook after creating and updating object via dokan REST API',
                    'description' => '',
                ],
                [
                    'title'       => 'Add dokan_ensure_vendor_coupon filter while ensuring vendor coupon restriction',
                    'description' => '',
                ],
                [
                    'title'       => 'Add updater class to fix banner issue where store settings and listing template was overridden',
                    'description' => '',
                ],
                [
                    'title'       => 'Add filter hook while fetching vendor products',
                    'description' => '',
                ],
                [
                    'title'       => 'Add define method to define plugin constants',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.15',
        'released' => '2019-05-08',
        'changes'  => [
            'Fix'   => [
                [
                    'title'       => 'Vendor banner is not showing in the backend edit user profile page',
                    'description' => '',
                ],
                [
                    'title'       => 'Add filter to allow or skip nonce checking while registering new user',
                    'description' => '',
                ],
            ],
            'Tweak' => [
                [
                    'title'       => 'Update appsero SDK',
                    'description' => '',
                ],
            ],
        ],
    ],
    [
        'version'  => 'Version 2.9.14',
        'released' => '2019-04-26',
        'changes'  => [
            'Fix' => [
                [
                    'title'       => 'Schedule product price not showing correctly',
                    'description' => '',
                ],
                [
                    'title'       => 'Backward compatibility for banner and store time',
                    'description' => '',
                ],
            ],
        ],
    ],
];

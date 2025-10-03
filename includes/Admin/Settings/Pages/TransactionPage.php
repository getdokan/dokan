<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class TransactionPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'transaction';
    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 600;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_transaction';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() {
        wp_localize_script(
            'dokan-admin-dashboard',
            'adminWithdrawData',
            [ 'currency' => dokan_get_container()->get( 'scripts' )->get_localized_price() ],
        );
    }

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array {
        return [ 'dokan-fontawesome', 'dokan-accounting' ];
    }

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array {
        return [ 'dokan-fontawesome' ];
    }

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array {
        return [];
    }

    /**
     * Get default commission settings
     *
     * @since 4.0.0
     *
     * @return array Default commission settings
     */
    protected function get_default_settings(): array {
        /**
         * Filter the default settings for the commission step in the onboarding setup.
         *
         * @since 4.0.0
         *
         * @param array $default_settings The default settings for the commission step.
         *
         * @return array Filtered default settings.
         */
        return apply_filters(
            'dokan_admin_settings_commission_default_data',
            [
                'additional_fee'                            => '10',
                'commission_type'                           => 'fixed',
                'admin_percentage'                          => '10',
                'reset_sub_category_when_edit_all_category' => 'on',
                'commission_category_based_values'          => [
                    'items' => [],
                    'all'   => [
                        'flat'       => '',
                        'percentage' => '',
                    ],
                ],
            ]
        );
    }

    /**
     * Describe the settings options
     *
     * @return void
     */
    public function describe_settings(): void {
        $default_settings = $this->get_default_settings();
        $dokan_selling    = get_option( 'dokan_selling', $default_settings );

        // Create commission subpage
        $commission_page = ElementFactory::sub_page( 'commission' )
            ->set_title( esc_html__( 'Commissions', 'dokan-lite' ) )
            ->set_priority( 200 );

        // Create commission section
        $commission_section = ElementFactory::section( 'commission' );
        // Add commission fields
        $commission_section
            ->add(
                ElementFactory::field( 'commission_type', 'radio_capsule' )
                    ->set_title( esc_html__( 'Commission Type', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Select a commission type for your marketplace', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Fixed', 'dokan-lite' ), 'fixed', 'Percent' )
                    ->add_option( esc_html__( 'Category Based', 'dokan-lite' ), 'category_based', 'Box' )
                    ->set_default( $default_settings['commission_type'] )
                    ->set_value( $dokan_selling['commission_type'] ?? $default_settings['commission_type'] )
            )
            ->add(
                ElementFactory::field( 'admin_commission', 'combine_input' )
                    ->set_title( esc_html__( 'Admin Commission', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ) )
                    ->add_dependency( 'commission.commission.commission_type', 'fixed', true, 'display', 'hide', '!==' )
                    ->add_dependency( 'commission.commission.commission_type', 'fixed', true, 'display', 'show', '===' )
                    ->set_admin_percentage( $dokan_selling['admin_percentage'] ?? $default_settings['admin_percentage'] )
                    ->set_additional_fee( $dokan_selling['additional_fee'] ?? $default_settings['additional_fee'] )
                    ->set_value(
                        [
                            'additional_fee'   => $dokan_selling['additional_fee'] ?? $default_settings['additional_fee'],
                            'admin_percentage' => $dokan_selling['admin_percentage'] ?? $default_settings['admin_percentage'],
                        ]
                    )
            )
            ->add(
                ElementFactory::field( 'reset_sub_category_when_edit_all_category', 'switch' )
                    ->set_title( esc_html__( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ) )
                    ->set_description( esc_html__( "Important: 'All Categories' commission serves as your marketplace's default rate and cannot be empty. If 0 is given in value, then the marketplace will deduct no commission from vendors", 'dokan-lite' ) )
                    ->add_dependency( 'commission.commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                    ->add_dependency( 'commission.commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( $default_settings['reset_sub_category_when_edit_all_category'] )
                    ->set_value( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'] )
            )
            ->add(
                ElementFactory::field( 'commission_category_based_values', 'category_based_commission' )
                    ->set_title( esc_html__( 'Admin Commission', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Amount you will get from each sale', 'dokan-lite' ) )
                    ->add_dependency( 'commission.commission.commission_type', 'category_based', true, 'display', 'hide', '!==' )
                    ->add_dependency( 'commission.commission.commission_type', 'category_based', true, 'display', 'show', '===' )
                    ->add_dependency( 'commission.commission.reset_sub_category_when_edit_all_category', 'on', true, 'custom', 'custom', '===' )
                    ->add_dependency( 'commission.commission.reset_sub_category_when_edit_all_category', 'off', true, 'custom', 'custom', '===' )
                    ->set_reset_subcategory( $dokan_selling['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'] )
                    ->set_value( (array) ( $dokan_selling['commission_category_based_values'] ?? $default_settings['commission_category_based_values'] ) )
            );

        // Add the commission section to commission page
        $commission_page->add( $commission_section );

        // Create fees subpage
        $fees_page = ElementFactory::sub_page( 'fees' )
            ->set_priority( 100 )
            ->set_icon( 'FileSpreadsheet' )
            ->set_title( esc_html__( 'Fees', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure how different types of fees are distributed between vendors and admin', 'dokan-lite' ) );

        // Create fees section
        $fees_section = ElementFactory::section( 'fees' )
            ->add(
                ElementFactory::field( 'shipping_fee', 'radio_capsule' )
                    ->set_title( esc_html__( 'Shipping Fee', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Who will be receiving the shipping fees? Note that, tax fees for corresponding shipping method will not be included with shipping fees.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( esc_html__( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            )
            ->add(
                ElementFactory::field( 'product_tax_fee', 'radio_capsule' )
                    ->set_title( esc_html__( 'Product Tax Fee', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Who will be receiving the tax fees for products? Note that, shipping tax fees will not be included with product tax.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( esc_html__( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            )
            ->add(
                ElementFactory::field( 'shipping_tax_fee', 'radio_capsule' )
                    ->set_title( esc_html__( 'Shipping Tax Fee', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Who will be receiving the tax fees for shipping?', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( esc_html__( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            );

        // Add the fees section to fees page
        $fees_page->add( $fees_section );

        // Create withdraw subpage
        $withdraw_page = ElementFactory::sub_page( 'withdraw_charge' )
            ->set_priority( 300 )
            ->set_icon( 'FileSpreadsheet' )
            ->set_title( esc_html__( 'Withdraw', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Set up available withdrawal methods and transaction conditions for vendors.', 'dokan-lite' ) )
            ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/vendor-settings/withdraw/' ) )
            ->add(
                ElementFactory::section( 'section_withdraw_charge' )
                    ->set_title( esc_html__( 'Withdraw Methods and Charges', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Select suitable withdraw methods and charges for vendors.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::field_group( 'withdraw_methods_group_paypal' )
                            ->add(
                                ElementFactory::field( 'paypal_withdraw', 'switch' )
                                    ->set_title( esc_html__( 'PayPal', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable PayPal as a withdrawal method for vendors.', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                                    ->set_default( 'on' )
                            )
                            ->add(
                                ElementFactory::field( 'paypal_withdraw_charges', 'combine_input' )
                                    ->set_title( esc_html__( 'Withdraw charges', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ) )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group.paypal_withdraw', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group.paypal_withdraw', 'off', true, 'display', 'hide', '===' )
                                    ->set_value(
                                        [
                                            'additional_fee'   => '0.00',
                                            'admin_percentage' => '0.00',
                                        ]
                                    )
                                    ->set_admin_percentage( '0.00' )
                                    ->set_additional_fee( '0.00' )
                            )
                    )
                    ->add(
                        ElementFactory::field_group( 'withdraw_methods_group_skrill' )
                            ->add(
                                ElementFactory::field( 'skrill_withdraw', 'switch' )
                                    ->set_title( esc_html__( 'Skrill', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable Skrill as a withdrawal method for vendors.', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                                    ->set_default( 'off' )
                            )
                            ->add(
                                ElementFactory::field( 'skrill_withdraw_charges', 'combine_input' )
                                    ->set_title( esc_html__( 'Withdraw charges', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ) )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_skrill.skrill_withdraw', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_skrill.skrill_withdraw', 'off', true, 'display', 'hide', '===' )
                                    ->set_value(
                                        [
                                            'additional_fee'   => '0.00',
                                            'admin_percentage' => '0.00',
                                        ]
                                    )
                                    ->set_admin_percentage( '0.00' )
                                    ->set_additional_fee( '0.00' )
                            )
                    )
                    ->add(
                        ElementFactory::field_group( 'withdraw_methods_group_bank' )
                            ->add(
                                ElementFactory::field( 'bank_transfer_withdraw', 'switch' )
                                    ->set_title( esc_html__( 'Bank Transfer', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Enable Bank Transfer as a withdrawal method for vendors.', 'dokan-lite' ) )
                                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                                    ->set_default( 'off' )
                            )
                            ->add(
                                ElementFactory::field( 'bank_transfer_withdraw_charges', 'combine_input' )
                                    ->set_title( esc_html__( 'Withdraw charges', 'dokan-lite' ) )
                                    ->set_description( esc_html__( 'Set withdrawal charges for Bank Transfer method.', 'dokan-lite' ) )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw', 'on', true, 'display', 'show', '===' )
                                    ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw', 'off', true, 'display', 'hide', '===' )
                                    ->set_value(
                                        [
                                            'additional_fee'   => '0.00',
                                            'admin_percentage' => '0.00',
                                        ]
                                    )
                                    ->set_admin_percentage( '0.00' )
                                    ->set_additional_fee( '0.00' )
                            )
                    )
            )
            ->add(
                ElementFactory::section( 'minimum_withdraw_limit_section' )
                    ->add(
                        ElementFactory::field( 'minimum_withdraw_limit', 'number' )
                            ->set_title( esc_html__( 'Minimum Withdraw Limit', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Minimum balance required to make a withdraw request. Leave blank to set no minimum limits.', 'dokan-lite' ) )
                            ->set_postfix( esc_html__( '$', 'dokan-lite' ) )
                            ->set_default( '50' )
                    )
            )
            ->add(
                ElementFactory::section( 'cod_payments_section' )
                    ->add(
                        ElementFactory::field( 'cod_payments', 'radio_capsule' )
                            ->set_title( esc_html__( 'COD Payments', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ) )
                            ->add_option( esc_html__( 'Include', 'dokan-lite' ), 'include' )
                            ->add_option( esc_html__( 'Exclude', 'dokan-lite' ), 'exclude' )
                            ->set_default( 'include' )
                    )
            );

        // Create a reverse withdrawal subpage
        $reverse_withdrawal_page = ElementFactory::sub_page( 'reverse_withdrawal' )
            ->set_priority( 400 )
            ->set_title( esc_html__( 'Reverse Withdrawal', 'dokan-lite' ) )
            ->set_doc_link( 'https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/' )
            ->set_description( esc_html__( 'Set up commission collection from vendors on Cash on Delivery orders. Control when and how to charge money from vendor accounts when they owe you.', 'dokan-lite' ) );

        // Create a reverse withdrawal section
        $reverse_withdrawal_section = ElementFactory::section( 'reverse_withdrawal_section' )
            ->add(
                ElementFactory::field( 'enabled', 'switch' )
                    ->set_title( esc_html__( 'Activate Reverse Withdrawal (Cash On Delivery)', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Enable this option to activate automatic balance deducting from vendors.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'billing_type', 'radio_capsule' )
                    ->set_title( esc_html__( 'Billing Type', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Select how vendors will be billed for their reverse balance amounts.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'By Amount Limit', 'dokan-lite' ), 'by_amount' )
                    ->add_option( esc_html__( 'Monthly', 'dokan-lite' ), 'by_month' )
                    ->set_default( 'by_amount' )
            )
            ->add(
                ElementFactory::field( 'reverse_balance_threshold', 'number' )
                    ->set_title( sprintf( '%1$s (%2$s)', esc_html__( 'Reverse Balance Threshold', 'dokan-lite' ), get_woocommerce_currency() ), )
                    ->set_description( esc_html__( 'Set the amount that triggers automatic withdrawal actions.', 'dokan-lite' ) )
                    ->set_prefix( 'DollarSign' )
                    ->set_addon_icon( true )
                    ->set_step( 0.5 )
                    ->set_minimum( 0 )
                    ->set_default( 150 )
                    ->add_dependency( 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'by_amount', true, 'display', 'show', '===' )
                    ->add_dependency( 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'by_month', true, 'display', 'hide', '===' )
            )
            ->add(
                ElementFactory::field( 'monthly_billing_day', 'number' )
                    ->set_title( esc_html__( 'Monthly Billing Day', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Enter the day of month when you want to send reverse withdrawal balance invoices to vendors.', 'dokan-lite' ) )
                    ->set_addon_icon( true )
                    ->set_prefix( 'Calendar' )
                    ->set_default( 1 )
                    ->set_minimum( 1 )
                    ->set_maximum( 28 )
                    ->add_dependency( 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'by_month', true, 'display', 'show', '===' )
                    ->add_dependency( 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'by_amount', true, 'display', 'hide', '===' )
            )
            ->add(
                ElementFactory::field( 'due_period', 'number' )
                    ->set_title( esc_html__( 'Grace Period', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Number of days to wait before enforcing collection actions. Set to 0 for immediate action.', 'dokan-lite' ) )
                    ->set_postfix( esc_html__( 'Days', 'dokan-lite' ) )
                    ->set_step( 1 )
                    ->set_minimum( 0 )
                    ->set_default( 7 )
                    ->set_maximum( 28 )
            )
            ->add(
                ElementFactory::field( 'failed_actions', 'multicheck' )
                    ->set_title( esc_html__( 'Penalty Actions After Grace Period', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Choose actions to take when the grace period expires and payment remains outstanding.', 'dokan-lite' ) )
                    ->add_option( esc_html__( 'Add to Cart Button Visibility', 'dokan-lite' ), 'enable_catalog_mode' )
                    ->add_option( esc_html__( 'Withdraw Menu', 'dokan-lite' ), 'hide_withdraw_menu' )
                    ->add_option( esc_html__( 'Make Vendor Status Inactive', 'dokan-lite' ), 'status_inactive' )
                    ->set_default( [ 'enable_catalog_mode' ] )
            )
            ->add(
                ElementFactory::field( 'display_notice', 'switch' )
                    ->set_title( esc_html__( 'Display Notice During Grace Period', 'dokan-lite' ) )
                    ->set_description( esc_html__( 'Show a payment reminder notification on the vendor dashboard during the grace period.', 'dokan-lite' ) )
                    ->set_enable_state( esc_html__( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( esc_html__( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            );

        // Add the reverse withdrawal section to the reverse withdrawal page
        $reverse_withdrawal_page->add( $reverse_withdrawal_section );

        $this
            ->set_title( esc_html__( 'Transaction', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure transaction-related settings including commissions and fees.', 'dokan-lite' ) )
            ->set_icon( 'ArrowRightLeft' )
            ->add( $commission_page )
            ->add( $fees_page )
            ->add( $withdraw_page )
            ->add( $reverse_withdrawal_page );
    }
}

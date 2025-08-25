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
    protected int $priority = 300;

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
            ->set_title( esc_html__( 'Commission', 'dokan-lite' ) );

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
            ->set_icon( 'FileSpreadsheet' )
            ->set_title( __( 'Fees', 'dokan-lite' ) )
            ->set_description( __( 'Configure how different types of fees are distributed between vendors and admin', 'dokan-lite' ) );

        // Create fees section
        $fees_section = ElementFactory::section( 'fees' )
            ->add(
                ElementFactory::field( 'shipping_fee', 'radio_capsule' )
                    ->set_title( __( 'Shipping Fee', 'dokan-lite' ) )
                    ->set_description( __( 'Who will be receiving the shipping fees? Note that, tax fees for corresponding shipping method will not be included with shipping fees.', 'dokan-lite' ) )
                    ->add_option( __( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( __( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            )
            ->add(
                ElementFactory::field( 'product_tax_fee', 'radio_capsule' )
                    ->set_title( __( 'Product Tax Fee', 'dokan-lite' ) )
                    ->set_description( __( 'Who will be receiving the tax fees for products? Note that, shipping tax fees will not be included with product tax.', 'dokan-lite' ) )
                    ->add_option( __( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( __( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            )
            ->add(
                ElementFactory::field( 'shipping_tax_fee', 'radio_capsule' )
                    ->set_title( __( 'Shipping Tax Fee', 'dokan-lite' ) )
                    ->set_description( __( 'Who will be receiving the tax fees for shipping?', 'dokan-lite' ) )
                    ->add_option( __( 'Vendor', 'dokan-lite' ), 'vendor', 'Users' )
                    ->add_option( __( 'Admin', 'dokan-lite' ), 'admin', 'User' )
                    ->set_default( 'vendor' )
            );

        // Add the fees section to fees page
        $fees_page->add( $fees_section );

        // Create withdraw subpage
        $withdraw_page = ElementFactory::sub_page( 'withdraw_charge' )
            ->set_icon( 'FileSpreadsheet' )
            ->set_title( __( 'Withdraw', 'dokan-lite' ) )
            ->set_description( __( 'Set up available withdrawal methods and transaction conditions for vendors.', 'dokan-lite' ) )
            ->set_doc_link( esc_url( 'https://wedevs.com/docs/dokan/vendor-settings/withdraw/' ) )
            ->add(
                ElementFactory::section( 'section_withdraw_charge' )
                    ->set_title( __( 'Withdraw Methods and Charges', 'dokan-lite' ) )
                    ->set_description( __( 'Select suitable withdraw methods and charges for vendors.', 'dokan-lite' ) )
                    ->add(
                        ElementFactory::field_group( 'withdraw_methods_group' )
                                                ->add(
                                                    ElementFactory::field( 'paypal_withdraw', 'switch' )
                                                        ->set_title( __( 'PayPal', 'dokan-lite' ) )
                                                        ->set_description( __( 'Enable PayPal as a withdrawal method for vendors.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                                )
                                                ->add(
                                                    ElementFactory::field( 'paypal_withdraw_charges', 'combine_input' )
                                                        ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ) )
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
                                                        ->set_title( __( 'Skrill', 'dokan-lite' ) )
                                                        ->set_description( __( 'Enable Skrill as a withdrawal method for vendors.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'off' )
                                                )
                                        ->add(
                                            ElementFactory::field( 'skrill_withdraw_charges', 'combine_input' )
                                                        ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ) )
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
                        ElementFactory::field_group(
                            'withdraw_methods_group_razorpay'
                        )
                                        ->add(
                                            ElementFactory::field( 'razorpay_withdraw', 'switch' )
                                                        ->set_title( __( 'Razorpay', 'dokan-lite' ) )
                                                        ->set_description( __( 'Enable Razorpay as a withdrawal method for vendors.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'off' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'razorpay_withdraw_charges', 'combine_input' )
                                                        ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set withdrawal charges for PayPal method.', 'dokan-lite' ) )
                                                        ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_razorpay.razorpay_withdraw', 'on', true, 'display', 'show', '===' )
                                                        ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_razorpay.razorpay_withdraw', 'off', true, 'display', 'hide', '===' )
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
                                                        ->set_title( __( 'Bank Transfer', 'dokan-lite' ) )
                                                        ->set_description( __( 'Enable Bank Transfer as a withdrawal method for vendors.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'off' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'bank_transfer_withdraw_charges', 'combine_input' )
                                                        ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set withdrawal charges for Bank Transfer method.', 'dokan-lite' ) )
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
                    ->add(
                        ElementFactory::field_group( 'withdraw_methods_group_custom' )
                                        ->add(
                                            ElementFactory::field( 'custom_withdraw', 'switch' )
                                                        ->set_title( __( 'Custom', 'dokan-lite' ) )
                                                        ->set_description( __( 'Enable Custom withdrawal method for vendors.', 'dokan-lite' ) )
                                                        ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                        ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                        ->set_default( 'on' )
                                        )
                                        ->add(
                                            ElementFactory::field( 'bank_transfer_withdraw_charges', 'combine_input' )
                                                        ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                        ->set_description( __( 'Set withdrawal charges for Bank Transfer method.', 'dokan-lite' ) )
                                                        ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw', 'on', true, 'display', 'show', '===' )
                                                        ->add_dependency( 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw', 'off', true, 'display', 'hide', '===' )
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
                        ElementFactory::field( 'custom_method_name', 'text' )
                                                ->set_title( __( 'Custom Method Name', 'dokan-lite' ) )
                                                ->set_description( __( 'This will be the title of the custom withdraw method.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'Type something', 'dokan-lite' ) )
                    )
                    ->add(
                        ElementFactory::field( 'custom_method_type', 'text' )
                                                ->set_title( __( 'Custom Method Type', 'dokan-lite' ) )
                                                ->set_description( __( 'Custom Withdraw method type.', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'e.g. Email or Phone Number', 'dokan-lite' ) )
                    )
                    ->add(
                        ElementFactory::field( 'custom_withdraw_charges', 'combine_input' )
                                                ->set_title( __( 'Withdraw charges', 'dokan-lite' ) )
                                                ->set_description( __( 'Set withdrawal charges for Custom method.', 'dokan-lite' ) )
                                                ->set_value(
                                                    [
                                                        'additional_fee'   => '0.00',
                                                        'admin_percentage' => '0.00',
                                                    ]
                                                )
                                                ->set_admin_percentage( '0.00' )
                                                ->set_additional_fee( '0.00' )
                    )
                    ->add(
                        ElementFactory::field( 'minimum_withdraw_limit', 'number' )
                                                ->set_title( __( 'Minimum Withdraw Limit', 'dokan-lite' ) )
                                                ->set_description( __( 'Minimum balance required to make a withdraw request. Leave blank to set no minimum limits.', 'dokan-lite' ) )
                                                ->set_postfix( __( '$', 'dokan-lite' ) )
                                                ->set_default( '50' )
                    )
                    ->add(
                        ElementFactory::field( 'cod_payments', 'radio_capsule' )
                                                ->set_title( __( 'COD Payments', 'dokan-lite' ) )
                                                ->set_description( __( 'If an order is paid with Cash on Delivery (COD), then exclude that payment from vendor balance.', 'dokan-lite' ) )
                                                ->add_option( __( 'Include', 'dokan-lite' ), 'include' )
                                                ->add_option( __( 'Exclude', 'dokan-lite' ), 'exclude' )
                                                ->set_default( 'include' )
                    )
                    ->add(
                        ElementFactory::field( 'withdraw_threshold', 'number' )
                                                ->set_title( __( 'Withdraw Threshold', 'dokan-lite' ) )
                                                ->set_description( __( 'Days to wait before users can withdraw from completed orders. Set to "0" to disable the waiting period.', 'dokan-lite' ) )
                                                ->set_postfix( __( 'Days', 'dokan-lite' ) )
                                                ->set_placeholder( __( 'e.g 2', 'dokan-lite' ) )
                                                ->set_default( '0' )
                    )
                    ->add(
                        ElementFactory::field( 'withdraw_option_visibility', 'switch' )
                                                ->set_title( __( 'Withdraw Option Visibility', 'dokan-lite' ) )
                                                ->set_description( __( 'withdraw option (when vendor is getting commission automatically)', 'dokan-lite' ) )
                                                ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                                ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                                ->set_default( 'off' )
                    )
                    ->add(
                        ElementFactory::field( 'manual_withdraw', 'multicheck' )
                                                ->set_title( __( 'Manual Withdraw', 'dokan-lite' ) )
                                                ->set_description( __( 'Allow manual withdrawal process for vendors.', 'dokan-lite' ) )
                                                ->add_option( __( 'Enable Manual Withdraw', 'dokan-lite' ), 'enable_manual_withdraw' )
                                                ->add_option( __( 'Enable Manual Withdraw Request', 'dokan-lite' ), ' enable_manual_withdraw_request' )
                    )
                    ->add(
                        ElementFactory::field( 'auto_withdraw', 'multicheck' )
                                                ->set_title( __( 'Schedule Disbursement or Auto Withdraw Process for Vendors', 'dokan-lite' ) )
                                                ->set_description( __( 'Admin can make multiple schedules but vendor can choose anyone.', 'dokan-lite' ) )
                                                ->add_option( __( 'Enable Auto Withdraw', 'dokan-lite' ), 'enable_auto_withdraw' )
                                                ->add_option( __( 'Enable Schedule Disbursement', 'dokan-lite' ), 'enable_schedule_disbursement' )
                    )
                    ->add(
                        ElementFactory::field( 'withdraw_schedule', 'withdraw_schedule' )
                                        ->set_title( __( 'Add Withdraw Schedule', 'dokan-lite' ) )
                                        ->set_description(
                                            __( 'Set up multiple withdrawal schedules for vendors.', 'dokan-lite' )
                                        )
                    )
            );

        $this
            ->set_title( esc_html__( 'Transaction', 'dokan-lite' ) )
            ->set_description( esc_html__( 'Configure transaction-related settings including commissions and fees.', 'dokan-lite' ) )
            ->set_icon( 'ArrowRightLeft' )
            ->add( $commission_page )
            ->add( $fees_page )
            ->add( $withdraw_page );
    }

    /**
     * Handle option dispatcher for saving settings
     *
     * @param array $data The form data
     *
     * @return void
     */
    public function option_dispatcher( $data ): void {
        $default_settings = $this->get_default_settings();
        $dokan_selling    = get_option( 'dokan_selling', $default_settings );

        $dokan_selling['additional_fee']                            = $data['commission']['admin_commission']['additional_fee'] ?? $default_settings['additional_fee'];
        $dokan_selling['commission_type']                           = $data['commission']['commission_type'] ?? $default_settings['commission_type'];
        $dokan_selling['admin_percentage']                          = $data['commission']['admin_commission']['admin_percentage'] ?? $default_settings['admin_percentage'];
        $dokan_selling['commission_category_based_values']          = $data['commission']['commission_category_based_values'] ?? $default_settings['commission_category_based_values'];
        $dokan_selling['reset_sub_category_when_edit_all_category'] = $data['commission']['reset_sub_category_when_edit_all_category'] ?? $default_settings['reset_sub_category_when_edit_all_category'];

        update_option( 'dokan_selling', $dokan_selling );
    }
}

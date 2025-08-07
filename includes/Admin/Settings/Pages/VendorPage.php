<?php

namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;
use WeDevs\Dokan\Admin\Settings\ElementTransformer;
use WeDevs\Dokan\Admin\Settings;

class VendorPage extends AbstractPage {

    /**
     * The page ID.
     *
     * @var string
     */
    protected $id = 'vendor';

    /**
     * The page priority.
     *
     * @var int
     */
    protected int $priority = 200;

    /**
     * Storage key for the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected $storage_key = 'dokan_settings_vendor';

    /**
     * Register the page scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register() {}

    /**
     * Get the page scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page scripts.
     */
    public function scripts(): array {
        return [];
    }

    /**
     * Get the page styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The page styles.
     */
    public function styles(): array {
        return [];
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
     * Describe the settings options
     *
     * @return void
     */
    public function describe_settings(): void {
        // Create vendor capabilities subpage with a single section
        $vendor_capabilities_page = ElementFactory::sub_page( 'vendor_capabilities' )
            ->set_title( __( 'Vendor Capabilities', 'dokan-lite' ) )
            ->set_description( __( 'Configure what vendors can do in your marketplace.', 'dokan-lite' ) );

        // Store state sub-page
        $store_state_page = ElementFactory::sub_page( 'store_state' )
                                            ->set_title( __( 'Store State', 'dokan-lite' ) )
                                            ->set_description( __( 'Configure store state settings.', 'dokan-lite' ) )
                                            ->set_icon( 'ShoppingBag' );

        // Create a single section for all vendor capabilities
        $vendor_capabilities_section = ElementFactory::section( 'vendor_capabilities' )
            ->set_title( __( 'Vendor Capabilities', 'dokan-lite' ) )
            ->set_description( __( 'Configure all vendor capabilities in one place.', 'dokan-lite' ) );

        // Add all fields to the single section
        $vendor_capabilities_section
            ->add(
                ElementFactory::field( 'selling_product_type', 'radio_capsule' )
                    ->set_title( __( 'Selling Product Types', 'dokan-lite' ) )
                    ->set_description( __( 'Select a type for vendors what type of product they can sell only.', 'dokan-lite' ) )
                    ->add_option( 'physical', esc_html__( 'Physical', 'dokan-lite' ) )
                    ->add_option( 'digital', esc_html__( 'Digital', 'dokan-lite' ) )
                    ->add_option( 'both', esc_html__( 'Both', 'dokan-lite' ) )
                    ->set_default( 'physical' )
            )
            ->add(
                ElementFactory::field( 'product_status', 'radio_capsule' )
                    ->set_title( __( 'Product Status', 'dokan-lite' ) )
                    ->set_description( __( 'The status of a product when a vendor creates or updates it.', 'dokan-lite' ) )
                    ->add_option( 'published', esc_html__( 'Published', 'dokan-lite' ) )
                    ->add_option( 'pending', esc_html__( 'Pending Review', 'dokan-lite' ) )
                    ->set_default( 'published' )
            )
            ->add(
                ElementFactory::field( 'duplicate_product', 'switch' )
                    ->set_title( __( 'Duplicate Product', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendor to duplicate their product.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'one_page_creation', 'switch' )
                    ->set_title( __( 'One Page Product Creation', 'dokan-lite' ) )
                    ->set_description( __( 'Add new product in single page view.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_popup', 'switch' )
                    ->set_title( __( 'Product Popup', 'dokan-lite' ) )
                    ->set_description( __( 'Add new product in popup view.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'category_selection', 'radio_capsule' )
                    ->set_title( __( 'Product Category Selection', 'dokan-lite' ) )
                    ->set_description( __( 'Control how vendors assign categories to their products.', 'dokan-lite' ) )
                    ->add_option( 'single', esc_html__( 'Single Category', 'dokan-lite' ) )
                    ->add_option( 'multiple', esc_html__( 'Multiple Categories', 'dokan-lite' ) )
                    ->set_default( 'single' )
            )
            ->add(
                ElementFactory::field( 'select_any_category', 'switch' )
                    ->set_title( __( 'Select any category', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to select any category while creating/editing products.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'vendors_create_tags', 'switch' )
                    ->set_title( __( 'Vendors Can Create Tags', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to create new product tags from vendor dashboard.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'add_new_attribute_values', 'switch' )
                    ->set_title( __( 'Add New Attribute Values', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to add new values to predefined attribute.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'product_review_management', 'switch' )
                    ->set_title( __( 'Product Review Management by Vendors', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendors to manage product review status changes from their dashboard.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field( 'order_status_change', 'switch' )
                    ->set_title( __( 'Order Status Change', 'dokan-lite' ) )
                    ->set_description( __( 'Allow vendor to update order status.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'on' )
            )
            ->add(
                ElementFactory::field( 'auction_functions', 'switch' )
                    ->set_title( __( 'Auction Functions for New Vendors', 'dokan-lite' ) )
                    ->set_description( __( 'Allow new vendors to create auction products upon registration.', 'dokan-lite' ) )
                    ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                    ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                    ->set_default( 'off' )
            )
            ->add(
                ElementFactory::field_group( 'discount_settings' )

                    ->add(
                        ElementFactory::field( 'discount_editing', 'switch' )
                            ->set_title( __( 'Discount Editing', 'dokan-lite' ) )
                            ->set_description( __( 'Vendor can add order and product quantity discount.', 'dokan-lite' ) )
                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                            ->set_default( 'on' )
                    )
                    ->add(
                        ElementFactory::field( 'discount_types', 'multicheck' )
                                        ->set_options(
                                            [
												[
													'value' => 'order_discount',
													'title' => __( 'Order Discount', 'dokan-lite' ),
												],
												[
													'value' => 'product_quantity_discount',
													'title' => __( 'Product Quantity Discount', 'dokan-lite' ),
												],
                                            ]
                                        )
                            ->set_default( [] )
                    )
            );

        // Add the single section to vendor capabilities page
        $vendor_capabilities_page->add( $vendor_capabilities_section );

        // Store state sub-page
        $store_state_page->add(
            ElementFactory::section( 'vendor_state' )
                            ->add(
                                ElementFactory::field_group( 'vendor_state_settings' )
                                            ->add(
                                                ElementFactory::field( 'vendor_state_description', 'base_field_label' )
                                                                ->set_title( __( 'Vendor State Description', 'dokan-lite' ) )
                                                                ->set_description( __( 'Select the state for vendors and notify them when their state changes.', 'dokan-lite' ) )
                                                                ->set_helper_text( __( 'This setting allows you to manage vendor states and notify them accordingly.', 'dokan-lite' ) )
                                            )
                                            ->add(
                                                ElementFactory::field( 'vendor_state', 'refresh_select' )
                                                                ->set_title( __( 'Vendor State', 'dokan-lite' ) )
                                                                ->set_description( __( 'Select the state for vendors.', 'dokan-lite' ) )
                                                                ->set_options(
                                                                    [
                                                                        [
                                                                            'value' => 'active',
                                                                            'title' => __( 'Active', 'dokan-lite' ),
                                                                        ],
                                                                        [
                                                                            'value' => 'inactive',
                                                                            'title' => __( 'Inactive', 'dokan-lite' ),
                                                                        ],
                                                                        [
                                                                            'value' => 'pending',
                                                                            'title' => __( 'Pending', 'dokan-lite' ),
                                                                        ],
                                                                    ]
                                                                )
                                                                ->set_default( 'active' )
                                            )
                            )
                            ->add(
                                ElementFactory::field( 'vendor_state_notification', 'switch' )
                                            ->set_title( __( 'Vendor State Notification', 'dokan-lite' ) )
                                            ->set_description( __( 'Notify vendors when their state changes.', 'dokan-lite' ) )
                                            ->set_enable_state( __( 'Enabled', 'dokan-lite' ), 'on' )
                                            ->set_disable_state( __( 'Disabled', 'dokan-lite' ), 'off' )
                                            ->set_default( 'on' )
                            )
        );

        $this
            ->set_title( __( 'Vendor', 'dokan-lite' ) )
            ->set_description( __( 'Configure vendor-related settings and capabilities.', 'dokan-lite' ) )
            ->set_icon( 'Users' )
            ->add( $vendor_capabilities_page )
            ->add( $store_state_page );
    }
}

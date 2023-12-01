<?php

namespace WeDevs\Dokan\ProductForm;

defined( 'ABSPATH' ) || exit;

/**
 * Init Product Form Fields
 *
 * @since DOKAN_SINCE
 */
class Init {

    /**
     * Class constructor
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function __construct() {
        add_action( 'init', [ $this, 'init_form_fields' ], 1 );
    }

    /**
     * Init form fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_form_fields() {
        $this->init_general_fields();
        $this->init_inventory_fields();
        $this->init_downloadable_fields();
        $this->init_other_fields();
    }

    /**
     * Init general fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_general_fields() {
        $section = Factory::add_section(
            'general',
            [
                'title' => __( 'General', 'dokan-lite' ),
                'order' => 10,
            ]
        );

        $section->add_field(
            Elements::ID,
            [
                'title'       => __( 'Title', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => 'post_title',
                'placeholder' => __( 'Enter product title...', 'dokan-lite' ),
                'error_msg'   => __( 'Please enter product title!', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::TYPE, [
                'title'        => __( 'Product Type', 'dokan-lite' ),
                'type'         => 'select',
                'name'         => 'product_type',
                'options'      => apply_filters(
                    'dokan_product_types',
                    [
                        'simple' => __( 'Simple', 'dokan-lite' ), // dokan lite only supports simple product
                    ]
                ),
                'help_content' => __( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::REGULAR_PRICE, [
                'title'       => __( 'Price', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => '_regular_price',
                'placeholder' => '0.00',
            ]
        );

        $section->add_field(
            Elements::SALE_PRICE, [
                'title'       => __( 'Discounted Price', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => '_sale_price',
                'placeholder' => '0.00',
            ]
        );

        $section->add_field(
            Elements::DATE_ON_SALE_FROM, [
                'title'       => __( 'From', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => '_sale_price_dates_from',
                'placeholder' => wc_date_format(),
            ]
        );

        $section->add_field(
            Elements::DATE_ON_SALE_TO, [
                'title'       => __( 'To', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => '_sale_price_dates_to',
                'placeholder' => wc_date_format(),
            ]
        );

        $section->add_field(
            Elements::CATEGORIES, [
                'title'       => __( 'Categories', 'dokan-lite' ),
                'type'        => 'select',
                'name'        => 'product_cat[]',
                'placeholder' => __( 'Select product categories', 'dokan-lite' ),
                'options'     => [],
            ]
        );

        $can_create_tags  = dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling' );
        $tags_placeholder = 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' );
        $section->add_field(
            Elements::TAGS, [
                'title'       => __( 'Tags', 'dokan-lite' ),
                'type'        => 'select',
                'name'        => 'product_tag[]',
                'placeholder' => $tags_placeholder,
            ]
        );

        $section->add_field(
            Elements::FEATURED_IMAGE_ID, [
                'title'       => __( 'Product Image', 'dokan-lite' ),
                'type'        => 'image',
                'name'        => 'feat_image_id',
                'placeholder' => __( 'Select product image', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::GALLERY_IMAGE_IDS, [
                'title'       => __( 'Product Gallery', 'dokan-lite' ),
                'type'        => 'gallery',
                'name'        => 'product_image_gallery',
                'placeholder' => __( 'Select product gallery images', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::SHORT_DESCRIPTION, [
                'title'       => __( 'Short Description', 'dokan-lite' ),
                'type'        => 'textarea',
                'name'        => 'post_excerpt',
                'placeholder' => __( 'Enter product short description', 'dokan-lite' ),
                'visibility'  => false,
            ]
        );

        $section->add_field(
            Elements::DESCRIPTION, [
                'title'       => __( 'Description', 'dokan-lite' ),
                'type'        => 'textarea',
                'name'        => 'post_content',
                'placeholder' => __( 'Enter product description', 'dokan-lite' ),
                'required'    => true,
                'visibility'  => false,
            ]
        );
    }

    /**
     * Init inventory fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_inventory_fields() {
        $section = Factory::add_section(
            'inventory',
            [
                'title'       => __( 'Inventory', 'dokan-lite' ),
                'description' => __( 'Manage your product stock', 'dokan-lite' ),
                'order'       => 20,
            ]
        );

        $section->add_field(
            Elements::SKU, [
                'title'       => __( 'SKU', 'dokan-lite' ),
                'type'        => 'text',
                'name'        => '_sku',
                'placeholder' => __( 'Enter product SKU', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::STOCK_STATUS, [
                'title'   => __( 'Stock Status', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_stock_status',
                'options' => wc_get_product_stock_status_options(),
            ]
        );

        $section->add_field(
            Elements::MANAGE_STOCK, [
                'title' => __( 'Enable product stock management', 'dokan-lite' ),
                'type'  => 'checkbox',
                'name'  => '_manage_stock',
                'value' => 'yes',
            ]
        );

        $section->add_field(
            Elements::STOCK_QUANTITY, [
                'title'       => __( 'Stock quantity', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_stock',
                'placeholder' => '1',
                'min'         => 0,
                'step'        => 1,
            ]
        );

        $section->add_field(
            Elements::LOW_STOCK_AMOUNT, [
                'title'       => __( 'Low stock threshold', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_low_stock_amount',
                'placeholder' => 1,
                'min'         => 0,
                'step'        => 1,
            ]
        );

        $section->add_field(
            Elements::BACKORDERS, [
                'title'   => __( 'Allow Backorders', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_backorders',
                'options' => wc_get_product_backorder_options(),
            ]
        );

        $section->add_field(
            Elements::SOLD_INDIVIDUALLY, [
                'title' => __( 'Sold Individually', 'dokan-lite' ),
                'type'  => 'checkbox',
                'name'  => '_sold_individually',
                'value' => 'yes',
            ]
        );
    }

    /**
     * Init downloadable fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_downloadable_fields() {
        $section = Factory::add_section(
            'downloadable',
            [
                'title'       => __( 'Downloadable Options', 'dokan-lite' ),
                'description' => __( 'Configure your downloadable product settings', 'dokan-lite' ),
                'order'       => 30,
            ]
        );

        $section->add_field(
            Elements::DOWNLOAD_LIMIT, [
                'title'       => __( 'Download Limit', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_download_limit',
                'placeholder' => __( 'Unlimited', 'dokan-lite' ),
                'min'         => 0,
                'step'        => 1,
            ]
        );

        $section->add_field(
            Elements::DOWNLOAD_EXPIRY, [
                'title'       => __( 'Download Expiry', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_download_expiry',
                'placeholder' => __( 'Never', 'dokan-lite' ),
                'min'         => 0,
                'step'        => 1,
            ]
        );
    }

    /**
     * Init other fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_other_fields() {
        $section = Factory::add_section(
            'others',
            [
                'title'       => __( 'Other Options', 'dokan-lite' ),
                'description' => __( 'Set your extra product options', 'dokan-lite' ),
                'order'       => 30,
            ]
        );

        $section->add_field(
            Elements::STATUS, [
                'title'   => __( 'Product Status', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => 'post_status',
                'default' => dokan_get_default_product_status( dokan_get_current_user_id() ),
                'options' => dokan_get_available_post_status(), // get it with product_id param
            ]
        );

        $section->add_field(
            Elements::CATALOG_VISIBILITY, [
                'title'   => __( 'Visibility', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_visibility',
                'options' => dokan_get_product_visibility_options(),
            ]
        );

        $section->add_field(
            Elements::PURCHASE_NOTE, [
                'title'       => __( 'Purchase Note', 'dokan-lite' ),
                'type'        => 'textarea',
                'name'        => '_purchase_note',
                'placeholder' => __( 'Customer will get this info in their order email', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::REVIEWS_ALLOWED, [
                'title' => __( 'Enable product reviews', 'dokan-lite' ),
                'type'  => 'checkbox',
                'name'  => '_enable_reviews',
                'value' => 'yes',
            ]
        );
    }

    /**
     * Init shipping fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_shipping_fields() {
        if ( ! dokan()->is_pro_exists() ) {
            return;
        }

        $is_shipping_disabled = 'sell_digital' === dokan_pro()->digital_product->get_selling_product_type();
        $tab_title            = $is_shipping_disabled ? __( 'Tax', 'dokan-lite' ) : __( 'Shipping and Tax', 'dokan-lite' );
        $tab_desc             = $is_shipping_disabled ? __( 'Manage tax for this product', 'dokan-lite' ) : __( 'Manage shipping and tax for this product', 'dokan-lite' );

        $section = Factory::add_section(
            'shipping',
            [
                'title'       => $tab_title,
                'description' => $tab_desc,
                'order'       => 30,
            ]
        );

        $section->add_field(
            Elements::DISABLE_SHIPPING_META, [
                'title' => __( 'Disable shipping', 'dokan-lite' ),
                'type'  => 'checkbox',
                'name'  => '_disable_shipping',
                'value' => 'no',
            ]
        );

        $section->add_field(
            Elements::WEIGHT, [
                'title'       => __( 'Weight', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_weight',
                'placeholder' => '0.00',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $section->add_field(
            Elements::DIMENSIONS_LENGTH, [
                'title'       => __( 'Length', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_length',
                'placeholder' => '0.00',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $section->add_field(
            Elements::DIMENSIONS_WIDTH, [
                'title'       => __( 'Width', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_width',
                'placeholder' => '0.00',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $section->add_field(
            Elements::DIMENSIONS_HEIGHT, [
                'title'       => __( 'Height', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_height',
                'placeholder' => '0.00',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $shipping_settings_link = sprintf( '<a href="%1$s">', dokan_get_navigation_url( 'settings/shipping' ) );
        /* translators: %1$s is replaced with "HTML open entities," %2$s is replaced with "HTML close entities"*/
        $product_shipping_help_block = sprintf( esc_html__( 'Shipping classes are used by certain shipping methods to group similar products. Before adding a product, please configure the %1$s shipping settings %2$s', 'dokan-lite' ), $shipping_settings_link, '</a>' );

        $section->add_field(
            Elements::SHIPPING_CLASS, [
                'title'       => __( 'Shipping Class', 'dokan-lite' ),
                'type'        => 'select',
                'name'        => '_shipping_class',
                'placeholder' => __( 'Select shipping class', 'dokan-lite' ),
                'options'     => [],
            ]
        );

        $section->add_field(
            Elements::OVERWRITE_SHIPPING_META, [
                'title' => __( 'Override your store\'s default shipping cost for this product', 'dokan-lite' ),
                'type'  => 'checkbox',
                'name'  => '_overwrite_shipping',
                'value' => 'no',
            ]
        );

        $section->add_field(
            Elements::ADDITIONAL_SHIPPING_COST_META, [
                'title'       => __( 'Additional cost', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_additional_price',
                'placeholder' => '0.00',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $section->add_field(
            Elements::ADDITIONAL_SHIPPING_QUANTITY_META, [
                'title'       => __( 'Per Qty Additional Price', 'dokan-lite' ),
                'type'        => 'number',
                'name'        => '_additional_qty',
                'placeholder' => '0',
                'min'         => 0,
                'step'        => 0.01,
            ]
        );

        $section->add_field(
            Elements::ADDITIONAL_SHIPPING_PROCESSING_TIME_META, [
                'title'   => __( 'Processing Time', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_dps_processing_time',
                'options' => [],
            ]
        );

        $section->add_field(
            Elements::TAX_STATUS, [
                'title'   => __( 'Tax Status', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_tax_status',
                'options' => [
                    'taxable'  => __( 'Taxable', 'dokan-lite' ),
                    'shipping' => __( 'Shipping only', 'dokan-lite' ),
                    'none'     => _x( 'None', 'Tax status', 'dokan-lite' ),
                ],
            ]
        );

        $section->add_field(
            Elements::TAX_CLASS, [
                'title'   => __( 'Tax Class', 'dokan-lite' ),
                'type'    => 'select',
                'name'    => '_tax_class',
                'options' => wc_get_product_tax_class_options(),
            ]
        );
    }
}

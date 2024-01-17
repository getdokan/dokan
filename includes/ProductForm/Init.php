<?php

namespace WeDevs\Dokan\ProductForm;

use WC_Product;
use WeDevs\Dokan\ProductCategory\Helper as ProductCategoryHelper;

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
        add_action( 'init', [ $this, 'init_form_fields' ], 5 );
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
        $this->init_downloadable_virtual_fields();
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
                'title'    => __( 'General', 'dokan-lite' ),
                'order'    => 10,
                'required' => true,
            ]
        );

        $section->add_field(
            Elements::NAME,
            [
                'title'          => __( 'Title', 'dokan-lite' ),
                'field_type'     => 'text',
                'name'           => 'post_title',
                'placeholder'    => __( 'Enter product title...', 'dokan-lite' ),
                'required'       => true,
                'error_msg'      => __( 'Please enter product title!', 'dokan-lite' ),
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_name();
                },
            ]
        );

        $section->add_field(
            Elements::SLUG,
            [
                'title'             => __( 'Slug', 'dokan-lite' ),
                'field_type'        => 'text',
                'type'              => 'other',
                'name'              => 'slug',
                'placeholder'       => __( 'Enter product slug...', 'dokan-lite' ),
                'required'          => false,
                'error_msg'         => __( 'Please enter product slug!', 'dokan-lite' ),
                'sanitize_callback' => function ( $slug, $product_id, $status, $post_parent = 0 ) {
                    return wp_unique_post_slug( $slug, $product_id, $status, 'product', $post_parent );
                },
                'value_callback'    => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_slug();
                },
            ]
        );

        $section->add_field(
            Elements::TYPE, [
                'title'          => __( 'Product Type', 'dokan-lite' ),
                'field_type'     => 'select',
                'type'           => 'other',
                'name'           => 'product-type',
                'options'        => apply_filters(
                    'dokan_product_types',
                    [
                        'simple' => __( 'Simple', 'dokan-lite' ), // dokan lite only supports simple product
                    ]
                ),
                'help_content'   => __( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ),
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }
                    if ( ! $product instanceof WC_Product ) {
                        return 'simple';
                    }

                    return $product->get_type();
                },
            ]
        );

        $section->add_field(
            Elements::REGULAR_PRICE, [
                'title'       => __( 'Price', 'dokan-lite' ),
                'field_type'  => 'text',
                'name'        => '_regular_price',
                'placeholder' => '0.00',
            ]
        );

        $section->add_field(
            Elements::SALE_PRICE, [
                'title'       => __( 'Discounted Price', 'dokan-lite' ),
                'field_type'  => 'text',
                'name'        => '_sale_price',
                'placeholder' => '0.00',
            ]
        );

        $section->add_field(
            Elements::DATE_ON_SALE_FROM, [
                'title'          => __( 'From', 'dokan-lite' ),
                'field_type'     => 'text',
                'name'           => '_sale_price_dates_from',
                'placeholder'    => 'YYYY-MM-DD',
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        $time = dokan_current_datetime()->modify( $value );

                        return $time ? $time->getTimestamp() : false;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return false;
                    }

                    return $product->get_date_on_sale_from( 'edit' ) ? $product->get_date_on_sale_from( 'edit' )->getTimestamp() : false;
                },
            ]
        );

        $section->add_field(
            Elements::DATE_ON_SALE_TO, [
                'title'          => __( 'To', 'dokan-lite' ),
                'field_type'     => 'text',
                'name'           => '_sale_price_dates_to',
                'placeholder'    => 'YYYY-MM-DD',
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        $time = dokan_current_datetime()->modify( $value );

                        return $time ? $time->getTimestamp() : false;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return false;
                    }

                    return $product->get_date_on_sale_to( 'edit' ) ? $product->get_date_on_sale_to( 'edit' )->getTimestamp() : false;
                },
            ]
        );

        $category_error_message = ProductCategoryHelper::product_category_selection_is_single()
            ? __( 'Please select at least one category!', 'dokan-lite' )
            : __( 'Please select a category', 'dokan-lite' );

        $section->add_field(
            Elements::CATEGORIES, [
                'title'             => __( 'Categories', 'dokan-lite' ),
                'field_type'        => 'select',
                'name'              => 'chosen_product_cat[]',
                'placeholder'       => __( 'Select product categories', 'dokan-lite' ),
                'options'           => [],
                'required'          => true,
                'error_msg'         => $category_error_message,
                'sanitize_callback' => function ( array $categories, WC_Product $product ) {
                    $chosen_product_categories = array_map( 'absint', $categories );
                    $chosen_cat                = ProductCategoryHelper::product_category_selection_is_single() ? [ reset( $chosen_product_categories ) ] : $chosen_product_categories;

                    // store product category in meta data
                    $product->add_meta_data( 'chosen_product_cat', $chosen_cat, true );

                    return array_map( 'absint', ProductCategoryHelper::get_object_terms_from_chosen_categories( $product, $chosen_cat ) );
                },
                'value_callback'    => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return [];
                    }

                    return $product->get_category_ids();
                },
            ]
        );

        $can_create_tags  = dokan()->is_pro_exists() ? dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling', 'off' ) : 'off';
        $tags_placeholder = 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' );
        $section->add_field(
            Elements::TAGS, [
                'title'             => __( 'Tags', 'dokan-lite' ),
                'field_type'        => 'select',
                'name'              => 'product_tag[]',
                'placeholder'       => $tags_placeholder,
                'sanitize_callback' => function ( $tags ) {
                    /**
                     * Maximum number of tags a vendor can add.
                     *
                     * @since 3.3.7
                     *
                     * @args  int -1 default to unlimited
                     */
                    $maximum_tags_select_length = apply_filters( 'dokan_product_tags_select_max_length', -1 );

                    if ( $maximum_tags_select_length !== -1 && count( $tags ) > $maximum_tags_select_length ) {
                        // translators: %s: maximum tag length
                        return sprintf( __( 'You can only select %s tags', 'dokan-lite' ), number_format_i18n( $maximum_tags_select_length ) );
                    }

                    // todo: add support for creating tags
                    return array_map(
                        function ( $tag ) {
                            if ( is_numeric( $tag ) ) {
                                return absint( $tag );
                            } else {
                                return sanitize_text_field( $tag );
                            }
                        }, (array) $tags
                    );
                },
                'value_callback'    => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return [];
                    }

                    return $product->get_tag_ids();
                },
            ]
        );

        $section->add_field(
            Elements::FEATURED_IMAGE_ID, [
                'title'       => __( 'Product Image', 'dokan-lite' ),
                'field_type'  => 'image',
                'name'        => 'image_id',
                'placeholder' => __( 'Select product image', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::GALLERY_IMAGE_IDS, [
                'title'       => __( 'Product Gallery', 'dokan-lite' ),
                'field_type'  => 'gallery',
                'name'        => 'gallery_image_ids',
                'placeholder' => __( 'Select product gallery images', 'dokan-lite' ),
            ]
        );

        $section->add_field(
            Elements::SHORT_DESCRIPTION, [
                'title'          => __( 'Short Description', 'dokan-lite' ),
                'field_type'     => 'textarea',
                'name'           => 'post_excerpt',
                'placeholder'    => __( 'Enter product short description', 'dokan-lite' ),
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_short_description();
                },
            ]
        );

        $section->add_field(
            Elements::DESCRIPTION, [
                'title'          => __( 'Description', 'dokan-lite' ),
                'field_type'     => 'textarea',
                'name'           => 'post_content',
                'placeholder'    => __( 'Enter product description', 'dokan-lite' ),
                'required'       => true,
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_description();
                },
            ]
        );
    }

    /**
     * Init downloadable and virtual fields
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_downloadable_virtual_fields() {
        $section = Factory::add_section(
            'downloadable_virtual',
            [
                'title'       => __( 'Downloadable', 'dokan-lite' ),
                'description' => __( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ),
                'order'       => 20,
            ]
        );

        $section->add_field(
            Elements::DOWNLOADABLE, [
                'title'                 => __( 'Downloadable', 'dokan-lite' ),
                'description'           => __( 'Virtual products are intangible and are not shipped.', 'dokan-lite' ),
                'field_type'            => 'checkbox',
                'name'                  => '_downloadable',
                'additional_properties' => [
                    'value' => 'yes',
                ],
                'sanitize_callback'     => function ( $value ) {
                    return ! empty( $value ) && 'yes' === $value;
                },
            ]
        );

        $section->add_field(
            Elements::VIRTUAL, [
                'title'                 => __( 'Virtual', 'dokan-lite' ),
                'description'           => __( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ),
                'field_type'            => 'checkbox',
                'name'                  => '_virtual',
                'additional_properties' => [
                    'value' => 'yes',
                ],
                'sanitize_callback'     => function ( $value ) {
                    return ! empty( $value ) && 'yes' === $value;
                },
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
                'description' => __( 'Manage inventory for this product', 'dokan-lite' ),
                'order'       => 20,
            ]
        );

        $section->add_field(
            Elements::SKU, [
                'title'       => '<abbr title="' . esc_attr__( 'Stock Keeping Unit', 'dokan-lite' ) . '">' . esc_html__( 'SKU', 'dokan-lite' ) . '</abbr>',
                'description' => __( 'SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased.', 'dokan-lite' ),
                'placeholder' => __( 'Enter product SKU', 'dokan-lite' ),
                'field_type'  => 'text',
                'name'        => '_sku',
            ]
        );

        $section->add_field(
            Elements::STOCK_STATUS, [
                'title'       => __( 'Stock Status', 'dokan-lite' ),
                'description' => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'dokan-lite' ),
                'field_type'  => 'select',
                'name'        => '_stock_status',
                'options'     => wc_get_product_stock_status_options(),
            ]
        );

        $section->add_field(
            Elements::MANAGE_STOCK, [
                'title'                 => __( 'Enable product stock management', 'dokan-lite' ),
                'description'           => __( 'Manage stock level (quantity)', 'dokan-lite' ),
                'field_type'            => 'checkbox',
                'name'                  => '_manage_stock',
                'additional_properties' => [
                    'value' => 'yes',
                ],
                'sanitize_callback'     => function ( $value ) {
                    return ! empty( $value ) && 'yes' === $value;
                },
            ]
        );

        $section->add_field(
            Elements::STOCK_QUANTITY, [
                'title'                 => __( 'Stock quantity', 'dokan-lite' ),
                'description'           => __( 'Stock quantity. If this is a variable product this value will be used to control stock for all variations, unless you define stock at variation level.', 'dokan-lite' ),
                'field_type'            => 'number',
                'name'                  => '_stock',
                'placeholder'           => '1',
                'additional_properties' => [
                    'min'  => 0,
                    'step' => 'any',
                ],
                'sanitize_callback'     => function ( $value, $original_stock = false, $product = null ) {
                    if (
                        false !== $original_stock
                        && $product instanceof WC_Product
                        && wc_stock_amount( $product->get_stock_quantity( 'edit' ) ) !== wc_stock_amount( $original_stock )
                    ) {
                        return new \WP_Error(
                            'invalid-stock-quantity',
                            sprintf(
                                /* translators: 1: product ID 2: quantity in stock */
                                __(
                                    'The stock has not been updated because the value has changed since editing. Product %1$d has %2$d units in stock.',
                                    'dokan-lite'
                                ),
                                $product->get_id(),
                                $product->get_stock_quantity( 'edit' )
                            )
                        );
                    }

                    return wc_stock_amount( $value );
                },
                'value_callback'        => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return 0;
                    }

                    return $product->get_stock_quantity();
                },
            ]
        );

        $section->add_field(
            Elements::LOW_STOCK_AMOUNT, [
                'title'                 => __( 'Low stock threshold', 'dokan-lite' ),
                'description'           => __( 'When product stock reaches this amount you will be notified by email. It is possible to define different values for each variation individually.', 'dokan-lite' ),
                'field_type'            => 'number',
                'name'                  => '_low_stock_amount',
                'placeholder'           => sprintf(
                /* translators: %d: Amount of stock left */
                    esc_attr__( 'Store-wide threshold (%d)', 'dokan-lite' ),
                    esc_attr( get_option( 'woocommerce_notify_low_stock_amount' ) )
                ),
                'additional_properties' => [
                    'min'  => 0,
                    'step' => 'any',
                ],
                'sanitize_callback'     => function ( $value ) {
                    if ( '' !== $value ) {
                        return wc_stock_amount( $value );
                    }

                    return '';
                },
            ]
        );

        $section->add_field(
            Elements::BACKORDERS, [
                'title'       => __( 'Allow Backorders', 'dokan-lite' ),
                'description' => __( 'If managing stock, this controls whether or not backorders are allowed. If enabled, stock quantity can go below 0.', 'dokan-lite' ),
                'field_type'  => 'select',
                'name'        => '_backorders',
                'options'     => wc_get_product_backorder_options(),
            ]
        );

        $section->add_field(
            Elements::SOLD_INDIVIDUALLY, [
                'title'                 => __( 'Allow only one quantity of this product to be bought in a single order', 'dokan-lite' ),
                'description'           => __( 'Check to let customers to purchase only 1 item in a single order. This is particularly useful for items that have limited quantity, for example art or handmade goods.', 'dokan-lite' ),
                'field_type'            => 'checkbox',
                'name'                  => '_sold_individually',
                'additional_properties' => [
                    'value' => 'yes',
                ],
                'sanitize_callback'     => function ( $value ) {
                    return ! empty( $value ) && 'yes' === $value;
                },
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
            Elements::DOWNLOADS, [
                'title'             => __( 'Downloadable Files', 'dokan-lite' ),
                'description'       => __( 'Upload files that customers can download after purchase.', 'dokan-lite' ),
                'field_type'        => 'downloadable',
                'name'              => '_wc_file_urls[]',
                'sanitize_callback' => function ( $file_names, $file_urls, $file_hashes ) {
                    return dokan()->product->prepare_downloads( $file_names, $file_urls, $file_hashes );
                },
            ]
        );

        $section->add_field(
            Elements::DOWNLOAD_LIMIT, [
                'title'                 => __( 'Download Limit', 'dokan-lite' ),
                'placeholder'           => __( 'Unlimited', 'dokan-lite' ),
                'description'           => __( 'Leave blank for unlimited re-downloads.', 'dokan-lite' ),
                'field_type'            => 'number',
                'name'                  => '_download_limit',
                'additional_properties' => [
                    'min'  => 0,
                    'step' => 1,
                ],
                'sanitize_callback'     => function ( $value ) {
                    if ( '' !== $value ) {
                        return absint( $value );
                    }

                    return '';
                },
            ]
        );

        $section->add_field(
            Elements::DOWNLOAD_EXPIRY, [
                'title'                 => __( 'Download Expiry', 'dokan-lite' ),
                'placeholder'           => __( 'Never', 'dokan-lite' ),
                'description'           => __( 'Enter the number of days before a download link expires, or leave blank.', 'dokan-lite' ),
                'field_type'            => 'number',
                'name'                  => '_download_expiry',
                'additional_properties' => [
                    'min'  => 0,
                    'step' => 1,
                ],
                'sanitize_callback'     => function ( $value ) {
                    if ( '' !== $value ) {
                        return absint( $value );
                    }

                    return '';
                },
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
                'title'      => __( 'Product Status', 'dokan-lite' ),
                'field_type' => 'select',
                'name'       => 'status',
                'options'    => dokan_get_available_post_status(), // get it with product_id param
            ]
        );

        $section->add_field(
            Elements::CATALOG_VISIBILITY, [
                'title'          => __( 'Visibility', 'dokan-lite' ),
                'field_type'     => 'select',
                'name'           => '_visibility',
                'options'        => dokan_get_product_visibility_options(),
                'value_callback' => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_catalog_visibility();
                },
            ]
        );

        $section->add_field(
            Elements::PURCHASE_NOTE, [
                'title'             => __( 'Purchase Note', 'dokan-lite' ),
                'field_type'        => 'textarea',
                'name'              => '_purchase_note',
                'placeholder'       => __( 'Customer will get this info in their order email', 'dokan-lite' ),
                'sanitize_callback' => 'wp_kses_post',
            ]
        );

        $section->add_field(
            Elements::REVIEWS_ALLOWED, [
                'title'                 => __( 'Enable product reviews', 'dokan-lite' ),
                'field_type'            => 'checkbox',
                'name'                  => 'comment_status',
                'additional_properties' => [
                    'value' => 'yes',
                ],
                'sanitize_callback'     => function ( $value ) {
                    return ! empty( $value ) && 'yes' === $value;
                },
                'value_callback'        => function ( $product, $value = '' ) {
                    if ( '' !== $value ) {
                        return $value;
                    }

                    if ( ! $product instanceof WC_Product ) {
                        return '';
                    }

                    return $product->get_reviews_allowed();
                },
            ]
        );
    }
}

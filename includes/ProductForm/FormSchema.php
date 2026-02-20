<?php

namespace WeDevs\Dokan\ProductForm;

use WC_Product;
use WeDevs\Dokan\ProductCategory\Helper as ProductCategoryHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Product form schema, data resolution, and product form support.
 *
 * @since DOKAN_SINCE
 */
class FormSchema {

    /**
     * Required field attributes
     *
     * @since DOKAN_SINCE
     *
     * @var array $required_fields
     */
    private array $required_fields = [
        'id',
        'type',
        'variant',
        'label',
    ];

    private array $supported_types = [
        'section',
        'field',
    ];

    private array $supported_variants = [
        'text',
        'select',
        'multiselect',
        'async_select',
        'checkbox',
        'textarea',
        'editor',
        'radio',
        'number',
        'custom',
        'date',
        'feature_image',
        'gallery_images',
        'downloadable',
        'attribute',
    ];

    private function assert_field_schema( array $fields ): array {
        foreach ( $fields as $field ) {
            // Check required attributes are present.
            foreach ( $this->required_fields as $attr ) {
                // 'variant' is only required for field-type items, not sections.
                if ( 'variant' === $attr && isset( $field['type'] ) && 'section' === $field['type'] ) {
                    continue;
                }
                if ( ! array_key_exists( $attr, $field ) || empty( $field[ $attr ] ) ) {
                    error_log(
                        sprintf( 'Missing required attribute "%s" on field: %s', esc_html( $attr ), esc_html( $field['id'] ?? 'unknown' ) )
                    );
                }
            }
            if ( ! in_array( $field['type'], $this->supported_types, true ) ) {
                error_log( sprintf( 'Invalid field type: %s', esc_html( $field['type'] ) ) );
            }
            if ( isset( $field['variant'] ) && ! in_array( $field['variant'], $this->supported_variants, true ) ) {
                error_log( sprintf( 'Invalid field variant: %s', esc_html( $field['variant'] ) ) );
            }
        }
        return $fields;
    }

    /**
     * Get flat form items (sections and fields). Resolves field values when $product_id is provided.
     *
     * @since DOKAN_SINCE
     * @param int $product_id Optional. Product ID to resolve values from.
     * @return array Form items (sections and fields).
     */
    public function get_fields( int $product_id = 0 ): array {
        $product = ( $product_id > 0 ) ? wc_get_product( $product_id ) : null;

        $can_create_tags = dokan()->is_pro_exists() ? dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling', 'off' ) : 'off';
        // Resolve all options at definition time.
        $product_type_options = apply_filters( 'dokan_product_types', [ 'simple' => __( 'Simple', 'dokan-lite' ) ] );

        $dep_downloadable = [
            [
                'comparison' => '==',
                'key'        => Elements::DOWNLOADABLE,
                'value'      => 'on',
            ],
        ];

        // Hide price fields for variable products (price is set per-variation).
        $dep_non_variable = [
            [
                'comparison' => '!=',
                'key'        => Elements::TYPE,
                'value'      => Elements::PRODUCT_TYPE_VARIABLE,
            ],
        ];

        $general_fields = [
            [
                'id'        => Elements::SECTION_GENERAL,
                'parent_id' => null,
                'type'      => 'section',
                'label'      => __( 'General', 'dokan-lite' ),
                'priority'   => 10,
                'required'   => true,
                'visibility' => true,
            ],
            [
                'id'             => Elements::NAME,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'         => __( 'Product Title', 'dokan-lite' ),
                'variant'        => 'text',
                'placeholder'   => __( 'Enter product title...', 'dokan-lite' ),
                'required'      => true,
                'error_message' => __( 'Please enter a product title.', 'dokan-lite' ),
                'priority'      => 30,
                'visibility'     => true,
            ],
            [
                'id'               => Elements::SLUG,
                'parent_id'        => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Permalink', 'dokan-lite' ),
                'variant'          => 'text',
                'placeholder'      => __( 'Enter product slug...', 'dokan-lite' ),
                'required'         => false,
                'priority'         => 30,
                'visibility'       => true,
                'dependencies'    => [
                    [
                        'comparison' => 'not_empty',
                        'key'        => Elements::SLUG,
                    ],
                ],
            ],
            [
                'id'             => Elements::TYPE,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Product Type', 'dokan-lite' ),
                'variant'        => 'select',
                'value'          => 'simple',
                'default'        => 'simple',
                'required'       => true,
                'options'        => $product_type_options,
                'description'    => __( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ),
                'tooltip'        => __( 'Choose product type.', 'dokan-lite' ),
                'priority'       => 30,
                'visibility'     => true,
            ],
            [
                'id'           => Elements::ENABLED,
                'parent_id'    => Elements::SECTION_GENERAL,
                'type'         => 'field',
                'label'        => __( 'Enabled', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'priority'     => 30,
                'visibility'   => true,
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::TYPE,
                        'value'      => 'variation',
                    ],
                ],
            ],
            [
                'id'           => Elements::REGULAR_PRICE,
                'parent_id'    => Elements::SECTION_GENERAL,
                'type'         => 'field',
                'label'        => __( 'Price', 'dokan-lite' ),
                'variant'      => 'text',
                'placeholder'  => '0.00',
                'priority'     => 30,
                'visibility'   => true,
                'dependencies' => $dep_non_variable,
            ],
            [
                'id'           => Elements::SALE_PRICE,
                'parent_id'    => Elements::SECTION_GENERAL,
                'type'         => 'field',
                'label'        => __( 'Sale Price', 'dokan-lite' ),
                'variant'      => 'text',
                'placeholder'  => '0.00',
                'priority'     => 30,
                'visibility'   => true,
                'dependencies' => $dep_non_variable,
            ],
            [
                'id'             => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Create Schedule for Discount', 'dokan-lite' ),
                'variant'        => 'checkbox',
                'priority'       => 30,
                'visibility'     => true,
                'dependencies'   => $dep_non_variable,
            ],
            [
                'id'             => Elements::DATE_ON_SALE_FROM,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'From', 'dokan-lite' ),
                'variant'        => 'date',
                'placeholder'    => 'YYYY-MM-DD',
                'priority'       => 30,
                'dependencies' => array_merge(
                    $dep_non_variable,
                    [
                        [
                            'comparison' => '==',
                            'key'        => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                            'value'      => 'on',
                        ],
                    ]
                ),
                'visibility'     => true,
            ],
            [
                'id'             => Elements::DATE_ON_SALE_TO,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'To', 'dokan-lite' ),
                'variant'        => 'date',
                'placeholder'    => 'YYYY-MM-DD',
                'priority'       => 30,
                'dependencies' => array_merge(
                    $dep_non_variable,
                    [
                        [
                            'comparison' => '==',
                            'key'        => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                            'value'      => 'on',
                        ],
                    ]
                ),
                'visibility'     => true,
            ],
            [
                'id'               => Elements::CATEGORIES,
                'parent_id'        => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Categories', 'dokan-lite' ),
                'variant'          => 'select',
                'placeholder'      => __( 'Select product categories', 'dokan-lite' ),
                'value'            => [],
                'default'          => [],
                'options'          => ProductCategoryHelper::get_product_categories_tree(),
                'required'         => true,
                'priority'         => 30,
                'visibility'       => true,
            ],
            [
                'id'               => Elements::TAGS,
                'parent_id'        => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Tags', 'dokan-lite' ),
                'variant'          => 'select',
                'placeholder'      => 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' ),
                'value'            => [],
                'default'          => [],
                'options'          => self::get_product_tags(),
                'priority'         => 30,
                'visibility'       => true,
            ],
            [
                'id'               => Elements::BRANDS,
                'parent_id'        => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Brands', 'dokan-lite' ),
                'variant'          => 'select',
                'placeholder'      => __( 'Select product brands', 'dokan-lite' ),
                'value'            => [],
                'default'          => [],
                'options'          => self::get_products_brands(),
                'priority'         => 30,
                'visibility'       => true,
            ],
            [
                'id'             => Elements::FEATURED_IMAGE_ID,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Feature Image', 'dokan-lite' ),
                'variant'        => 'feature_image',
                'value'          => [],
                'default'        => [],
                'tooltip'        => __( 'Select product image', 'dokan-lite' ),
                'priority'       => 30,
                'visibility'     => true,
            ],
            [
                'id'             => Elements::GALLERY_IMAGE_IDS,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Gallery Image', 'dokan-lite' ),
                'variant'        => 'gallery_images',
                'value'          => [],
                'default'        => [],
                'tooltip'        => __( 'Select product gallery images', 'dokan-lite' ),
                'priority'       => 30,
                'visibility'     => true,
            ],
            [
                'id'             => Elements::SHORT_DESCRIPTION,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Short Description', 'dokan-lite' ),
                'variant'        => 'editor',
                'placeholder'    => __( 'Enter product short description', 'dokan-lite' ),
                'priority'       => 30,
                'visibility'     => true,
            ],
            [
                'id'             => Elements::DESCRIPTION,
                'parent_id'      => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Description', 'dokan-lite' ),
                'variant'        => 'editor',
                'placeholder'    => __( 'Enter product description', 'dokan-lite' ),
                'required'       => true,
                'priority'       => 30,
                'visibility'     => true,
            ],
            [
                'id'            => Elements::DOWNLOADABLE,
                'parent_id'     => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Downloadable', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'tooltip'       => __( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ),
                'priority'      => 30,
                'visibility'    => true,
            ],
            [
                'id'            => Elements::VIRTUAL,
                'parent_id'     => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Virtual', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'tooltip'       => __( 'Virtual products are intangible and are not shipped.', 'dokan-lite' ),
                'priority'      => 30,
                'visibility'    => true,
            ],
        ];

        $inventory_fields = [
            [
                'id'          => Elements::SECTION_INVENTORY,
                'parent_id'   => null,
                'type'        => 'section',
                'label'       => __( 'Inventory', 'dokan-lite' ),
                'description' => __( 'Manage inventory for this product', 'dokan-lite' ),
                'priority'    => 30,
                'visibility'  => true,
            ],
            [
                'id'           => Elements::SKU,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => sprintf( '%s <span>(%s)</span>', esc_html__( 'SKU', 'dokan-lite' ), esc_html__( 'Stock Keeping Unit', 'dokan-lite' ) ),
                'variant'      => 'text',
                'placeholder'  => __( 'Enter product SKU', 'dokan-lite' ),
                'description'  => __( 'SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased.', 'dokan-lite' ),
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::GLOBAL_UNIQUE_ID,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => sprintf( '%s <span>(%s)</span>', esc_html__( 'GTIN, UPC, EAN, or ISBN', 'dokan-lite' ), esc_html__( 'Product Identifiers', 'dokan-lite' ) ),
                'variant'      => 'text',
                'placeholder'  => __( 'Enter code', 'dokan-lite' ),
                'tooltip'      => __( 'Enter a barcode or any other identifier unique to this product. It can help you list this product on other channels or marketplaces.', 'dokan-lite' ),
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::STOCK_STATUS,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Stock Status', 'dokan-lite' ),
                'variant'      => 'select',
                'description'  => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'dokan-lite' ),
                'options'      => wc_get_product_stock_status_options(),
                'dependencies' => [
                    [
                        'comparison' => '!=',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => 'on',
                    ],
                ],
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::MANAGE_STOCK,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Manage stock?', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'tooltip'      => __( 'Manage stock level (quantity)', 'dokan-lite' ),
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::STOCK_QUANTITY,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Stock quantity', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => '1',
                'default'      => 0,
                'description'  => __( 'Stock quantity. If this is a variable product this value will be used to control stock for all variations, unless you define stock at variation level.', 'dokan-lite' ),
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => 'on',
                    ],
                ],
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::LOW_STOCK_AMOUNT,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Low stock threshold', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => sprintf(
                    /* translators: %d: store-wide threshold */
                    esc_attr__( 'Store-wide threshold (%d)', 'dokan-lite' ),
                    esc_attr( get_option( 'woocommerce_notify_low_stock_amount' ) )
                ),
                'description' => __( 'When product stock reaches this amount you will be notified by email. It is possible to define different values for each variation individually.', 'dokan-lite' ),
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => 'on',
                    ],
                ],
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::BACKORDERS,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Allow Backorders', 'dokan-lite' ),
                'variant'      => 'select',
                'description'  => __( 'If managing stock, this controls whether or not backorders are allowed. If enabled, stock quantity can go below 0.', 'dokan-lite' ),
                'options'      => wc_get_product_backorder_options(),
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => 'on',
                    ],
                ],
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::SOLD_INDIVIDUALLY,
                'parent_id'    => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Allow only one quantity of this product to be bought in a single order.', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'tooltip'      => __( 'Check to let customers to purchase only 1 item in a single order. This is particularly useful for items that have limited quantity, for example art or handmade goods.', 'dokan-lite' ),
                'priority'     => 30,
                'visibility'   => true,
            ],
        ];
        $downloadable_fields = [
            [
                'id'           => Elements::SECTION_DOWNLOADABLE,
                'parent_id'    => null,
                'type'         => 'section',
                'label'        => __( 'Downloadable Options', 'dokan-lite' ),
                'description'  => __( 'Configure your downloadable product settings', 'dokan-lite' ),
                'priority'     => 30,
                'visibility'   => true,
                'dependencies' => $dep_downloadable,
            ],
            [
                'id'           => Elements::DOWNLOADS,
                'parent_id'    => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Downloadable Files', 'dokan-lite' ),
                'variant'      => 'downloadable',
                'value'           => [],
                'default'         => [],
                'description'     => __( 'Upload files that customers can download after purchase.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::DOWNLOAD_LIMIT,
                'parent_id'    => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Download Limit', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => __( 'Unlimited', 'dokan-lite' ),
                'description'  => __( 'Leave blank for unlimited re-downloads.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::DOWNLOAD_EXPIRY,
                'parent_id'    => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Download Expiry', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => __( 'Never', 'dokan-lite' ),
                'description'  => __( 'Enter the number of days before a download link expires, or leave blank.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'priority'     => 30,
                'visibility'   => true,
            ],
        ];
        $others_fields = [
            [
                'id'          => Elements::SECTION_OTHERS,
                'parent_id'   => null,
                'type'        => 'section',
                'label'       => __( 'Other Options', 'dokan-lite' ),
                'description' => __( 'Set your extra product options', 'dokan-lite' ),
                'priority'    => 30,
                'visibility'  => true,
            ],
            [
                'id'           => Elements::STATUS,
                'parent_id'    => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Status', 'dokan-lite' ),
                'variant'      => 'radio',
                'value'        => 'draft',
                'default'      => 'draft',
                'options'      => dokan_get_available_post_status( $product_id ),
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::CATALOG_VISIBILITY,
                'parent_id'    => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Visibility', 'dokan-lite' ),
                'variant'      => 'select',
                'options'      => dokan_get_product_visibility_options(),
                'priority'     => 30,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::PURCHASE_NOTE,
                'parent_id'    => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Purchase Note', 'dokan-lite' ),
                'variant'      => 'textarea',
                'placeholder'     => __( 'Purchase Note', 'dokan-lite' ),
                'description'     => __( 'Customer will get this in order email.', 'dokan-lite' ),
                'priority'        => 30,
                'visibility'      => true,
            ],
            [
                'id'           => Elements::REVIEWS_ALLOWED,
                'parent_id'    => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Enable product reviews', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'priority'    => 30,
                'visibility'  => true,
            ],
        ];

        $items = array_merge(
            $general_fields,
            $inventory_fields,
            $downloadable_fields,
            $others_fields,
        );

        $items = apply_filters( 'dokan_product_form_schema', $items, $product_id );

        // Sort the items by priority (fallback to 30 when not set).
        usort(
            $items,
            function ( $a, $b ) {
                $a_priority = isset( $a['priority'] ) ? (int) $a['priority'] : 30;
                $b_priority = isset( $b['priority'] ) ? (int) $b['priority'] : 30;

                return $a_priority <=> $b_priority;
            }
        );

        // validate the fields
        $this->assert_field_schema( $items );

        if ( $product instanceof WC_Product ) {
            foreach ( $items as &$item ) {
                if ( $item['type'] === 'field' ) {
                    $item['value'] = $this->resolve_field_value( $item['id'], $product );
                }
            }
        }

        return $items;
    }

    /**
     * Get field key from field id (id is Elements constant value, e.g. name, reviews_allowed).
     *
     * @param string $id Field id (Elements constant value).
     * @return string
     */
    private function get_field_key_from_id( string $id ): string {
        $parts = explode( '.', $id );
        return end( $parts );
    }

    /**
     * Resolve a field's value from product. Mirrors Field::get_value() and original value_callback logic.
     *
     * @param string     $field_id Field id (Elements constant value, e.g. Elements::REVIEWS_ALLOWED).
     * @param WC_Product $product  Product instance.
     * @return mixed
     */
    private function resolve_field_value( string $field_id, WC_Product $product ) {
        $key = $this->get_field_key_from_id( $field_id );

        switch ( $key ) {
            case Elements::NAME:
                $name = $product->get_name();
                if ( $name === 'AUTO-DRAFT' ) {
                    return '';
                }
                return $name;
            case Elements::CREATE_SCHEDULE_FOR_DISCOUNT:
                return ( ! empty( $product->get_date_on_sale_to() ) || ! empty( $product->get_date_on_sale_from() ) ) ? 'on' : 'off';
            case Elements::DATE_ON_SALE_FROM:
                $from = $product->get_date_on_sale_from( 'edit' );
                return $from ? $from->date( 'Y-m-d' ) : '';
            case Elements::DATE_ON_SALE_TO:
                $to = $product->get_date_on_sale_to( 'edit' );
                return $to ? $to->date( 'Y-m-d' ) : '';
            case Elements::CATEGORIES:
                return $product->get_category_ids();
            case Elements::TAGS:
                return $product->get_tag_ids();
            case Elements::BRANDS:
                return $product->get_brand_ids();
            case Elements::FEATURED_IMAGE_ID:
                $image_id = $product->get_image_id();
                return [
                    'id'  => $image_id,
                    'url' => $image_id ? wp_get_attachment_url( $image_id ) : '',
                ];
            case Elements::GALLERY_IMAGE_IDS:
                $urls = [];
                foreach ( $product->get_gallery_image_ids() as $attachment_id ) {
                    $urls[] = [
                        'id'  => $attachment_id,
                        'url' => wp_get_attachment_url( $attachment_id ),
                    ];
                }
                return $urls;
            case Elements::DOWNLOADABLE:
                return $product->is_downloadable();
            case Elements::VIRTUAL:
                return $product->is_virtual();
            case Elements::SOLD_INDIVIDUALLY:
                return $product->is_sold_individually();
            case Elements::DOWNLOADS:
                $downloads = [];
                foreach ( $product->get_downloads() as $download ) {
                    $downloads[] = [
                        'id' => (string) attachment_url_to_postid( $download['file'] ),
                        'name' => $download['name'],
                        'file'   => $download['file'],
                    ];
                }
                return $downloads;
            case Elements::STATUS:
                if ( 'auto-draft' !== $product->get_status() ) {
                    return $product->get_status();
                }
                $seller_id          = dokan_get_vendor_by_product( $product->get_id(), true );
                $new_product_status = dokan_get_default_product_status( $seller_id );
                $current_status     = 'publish' === $new_product_status ? 'publish' : ( 'pending' === $new_product_status ? 'pending' : 'draft' );
                return apply_filters( 'dokan_post_edit_default_status', $current_status, $product );
            case Elements::ENABLED:
                return $product->get_status() === 'publish';
            default:
                // Get the field name from the key.
                $field_name = sanitize_key( $key );

                $value = apply_filters( 'dokan_product_form_schema_value', '', $field_name, $product );
                if ( ! empty( $value ) ) {
                    return $value;
                }

                // If the field name starts with an underscore, it is a meta field.
                if ( 0 === strpos( $field_name, '_' ) ) {
                    return $product->get_meta( $field_name );
                }

                // If the field name does not start with an underscore, it is a prop field.
                $method_name = 'get_' . $field_name;

                // If the method exists, return the value.
                if ( method_exists( $product, $method_name ) ) {
                    return $product->{$method_name}();
                }

                return '';
        }
    }


    /**
     * Get product variations for a product (for form manager).
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product ID.
     *
     * @return array
     */
    public function get_product_variations( int $product_id ): array {
        $variations = wc_get_products(
            [
				'status'  => [ 'private', 'publish' ],
				'type'    => 'variation',
				'parent'  => $product_id,
				'orderby' => [
					'menu_order' => 'ASC',
					'ID' => 'DESC',
				],
				'return'  => 'objects',
			]
        );

        $variations_data = [];
        $parent_product  = wc_get_product( $product_id );

        if ( $variations && $parent_product ) {
            $iteration = 0;
            foreach ( $variations as $variation ) {
                /** @var \WC_Product_Variation $variation */
                $variation_id     = $variation->get_id();
                $formatted_attrs  = [];
                $attribute_values = $variation->get_attributes( 'edit' );

                foreach ( $parent_product->get_attributes( 'edit' ) as $attribute ) {
                    if ( ! $attribute->get_variation() ) {
                        continue;
                    }
                    $selected_val = isset( $attribute_values[ sanitize_title( $attribute->get_name() ) ] )
                        ? $attribute_values[ sanitize_title( $attribute->get_name() ) ]
                        : '';
                    $options = [];
                    $selected = null;

                    if ( $attribute->is_taxonomy() ) {
                        foreach ( $attribute->get_terms() as $option ) {
                            $opt = [
                                'value' => $option->slug,
                                'label' => apply_filters( 'woocommerce_variation_option_name', $option->name, $option, $attribute->get_name(), $parent_product ),
                            ];
                            $options[] = $opt;
                            if ( $selected_val === $opt['value'] ) {
                                $selected = $opt;
                            }
                        }
                    } else {
                        foreach ( $attribute->get_options() as $option ) {
                            $opt = [
                                'value' => $option,
                                'label' => apply_filters( 'woocommerce_variation_option_name', $option, null, $attribute->get_name(), $parent_product ),
                            ];
                            $options[] = $opt;
                            if ( $selected_val === $opt['value'] ) {
                                $selected = $opt;
                            }
                        }
                    }
                    $formatted_attrs[] = [
                        'label'           => wc_attribute_label( $attribute->get_name() ),
                        'value'           => sanitize_title( $attribute->get_name() ),
                        'selected_value'  => $selected,
                        'options'         => $options,
                    ];
                }
                $variations_data[] = [
                    'id'         => $variation_id,
                    'parent_id'  => $product_id,
                    'menu_order' => $iteration++,
                    'attributes' => $formatted_attrs,
                ];
            }
        }
        return $variations_data;
    }

    /**
     * Get product tags for form options.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_product_tags(): array {
        $args = apply_filters(
            'dokan_product_tags_args', [
				'taxonomy'   => 'product_tag',
				'hide_empty' => 0,
				'orderby'    => 'name',
				'order'      => 'ASC',
			]
        );
        $data = [];
        $terms = get_terms( $args );
        if ( $terms && ! is_wp_error( $terms ) ) {
            foreach ( $terms as $term ) {
                $data[] = [
					'value' => $term->term_id,
					'slug' => $term->slug,
					'label' => $term->name,
				];
            }
        }
        return $data;
    }

    /**
     * Get product brands recursively for form options.
     *
     * @since DOKAN_SINCE
     *
     * @param int $parent_id Parent term ID (0 for top-level).
     *
     * @return array
     */
    public static function get_products_brands( int $parent_id = 0 ): array {
        $args = apply_filters(
            'dokan_product_brands_args', [
				'taxonomy'   => 'product_brand',
				'hide_empty' => 0,
				'parent'     => $parent_id,
				'orderby'    => 'name',
				'order'      => 'ASC',
			]
        );
        $terms  = get_terms( $args );
        $results = [];
        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $children = self::get_products_brands( $term->term_id );
                $data = [
                    'value'  => $term->term_id,
                    'slug'   => $term->slug,
                    'label'  => $term->name,
                    'parent' => $parent_id,
                ];
                if ( ! empty( $children ) ) {
                    $data['children'] = $children;
                }
                $results[] = $data;
            }
        }
        return apply_filters( 'dokan_get_products_brands_data', $results );
    }
}

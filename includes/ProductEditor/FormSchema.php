<?php

namespace WeDevs\Dokan\ProductEditor;

use WC_Product;
use WeDevs\Dokan\ProductCategory\Helper as ProductCategoryHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Product form schema, data resolution, and product form support.
 *
 * @since 5.0.0
 */
class FormSchema {

    /**
     * Required field attributes
     *
     * @since 5.0.0
     *
     * @var array $required_fields
     */
    private array $required_fields = [
        'id',
        'type',
        'variant',
        'label',
    ];

    /**
     * Supported field types.
     *
     * @since 5.0.0
     *
     * @var array
     */
    private array $supported_types = [
        'section',
        'field',
    ];

    /**
     * Supported field variants.
     *
     * @since 5.0.0
     *
     * @var array
     */
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
        'file',
        'datetime',
        'image',
        'gallery',
        'attribute',
        'location_map',
    ];

    /**
     * Validate field schema and log developer notices for invalid fields.
     *
     * @since 5.0.0
     *
     * @param array $fields Form schema fields to validate.
     *
     * @return array The same fields array (unmodified).
     */
    private function assert_field_schema( array $fields ): array {
        foreach ( $fields as $field ) {
            // Check required attributes are present.
            foreach ( $this->required_fields as $attr ) {
                // 'variant' is only required for field-type items, not sections.
                if ( 'variant' === $attr && isset( $field['type'] ) && 'section' === $field['type'] ) {
                    continue;
                }
                if ( ! array_key_exists( $attr, $field ) || ( $field[ $attr ] === '' || $field[ $attr ] === null ) ) {
                    _doing_it_wrong(
                        __METHOD__,
                        sprintf(
                            /* translators: 1: attribute name, 2: field id */
                            esc_html__( 'Missing required attribute "%1$s" on field: %2$s', 'dokan-lite' ),
                            esc_html( $attr ),
                            esc_html( $field['id'] ?? 'unknown' )
                        ),
                        '5.0.0'
                    );
                }
            }
            if ( ! in_array( $field['type'], $this->supported_types, true ) ) {
                _doing_it_wrong(
                    __METHOD__,
                    sprintf(
                        /* translators: 1: field type, 2: field id */
                        esc_html__( 'Invalid field type: %1$s and id: %2$s', 'dokan-lite' ),
                        esc_html( $field['type'] ),
                        esc_html( $field['id'] ?? 'unknown' )
                    ),
                    '5.0.0'
                );
            }
            if ( isset( $field['variant'] ) && ! in_array( $field['variant'], $this->supported_variants, true ) ) {
                _doing_it_wrong(
                    __METHOD__,
                    sprintf(
                        /* translators: 1: field variant, 2: field id */
                        esc_html__( 'Invalid field variant: %1$s and id: %2$s', 'dokan-lite' ),
                        esc_html( $field['variant'] ),
                        esc_html( $field['id'] ?? 'unknown' )
                    ),
                    '5.0.0'
                );
            }
        }
        return $fields;
    }

    /**
     * Get available product types as label/value pairs.
     *
     * @since 5.0.0
     *
     * @return array
     */
    public function get_product_types(): array {
        $types = [
            'simple' => __( 'Simple', 'dokan-lite' ),
        ];
        $product_types = apply_filters( 'dokan_product_types', $types );
        $types = array_map(
            fn( $key, $type ) => [
                'label' => $type,
                'value' => $key,
            ],
            array_keys( $product_types ),
            $product_types
        );

        return $types;
    }

    /**
     * Get the flat layout definition.
     *
     * Predefined items are sorted by array position.
     * Extensions can set an optional `priority` key to control insertion order
     * when adding items via the `dokan_product_editor_layouts` filter.
     *
     * @since 5.0.0
     *
     * @return array Flat array of layout items.
     */
    public static function get_layouts(): array {
        $layouts = [
            // Root layout with responsive breakpoints.
            [
                'id'         => Elements::ROOT_LAYOUT,
                'parent_id'  => null,
                'priority'   => 10,
                'layout'     => [
                    'type'      => 'row',
                    'alignment' => 'start',
                    'styles'    => [
                        Elements::PRIMARY_COLUMN => [ 'flex' => '1' ],
                        Elements::SIDEBAR_COLUMN => [
                            'flex'     => '0 0 25%',
                            'minWidth' => '280px',
                        ],
                    ],
                ],
                'responsive' => [
                    [
                        'maxWidth' => 768,
                        'layout'   => [
                            'type' => 'regular',
                        ],
                    ],
                ],
            ],

            // Two-column structure.
            [
                'id'        => Elements::PRIMARY_COLUMN,
                'parent_id' => Elements::ROOT_LAYOUT,
                'priority'  => 10,
            ],
            [
                'id'        => Elements::SIDEBAR_COLUMN,
                'parent_id' => Elements::ROOT_LAYOUT,
                'priority'  => 20,
            ],

            // ── Primary column sections ───────────────────────────

            // 1. General info section (card).
            [
                'id'        => Elements::SECTION_GENERAL,
                'parent_id' => Elements::PRIMARY_COLUMN,
                'priority'  => 10,
                'layout'    => [ 'type' => 'card' ],
                'children'  => [
                    Elements::NAME,
                    Elements::SLUG,
                    Elements::TYPE,
                    Elements::EXTERNAL_URL,
                    Elements::BUTTON_TEXT,
                    Elements::CATEGORIES,
                    Elements::TAGS,
                    Elements::BRANDS,
                    Elements::REGULAR_PRICE,
                    Elements::SALE_PRICE,
                    Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                ],
            ],
            // Digital product options group (inside general info, after 'type').
            [
                'id'        => Elements::SECTION_DIGITAL_OPTIONS,
                'parent_id' => Elements::SECTION_GENERAL,
                'after'     => Elements::TYPE,
                'priority'  => 10,
                'layout'    => [ 'type' => 'regular' ],
                'label'     => __( 'Digital Product Options', 'dokan-lite' ),
                'children'  => [
                    Elements::DOWNLOADABLE,
                    Elements::VIRTUAL,
                ],
            ],
            // Discount schedule row (inside general info, after 'create_schedule_for_discount').
            [
                'id'        => Elements::SECTION_DISCOUNT_SCHEDULE,
                'parent_id' => Elements::SECTION_GENERAL,
                'after'     => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                'priority'  => 20,
                'layout'    => [ 'type' => 'row' ],
                'children'  => [
                    Elements::DATE_ON_SALE_FROM,
                    Elements::DATE_ON_SALE_TO,
                ],
            ],

            // 2. Description section (card).
            [
                'id'        => Elements::SECTION_DESCRIPTION,
                'parent_id' => Elements::PRIMARY_COLUMN,
                'priority'  => 20,
                'layout'    => [ 'type' => 'card' ],
                'children'  => [
                    Elements::SHORT_DESCRIPTION,
                    Elements::DESCRIPTION,
                ],
            ],

            // 3. Inventory section (card with header).
            [
                'id'        => Elements::SECTION_INVENTORY,
                'parent_id' => Elements::PRIMARY_COLUMN,
                'layout'    => [
                    'type'       => 'card',
                    'withHeader' => true,
                ],
                'priority'  => 40,
                'children'  => [
                    Elements::SKU,
                    Elements::GLOBAL_UNIQUE_ID,
                    Elements::MANAGE_STOCK,
                    Elements::STOCK_STATUS,
                    Elements::STOCK_QUANTITY,
                    Elements::LOW_STOCK_AMOUNT,
                    Elements::BACKORDERS,
                    Elements::SOLD_INDIVIDUALLY,
                ],
            ],

            // 4. Shipping and Tax section (card with header).
            [
                'id'        => Elements::SECTION_SHIPPING,
                'parent_id' => Elements::PRIMARY_COLUMN,
                'priority'  => 40,
                'layout'    => [
                    'type'       => 'card',
                    'withHeader' => true,
                ],
                'children'  => [
                    Elements::DISABLE_SHIPPING_META,
                    Elements::SHIPPING_CLASS,
                    Elements::TAX_STATUS,
                    Elements::TAX_CLASS,
                    Elements::OVERWRITE_SHIPPING_META,
                    Elements::ADDITIONAL_SHIPPING_PROCESSING_TIME_META,
                ],
            ],
            // Shipping dimensions row (after '_disable_shipping').
            [
                'id'        => Elements::SECTION_SHIPPING_DIMENSIONS,
                'parent_id' => Elements::SECTION_SHIPPING,
                'after'     => Elements::DISABLE_SHIPPING_META,
                'priority'  => 10,
                'layout'    => [ 'type' => 'row' ],
                'children'  => [
                    Elements::WEIGHT,
                    Elements::DIMENSIONS_LENGTH,
                    Elements::DIMENSIONS_WIDTH,
                    Elements::DIMENSIONS_HEIGHT,
                ],
            ],
            // Overwrite shipping price/qty row (after '_overwrite_shipping').
            [
                'id'        => Elements::SECTION_SHIPPING_OVERWRITE,
                'parent_id' => Elements::SECTION_SHIPPING,
                'after'     => Elements::OVERWRITE_SHIPPING_META,
                'priority'  => 20,
                'layout'    => [ 'type' => 'row' ],
                'children'  => [
                    Elements::ADDITIONAL_SHIPPING_COST_META,
                    Elements::ADDITIONAL_SHIPPING_QUANTITY_META,
                ],
            ],

            // ── Sidebar column sections ───────────────────────────

            // Organize product (card, not collapsible).
            [
                'id'        => Elements::SECTION_PUBLISHING,
                'parent_id' => Elements::SIDEBAR_COLUMN,
                'priority'  => 10,
                'layout'    => [
                    'type'          => 'card',
                    'isCollapsible' => false,
                ],
                'children'  => [
                    Elements::STATUS,
                    Elements::CATALOG_VISIBILITY,
                    Elements::FEATURED_IMAGE_ID,
                    Elements::GALLERY_IMAGE_IDS,
                    Elements::REVIEWS_ALLOWED,
                ],
            ],

            // Purchase note section (card with header, not collapsible).
            [
                'id'        => Elements::SECTION_PURCHASE_NOTE,
                'parent_id' => Elements::SIDEBAR_COLUMN,
                'priority'  => 20,
                'layout'    => [
                    'type'          => 'card',
                    'withHeader'    => true,
                    'isCollapsible' => false,
                ],
                'children'  => [
                    Elements::PURCHASE_NOTE,
                ],
            ],
        ];

        $layouts = array_map(
            function ( $item ) {
                // Ensure 'children' key exists for all items.
                if ( ! isset( $item['children'] ) ) {
                    $item['children'] = [];
                }
                $item['children'] = apply_filters( 'dokan_product_editor_layout_children', $item['children'], $item );
                return $item;
            }, $layouts
        );

        /**
         * Filter the product editor form layout.
         *
         * Flat array of layout items with parent-child relationships.
         * Each item has: id, parent_id, layout, priority, label, description, children, after.
         * Sorting is by priority (default 999); items with equal priority preserve array order.
         *
         * @since 5.0.0
         *
         * @param array $layout Flat layout items.
         */
        $layouts = apply_filters( 'dokan_product_editor_layouts', $layouts );

        // Sort by priority after all extensions have added their items.
        usort(
            $layouts,
            function ( $a, $b ) {
                return ( $a['priority'] ?? 999 ) <=> ( $b['priority'] ?? 999 );
            }
        );

        return $layouts;
    }

    /**
     * Get flat form schema (sections and fields). Resolves field values when $product_id is provided.
     *
     * @since 5.0.0
     * @param int $product_id Optional. Product ID to resolve values from.
     * @return array Form schema items (sections and fields).
     */
    public function get_schema( int $product_id = 0 ): array {
        $product = ( $product_id > 0 ) ? wc_get_product( $product_id ) : null;

        $can_create_tags = dokan()->is_pro_exists() ? dokan_get_option( 'product_vendors_can_create_tags', 'dokan_selling', 'off' ) : 'off';

        $dep_downloadable = [
            [
                'comparison' => '==',
                'key'        => Elements::DOWNLOADABLE,
                'value'      => true,
            ],
        ];

        // Per-type visibility: show for simple & variation, hide for variable (price is set per-variation).
        $pre_type_visibilities = [
            Elements::PRODUCT_TYPE_SIMPLE    => true,
            Elements::PRODUCT_TYPE_VARIABLE  => false,
            Elements::PRODUCT_TYPE_VARIATION => true,
            Elements::PRODUCT_TYPE_GROUPED   => false,
        ];
        $price_visibilities = apply_filters(
            'dokan_product_editor_price_visibilities',
            $pre_type_visibilities,
        );

        $digital_field_visibilities = apply_filters(
            'dokan_product_editor_digital_option_visibilities',
            $pre_type_visibilities,
        );

        $price_labels = apply_filters(
            'dokan_product_editor_price_labels',
            []
        );

        $schedule_deps = [
			[
				'comparison' => '==',
				'key'        => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
				'value'      => true,
			],
		];

        $general_fields = [
            [
                'id'         => Elements::SECTION_GENERAL,
                'section_id' => null,
                'type'       => 'section',
                'label'      => __( 'General', 'dokan-lite' ),
                'required'   => true,
                'visibility' => true,
            ],
            [
                'id'             => Elements::NAME,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Title', 'dokan-lite' ),
                'variant'        => 'text',
                'placeholder'    => __( 'Enter product title...', 'dokan-lite' ),
                'required'       => true,
                'visibility'     => true,
            ],
            [
                'id'               => Elements::SLUG,
                'section_id'       => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Permalink', 'dokan-lite' ),
                'variant'          => 'text',
                'placeholder'      => __( 'Enter product slug...', 'dokan-lite' ),
                'prefix'           => home_url( wc_get_permalink_structure()['product_base'] ?? '/product/' ),
                'required'         => false,
                'visibility'       => true,
            ],
            [
                'id'             => Elements::TYPE,
                'section_id'     => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Product Type', 'dokan-lite' ),
                'variant'        => 'select',
                'value'          => 'simple',
                'required'       => true,
                'options'        => $this->get_product_types(),
                'description'    => __( 'Choose Variable if your product has multiple attributes - like sizes, colors, quality etc', 'dokan-lite' ),
                'tooltip'        => __( 'Choose product type.', 'dokan-lite' ),
                'visibility'     => true,
            ],
            [
                'id'            => Elements::ENABLED,
                'section_id'    => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Enabled', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'visibility'    => true,
                'show_in_admin' => false,
                'dependencies'  => [
                    [
                        'comparison' => 'contains',
                        'key'        => Elements::TYPE,
                        'value'      => 'variation',
                    ],
                ],
            ],
            [
                'id'           => Elements::REGULAR_PRICE,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'         => 'field',
                'label'        => __( 'Price', 'dokan-lite' ),
                'labels'       => $price_labels,
                'variant'      => 'text',
                'placeholder'  => '0.00',
                'visibility'   => true,
                'visibilities' => $price_visibilities,
                'requireds'    => [
                    'simple'   => true,
                    'external' => true,
                ],
            ],
            [
                'id'           => Elements::SALE_PRICE,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'         => 'field',
                'label'        => __( 'Sale Price', 'dokan-lite' ),
                'variant'      => 'text',
                'placeholder'  => '0.00',
                'visibility'   => true,
                'visibilities' => $price_visibilities,
                'validations'  => [
                    [
                        'rules'        => 'less_than',
                        'message'      => __( 'Sale price must be less than the regular price.', 'dokan-lite' ),
                        'params'       => [ 'field' => Elements::REGULAR_PRICE ],
                        'dependencies' => [
                            [
                                'comparison' => 'not_empty',
                                'key'        => Elements::REGULAR_PRICE,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id'            => Elements::CREATE_SCHEDULE_FOR_DISCOUNT,
                'section_id'    => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Create Schedule for Discount', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'visibility'    => true,
                'visibilities'  => $price_visibilities,
                'show_in_admin' => false,
            ],
            [
                'id'             => Elements::DATE_ON_SALE_FROM,
                'section_id'     => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'From', 'dokan-lite' ),
                'variant'        => 'datetime',
                'placeholder'    => 'YYYY-MM-DD HH:MM',
                'visibility'     => true,
                'visibilities'   => $price_visibilities,
                'dependencies'   => $schedule_deps,
            ],
            [
                'id'             => Elements::DATE_ON_SALE_TO,
                'section_id'     => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'To', 'dokan-lite' ),
                'variant'        => 'datetime',
                'placeholder'    => 'YYYY-MM-DD HH:MM',
                'visibility'     => true,
                'visibilities'   => $price_visibilities,
                'dependencies'   => $schedule_deps,
            ],
            [
                'id'               => Elements::CATEGORIES,
                'section_id'       => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Categories', 'dokan-lite' ),
                'variant'          => 'multiselect',
                'placeholder'      => __( 'Select product categories', 'dokan-lite' ),
                'value'            => [],
                'options'          => ProductCategoryHelper::get_product_categories_tree( true ),
                'required'         => true,
                'visibility'       => true,
            ],
            [
                'id'               => Elements::TAGS,
                'section_id'       => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Tags', 'dokan-lite' ),
                'variant'          => 'multiselect',
                'placeholder'      => 'on' === $can_create_tags ? __( 'Select tags/Add tags', 'dokan-lite' ) : __( 'Select product tags', 'dokan-lite' ),
                'value'            => [],
                'options'          => self::get_product_tags(),
                'visibility'       => true,
            ],
            [
                'id'               => Elements::BRANDS,
                'section_id'       => Elements::SECTION_GENERAL,
                'type'             => 'field',
                'label'            => __( 'Brands', 'dokan-lite' ),
                'variant'          => 'multiselect',
                'placeholder'      => __( 'Select product brands', 'dokan-lite' ),
                'value'            => [],
                'options'          => self::get_products_brands(),
                'visibility'       => true,
            ],
            [
                'id'             => Elements::FEATURED_IMAGE_ID,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Feature Image', 'dokan-lite' ),
                'variant'        => 'image',
                'value'          => [],
                'tooltip'        => __( 'Select product image', 'dokan-lite' ),
                'visibility'     => true,
            ],
            [
                'id'             => Elements::GALLERY_IMAGE_IDS,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Gallery Image', 'dokan-lite' ),
                'variant'        => 'gallery',
                'value'          => [],
                'tooltip'        => __( 'Select product gallery images', 'dokan-lite' ),
                'visibility'     => true,
            ],
            [
                'id'             => Elements::SHORT_DESCRIPTION,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Short Description', 'dokan-lite' ),
                'variant'        => 'editor',
                'placeholder'    => __( 'Enter product short description', 'dokan-lite' ),
                'visibility'     => true,
            ],
            [
                'id'             => Elements::DESCRIPTION,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'           => 'field',
                'label'          => __( 'Description', 'dokan-lite' ),
                'variant'        => 'editor',
                'placeholder'    => __( 'Enter product description', 'dokan-lite' ),
                'required'       => true,
                'visibility'     => true,
            ],
            [
                'id'            => Elements::DOWNLOADABLE,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Downloadable', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'tooltip'       => __( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ),
                'visibility'    => true,
                'visibilities'  => $digital_field_visibilities,
            ],
            [
                'id'            => Elements::VIRTUAL,
                'section_id'   => Elements::SECTION_GENERAL,
                'type'          => 'field',
                'label'         => __( 'Virtual', 'dokan-lite' ),
                'variant'       => 'checkbox',
                'tooltip'       => __( 'Virtual products are intangible and are not shipped.', 'dokan-lite' ),
                'visibility'    => true,
                'visibilities'  => $digital_field_visibilities,
            ],
        ];

        $inventory_fields = [
            [
                'id'          => Elements::SECTION_INVENTORY,
                'section_id'  => null,
                'type'        => 'section',
                'label'       => __( 'Inventory', 'dokan-lite' ),
                'description' => __( 'Manage inventory for this product', 'dokan-lite' ),
                'visibility'  => true,
            ],
            [
                'id'           => Elements::SKU,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => sprintf( '%s <span>(%s)</span>', esc_html__( 'SKU', 'dokan-lite' ), esc_html__( 'Stock Keeping Unit', 'dokan-lite' ) ),
                'variant'      => 'text',
                'placeholder'  => __( 'Enter product SKU', 'dokan-lite' ),
                'description'  => __( 'SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased.', 'dokan-lite' ),
                'visibility'   => true,
            ],
            [
                'id'           => Elements::GLOBAL_UNIQUE_ID,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => sprintf( '%s <span>(%s)</span>', esc_html__( 'GTIN, UPC, EAN, or ISBN', 'dokan-lite' ), esc_html__( 'Product Identifiers', 'dokan-lite' ) ),
                'variant'      => 'text',
                'placeholder'  => __( 'Enter code', 'dokan-lite' ),
                'tooltip'      => __( 'Enter a barcode or any other identifier unique to this product. It can help you list this product on other channels or marketplaces.', 'dokan-lite' ),
                'visibility'   => true,
            ],
            [
                'id'           => Elements::STOCK_STATUS,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Stock Status', 'dokan-lite' ),
                'variant'      => 'select',
                'description'  => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'dokan-lite' ),
                'options'      => wc_get_product_stock_status_options(),
                'dependencies' => [
                    [
                        'comparison' => '!=',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => true,
                    ],
                ],
                'visibility'   => true,
            ],
            [
                'id'           => Elements::MANAGE_STOCK,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Manage stock?', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'tooltip'      => __( 'Manage stock level (quantity)', 'dokan-lite' ),
                'visibility'   => true,
            ],
            [
                'id'           => Elements::STOCK_QUANTITY,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Stock quantity', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => '1',
                'description'  => __( 'Stock quantity. If this is a variable product this value will be used to control stock for all variations, unless you define stock at variation level.', 'dokan-lite' ),
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => true,
                    ],
                ],
                'visibility'   => true,
            ],
            [
                'id'           => Elements::LOW_STOCK_AMOUNT,
                'section_id'   => Elements::SECTION_INVENTORY,
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
                        'value'      => true,
                    ],
                ],
                'visibility'   => true,
            ],
            [
                'id'           => Elements::BACKORDERS,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Allow Backorders', 'dokan-lite' ),
                'variant'      => 'select',
                'description'  => __( 'If managing stock, this controls whether or not backorders are allowed. If enabled, stock quantity can go below 0.', 'dokan-lite' ),
                'options'      => wc_get_product_backorder_options(),
                'dependencies' => [
                    [
                        'comparison' => '==',
                        'key'        => Elements::MANAGE_STOCK,
                        'value'      => true,
                    ],
                ],
                'visibility'   => true,
            ],
            [
                'id'           => Elements::SOLD_INDIVIDUALLY,
                'section_id'   => Elements::SECTION_INVENTORY,
                'type'         => 'field',
                'label'        => __( 'Allow only one quantity of this product to be bought in a single order.', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'tooltip'      => __( 'Check to let customers to purchase only 1 item in a single order. This is particularly useful for items that have limited quantity, for example art or handmade goods.', 'dokan-lite' ),
                'visibility'   => true,
            ],
        ];
        $downloadable_fields = [
            [
                'id'           => Elements::SECTION_DOWNLOADABLE,
                'section_id'   => null,
                'type'         => 'section',
                'label'        => __( 'Downloadable Options', 'dokan-lite' ),
                'description'  => __( 'Configure your downloadable product settings', 'dokan-lite' ),
                'visibility'   => true,
                'dependencies' => $dep_downloadable,
            ],
            [
                'id'           => Elements::DOWNLOADS,
                'section_id'   => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Downloadable Files', 'dokan-lite' ),
                'variant'      => 'file',
                'value'           => [],
                'description'     => __( 'Upload files that customers can download after purchase.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::DOWNLOAD_LIMIT,
                'section_id'   => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Download Limit', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => __( 'Unlimited', 'dokan-lite' ),
                'description'  => __( 'Leave blank for unlimited re-downloads.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::DOWNLOAD_EXPIRY,
                'section_id'   => Elements::SECTION_DOWNLOADABLE,
                'type'         => 'field',
                'label'        => __( 'Download Expiry', 'dokan-lite' ),
                'variant'      => 'number',
                'placeholder'  => __( 'Never', 'dokan-lite' ),
                'description'  => __( 'Enter the number of days before a download link expires, or leave blank.', 'dokan-lite' ),
                'dependencies' => $dep_downloadable,
                'visibility'   => true,
            ],
        ];
        $others_fields = [
            [
                'id'          => Elements::SECTION_OTHERS,
                'section_id'  => null,
                'type'        => 'section',
                'label'       => __( 'Other Options', 'dokan-lite' ),
                'description' => __( 'Set your extra product options', 'dokan-lite' ),
                'visibility'  => true,
            ],
            [
                'id'           => Elements::STATUS,
                'section_id'   => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Status', 'dokan-lite' ),
                'variant'      => 'radio',
                'value'        => 'draft',
                'required'     => true,
                'options'      => dokan_get_available_post_status( $product_id ),
                'visibility'   => true,
            ],
            [
                'id'           => Elements::CATALOG_VISIBILITY,
                'section_id'   => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Visibility', 'dokan-lite' ),
                'variant'      => 'select',
                'options'      => dokan_get_product_visibility_options(),
                'required'     => true,
                'visibility'   => true,
            ],
            [
                'id'           => Elements::PURCHASE_NOTE,
                'section_id'   => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Purchase Note', 'dokan-lite' ),
                'variant'      => 'textarea',
                'placeholder'     => __( 'Purchase Note', 'dokan-lite' ),
                'description'     => __( 'Customer will get this in order email.', 'dokan-lite' ),
                'visibility'      => true,
            ],
            [
                'id'           => Elements::REVIEWS_ALLOWED,
                'section_id'   => Elements::SECTION_OTHERS,
                'type'         => 'field',
                'label'        => __( 'Enable product reviews', 'dokan-lite' ),
                'variant'      => 'checkbox',
                'visibility'   => true,
            ],
        ];

        $items = array_merge(
            $general_fields,
            $inventory_fields,
            $downloadable_fields,
            $others_fields,
        );

        $items = apply_filters( 'dokan_product_editor_schema', $items, $product_id );

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

        $items = apply_filters( 'dokan_product_editor_prepared_schema', $items, $product_id );

        if ( $product instanceof WC_Product ) {
            foreach ( $items as &$item ) {
                if ( $item['type'] === 'field' ) {
                    $value         = $this->resolve_field_value( $item['id'], $product );
                    $value         = $this->format_field_value( $value, $item['variant'] ?? 'text' );
                    if ( empty( $value ) && isset( $item['value'] ) ) {
                        // set default value from schema if resolved value is empty, e.g. for new products or when product meta is not set.
                        $value = $item['value'];
                    }
                    $item['value'] = $value;
                }
            }
        }

        return $items;
    }

    /**
     * Format a resolved field value to the shape expected by the frontend based on variant.
     *
     * Resolve_field_value() returns raw values (int, array of ints, etc.).
     * This method transforms them to the structured shape the React frontend expects.
     *
     * @since 5.0.0
     *
     * @param mixed  $value   Raw resolved value.
     * @param string $variant Field variant type.
     *
     * @return mixed Formatted value.
     */
    private function format_field_value( $value, string $variant ) {
        switch ( $variant ) {
            case 'image':
                $image_id = absint( $value );

                return [
                    'id'  => $image_id,
                    'url' => $image_id ? wp_get_attachment_url( $image_id ) : '',
                ];

            case 'file':
                if ( ! is_array( $value ) || empty( $value ) ) {
                    return [];
                }

                // Already in [ { id, file, name }, ... ] shape (e.g. from DOWNLOADS case).
                if ( isset( $value[0] ) && is_array( $value[0] ) ) {
                    return $value;
                }

                // Raw array of attachment IDs from custom meta — resolve to [ { id, file, name } ].
                return array_filter(
                    array_map(
                        function ( $id ) {
                            $attachment_id = absint( $id );
                            $url           = $attachment_id ? wp_get_attachment_url( $attachment_id ) : '';

                            if ( ! $url ) {
                                return null;
                            }

                            return [
                                'id'   => $attachment_id,
                                'file' => $url,
                                'name' => basename( get_attached_file( $attachment_id ) ?? '' ),
                            ];
                        },
                        $value
                    )
                );

            case 'gallery':
                if ( ! is_array( $value ) ) {
                    return [];
                }

                return array_map(
                    function ( $id ) {
                        $attachment_id = absint( $id );

                        return [
                            'id'  => $attachment_id,
                            'url' => $attachment_id ? wp_get_attachment_url( $attachment_id ) : '',
                        ];
                    },
                    $value
                );

            case 'number':
                return is_numeric( $value ) ? (float) $value : 0;

            default:
                return $value;
        }
    }

    /**
     * Resolve a field's value from product. Mirrors Field::get_value() and original value_callback logic.
     *
     * @param string     $field_id Field id (Elements constant value, e.g. Elements::REVIEWS_ALLOWED).
     * @param WC_Product $product  Product instance.
     * @return mixed
     */
    private function resolve_field_value( string $field_id, WC_Product $product ) {
        $key = $field_id;

        switch ( $key ) {
            case Elements::NAME:
                if ( $product->get_status() === 'auto-draft' ) {
                    return '';
                }
                return $product->get_name();
            case Elements::CREATE_SCHEDULE_FOR_DISCOUNT:
                return ! empty( $product->get_date_on_sale_to() ) || ! empty( $product->get_date_on_sale_from() );
            case Elements::DATE_ON_SALE_FROM:
                $from = $product->get_date_on_sale_from( 'edit' );
                return $from ? $from->date( 'Y-m-d' ) : '';
            case Elements::DATE_ON_SALE_TO:
                $to = $product->get_date_on_sale_to( 'edit' );
                return $to ? $to->date( 'Y-m-d' ) : '';
            case Elements::TAGS:
                return $product->get_tag_ids();
            case Elements::BRANDS:
                if ( method_exists( $product, 'get_brand_ids' ) ) {
                    return $product->get_brand_ids();
                }
                return wp_get_post_terms( $product->get_id(), 'product_brand', [ 'fields' => 'ids' ] );
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

                $value = apply_filters( 'dokan_product_editor_schema_value', null, $field_name, $product );
                if ( null !== $value ) {
                    return $value;
                }

                // If the field name does not start with an underscore, it is a prop field.
                $method_name = 'get_' . $field_name;

                // If the method exists, return the value.
                if ( method_exists( $product, $method_name ) ) {
                    return $product->{$method_name}();
                }

                // Fallback to product meta for custom fields without a dedicated getter.
                $meta_value = $product->get_meta( $field_name, true );
                if ( '' !== $meta_value && null !== $meta_value ) {
                    return $meta_value;
                }

                return '';
        }
    }


    /**
     * Get product tags for form options.
     *
     * @since 5.0.0
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
     * @since 5.0.0
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

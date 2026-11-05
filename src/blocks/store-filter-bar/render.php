<?php
/**
 * Render `dokan/store-filter-bar`.
 *
 * Renders the `store-lists-filter` template so the bar, its hooks and any theme
 * override stay shared with the classic listing. Talks to `dokan/store-list`
 * through GET params only.
 *
 * @since DOKAN_SINCE
 *
 * @var array $attributes Block attributes.
 */

use WeDevs\Dokan\Blocks\Styles;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// The classic listing drops its whole filter bar when this gate is closed.
if ( ! apply_filters( 'dokan_store_lists_filter', true ) ) {
    return;
}

$attributes = wp_parse_args(
    $attributes,
    [
        'showStoreCount'    => true,
        'showSearch'        => true,
        'showSort'          => true,
        'showViewToggle'    => true,
        'storeCountText'    => '',
        'filterButtonText'  => '',
        'sortLabel'         => '',
        'hiddenSortOptions' => [],
        'searchPlaceholder' => '',
        'applyText'         => '',
        'cancelText'        => '',
        'buttonColor'       => '',
        'buttonTextColor'   => '',
        'filterLabels'      => [],
    ]
);

// Extensions drawing into this block read their own attributes from here; Pro's map toggle is one.
\WeDevs\Dokan\Blocks\Manager::publish_rendering_attributes( $attributes, 'dokan/store-filter-bar' );

$requested_data = \WeDevs\Dokan\Vendor\StoreListsFilter::get_requested_data();

// The count and the hooks below get the same result the classic listing passes them:
// the matching stores, a first page of them at [dokan-stores]' default size.
$store_args = [
    'number' => 10,
];

if ( ! empty( $requested_data['dokan_seller_search'] ) ) {
    $store_args['meta_query'] = [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
        [
            'key'     => 'dokan_store_name',
            'value'   => $requested_data['dokan_seller_search'],
            'compare' => 'LIKE',
        ],
    ];
}

/** This filter is documented in includes/Shortcodes/Stores.php */
$stores = dokan_get_sellers( apply_filters( 'dokan_seller_listing_args', $store_args, $requested_data ) );

// Hiding every option would leave an empty select, so the whole control goes with them.
$sort_filters = array_diff_key(
    \WeDevs\Dokan\Vendor\StoreListsFilter::sort_by_options(),
    array_flip( array_map( 'sanitize_key', (array) $attributes['hiddenSortOptions'] ) )
);

$sort_by = \WeDevs\Dokan\Vendor\StoreListsFilter::get_requested_sort_by();

// The visitor's sort may be one the editor hid; fall back to a visible option.
if ( ! array_key_exists( $sort_by, $sort_filters ) ) {
    $sort_by = array_key_exists( 'most_recent', $sort_filters ) ? 'most_recent' : (string) key( $sort_filters );
}

// Button colours travel as custom properties; extensions style their own filter controls from the same two.
$dokan_button_color      = Styles::color( $attributes['buttonColor'] );
$dokan_button_text_color = Styles::color( $attributes['buttonTextColor'] );

$wrapper_attributes = get_block_wrapper_attributes(
    [
        'class' => 'dokan-store-filter-bar-block' . ( '' !== $dokan_button_color . $dokan_button_text_color ? ' has-button-color' : '' ),
        'style' => Styles::custom_properties(
            [
                '--dokan-filter-button-background' => $dokan_button_color,
                '--dokan-filter-button-color'      => $dokan_button_text_color,
            ]
        ),
    ]
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php
    \WeDevs\Dokan\Blocks\Manager::dispatch_store_lists_filter_form( $stores );

    dokan_get_template_part(
        'store-lists-filter',
        '',
        [
            'stores'             => $stores,
            'number_of_store'    => absint( $stores['count'] ),
            'sort_filters'       => $sort_filters,
            'sort_by'            => $sort_by,
            'show_store_count'   => (bool) $attributes['showStoreCount'],
            'show_search'        => (bool) $attributes['showSearch'],
            'show_sort'          => (bool) $attributes['showSort'],
            'show_view_toggle'   => (bool) $attributes['showViewToggle'],
            'store_count_text'   => trim( (string) $attributes['storeCountText'] ),
            'filter_button_text' => trim( (string) $attributes['filterButtonText'] ),
            'sort_label'         => trim( (string) $attributes['sortLabel'] ),
            'search_placeholder' => sanitize_text_field( (string) $attributes['searchPlaceholder'] ),
            'apply_text'         => sanitize_text_field( (string) $attributes['applyText'] ),
            'cancel_text'        => sanitize_text_field( (string) $attributes['cancelText'] ),
        ]
    );
    ?>
</div>

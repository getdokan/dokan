<?php
/**
 * Render `dokan/store-list`.
 *
 * Mirrors the `[dokan-stores]` shortcode query path and reuses the
 * `store-lists-loop` template so cards, hooks and pagination stay identical.
 *
 * @since DOKAN_SINCE
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$attributes = wp_parse_args(
    $attributes,
    [
        'perPage'          => 10,
        'columns'          => 3,
        'featured'         => false,
        'category'         => '',
        'storeIds'         => [],
        'withProductsOnly' => false,
        'orderby'          => '',
        'order'            => '',
    ]
);

wp_enqueue_style( 'dokan-style' );
wp_enqueue_style( 'dokan-fontawesome' );
wp_enqueue_style( 'dashicons' );
wp_enqueue_script( 'dokan-script' );

$limit = max( 1, absint( $attributes['perPage'] ) );
$page_num = is_front_page() ? max( 1, absint( get_query_var( 'page' ) ) ) : max( 1, absint( get_query_var( 'paged' ) ) );

// Runtime listing state travels as GET params — shared contract with dokan/store-filter-bar.
$dokan_seller_search = '';
$requested_data      = [];

if ( isset( $_GET['_store_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_store_filter_nonce'] ) ), 'dokan_store_lists_filter_nonce' ) ) {
    $dokan_seller_search = isset( $_GET['dokan_seller_search'] ) ? sanitize_text_field( wp_unslash( $_GET['dokan_seller_search'] ) ) : '';
    $requested_data      = wc_clean( wp_unslash( $_GET ) );
}

// Sorting is whitelisted, so it may travel without the filter-form nonce (e.g. plain sort links).
if ( empty( $requested_data['stores_orderby'] ) && isset( $_GET['stores_orderby'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $stores_orderby = sanitize_text_field( wp_unslash( $_GET['stores_orderby'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

    if ( array_key_exists( $stores_orderby, \WeDevs\Dokan\Vendor\StoreListsFilter::sort_by_options() ) ) {
        $requested_data['stores_orderby'] = $stores_orderby;
    }
}

if ( isset( $_GET['store_categories'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $requested_data['store_categories'] = wc_clean( wp_unslash( $_GET['store_categories'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

$seller_args = [
    'number' => $limit,
    'offset' => ( $page_num - 1 ) * $limit,
    'order'  => 'DESC',
];

if ( ! empty( $dokan_seller_search ) ) {
    $seller_args['meta_query'] = [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
        [
            'key'     => 'dokan_store_name',
            'value'   => $dokan_seller_search,
            'compare' => 'LIKE',
        ],
    ];
}

if ( $attributes['featured'] ) {
    $seller_args['featured'] = 'yes';
}

if ( ! empty( $attributes['category'] ) ) {
    $seller_args['store_category_query'][] = [
        'taxonomy' => 'store_category',
        'field'    => 'slug',
        'terms'    => array_map( 'trim', explode( ',', $attributes['category'] ) ),
    ];
}

if ( ! empty( $attributes['order'] ) && in_array( strtoupper( $attributes['order'] ), [ 'ASC', 'DESC' ], true ) ) {
    $seller_args['order'] = strtoupper( $attributes['order'] );
}

if ( ! empty( $attributes['orderby'] ) ) {
    $seller_args['orderby'] = sanitize_text_field( $attributes['orderby'] );
}

if ( $attributes['withProductsOnly'] ) {
    $seller_args['has_published_posts'] = [ 'product' ];
}

if ( ! empty( $attributes['storeIds'] ) ) {
    $seller_args['include'] = array_map( 'absint', (array) $attributes['storeIds'] );
}

/** This filter is documented in includes/Shortcodes/Stores.php */
$sellers = dokan_get_sellers( apply_filters( 'dokan_seller_listing_args', $seller_args, $requested_data ) );

global $post;
$pagination_base = empty( $post ) ? '' : str_replace( (string) $post->ID, '%#%', esc_url( get_pagenum_link( $post->ID ) ) );

?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'dokan-store-list-block' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php
    dokan_get_template_part(
        'store-lists-loop',
        false,
        [
            'sellers'         => $sellers,
            'limit'           => $limit,
            'offset'          => ( $page_num - 1 ) * $limit,
            'paged'           => $page_num,
            'search_query'    => $dokan_seller_search,
            'pagination_base' => $pagination_base,
            'per_row'         => max( 1, absint( $attributes['columns'] ) ),
            'search_enabled'  => 'yes',
            'image_size'      => 'full',
        ]
    );
    ?>
</div>

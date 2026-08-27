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
        'showAvatar'       => true,
        'defaultStoreName' => '',
        'showFeatured'     => true,
        'showOpenClose'    => true,
        'showRating'       => true,
        'showAddress'      => true,
        'showPhone'        => true,
    ]
);

// Extensions that draw into this block read their own attributes from here — the
// geolocation map is one of them, and its toggle is registered by Dokan Pro.
\WeDevs\Dokan\Blocks\Manager::publish_rendering_attributes( $attributes );

wp_enqueue_style( 'dokan-style' );
wp_enqueue_style( 'dokan-fontawesome' );
wp_enqueue_style( 'dashicons' );
wp_enqueue_script( 'dokan-script' );

$limit = max( 1, absint( $attributes['perPage'] ) );
$page_num = is_front_page() ? max( 1, absint( get_query_var( 'page' ) ) ) : max( 1, absint( get_query_var( 'paged' ) ) );

// Runtime listing state travels as GET params — shared contract with dokan/store-filter-bar.
$requested_data      = \WeDevs\Dokan\Vendor\StoreListsFilter::get_requested_data();
$dokan_seller_search = isset( $requested_data['dokan_seller_search'] ) ? sanitize_text_field( $requested_data['dokan_seller_search'] ) : '';

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
<?php
// The filter bar renders in a request of its own and cannot see this block's
// featured/category/include settings, so it publishes the total it actually matched.
$wrapper_attributes = get_block_wrapper_attributes(
    [
        'class'                  => 'dokan-store-list-block',
        'data-dokan-store-count' => number_format_i18n( absint( $sellers['count'] ) ),
    ]
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php
    // Dispatch first so a module can relocate its markup before the grid renders.
        \WeDevs\Dokan\Blocks\Manager::dispatch_store_lists_filter_form( $sellers );

    /** This action is documented in templates/store-lists.php */
    do_action( 'dokan_before_seller_listing_loop', $sellers );

    dokan_get_template_part(
        'store-lists-loop',
        false,
        [
            'sellers'            => $sellers,
            'limit'              => $limit,
            'offset'             => ( $page_num - 1 ) * $limit,
            'paged'              => $page_num,
            'search_query'       => $dokan_seller_search,
            'pagination_base'    => $pagination_base,
            'per_row'            => max( 1, absint( $attributes['columns'] ) ),
            'search_enabled'     => 'yes',
            'image_size'         => 'full',
            'show_avatar'        => (bool) $attributes['showAvatar'],
            'default_store_name' => sanitize_text_field( (string) $attributes['defaultStoreName'] ),
            'show_featured'      => (bool) $attributes['showFeatured'],
            'show_open_close'    => (bool) $attributes['showOpenClose'],
            'show_rating'        => (bool) $attributes['showRating'],
            'show_address'       => (bool) $attributes['showAddress'],
            'show_phone'         => (bool) $attributes['showPhone'],
        ]
    );

    /** This action is documented in templates/store-lists.php */
    do_action( 'dokan_after_seller_listing_loop', $sellers );
    ?>
</div>

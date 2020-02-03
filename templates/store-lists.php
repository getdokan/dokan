<?php
global $post;

$pagination_base = str_replace( $post->ID, '%#%', esc_url( get_pagenum_link( $post->ID ) ) );

$get_data = wp_unslash( $_GET );

$search_query = null;

if ( 'yes' === $search ) {
    $search_query = isset( $get_data['dokan_seller_search'] ) ? sanitize_text_field( $get_data['dokan_seller_search'] ) : '';
}

if ( apply_filters( 'dokan_store_lists_filter', true ) ) {
    /**
     * Hooks: dokan_store_lists_filter_form
     *
     * @since 2.9.30
     *
     * @hooked \WeDevs\Dokan\Vendor\StoreListsFilter::filter_area() - 10
     */
    do_action( 'dokan_store_lists_filter_form', $sellers );

    add_filter( 'dokan_show_seller_search', '__return_false' );
}

/**
 * Filter to toggle seller search form
 *
 * @since 2.8.6
 *
 * @var bool $show_form
 */
$show_seller_search = apply_filters( 'dokan_show_seller_search', true );

if ( $show_seller_search ) {
    $args = array(
        'search_query'    => $search_query,
        'pagination_base' => $pagination_base,
        'per_row'         => $per_row,
    );

    dokan_get_template_part( 'seller-search-form', false, $args );
}

/**
 *  Added extra search field after store listing search
 *
 * `dokan_after_seller_listing_serach_form` - action
 *
 *  @since 2.5.7
 *
 *  @param array|object $sellers
 */
do_action( 'dokan_after_seller_listing_serach_form', $sellers );

/**
 * Action hook before starting seller listing loop
 *
 * @since 2.8.6
 *
 * @var array $sellers
 */
do_action( 'dokan_before_seller_listing_loop', $sellers );

$template_args = array(
    'sellers'         => $sellers,
    'limit'           => $limit,
    'offset'          => $offset,
    'paged'           => $paged,
    'search_query'    => $search_query,
    'pagination_base' => $pagination_base,
    'per_row'         => $per_row,
    'search_enabled'  => $search,
    'image_size'      => $image_size,
);

dokan_get_template_part( 'store-lists-loop', false, $template_args );

/**
 * Action hook after finishing seller listing loop
 *
 * @since 2.8.6
 *
 * @var array $sellers
 */
do_action( 'dokan_after_seller_listing_loop', $sellers );

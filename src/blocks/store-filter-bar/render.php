<?php
/**
 * Render `dokan/store-filter-bar`.
 *
 * Reproduces the `store-lists-filter` template structure (same ids, classes
 * and hooks, so the legacy store-lists JS keeps working) with per-section
 * visibility toggles. Talks to `dokan/store-list` via GET params only.
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
        'showStoreCount' => true,
        'showSearch'     => true,
        'showSort'       => true,
        'showViewToggle' => true,
    ]
);

wp_enqueue_style( 'dokan-style' );
wp_enqueue_style( 'dashicons' );
wp_enqueue_script( 'dokan-script' );

// The count reflects the filters currently applied to the listing, so it has to
// run the same query the grid does. One row is enough — only the total is used.
$requested_data = [];

if ( isset( $_GET['_store_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_store_filter_nonce'] ) ), 'dokan_store_lists_filter_nonce' ) ) {
    $requested_data = wc_clean( wp_unslash( $_GET ) );
}

if ( isset( $_GET['store_categories'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $requested_data['store_categories'] = wc_clean( wp_unslash( $_GET['store_categories'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

$count_args = [ 'number' => 1 ];

if ( ! empty( $requested_data['dokan_seller_search'] ) ) {
    $count_args['meta_query'] = [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
        [
            'key'     => 'dokan_store_name',
            'value'   => $requested_data['dokan_seller_search'],
            'compare' => 'LIKE',
        ],
    ];
}

/** This filter is documented in includes/Shortcodes/Stores.php */
$stores          = dokan_get_sellers( apply_filters( 'dokan_seller_listing_args', $count_args, $requested_data ) );
$number_of_store = absint( $stores['count'] );
$sort_filters    = \WeDevs\Dokan\Vendor\StoreListsFilter::sort_by_options();

$sort_by = isset( $_GET['stores_orderby'] ) ? sanitize_text_field( wp_unslash( $_GET['stores_orderby'] ) ) : dokan_get_option( 'store_list_sort_by', 'dokan_appearance', 'most_recent' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

if ( ! array_key_exists( $sort_by, $sort_filters ) ) {
    $sort_by = 'most_recent';
}

?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'dokan-store-filter-bar-block' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php do_action( 'dokan_before_store_lists_filter', $stores ); ?>

    <div id="dokan-store-listing-filter-wrap">
        <?php do_action( 'dokan_before_store_lists_filter_left', $stores ); ?>
        <div class="left">
            <?php if ( $attributes['showStoreCount'] ) : ?>
                <p class="item store-count">
                    <?php
                    // translators: 1) number of stores
                    printf( esc_html( _n( 'Total store showing: %s', 'Total stores showing: %s', $number_of_store, 'dokan-lite' ) ), esc_html( number_format_i18n( $number_of_store ) ) );
                    ?>
                </p>
            <?php endif; ?>
        </div>

        <?php do_action( 'dokan_before_store_lists_filter_right', $stores ); ?>
        <div class="right">
            <?php if ( $attributes['showSearch'] ) : ?>
                <div class="item">
                    <div class="dokan-icons">
                        <div class="dokan-icon-div"></div>
                        <div class="dokan-icon-div"></div>
                        <div class="dokan-icon-div"></div>
                    </div>

                    <button class="dokan-store-list-filter-button dokan-btn dokan-btn-theme">
                        <?php esc_html_e( 'Filter', 'dokan-lite' ); ?>
                    </button>
                </div>
            <?php endif; ?>

            <?php if ( $attributes['showSort'] ) : ?>
                <form name="stores_sorting" class="sort-by item" method="get">
                    <label><?php esc_html_e( 'Sort by', 'dokan-lite' ); ?>:</label>

                    <select name="stores_orderby" id="stores_orderby" aria-label="<?php esc_attr_e( 'Sort by', 'dokan-lite' ); ?>">
                        <?php foreach ( $sort_filters as $key => $filter ) : ?>
                            <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $sort_by, $key ); ?>><?php echo esc_html( $filter ); ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            <?php endif; ?>

            <?php if ( $attributes['showViewToggle'] ) : ?>
                <div class="toggle-view item">
                    <span class="dashicons dashicons-screenoptions" data-view="grid-view"></span>
                    <span class="dashicons dashicons-menu-alt" data-view="list-view"></span>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <?php do_action( 'dokan_before_store_lists_filter_form', $stores ); ?>

    <?php if ( $attributes['showSearch'] ) : ?>
        <form role="store-list-filter" method="get" name="dokan_store_lists_filter_form" id="dokan-store-listing-filter-form-wrap" style="display: none">
            <?php
            do_action( 'dokan_before_store_lists_filter_search', $stores );

            if ( apply_filters( 'dokan_load_store_lists_filter_search_bar', true ) ) :
                ?>
                <div class="store-search grid-item">
                    <input type="search" class="store-search-input" name="dokan_seller_search" placeholder="<?php esc_attr_e( 'Search Vendors', 'dokan-lite' ); ?>">
                </div>
                <?php
            endif;

            do_action( 'dokan_before_store_lists_filter_apply_button', $stores );
            ?>

            <div class="apply-filter">
                <button id="cancel-filter-btn" class="dokan-btn dokan-btn-theme"><?php esc_html_e( 'Cancel', 'dokan-lite' ); ?></button>
                <button id="apply-filter-btn" class="dokan-btn dokan-btn-theme" type="submit"><?php esc_html_e( 'Apply', 'dokan-lite' ); ?></button>
            </div>

            <?php do_action( 'dokan_after_store_lists_filter_apply_button', $stores ); ?>
            <?php wp_nonce_field( 'dokan_store_lists_filter_nonce', '_store_filter_nonce', false ); ?>
        </form>
    <?php endif; ?>
</div>

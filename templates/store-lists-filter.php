<?php
/**
 * The template for displaying the store listing filter bar
 *
 * This template can be overridden by copying it to yourtheme/dokan/store-lists-filter.php
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package Dokan/Templates
 * @version DOKAN_SINCE
 *
 * @var array  $stores             Store query result.
 * @var int    $number_of_store    Total stores matching the current filters.
 * @var array  $sort_filters       Sort options, keyed by slug.
 * @var string $sort_by            Selected sort option.
 * @var array  $args               Optional per-section overrides, see the defaults below.
 *
 * Note for overrides: the store filter bar block passes its per-section settings
 * through $args. A copy of this template that predates them keeps working, but it
 * renders the whole bar and silently ignores those block settings.
 *
 * dokan_before_store_lists_filter_left and _right are captured before
 * dokan_before_store_lists_filter runs, so an all-hidden bar with nothing hooked
 * into it prints no empty chrome. Their output still appears in the same place.
 */

defined( 'ABSPATH' ) || exit;

// Only the store listing block passes these; every other caller gets the full bar.
$bar = wp_parse_args(
    isset( $args ) ? $args : [],
    [
        'show_store_count'   => true,
        'show_search'        => true,
        'show_sort'          => true,
        'show_view_toggle'   => true,
        'store_count_text'   => '',
        'filter_button_text' => '',
        'sort_label'         => '',
    ]
);

$sort_label_text = '' !== $bar['sort_label'] ? $bar['sort_label'] : __( 'Sort by', 'dokan-lite' ) . ':';

// Captured so a bar with every section hidden and nothing hooked into it prints no empty chrome.
ob_start();
do_action( 'dokan_before_store_lists_filter_left', $stores );
$left_hook_output = ob_get_clean();

ob_start();
do_action( 'dokan_before_store_lists_filter_right', $stores );
$right_hook_output = ob_get_clean();

$has_bar_content = $bar['show_store_count'] || $bar['show_search'] || $bar['show_sort'] || $bar['show_view_toggle']
    || '' !== trim( $left_hook_output . $right_hook_output );
?>

<?php do_action( 'dokan_before_store_lists_filter', $stores ); ?>

<?php if ( $has_bar_content ) : ?>
    <div id="dokan-store-listing-filter-wrap">
        <?php echo $left_hook_output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        <div class="left">
            <?php if ( $bar['show_store_count'] ) : ?>
                <p class="item store-count">
                    <?php
                    // The number is wrapped so a filtered grid can correct it client-side without reflowing the wording.
                    $store_count_value = '<span class="store-count-value">' . esc_html( number_format_i18n( $number_of_store ) ) . '</span>';

                    if ( '' !== $bar['store_count_text'] ) {
                        // A single placeholder keeps the wording free-form without risking a format error.
                        echo wp_kses_post( str_replace( '%s', $store_count_value, esc_html( $bar['store_count_text'] ) ) );
                    } else {
                        // translators: 1) number of stores
                        printf( esc_html( _n( 'Total store showing: %s', 'Total stores showing: %s', $number_of_store, 'dokan-lite' ) ), wp_kses_post( $store_count_value ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                    }
                    ?>
                </p>
            <?php endif; ?>
        </div>

        <?php echo $right_hook_output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        <div class="right">
            <?php if ( $bar['show_search'] ) : ?>
                <div class="item">
                    <div class="dokan-icons">
                        <div class="dokan-icon-div"></div>
                        <div class="dokan-icon-div"></div>
                        <div class="dokan-icon-div"></div>
                    </div>

                    <button class="dokan-store-list-filter-button dokan-btn dokan-btn-theme">
                        <?php echo esc_html( '' !== $bar['filter_button_text'] ? $bar['filter_button_text'] : __( 'Filter', 'dokan-lite' ) ); ?>
                    </button>
                </div>
            <?php endif; ?>

            <?php if ( $bar['show_sort'] && ! empty( $sort_filters ) ) : ?>
                <form name="stores_sorting" class="sort-by item" method="get">
                    <label for="stores_orderby"><?php echo esc_html( $sort_label_text ); ?></label>

                    <select name="stores_orderby" id="stores_orderby" aria-label="<?php echo esc_attr( $sort_label_text ); ?>">
                        <?php foreach ( $sort_filters as $key => $filter ) : ?>
                            <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $sort_by, $key ); ?>><?php echo esc_html( $filter ); ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            <?php endif; ?>

            <?php if ( $bar['show_view_toggle'] ) : ?>
                <div class="toggle-view item">
                    <?php // Grid is what the listing renders before a saved preference is restored, so mark it now instead of leaving both icons idle. ?>
                    <span class="dashicons dashicons-screenoptions active" data-view="grid-view"></span>
                    <span class="dashicons dashicons-menu-alt" data-view="list-view"></span>
                </div>
            <?php endif; ?>
        </div>
    </div>
<?php endif; ?>

<?php do_action( 'dokan_before_store_lists_filter_form', $stores ); ?>

<?php if ( $bar['show_search'] ) : ?>
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

<?php
/**
 * Dokan Dashboard Product Listing
 * filter template
 *
 * @var int|string           $product_cat
 * @var array<string,string> $product_types
 * @var string               $product_search_name
 * @var string|int           $date
 * @var string               $product_type
 * @var string               $filter_by_other
 * @var string               $post_status
 *
 * @since 2.4
 */

do_action( 'dokan_product_listing_filter_before_form' );
?>

    <form class="dokan-form-inline dokan-w8 dokan-product-date-filter" method="get" >
        <?php do_action( 'dokan_product_listing_filter_from_start', [] ); ?>
        <div class="dokan-form-group">
            <?php dokan_product_listing_filter_months_dropdown( dokan_get_current_user_id() ); ?>
        </div>

        <div class="dokan-form-group">
            <?php
            wp_dropdown_categories(
                apply_filters(
                    'dokan_product_cat_dropdown_args',
                    [
                        'show_option_none' => __( '- Select a category -', 'dokan-lite' ),
                        'hierarchical'     => 1,
                        'hide_empty'       => 0,
                        'name'             => 'product_cat',
                        'id'               => 'product_cat',
                        'taxonomy'         => 'product_cat',
                        'orderby'          => 'name',
                        'order'            => 'ASC',
                        'title_li'         => '',
                        'class'            => 'product_cat dokan-form-control chosen',
                        'exclude'          => '',
                        'selected'         => $product_cat,
                    ]
                )
            );
            ?>
        </div>

        <?php if ( is_array( $product_types ) ) : ?>
            <div class="dokan-form-group">
                <select name="product_type" id="filter-by-type" class="dokan-form-control" style="max-width:140px;">
                    <option value=""><?php esc_html_e( 'Product type', 'dokan-lite' ); ?></option>
                    <?php foreach ( $product_types as $type_key => $p_type ) : ?>
                        <option value="<?php echo esc_attr( $type_key ); ?>" <?php selected( $product_type, $type_key ); ?>>
                            <?php echo esc_html( $p_type ); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        <?php endif; ?>

        <?php do_action( 'dokan_product_listing_filter_from_end', [] ); ?>

        <?php if ( ! empty( $product_search_name ) ) : ?>
            <input type="hidden" name="product_search_name" value="<?php echo esc_attr( $product_search_name ); ?>">
        <?php endif; ?>

        <?php if ( ! empty( $post_status ) ) : ?>
            <input type="hidden" name="post_status" value="<?php echo esc_attr( $post_status ); ?>">
        <?php endif; ?>

        <?php wp_nonce_field( 'product_listing_filter', '_product_listing_filter_nonce', false ); ?>

        <div class="dokan-form-group">
            <button type="submit" class="dokan-btn"><?php esc_html_e( 'Filter', 'dokan-lite' ); ?></button>
            <a class="dokan-btn" href="<?php echo esc_attr( dokan_get_navigation_url( 'products' ) ); ?>"><?php esc_html_e( 'Reset', 'dokan-lite' ); ?></a>
        </div>
    </form>

    <?php do_action( 'dokan_product_listing_filter_before_search_form' ); ?>

    <form method="get" class="dokan-form-inline dokan-w5 dokan-product-search-form">

        <button type="submit" name="product_listing_search" value="ok" class="dokan-btn dokan-btn-theme"><?php esc_html_e( 'Search', 'dokan-lite' ); ?></button>

        <?php wp_nonce_field( 'product_listing_filter', '_product_listing_filter_nonce', false ); ?>

        <div class="dokan-form-group">
            <input type="text" class="dokan-form-control" name="product_search_name" placeholder="<?php esc_html_e( 'Search Products', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $product_search_name ); ?>">
        </div>

        <input type="hidden" name="product_cat" value="<?php echo esc_attr( $product_cat ); ?>">

        <?php if ( ! empty( $date ) ) : ?>
            <input type="hidden" name="date" value="<?php echo esc_attr( $date ); ?>">
        <?php endif; ?>

        <?php if ( ! empty( $product_type ) ) : ?>
            <input type="hidden" name="product_type" value="<?php echo esc_attr( $product_type ); ?>">
        <?php endif; ?>

        <?php if ( ! empty( $post_status ) ) : ?>
            <input type="hidden" name="post_status" value="<?php echo esc_attr( $post_status ); ?>">
        <?php endif; ?>
    </form>

    <?php do_action( 'dokan_product_listing_filter_after_form' ); ?>

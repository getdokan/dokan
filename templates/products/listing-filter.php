<?php
/**
 * Dokan Dashboard Product Listing
 * filter template
 *
 * @since 2.4
 */
$get_data  = wp_unslash( $_GET ); // WPCS: CSRF ok.
$post_data = wp_unslash( $_POST ); // WPCS: CSRF ok.

do_action( 'dokan_product_listing_filter_before_form' );
$product_types = apply_filters( 'dokan_product_types', ['simple'] );
$product_type  = isset( $get_data['product_type'] ) ? $get_data['product_type'] : ''; 
?>

    <form class="dokan-form-inline dokan-w8 dokan-product-date-filter" method="get" >
        <?php do_action( 'dokan_product_listing_filter_from_start', $get_data ); ?>
        <div class="dokan-form-group">
            <?php dokan_product_listing_filter_months_dropdown( dokan_get_current_user_id() ); ?>
        </div>

        <div class="dokan-form-group">
            <?php
                wp_dropdown_categories( [
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
                    'selected'         => isset( $get_data['product_cat'] ) ? $get_data['product_cat'] : '-1',
                ] );
            ?>
        </div>

        <?php if ( is_array( $product_types ) ) : ?>
            <div class="dokan-form-group">
                <select name="product_type" id="filter-by-type" class="dokan-form-control" style="max-width:140px;">
                    <option value=""><?php esc_html_e( 'Product type', 'dokan-lite' ); ?></option>
                    <?php foreach ( $product_types as $type_key => $p_type ) : ?>
                        <option value="<?php echo esc_attr( $type_key ); ?>" <?php echo selected( $product_type, $type_key ); ?>><?php echo esc_html( $p_type ); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        <?php endif; ?>

        <?php do_action( 'dokan_product_listing_filter_from_end', $get_data ); ?>

        <?php
        if ( isset( $get_data['product_search_name'] ) ) { ?>
            <input type="hidden" name="product_search_name" value="<?php echo esc_attr( $get_data['product_search_name'] ); ?>">
        <?php }
        ?>

        <button type="submit" name="product_listing_filter" value="ok" class="dokan-btn"><?php esc_html_e( 'Filter', 'dokan-lite' ); ?></button>

    </form>

    <?php do_action( 'dokan_product_listing_filter_before_search_form' ); ?>

    <form method="get" class="dokan-form-inline dokan-w5 dokan-product-search-form">

        <button type="submit" name="product_listing_search" value="ok" class="dokan-btn"><?php esc_html_e( 'Search', 'dokan-lite' ); ?></button>

        <?php wp_nonce_field( 'dokan_product_search', 'dokan_product_search_nonce' ); ?>

        <div class="dokan-form-group">
            <input type="text" class="dokan-form-control" name="product_search_name" placeholder="<?php esc_html_e( 'Search Products', 'dokan-lite' ); ?>" value="<?php echo isset( $get_data['product_search_name'] ) ? esc_attr( $get_data['product_search_name'] ) : ''; ?>">
        </div>

        <?php
        if ( isset( $get_data['product_cat'] ) ) { ?>
            <input type="hidden" name="product_cat" value="<?php echo esc_attr( $get_data['product_cat'] ); ?>">
        <?php }

        if ( isset( $get_data['date'] ) ) { ?>
            <input type="hidden" name="date" value="<?php echo esc_attr( $get_data['date'] ); ?>">
        <?php }
        ?>
    </form>

    <?php do_action( 'dokan_product_listing_filter_after_form' ); ?>

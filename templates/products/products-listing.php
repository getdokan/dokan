<?php
    global $post;
?>

<div class="dokan-dashboard-wrap">

    <?php

        /**
         *  dokan_dashboard_content_before hook
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );
        ?>

        <div class="dokan-dashboard-content dokan-product-listing">

            <?php

            /**
             *  dokan_dashboard_content_before hook
             *
             *  @hooked get_dashboard_side_navigation
             *
             *  @since 2.4
             */
            do_action( 'dokan_dashboard_content_inside_before' );
            do_action( 'dokan_before_listing_product' );
            ?>

            <article class="dokan-product-listing-area">

                <div class="product-listing-top dokan-clearfix">
                    <?php dokan_product_listing_status_filter(); ?>

                    <?php if ( dokan_is_seller_enabled( get_current_user_id() ) ): ?>
                        <span class="dokan-add-product-link">
                            <?php if ( current_user_can( 'dokan_add_product' ) ): ?>
                                <a href="<?php echo dokan_get_navigation_url( 'new-product' ); ?>" class="dokan-btn dokan-btn-theme <?php echo ( 'on' == dokan_get_option( 'disable_product_popup', 'dokan_selling', 'off' ) ) ? '' : 'dokan-add-new-product'; ?>">
                                    <i class="fa fa-briefcase">&nbsp;</i>
                                    <?php _e( 'Add new product', 'dokan-lite' ); ?>
                                </a>
                            <?php endif ?>

                            <?php
                                do_action( 'dokan_after_add_product_btn' );
                            ?>
                        </span>
                    <?php endif; ?>
                </div>

                <?php dokan_product_dashboard_errors(); ?>

                <div class="dokan-w12">
                    <?php dokan_product_listing_filter(); ?>
                </div>

                <div class="dokan-dashboard-product-listing-wrapper">

                    <form id="product-filter" method="POST" class="dokan-form-inline">
                        <div class="dokan-form-group">
                            <label for="bulk-product-action-selector" class="screen-reader-text"><?php _e( 'Select bulk action', 'dokan-lite' ); ?></label>

                            <select name="status" id="bulk-product-action-selector" class="dokan-form-control chosen">
                                <?php foreach ( $bulk_statuses as $key => $bulk_status ) : ?>
                                    <option class="bulk-product-status" value="<?php echo esc_attr( $key ) ?>"><?php echo esc_attr( $bulk_status ); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="dokan-form-group">
                            <?php wp_nonce_field( 'bulk_product_status_change', 'security' ); ?>
                            <input type="submit" name="bulk_product_status_change" id="bulk-product-action" class="dokan-btn dokan-btn-theme" value="<?php esc_attr_e( 'Apply', 'dokan-lite' ); ?>">
                        </div>
                        <table class="dokan-table dokan-table-striped product-listing-table">
                            <thead>
                                <tr>
                                    <th id="cb" class="manage-column column-cb check-column">
                                        <label for="cb-select-all"></label>
                                        <input id="cb-select-all" class="dokan-checkbox" type="checkbox">
                                    </th>
                                    <th><?php _e( 'Image', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Name', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Status', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'SKU', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Stock', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Price', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Earning', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Type', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Views', 'dokan-lite' ); ?></th>
                                    <th><?php _e( 'Date', 'dokan-lite' ); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $pagenum       = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;
                                $post_statuses = array( 'publish', 'draft', 'pending' );
                                $args = array(
                                    'posts_per_page' => 10,
                                    'paged'          => $pagenum,
                                    'author'         => get_current_user_id(),
                                    'tax_query'      => array(
                                        array(
                                            'taxonomy' => 'product_type',
                                            'field'    => 'slug',
                                            'terms'    => apply_filters( 'dokan_product_listing_exclude_type', array() ),
                                            'operator' => 'NOT IN',
                                        ),
                                    ),
                                );

                                if ( isset( $_GET['post_status']) && in_array( $_GET['post_status'], $post_statuses ) ) {
                                    $args['post_status'] = $_GET['post_status'];
                                }

                                if( isset( $_GET['date'] ) && $_GET['date'] != 0 ) {
                                    $args['m'] = $_GET['date'];
                                }

                                if( isset( $_GET['product_cat'] ) && $_GET['product_cat'] != -1 ) {
                                    $args['tax_query'][] = array(
                                        'taxonomy' => 'product_cat',
                                        'field' => 'id',
                                        'terms' => (int)  $_GET['product_cat'],
                                        'include_children' => false,
                                    );
                                }

                                if ( isset( $_GET['product_search_name']) && !empty( $_GET['product_search_name'] ) ) {
                                    $args['s'] = $_GET['product_search_name'];
                                }

                                $original_post = $post;
                                $product_query = dokan()->product->all( apply_filters( 'dokan_product_listing_arg', $args ) );

                                if ( $product_query->have_posts() ) {
                                    while ($product_query->have_posts()) {
                                        $product_query->the_post();

                                        $row_actions = dokan_product_get_row_action( $post );
                                        $tr_class = ($post->post_status == 'pending' ) ? ' class="danger"' : '';
                                        $view_class = ($post->post_status == 'pending' ) ? 'dokan-hide' : '';
                                        $product = wc_get_product( $post->ID );
                                        ?>
                                        <tr<?php echo $tr_class; ?>>
                                            <td class="dokan-product-select">
                                                <label for="cb-select-<?php echo esc_attr( $post->ID ); ?>"></label>
                                                <input class="cb-select-items dokan-checkbox" type="checkbox" name="bulk_products[]" value="<?php echo esc_attr( $post->ID ); ?>">
                                            </td>
                                            <td data-title="<?php _e( 'Image', 'dokan-lite' ); ?>">
                                                <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
                                                    <a href="<?php echo dokan_edit_product_url( $post->ID ); ?>"><?php echo $product->get_image(); ?></a>
                                                <?php else: ?>
                                                    <?php echo $product->get_image(); ?>
                                                <?php endif ?>
                                            </td>
                                            <td data-title="<?php _e( 'Name', 'dokan-lite' ); ?>">
                                                <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
                                                    <p><a href="<?php echo dokan_edit_product_url( $post->ID ); ?>"><?php echo $product->get_title(); ?></a></p>
                                                <?php else: ?>
                                                    <p><a href=""><?php echo $product->get_title(); ?></a></p>
                                                <?php endif ?>

                                                <?php if ( !empty( $row_actions ) ): ?>
                                                    <div class="row-actions">
                                                        <?php echo $row_actions; ?>
                                                    </div>
                                                <?php endif ?>
                                            </td>
                                            <td class="post-status" data-title="<?php _e( 'Status', 'dokan-lite' ); ?>">
                                                <label class="dokan-label <?php echo dokan_get_post_status_label_class( $post->post_status ); ?>"><?php echo dokan_get_post_status( $post->post_status ); ?></label>
                                            </td>
                                            <td data-title="<?php _e( 'SKU', 'dokan-lite' ); ?>">
                                                <?php
                                                if ( $product->get_sku() ) {
                                                    echo $product->get_sku();
                                                } else {
                                                    echo '<span class="na">&ndash;</span>';
                                                }
                                                ?>
                                            </td>
                                            <td data-title="<?php _e( 'Stock', 'dokan-lite' ); ?>">
                                                <?php
                                                if ( $product->is_in_stock() ) {
                                                    echo '<mark class="instock">' . __( 'In stock', 'dokan-lite' ) . '</mark>';
                                                } else {
                                                    echo '<mark class="outofstock">' . __( 'Out of stock', 'dokan-lite' ) . '</mark>';
                                                }

                                                if ( $product->managing_stock() ) :
                                                    echo ' &times; ' . $product->get_stock_quantity();
                                                endif;
                                                ?>
                                            </td>
                                            <td data-title="<?php _e( 'Price', 'dokan-lite' ); ?>">
                                                <?php
                                                if ( $product->get_price_html() ) {
                                                    echo $product->get_price_html();
                                                } else {
                                                    echo '<span class="na">&ndash;</span>';
                                                }
                                                ?>
                                            </td>
                                            <td data-title="<?php _e( 'Earning', 'dokan-lite' ); ?>">
                                                <?php
                                                if ( $product->get_type() == 'simple' ) {
                                                    echo wc_price( dokan_get_earning_by_product( $product->get_id(), get_current_user_id() ) );
                                                } else {
                                                    echo "-";
                                                }
                                                ?>
                                            </td>
                                            <td data-title="<?php _e( 'Type', 'dokan-lite' ); ?>">
                                                <?php
                                                if( dokan_get_prop( $product, 'product_type' , 'get_type') == 'grouped' ):
                                                    echo '<span class="product-type tips grouped" title="' . __( 'Grouped', 'dokan-lite' ) . '"></span>';
                                                elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'external' ):
                                                    echo '<span class="product-type tips external" title="' . __( 'External/Affiliate', 'dokan-lite' ) . '"></span>';
                                                elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'simple' ):

                                                    if ( $product->is_virtual() ) {
                                                        echo '<span class="product-type tips virtual" title="' . __( 'Virtual', 'dokan-lite' ) . '"></span>';
                                                    } elseif ( $product->is_downloadable() ) {
                                                        echo '<span class="product-type tips downloadable" title="' . __( 'Downloadable', 'dokan-lite' ) . '"></span>';
                                                    } else {
                                                        echo '<span class="product-type tips simple" title="' . __( 'Simple', 'dokan-lite' ) . '"></span>';
                                                    }

                                                    elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'variable' ):
                                                        echo '<span class="product-type tips variable" title="' . __( 'Variable', 'dokan-lite' ) . '"></span>';
                                                    else:
                                                        // Assuming that we have other types in future
                                                        echo '<span class="product-type tips ' . dokan_get_prop( $product, 'product_type' , 'get_type') . '" title="' . ucfirst( dokan_get_prop( $product, 'product_type' , 'get_type') ) . '"></span>';
                                                endif;
                                                ?>
                                            </td>
                                            <td data-title="<?php _e( 'Views', 'dokan-lite' ); ?>">
                                                <?php echo (int) get_post_meta( $post->ID, 'pageview', true ); ?>
                                            </td>
                                            <td class="post-date" data-title="<?php _e( 'Date', 'dokan-lite' ); ?>">
                                                <?php
                                                if ( '0000-00-00 00:00:00' == $post->post_date ) {
                                                    $t_time = $h_time = __( 'Unpublished', 'dokan-lite' );
                                                    $time_diff = 0;
                                                } else {
                                                    $t_time = get_the_time( __( 'Y/m/d g:i:s A', 'dokan-lite' ) );
                                                    $m_time = $post->post_date;
                                                    $time = get_post_time( 'G', true, $post );

                                                    $time_diff = time() - $time;

                                                    if ( $time_diff > 0 && $time_diff < 24 * 60 * 60 ) {
                                                        $h_time = sprintf( __( '%s ago', 'dokan-lite' ), human_time_diff( $time ) );
                                                    } else {
                                                        $h_time = mysql2date( __( 'Y/m/d', 'dokan-lite' ), $m_time );
                                                    }
                                                }

                                                echo '<abbr title="' . dokan_date_time_format( $t_time ) . '">' . apply_filters( 'post_date_column_time', dokan_date_time_format( $h_time, true ), $post, 'date', 'all' ) . '</abbr>';
                                                echo '<div class="status">';
                                                if ( 'publish' == $post->post_status ) {
                                                    _e( 'Published', 'dokan-lite' );
                                                } elseif ( 'future' == $post->post_status ) {
                                                    if ( $time_diff > 0 ) {
                                                        echo '<strong class="attention">' . __( 'Missed schedule', 'dokan-lite' ) . '</strong>';
                                                    } else {
                                                        _e( 'Scheduled', 'dokan-lite' );
                                                    }
                                                } else {
                                                    _e( 'Last Modified', 'dokan-lite' );
                                                }
                                                ?>
                                                </div>
                                            </td>
                                            <td class="diviader"></td>
                                        </tr>

                                    <?php } ?>

                                    <?php } else { ?>
                                        <tr>
                                            <td colspan="7"><?php _e( 'No product found', 'dokan-lite' ); ?></td>
                                        </tr>
                                    <?php } ?>

                            </tbody>

                        </table>
                    </form>
                </div>
                    <?php
                    wp_reset_postdata();

                    $pagenum      = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;
                    $base_url = dokan_get_navigation_url('products');

                    if ( $product_query->max_num_pages > 1 ) {
                        echo '<div class="pagination-wrap">';
                        $page_links = paginate_links( array(
                            'current'   => $pagenum,
                            'total'     => $product_query->max_num_pages,
                            'base'      => $base_url. '%_%',
                            'format'    => '?pagenum=%#%',
                            'add_args'  => false,
                            'type'      => 'array',
                            'prev_text' => __( '&laquo; Previous', 'dokan-lite' ),
                            'next_text' => __( 'Next &raquo;', 'dokan-lite' )
                            ) );

                        echo '<ul class="pagination"><li>';
                        echo join("</li>\n\t<li>", $page_links);
                        echo "</li>\n</ul>\n";
                        echo '</div>';
                    }
                    ?>
                </article>

                <?php

            /**
             *  dokan_dashboard_content_before hook
             *
             *  @hooked get_dashboard_side_navigation
             *
             *  @since 2.4
             */
            do_action( 'dokan_dashboard_content_inside_after' );
            do_action( 'dokan_after_listing_product' );
            ?>

        </div><!-- #primary .content-area -->

        <?php

        /**
         *  dokan_dashboard_content_after hook
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );
        ?>

    </div><!-- .dokan-dashboard-wrap -->

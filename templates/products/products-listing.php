<?php
    global $post;
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

<div class="dokan-dashboard-wrap">

    <?php

        /**
         *  Adding dokan_dashboard_content_before hook
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
             *  Adding dokan_dashboard_content_before hook
             *
             *  @hooked get_dashboard_side_navigation
             *
             *  @since 2.4
             */
            do_action( 'dokan_dashboard_content_inside_before' );
            do_action( 'dokan_before_listing_product' );
            ?>

                <article class="dokan-product-listing-area">

                    <?php
                    $disable_product_popup = 'on' === dokan_get_option( 'disable_product_popup', 'dokan_selling', 'off' );
                    $new_product_url       = add_query_arg(
                        [
                            '_dokan_add_product_nonce' => wp_create_nonce( 'dokan_add_product_nonce' ),
                        ],
                        dokan_get_navigation_url( 'new-product' )
                    );
                    $product_listing_args  = [
                        'author'            => dokan_get_current_user_id(),
                        'posts_per_page'    => 1,
                        'post_status'       => apply_filters( 'dokan_product_listing_post_statuses', [ 'publish', 'draft', 'pending', 'future' ] ),
                    ];
                    $product_query = dokan()->product->all( $product_listing_args );

                    if ( $product_query->have_posts() ) {
                        ?>

                        <div class="product-listing-top dokan-clearfix">
                            <?php dokan_product_listing_status_filter(); ?>

                            <?php if ( dokan_is_seller_enabled( dokan_get_current_user_id() ) ) : ?>
                                <span class="dokan-add-product-link">
                                    <?php if ( current_user_can( 'dokan_add_product' ) ) : ?>
                                        <a href="<?php echo esc_url( $new_product_url ); ?>" class="dokan-btn dokan-btn-theme <?php echo $disable_product_popup ? '' : 'dokan-add-new-product'; ?>">
                                            <i class="fas fa-briefcase">&nbsp;</i>
                                            <?php esc_html_e( 'Add new product', 'dokan-lite' ); ?>
                                        </a>
                                    <?php endif; ?>

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
                                    <label for="bulk-product-action-selector" class="screen-reader-text"><?php esc_html_e( 'Select bulk action', 'dokan-lite' ); ?></label>

                                    <select name="status" id="bulk-product-action-selector" class="dokan-form-control chosen">
                                        <?php foreach ( $bulk_statuses as $key => $bulk_status ) : ?>
                                            <option class="bulk-product-status" value="<?php echo esc_attr( $key ); ?>"><?php echo esc_attr( $bulk_status ); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div class="dokan-form-group">
                                    <?php wp_nonce_field( 'bulk_product_status_change', 'security' ); ?>
                                    <input
                                        type="submit"
                                        name="bulk_product_status_change"
                                        id="bulk-product-action"
                                        class="dokan-btn dokan-btn-theme"
                                        value="<?php esc_attr_e( 'Apply', 'dokan-lite' ); ?>"
                                        onClick="dokan_bulk_delete_prompt( event, '<?php esc_attr_e( 'Are you sure?', 'dokan-lite' ); ?>', '#bulk-product-action-selector', '#product-filter' )"
                                    />
                                </div>
                                <table class="dokan-table dokan-table-striped product-listing-table dokan-inline-editable-table" id="dokan-product-list-table">
                                    <thead>
                                        <tr>
                                            <th id="cb" class="manage-column column-cb check-column">
                                                <label for="cb-select-all"></label>
                                                <input id="cb-select-all" class="dokan-checkbox" type="checkbox">
                                            </th>
                                            <th><?php esc_html_e( 'Image', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Name', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Status', 'dokan-lite' ); ?></th>

                                            <?php do_action( 'dokan_product_list_table_after_status_table_header' ); ?>

                                            <th><?php esc_html_e( 'SKU', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Stock', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Price', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Type', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Views', 'dokan-lite' ); ?></th>
                                            <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    <?php do_action( 'dokan_product_list_before_table_body_start' ); ?>
                                        <?php
                                        $post_statuses  = apply_filters( 'dokan_product_listing_post_statuses', [ 'publish', 'draft', 'pending', 'future' ] );
                                        $stock_statuses = apply_filters( 'dokan_product_stock_statuses', [ 'instock', 'outofstock' ] );
                                        $product_types  = apply_filters( 'dokan_product_types', [ 'simple' => __( 'Simple', 'dokan-lite' ) ] );

                                        $args = array(
                                            'posts_per_page' => 15,
                                            'paged'          => 1,
                                            'author'         => dokan_get_current_user_id(),
                                            'post_status'    => $post_statuses,
                                            'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
                                                array(
                                                    'taxonomy' => 'product_type',
                                                    'field'    => 'slug',
                                                    'terms'    => apply_filters( 'dokan_product_listing_exclude_type', array() ),
                                                    'operator' => 'NOT IN',
                                                ),
                                            ),
                                        );

                                        if ( isset( $_GET['_product_listing_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_product_listing_filter_nonce'] ) ), 'product_listing_filter' ) ) {
                                            if ( isset( $_GET['pagenum'] ) ) {
                                                $args['paged'] = absint( $_GET['pagenum'] );
                                            }

                                            if ( isset( $_GET['post_status'] ) && in_array( $_GET['post_status'], $post_statuses, true ) ) {
                                                $args['post_status'] = sanitize_text_field( wp_unslash( $_GET['post_status'] ) );
                                            }

                                            if ( isset( $_GET['date'] ) && $_GET['date'] !== 0 ) {
                                                $args['m'] = sanitize_text_field( wp_unslash( $_GET['date'] ) );
                                            }

                                            if ( isset( $_GET['product_cat'] ) && intval( $_GET['product_cat'] ) !== -1 ) {
                                                $args['tax_query'][] = array(
                                                    'taxonomy' => 'product_cat',
                                                    'field' => 'id',
                                                    'terms' => intval( $_GET['product_cat'] ),
                                                    'include_children' => false,
                                                );
                                            }

                                            if ( ! empty( $_GET['product_type'] ) ) {
                                                $product_type = sanitize_text_field( wp_unslash( $_GET['product_type'] ) );
                                                if ( array_key_exists( $product_type, $product_types ) ) {
                                                    $args['tax_query'][] = [
                                                        'taxonomy' => 'product_type',
                                                        'field'    => 'slug',
                                                        'terms'    => $product_type,
                                                    ];
                                                }
                                            }

                                            if ( ! empty( $_GET['product_search_name'] ) ) {
                                                $args['s'] = sanitize_text_field( wp_unslash( $_GET['product_search_name'] ) );
                                            }

                                            if ( isset( $_GET['post_status'] ) && in_array( $_GET['post_status'], $stock_statuses, true ) ) {
                                                $args['meta_query'][] = array(
                                                    'key' => '_stock_status',
                                                    'value' => sanitize_text_field( wp_unslash( $_GET['post_status'] ) ),
                                                    'compare' => '=',
                                                );
                                            }
                                        }

                                        $original_post = $post;
                                        $product_args  = apply_filters( 'dokan_pre_product_listing_args', $args, [] );
                                        $product_query = dokan()->product->all( apply_filters( 'dokan_product_listing_arg', $product_args ) );

                                        if ( $product_query->have_posts() ) {
                                            while ( $product_query->have_posts() ) {
                                                $product_query->the_post();

                                                $row_actions = dokan_product_get_row_action( $post );
                                                $tr_class = ( $post->post_status === 'pending' ) ? 'danger' : '';
                                                $view_class = ( $post->post_status === 'pending' ) ? 'dokan-hide' : '';
                                                $product = wc_get_product( $post->ID );

                                                $row_args = array(
                                                    'post' => $post,
                                                    'product' => $product,
                                                    'tr_class' => $tr_class,
                                                    'row_actions' => $row_actions,
                                                );

                                                dokan_get_template_part( 'products/products-listing-row', '', $row_args );

                                                do_action( 'dokan_product_list_table_after_row', $product, $post );
                                            }
                                        } else {
                                            ?>
                                            <tr>
                                                <td colspan="11"><?php esc_html_e( 'No product found', 'dokan-lite' ); ?></td>
                                            </tr>
                                        <?php } ?>
                                    </tbody>

                                </table>
                            </form>
                        </div>
                        <?php
                        wp_reset_postdata();

                        $pagenum  = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;
                        $base_url = dokan_get_navigation_url( 'products' );

                        if ( $product_query->max_num_pages > 1 ) {
                            echo '<div class="pagination-wrap">';
                            $page_links = paginate_links(
                                array(
                                    'current'   => $pagenum,
                                    'total'     => $product_query->max_num_pages,
                                    'base'      => $base_url . '%_%',
                                    'format'    => '?pagenum=%#%',
                                    'add_args'  => [
                                        '_product_listing_filter_nonce' => wp_create_nonce( 'product_listing_filter' ),
                                    ],
                                    'type'      => 'array',
                                    'prev_text' => __( '&laquo; Previous', 'dokan-lite' ),
                                    'next_text' => __( 'Next &raquo;', 'dokan-lite' ),
                                )
                            );

                            echo '<ul class="pagination"><li>';
                            echo join( "</li>\n\t<li>", $page_links ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
                            echo "</li>\n</ul>\n";
                            echo '</div>';
                        }
                        ?>
                        <?php
                    } else {
                        ?>
                        <div class="dokan-dashboard-product-listing-wrapper dokan-dashboard-not-product-found">
                            <img src="<?php echo esc_url( plugins_url( 'assets/images/no-product-found.svg', DOKAN_FILE ) ); ?>" alt="dokan setup" class="no-product-found-icon">
                            <h4 class="dokan-blank-product-message">
                                <?php esc_html_e( 'No Products Found!', 'dokan-lite' ); ?>
                            </h4>

                            <?php if ( dokan_is_seller_enabled( dokan_get_current_user_id() ) ) : ?>
                                <h2 class="dokan-blank-product-message">
                                    <?php esc_html_e( 'Ready to start selling something awesome?', 'dokan-lite' ); ?>
                                </h2>

                                <span class="dokan-add-product-link">
                                    <?php if ( current_user_can( 'dokan_add_product' ) ) : ?>
                                        <a href="<?php echo esc_url( $new_product_url ); ?>" class="dokan-btn dokan-btn-theme <?php echo $disable_product_popup ? '' : 'dokan-add-new-product'; ?>">
                                            <i class="fas fa-briefcase">&nbsp;</i>
                                            <?php esc_html_e( 'Add new product', 'dokan-lite' ); ?>
                                        </a>
                                    <?php endif ?>

                                    <?php
                                        do_action( 'dokan_after_add_product_btn' );
                                    ?>
                                </span>
                            <?php endif; ?>
                        </div>
                    <?php } ?>
                </article>

                <?php

                /**
                 *  Adding dokan_dashboard_content_before hook
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
         *  Adding dokan_dashboard_content_after hook
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );
        ?>

    </div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>

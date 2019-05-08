<div id="dokan-seller-listing-wrap">
    <div class="seller-listing-content">
        <?php if ( $sellers['users'] ) : ?>
            <ul class="dokan-seller-wrap">
                <?php
                foreach ( $sellers['users'] as $seller ) {
                    $store_info      = dokan_get_store_info( $seller->ID );
                    $banner_id       = ! empty( $store_info['banner_id'] ) ? $store_info['banner_id'] : 0;
                    $banner_id       = ! empty( $store_info['banner'] ) ? $store_info['banner'] : $banner_id;
                    $store_name      = isset( $store_info['store_name'] ) ? esc_html( $store_info['store_name'] ) : __( 'N/A', 'dokan-lite' );
                    $store_url       = dokan_get_store_url( $seller->ID );
                    $store_address   = dokan_get_seller_short_address( $seller->ID );
                    $seller_rating   = dokan_get_seller_rating( $seller->ID );
                    $banner_url      = ( $banner_id ) ? wp_get_attachment_image_src( $banner_id, $image_size ) : DOKAN_PLUGIN_ASSEST . '/images/default-store-banner.png';
                    $featured_seller = get_user_meta( $seller->ID, 'dokan_feature_seller', true );
                    ?>

                    <li class="dokan-single-seller woocommerce coloum-<?php echo esc_attr( $per_row ); ?> <?php echo ( ! $banner_id ) ? 'no-banner-img' : ''; ?>">
                        <div class="store-wrapper">
                            <div class="store-content">
                                <div class="store-info" style="background-image: url( '<?php echo is_array( $banner_url ) ? esc_attr( $banner_url[0] ) : esc_attr( $banner_url ); ?>');">
                                    <div class="store-data-container">
                                        <div class="featured-favourite">
                                            <?php if ( ! empty( $featured_seller ) && 'yes' == $featured_seller ): ?>
                                                <div class="featured-label"><?php esc_html_e( 'Featured', 'dokan-lite' ); ?></div>
                                            <?php endif ?>

                                            <?php do_action( 'dokan_seller_listing_after_featured', $seller, $store_info ); ?>
                                        </div>

                                        <div class="store-data">
                                            <h2><a href="<?php echo esc_attr($store_url); ?>"><?php echo esc_html($store_name); ?></a></h2>

                                            <?php if ( !empty( $seller_rating['count'] ) ): ?>
                                                <div class="star-rating dokan-seller-rating" title="<?php echo sprintf( esc_attr__( 'Rated %s out of 5', 'dokan-lite' ), esc_attr( $seller_rating['rating'] ) ) ?>">
                                                    <span style="width: <?php echo ( esc_attr( ($seller_rating['rating']/5) ) * 100 - 1 ); ?>%">
                                                        <strong class="rating"><?php echo esc_html( $seller_rating['rating'] ); ?></strong> out of 5
                                                    </span>
                                                </div>
                                            <?php endif ?>

                                            <?php if ( $store_address ): ?>
                                                <?php
                                                    $allowed_tags = array(
                                                        'span' => array(
                                                            'class' => array(),
                                                        ),
                                                        'br' => array()
                                                    );
                                                ?>
                                                <p class="store-address"><?php echo wp_kses( $store_address, $allowed_tags ); ?></p>
                                            <?php endif ?>

                                            <?php if ( !empty( $store_info['phone'] ) ) { ?>
                                                <p class="store-phone">
                                                    <i class="fa fa-phone" aria-hidden="true"></i> <?php echo esc_html( $store_info['phone'] ); ?>
                                                </p>
                                            <?php } ?>

                                            <?php do_action( 'dokan_seller_listing_after_store_data', $seller, $store_info ); ?>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="store-footer">
                                <div class="seller-avatar">
                                    <?php echo get_avatar( $seller->ID, 150 ); ?>
                                </div>
                                <a href="<?php echo esc_url( $store_url ); ?>" class="dokan-btn dokan-btn-theme"><?php esc_html_e( 'Visit Store', 'dokan-lite' ); ?></a>

                                <?php do_action( 'dokan_seller_listing_footer_content', $seller, $store_info ); ?>
                            </div>
                        </div>
                    </li>

                <?php } ?>
                <div class="dokan-clearfix"></div>
            </ul> <!-- .dokan-seller-wrap -->

            <?php
            $user_count   = $sellers['count'];
            $num_of_pages = ceil( $user_count / $limit );

            if ( $num_of_pages > 1 ) {
                echo '<div class="pagination-container clearfix">';

                $pagination_args = array(
                    'current'   => $paged,
                    'total'     => $num_of_pages,
                    'base'      => $pagination_base,
                    'type'      => 'array',
                    'prev_text' => __( '&larr; Previous', 'dokan-lite' ),
                    'next_text' => __( 'Next &rarr;', 'dokan-lite' ),
                );

                if ( ! empty( $search_query ) ) {
                    $pagination_args['add_args'] = array(
                        'dokan_seller_search' => $search_query,
                    );
                }

                $page_links = paginate_links( $pagination_args );

                if ( $page_links ) {
                    $pagination_links  = '<div class="pagination-wrap">';
                    $pagination_links .= '<ul class="pagination"><li>';
                    $pagination_links .= join( "</li>\n\t<li>", $page_links );
                    $pagination_links .= "</li>\n</ul>\n";
                    $pagination_links .= '</div>';

                    echo $pagination_links; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
                }

                echo '</div>';
            }
            ?>

        <?php else:  ?>
            <p class="dokan-error"><?php esc_html_e( 'No vendor found!', 'dokan-lite' ); ?></p>
        <?php endif; ?>
    </div>
</div>

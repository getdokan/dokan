<div id="dokan-seller-listing-wrap">
    <div class="seller-listing-content">
        <?php if ( $sellers['users'] ) : ?>
            <ul class="dokan-seller-wrap">
                <?php
                foreach ( $sellers['users'] as $seller ) {
                    $store_info = dokan_get_store_info( $seller->ID );
                    $banner_id  = isset( $store_info['banner'] ) ? $store_info['banner'] : 0;
                    $store_name = isset( $store_info['store_name'] ) ? esc_html( $store_info['store_name'] ) : __( 'N/A', 'dokan-lite' );
                    $store_url  = dokan_get_store_url( $seller->ID );
                    $store_address  = dokan_get_seller_short_address( $seller->ID );
                    $seller_rating  = dokan_get_seller_rating( $seller->ID );
                    $banner_url = ( $banner_id ) ? wp_get_attachment_image_src( $banner_id, $image_size ) : DOKAN_PLUGIN_ASSEST . '/images/default-store-banner.png';
                    $featured_seller = get_user_meta( $seller->ID, 'dokan_feature_seller', true );
                    ?>

                    <li class="dokan-single-seller woocommerce coloum-<?php echo $per_row; ?> <?php echo ( ! $banner_id ) ? 'no-banner-img' : ''; ?>">
                        <div class="store-wrapper">
                            <div class="store-content">
                                <div class="store-info" style="background-image: url( '<?php echo is_array( $banner_url ) ? $banner_url[0] : $banner_url; ?>');">
                                    <div class="store-data-container">
                                        <div class="featured-favourite">
                                            <?php if ( ! empty( $featured_seller ) && 'yes' == $featured_seller ): ?>
                                                <div class="featured-label"><?php _e( 'Featured', 'dokan-lite' ); ?></div>
                                            <?php endif ?>

                                            <?php do_action( 'dokan_seller_listing_after_featured', $seller, $store_info ); ?>
                                        </div>

                                        <div class="store-data">
                                            <h2><a href="<?php echo $store_url; ?>"><?php echo $store_name; ?></a></h2>

                                            <?php if ( !empty( $seller_rating['count'] ) ): ?>
                                                <div class="star-rating dokan-seller-rating" title="<?php echo sprintf( __( 'Rated %s out of 5', 'dokan-lite' ), $seller_rating['rating'] ) ?>">
                                                    <span style="width: <?php echo ( ( $seller_rating['rating']/5 ) * 100 - 1 ); ?>%">
                                                        <strong class="rating"><?php echo $seller_rating['rating']; ?></strong> out of 5
                                                    </span>
                                                </div>
                                            <?php endif ?>

                                            <?php if ( $store_address ): ?>
                                                <p class="store-address"><?php echo $store_address; ?></p>
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
                                <a href="<?php echo $store_url; ?>" class="dokan-btn dokan-btn-theme"><?php _e( 'Visit Store', 'dokan-lite' ); ?></a>

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

                    echo $pagination_links;
                }

                echo '</div>';
            }
            ?>

        <?php else:  ?>
            <p class="dokan-error"><?php _e( 'No vendor found!', 'dokan-lite' ); ?></p>
        <?php endif; ?>
    </div>
</div>
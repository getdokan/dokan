<?php
/**
 * Dokan vendor information template on product page
 *
 * @since   3.3.7
 *
 * @param Object $vendor
 * @param Array  $store_info
 * @param Array  $store_rating
 *
 * @package dokan
 */
?>

<div class="dokan-vendor-info-wrap">
    <div class="dokan-vendor-image">
        <img src="<?php echo esc_url( $vendor->get_avatar() ); ?>" alt="<?php echo esc_attr( $store_info['store_name'] ); ?>">
    </div>
    <div class="dokan-vendor-info">
        <div class="dokan-vendor-name">
            <a href="<?php echo esc_attr( $vendor->get_shop_url() ); ?>"><h5><?php echo esc_html( $store_info['store_name'] ); ?></h5></a>
            <?php apply_filters( 'dokan_product_single_after_store_name', $vendor ); ?>
        </div>
        <div class="dokan-vendor-rating">
            <?php if ( $store_rating['count'] ) : ?>
                <p><?php echo esc_html( $store_rating['rating'] ); ?></p>
            <?php endif; ?>
            <?php echo wp_kses_post( dokan_generate_ratings( $store_rating['rating'], 5 ) ); ?>
        </div>
        <?php if ( $store_rating['count'] ) : ?>
            <?php // translators: %d reviews count ?>
            <p class="dokan-ratings-count">(<?php echo sprintf( _n( '%d Review', '%d Reviews', $store_rating['count'], 'dokan-lite' ), number_format_i18n( $store_rating['count'] ) ); ?>)</p>
        <?php endif; ?>
    </div>
</div>

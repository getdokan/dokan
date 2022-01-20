<?php
/**
 * Dokan seller information template on product page
 *
 * @since 3.3.7
 *
 * @package dokan
 */
global $product;

$vendor       = dokan_get_vendor_by_product( $product );
$store_info   = $vendor->get_shop_info();
$store_rating = $vendor->get_rating();
?>

<div class="dokan-seller-info-wrap">
    <div class="dokan-seller-image">
        <img src="<?php echo esc_url( $vendor->get_avatar() ); ?>" alt="<?php echo esc_attr( $store_info['store_name'] ); ?>">
    </div>
    <div class="dokan-seller-info">
        <div class="dokan-seller-name">
            <h5><?php echo esc_html( $store_info['store_name'] ); ?></h5>
            <?php apply_filters( 'dokan_seller_verified_icon', $vendor ); ?>
        </div>
        <div class="dokan-seller-rating">
            <?php if ( $store_rating['count'] ) : ?>
                <p><?php echo esc_html( $store_rating['rating'] ); ?></p>
            <?php endif; ?>
            <?php echo wp_kses_post( dokan_generate_ratings( $store_rating['rating'], 5 ) ); ?>
        </div>
        <?php if ( $store_rating['count'] ) : ?>
            <?php // translators: %d reviews count ?>
            <p class="dokan-ratings-count">(<?php echo sprintf( _n( '%d Review', '%d Reviews', $store_rating['count'], 'dokan' ), $store_rating['count'] ); ?>)</p>
        <?php endif; ?>
    </div>
</div>

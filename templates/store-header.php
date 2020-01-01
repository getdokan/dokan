<?php
$store_user               = dokan()->vendor->get( get_query_var( 'author' ) );
$store_info               = $store_user->get_shop_info();
$social_info              = $store_user->get_social_profiles();
$store_tabs               = dokan_get_store_tabs( $store_user->get_id() );
$social_fields            = dokan_get_social_profile_fields();

$dokan_appearance         = get_option( 'dokan_appearance' );
$profile_layout           = empty( $dokan_appearance['store_header_template'] ) ? 'default' : $dokan_appearance['store_header_template'];
$store_address            = dokan_get_seller_short_address( $store_user->get_id(), false );

$dokan_store_time_enabled = isset( $store_info['dokan_store_time_enabled'] ) ? $store_info['dokan_store_time_enabled'] : '';
$store_open_notice        = isset( $store_info['dokan_store_open_notice'] ) && ! empty( $store_info['dokan_store_open_notice'] ) ? $store_info['dokan_store_open_notice'] : __( 'Store Open', 'dokan-lite' );
$store_closed_notice      = isset( $store_info['dokan_store_close_notice'] ) && ! empty( $store_info['dokan_store_close_notice'] ) ? $store_info['dokan_store_close_notice'] : __( 'Store Closed', 'dokan-lite' );
$show_store_open_close    = dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' );

$general_settings         = get_option( 'dokan_general', [] );
$banner_width             = dokan_get_option( 'store_banner_width', 'dokan_appearance', 625 );

if ( ( 'default' === $profile_layout ) || ( 'layout2' === $profile_layout ) ) {
    $profile_img_class = 'profile-img-circle';
} else {
    $profile_img_class = 'profile-img-square';
}

if ( 'layout3' === $profile_layout ) {
    unset( $store_info['banner'] );

    $no_banner_class      = ' profile-frame-no-banner';
    $no_banner_class_tabs = ' dokan-store-tabs-no-banner';

} else {
    $no_banner_class      = '';
    $no_banner_class_tabs = '';
}

?>
<div class="profile-frame<?php echo esc_attr( $no_banner_class ); ?>">

    <div class="profile-info-box profile-layout-<?php echo esc_attr( $profile_layout ); ?>">
        <?php if ( $store_user->get_banner() ) { ?>
            <img src="<?php echo esc_url( $store_user->get_banner() ); ?>"
                 alt="<?php echo esc_attr( $store_user->get_shop_name() ); ?>"
                 title="<?php echo esc_attr( $store_user->get_shop_name() ); ?>"
                 class="profile-info-img">
        <?php } else { ?>
            <div class="profile-info-img dummy-image">&nbsp;</div>
        <?php } ?>

        <div class="profile-info-summery-wrapper dokan-clearfix">
            <div class="profile-info-summery">
                <div class="profile-info-head">
                    <div class="profile-img <?php echo esc_attr( $profile_img_class ); ?>">
                        <img src="<?php echo esc_url( $store_user->get_avatar() ) ?>"
                            alt="<?php echo esc_attr( $store_user->get_shop_name() ) ?>"
                            size="150">
                    </div>
                    <?php if ( ! empty( $store_user->get_shop_name() ) && 'default' === $profile_layout ) { ?>
                        <h1 class="store-name"><?php echo esc_html( $store_user->get_shop_name() ); ?></h1>
                    <?php } ?>
                </div>

                <div class="profile-info">
                    <?php if ( ! empty( $store_user->get_shop_name() ) && 'default' !== $profile_layout ) { ?>
                        <h1 class="store-name"><?php echo esc_html( $store_user->get_shop_name() ); ?></h1>
                    <?php } ?>

                    <ul class="dokan-store-info">
                        <?php if ( isset( $store_address ) && !empty( $store_address ) ) { ?>
                            <li class="dokan-store-address"><i class="fa fa-map-marker"></i>
                                <?php echo wp_kses_post( $store_address ); ?>
                            </li>
                        <?php } ?>

                        <?php if ( !empty( $store_user->get_phone() ) ) { ?>
                            <li class="dokan-store-phone">
                                <i class="fa fa-mobile"></i>
                                <a href="tel:<?php echo esc_html( $store_user->get_phone() ); ?>"><?php echo esc_html( $store_user->get_phone() ); ?></a>
                            </li>
                        <?php } ?>

                        <?php if ( $store_user->show_email() == 'yes' ) { ?>
                            <li class="dokan-store-email">
                                <i class="fa fa-envelope-o"></i>
                                <a href="mailto:<?php echo esc_attr( antispambot( $store_user->get_email() ) ); ?>"><?php echo esc_attr( antispambot( $store_user->get_email() ) ); ?></a>
                            </li>
                        <?php } ?>

                        <li class="dokan-store-rating">
                            <i class="fa fa-star"></i>
                            <?php echo wp_kses_post( dokan_get_readable_seller_rating( $store_user->get_id() ) ); ?>
                        </li>

                        <?php if ( $show_store_open_close == 'on' && $dokan_store_time_enabled == 'yes') : ?>
                            <li class="dokan-store-open-close">
                                <i class="fa fa-shopping-cart"></i>
                                <?php if ( dokan_is_store_open( $store_user->get_id() ) ) {
                                    echo esc_attr( $store_open_notice );
                                } else {
                                    echo esc_attr( $store_closed_notice );
                                } ?>
                            </li>
                        <?php endif ?>

                        <?php do_action( 'dokan_store_header_info_fields',  $store_user->get_id() ); ?>
                    </ul>

                    <?php if ( $social_fields ) { ?>
                        <div class="store-social-wrapper">
                            <ul class="store-social">
                                <?php foreach( $social_fields as $key => $field ) { ?>
                                    <?php if ( !empty( $social_info[ $key ] ) ) { ?>
                                        <li>
                                            <a href="<?php echo esc_url( $social_info[ $key ] ); ?>" target="_blank"><i class="fa fa-<?php echo esc_attr( $field['icon'] ); ?>"></i></a>
                                        </li>
                                    <?php } ?>
                                <?php } ?>
                            </ul>
                        </div>
                    <?php } ?>

                </div> <!-- .profile-info -->
            </div><!-- .profile-info-summery -->
        </div><!-- .profile-info-summery-wrapper -->
    </div> <!-- .profile-info-box -->
</div> <!-- .profile-frame -->

<?php if ( $store_tabs ) { ?>
    <div class="dokan-store-tabs<?php echo esc_attr( $no_banner_class_tabs ); ?>">
        <ul class="dokan-list-inline">
            <?php foreach( $store_tabs as $key => $tab ) { ?>
                <?php if ( $tab['url'] ): ?>
                    <li><a href="<?php echo esc_url( $tab['url'] ); ?>"><?php echo esc_html( $tab['title'] ); ?></a></li>
                <?php endif; ?>
            <?php } ?>
            <?php do_action( 'dokan_after_store_tabs', $store_user->get_id() ); ?>
        </ul>
    </div>
<?php } ?>

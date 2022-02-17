<?php
$store_user               = dokan()->vendor->get( get_query_var( 'author' ) );
$store_info               = $store_user->get_shop_info();
$social_info              = $store_user->get_social_profiles();
$store_tabs               = dokan_get_store_tabs( $store_user->get_id() );
$social_fields            = dokan_get_social_profile_fields();

$dokan_store_info         = dokan_get_store_info( $store_user->get_id() );
$dokan_store_times        = ! empty( $dokan_store_info['dokan_store_time'] ) ? $dokan_store_info['dokan_store_time'] : [];
$current_time             = dokan_current_datetime();
$today                    = strtolower( $current_time->format( 'l' ) );

$dokan_appearance         = get_option( 'dokan_appearance' );
$profile_layout           = empty( $dokan_appearance['store_header_template'] ) ? 'default' : $dokan_appearance['store_header_template'];
$store_address            = dokan_get_seller_short_address( $store_user->get_id(), false );

$dokan_store_time_enabled = isset( $store_info['dokan_store_time_enabled'] ) ? $store_info['dokan_store_time_enabled'] : '';
$store_open_notice        = isset( $store_info['dokan_store_open_notice'] ) && ! empty( $store_info['dokan_store_open_notice'] ) ? $store_info['dokan_store_open_notice'] : __( 'Store Open', 'dokan-lite' );
$store_closed_notice      = isset( $store_info['dokan_store_close_notice'] ) && ! empty( $store_info['dokan_store_close_notice'] ) ? $store_info['dokan_store_close_notice'] : __( 'Store Closed', 'dokan-lite' );
$show_store_open_close    = dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' );

$general_settings         = get_option( 'dokan_general', [] );
$banner_width             = dokan_get_vendor_store_banner_width();

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
<div class="dokan-profile-frame-wrapper">
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
                            <?php if ( ! dokan_is_vendor_info_hidden( 'address' ) && isset( $store_address ) && !empty( $store_address ) ) { ?>
                                <li class="dokan-store-address"><i class="fas fa-map-marker-alt"></i>
                                    <?php echo wp_kses_post( $store_address ); ?>
                                </li>
                            <?php } ?>

                            <?php if ( ! dokan_is_vendor_info_hidden( 'phone' ) && ! empty( $store_user->get_phone() ) ) { ?>
                                <li class="dokan-store-phone">
                                    <i class="fas fa-mobile-alt"></i>
                                    <a href="tel:<?php echo esc_html( $store_user->get_phone() ); ?>"><?php echo esc_html( $store_user->get_phone() ); ?></a>
                                </li>
                            <?php } ?>

                            <?php if ( ! dokan_is_vendor_info_hidden( 'email' ) && $store_user->show_email() == 'yes' ) { ?>
                                <li class="dokan-store-email">
                                    <i class="far fa-envelope"></i>
                                    <a href="mailto:<?php echo esc_attr( antispambot( $store_user->get_email() ) ); ?>"><?php echo esc_attr( antispambot( $store_user->get_email() ) ); ?></a>
                                </li>
                            <?php } ?>

                            <li class="dokan-store-rating">
                                <i class="fas fa-star"></i>
                                <?php echo wp_kses_post( dokan_get_readable_seller_rating( $store_user->get_id() ) ); ?>
                            </li>

                            <?php if ( $show_store_open_close == 'on' && $dokan_store_time_enabled == 'yes') : ?>
                                <li class="dokan-store-open-close">
                                    <i class="fas fa-shopping-cart"></i>
                                    <?php if ( dokan_is_store_open( $store_user->get_id() ) ) {
                                        echo esc_attr( $store_open_notice );
                                    } else {
                                        echo esc_attr( $store_closed_notice );
                                    }

                                    $now           = 0;
                                    $store_info    = ! empty( $dokan_store_times[ $today ] ) ? $dokan_store_times[ $today ] : [];
                                    $store_status  = ! empty( $store_info['status'] ) ? $store_info['status'] : 'close';

                                    // If todays schedule found then show formatted store time.
                                    if ( ! empty( $store_info ) && $store_status !== 'close' ) :
                                        $opening_times = ! empty( $store_info['opening_time'] ) ? $store_info['opening_time'] : [];
                                        $closing_times = ! empty( $store_info['closing_time'] ) ? $store_info['closing_time'] : [];
                                        $times_length  = ! empty( $opening_times ) ? count( (array) $opening_times ) : 0;

                                        error_log( print_r(  dokan_is_store_open( $store_user->get_id() ), 1 ) );

                                        // Get current slot index if vendor store is open now.
                                        for ( $index = 0; $index < $times_length; $index++ ) {
                                            if ( ! dokan_is_store_open( $store_user->get_id() ) ) {
                                                break;
                                            }

                                            $formatted_opening_time = $current_time->modify( $opening_times[ $index ] );
                                            $formatted_closing_time = $current_time->modify( $closing_times[ $index ] );

                                            if ( $formatted_opening_time <= $current_time && $formatted_closing_time >= $current_time ) {
                                                $now = $index;
                                                break;
                                            }
                                        }

                                        $formatted_opening_time = $current_time->modify( $opening_times[ $now ] )->format( wc_time_format() );
                                        $formatted_closing_time = $current_time->modify( $closing_times[ $now ] )->format( wc_time_format() );
                                        ?>
                                        <br/>
                                        <span class="dokan-times">
                                            <?php echo esc_html( $formatted_opening_time . ' - ' . $formatted_closing_time ); ?>
                                        </span>
                                    <?php endif; ?>

                                    <span class="fa fa-angle-down"></span>
                                    <div id="vendor-store-times">
                                        <?php
                                        foreach ( dokan_get_translated_days() as $day_key => $day ) :
                                            // Get store opening time.
                                            $store_info    = ! empty( $dokan_store_times[ $day_key ] ) ? $dokan_store_times[ $day_key ] : [];
                                            $store_status  = ! empty( $store_info['status'] ) ? $store_info['status'] : 'close';
                                            ?>
                                            <div class="store-time-tags">
                                                <div class="store-days"><?php echo esc_html( $day ); ?></div>
                                                <div class="store-times">
                                                    <?php if ( $store_status === 'close' ) : ?>
                                                        <span class="store-close" href="#"><?php esc_html_e( 'CLOSED', 'dokan-lite' ); ?></span>
                                                    <?php endif; ?>

                                                    <?php
                                                    $opening_times = ! empty( $store_info['opening_time'] ) ? $store_info['opening_time'] : [];

                                                    // If dokan pro doesn't exists then show single item.
                                                    if ( ! dokan()->is_pro_exists() ) {
                                                        // Get single time.
                                                        $opening_times = ! empty( $opening_times ) && is_array( $opening_times ) ? $opening_times[0] : [];
                                                    }

                                                    $times_length = ! empty( $opening_times ) ? count( (array) $opening_times ) : 0;

                                                    // Get formatted times.
                                                    for ( $index = 0; $index < $times_length; $index++ ) :
                                                        $formatted_opening_time = $current_time->modify( $store_info['opening_time'][ $index ] )->format( wc_time_format() );
                                                        $formatted_closing_time = $current_time->modify( $store_info['closing_time'][ $index ] )->format( wc_time_format() );
                                                        ?>
                                                        <span class="store-open" href="#"><?php echo esc_html( $formatted_opening_time . ' - ' . $formatted_closing_time ); ?></span>
                                                    <?php endfor; ?>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </li>
                            <?php endif ?>

                            <?php do_action( 'dokan_store_header_info_fields', $store_user->get_id() ); ?>
                        </ul>

                        <?php if ( $social_fields ) { ?>
                            <div class="store-social-wrapper">
                                <ul class="store-social">
                                    <?php foreach( $social_fields as $key => $field ) { ?>
                                        <?php if ( !empty( $social_info[ $key ] ) ) { ?>
                                            <li>
                                                <a href="<?php echo esc_url( $social_info[ $key ] ); ?>" target="_blank"><i class="fab fa-<?php echo esc_attr( $field['icon'] ); ?>"></i></a>
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
</div>

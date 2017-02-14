<?php
$store_user    = get_userdata( get_query_var( 'author' ) );
$store_info    = dokan_get_store_info( $store_user->ID );
$store_tabs    = dokan_get_store_tabs( $store_user->ID );
$social_fields = dokan_get_social_profile_fields();

$dokan_appearance = get_option( 'dokan_appearance' );
$profile_layout = empty( $dokan_appearance['store_header_template'] ) ? 'default' : $dokan_appearance['store_header_template'];

$store_address = dokan_get_seller_address( $store_user->ID, TRUE );

if ( ! empty( $store_address['state'] ) && ! empty( $store_address['country'] ) ) {
    $short_address = $store_address['state'] . ', ' . $store_address['country'];
} else if ( ! empty( $store_address['country'] ) ) {
    $short_address = $store_address['country'];
} else {
    $short_address = '';
}

$store_address = apply_filters( 'dokan_store_header_adress', $short_address, $store_address );

$general_settings = get_option( 'dokan_general', [] );
$banner_width = ! empty( $general_settings['store_banner_width'] ) ? $general_settings['store_banner_width'] : 625;

if ( ( 'default' === $profile_layout ) || ( 'layout2' === $profile_layout ) ) {
    $profile_img_class = 'profile-img-circle';
} else {
    $profile_img_class = 'profile-img-square';
}

if ( 'layout3' === $profile_layout ) {
    unset( $store_info['banner'] );

    $no_banner_class = ' profile-frame-no-banner';
    $no_banner_class_tabs = ' dokan-store-tabs-no-banner';

} else {
    $no_banner_class = '';
    $no_banner_class_tabs = '';
}

?>
<div class="profile-frame<?php echo $no_banner_class; ?>">

    <div class="profile-info-box profile-layout-<?php echo $profile_layout; ?>">
        <?php if ( isset( $store_info['banner'] ) && !empty( $store_info['banner'] ) ) { ?>
            <img src="<?php echo wp_get_attachment_url( $store_info['banner'] ); ?>"
                 alt="<?php echo isset( $store_info['store_name'] ) ? esc_html( $store_info['store_name'] ) : ''; ?>"
                 title="<?php echo isset( $store_info['store_name'] ) ? esc_html( $store_info['store_name'] ) : ''; ?>"
                 class="profile-info-img">
        <?php } else { ?>
            <div class="profile-info-img dummy-image">&nbsp;</div>
        <?php } ?>

        <div class="profile-info-summery-wrapper dokan-clearfix">
            <div class="profile-info-summery">
                <div class="profile-info-head">
                    <div class="profile-img <?php echo $profile_img_class; ?>">
                        <?php echo get_avatar( $store_user->ID, 150 ); ?>
                    </div>
                    <?php if ( isset( $store_info['store_name'] ) && 'default' === $profile_layout ) { ?>
                        <h1 class="store-name"><?php echo esc_html( $store_info['store_name'] ); ?></h1>
                    <?php } ?>
                </div>

                <div class="profile-info">
                    <?php if ( isset( $store_info['store_name'] ) && 'default' !== $profile_layout ) { ?>
                        <h1 class="store-name"><?php echo esc_html( $store_info['store_name'] ); ?></h1>
                    <?php } ?>

                    <ul class="dokan-store-info">
                        <?php if ( isset( $store_address ) && !empty( $store_address ) ) { ?>
                            <li class="dokan-store-address"><i class="fa fa-map-marker"></i>
                                <?php echo $store_address; ?>
                            </li>
                        <?php } ?>

                        <?php if ( isset( $store_info['phone'] ) && !empty( $store_info['phone'] ) ) { ?>
                            <li class="dokan-store-phone">
                                <i class="fa fa-mobile"></i>
                                <a href="tel:<?php echo esc_html( $store_info['phone'] ); ?>"><?php echo esc_html( $store_info['phone'] ); ?></a>
                            </li>
                        <?php } ?>

                        <?php if ( isset( $store_info['show_email'] ) && $store_info['show_email'] == 'yes' ) { ?>
                            <li class="dokan-store-email">
                                <i class="fa fa-envelope-o"></i>
                                <a href="mailto:<?php echo antispambot( $store_user->user_email ); ?>"><?php echo antispambot( $store_user->user_email ); ?></a>
                            </li>
                        <?php } ?>

                        <li class="dokan-store-rating">
                            <i class="fa fa-star"></i>
                            <?php dokan_get_readable_seller_rating( $store_user->ID ); ?>
                        </li>
                    </ul>

                    <?php if ( $social_fields ) { ?>
                        <div class="store-social-wrapper">
                            <ul class="store-social">
                                <?php foreach( $social_fields as $key => $field ) { ?>
                                    <?php if ( isset( $store_info['social'][ $key ] ) && !empty( $store_info['social'][ $key ] ) ) { ?>
                                        <li>
                                            <a href="<?php echo esc_url( $store_info['social'][ $key ] ); ?>" target="_blank"><i class="fa fa-<?php echo $field['icon']; ?>"></i></a>
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
    <div class="dokan-store-tabs<?php echo $no_banner_class_tabs; ?>">
        <ul class="dokan-list-inline">
            <?php foreach( $store_tabs as $key => $tab ) { ?>
                <li><a href="<?php echo esc_url( $tab['url'] ); ?>"><?php echo $tab['title']; ?></a></li>
            <?php } ?>
            <?php do_action( 'dokan_after_store_tabs', $store_user->ID ); ?>
        </ul>
    </div>
<?php } ?>
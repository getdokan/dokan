<div class="wrap">
    <h2><?php _e( 'Dokan - Add-ons', 'dokan-lite' ); ?></h2>

    <?php
    $add_ons = get_transient( 'dokan_addons' );

    if ( false === $add_ons ) {

        $response = wp_remote_get( 'https://api.bitbucket.org/2.0/snippets/wedevs/gpgXB/files/dokan-addons.json', array('timeout' => 15) );
        $add_ons  = wp_remote_retrieve_body( $response );

        if ( is_wp_error( $response ) || $response['response']['code'] != 200 ) {
            return false;
        }

        set_transient( 'dokan_addons', $add_ons, 12 * HOUR_IN_SECONDS );
    }

    $add_ons = json_decode( $add_ons );

    if ( count( $add_ons ) ) {
        foreach ($add_ons as $addon) {
            ?>

            <div class="dokan-addon">
                <div class="dokan-addon-thumb">
                    <a href="<?php echo $addon->url; ?>" target="_blank">
                        <img src="<?php echo $addon->thumbnail; ?>" alt="<?php echo esc_attr( $addon->title ); ?>" />
                    </a>
                </div>

                <div class="dokan-detail">
                    <h3 class="title">
                        <a href="<?php echo $addon->url; ?>" target="_blank"><?php echo $addon->title; ?></a>
                    </h3>

                    <div class="text"><?php echo $addon->desc; ?></div>
                </div>

                <div class="dokan-links">
                    <?php if ( class_exists( $addon->class ) ) { ?>
                        <a class="button button-disabled" href="<?php echo $addon->url; ?>" target="_blank">Installed</a>
                    <?php } else { ?>
                        <a class="button" href="<?php echo $addon->url; ?>" target="_blank">View Details</a>
                    <?php } ?>
                </div>
            </div>

            <?php
        }
    } else {
        echo '<div class="error"><p>Error fetching add-ons. Please reload the page again!</p></div>';
    }
    ?>

    <style type="text/css">
        .dokan-addon {
            width: 240px;
            float: left;
            margin: 10px;
            border: 1px solid #E6E6E6;
        }

        .dokan-addon-thumb img {
            width: 100%;
            height: 160px;
        }

        .dokan-detail {
            padding: 6px 10px 10px;
            min-height: 110px;
            background: #fff;
        }

        .dokan-detail h3.title {
            margin: 5px 0 10px;
            padding: 0;
        }

        .dokan-detail h3.title a {
            text-decoration: none;
            color: #111;
        }

        .dokan-links {
            padding: 10px;
            background: #F5F5F5;
            border-top: 1px solid #E6E6E6;
            text-align: center;
        }

        a.button.disabled {
            background: #eee;
        }
    </style>

</div>
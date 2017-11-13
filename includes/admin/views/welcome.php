<?php
/**
 * Dokan Admin Dashboard Welcome Template
 *
 * @since 2.4.3
 *
 * @package dokan
 */
?>

<div class="wrap about-wrap">
    <h1><?php echo __( 'Welcome to Dokan', 'dokan-lite' ) . ' ' . DOKAN_PLUGIN_VERSION; ?></h1>

    <div class="about-text">
        <?php _e( 'Thank you for installing Dokan!', 'dokan-lite' ); ?>
        <?php printf( __( 'Dokan %s makes it even easier to start your own multivendor marketplace.', 'dokan-lite' ), DOKAN_PLUGIN_VERSION ); ?>
    </div>

    <ul class="action-buttons">
        <li><a class="button button-primary" href="<?php echo admin_url( 'admin.php?page=dokan-settings' ); ?>"><?php _e( 'Settings', 'dokan-lite' ); ?></a></li>
        <li><a class="button" href="http://docs.wedevs.com/category/plugins/dokan-plugins/" target="_blank"><?php _e( 'Documentation', 'dokan-lite' ); ?></a></li>
        <li>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://wedevs.com/products/plugins/dokan/" data-text="#Dokan is the easiest way to start your own multi-vendor e-commerce website" data-via="weDevs" data-size="large" data-hashtags="dokan">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </li>
    </ul>

    <?php
    $order_count = get_posts( array(
        'post_type'      => 'shop_order',
        'post_status'    => 'any',
        'posts_per_page' => -1
    ) );

    if ( $order_count && count( $order_count ) != dokan_total_orders() ) {
        ?>

        <div class="metabox-holder">
            <div class="postbox">
                <h3><?php _e( 'Order Synchronization', 'dokan-lite' ); ?></h3>

                <div class="inside">
                    <p><?php _e( 'Seems like you have some unsynchronized orders. This tool will re-build Dokan\'s sync table.', 'dokan-lite' ); ?></p>
                    <p><?php _e( 'Don\'t worry, any existing orders will not be deleted.', 'dokan-lite' ); ?></p>

                    <div class="regen-sync-response"></div>
                    <div id="progressbar" style="display: none"><div id="regen-pro">0</div></div>

                    <form id="regen-sync-table" action="" method="post">
                        <?php wp_nonce_field( 'regen_sync_table' ); ?>
                        <input type="hidden" name="limit" value="<?php echo apply_filters( 'regen_sync_table_limit', 100 ); ?>">
                        <input type="hidden" name="offset" value="0">

                        <a href="<?php echo admin_url( 'admin.php?page=dokan' ); ?>" class="button"><?php _e( 'Skip', 'dokan-lite' ); ?></a>
                        <input id="btn-rebuild" type="submit" class="button button-primary" value="<?php esc_attr_e( 'Synchronize Orders', 'dokan-lite' ); ?>" >
                        <span class="regen-sync-loader" style="display:none"></span>
                    </form>
                </div>
            </div>
        </div>
    <?php } ?>

    <div class="feature-section three-col">
        <div class="col">
            <h3><?php _e( 'Flat view style for product add and edit', 'dokan-lite' ); ?></h3>
            <p><?php _e( 'New Flat view for add or edit product is a single page design to add new products from one place. To switch the new product upload screen, you can go to wp-admin → Dokan → Settings → Selling Options → Add Edit Product Style.', 'dokan-lite' ); ?></p>
        </div>

        <div class="col">
            <h3><?php _e( 'Store SEO manage system for vendors store', 'dokan-lite' ); ?></h3>
            <p><?php _e( 'From now on, whenever someone shares the store page, the images and texts written on the settings will appear on the social sites. So your vendors can get more traffic from search engines and social sites.', 'dokan-lite' ); ?></p>
        </div>

        <div class="col">
            <h3><?php _e( 'Shipping calculator on single product page', 'dokan-lite' ); ?></h3>
            <p><?php _e( 'From this version, the customers can calculate the shipping cost right from the product page, before adding them to cart and also know about if that product ships to his location or not. So this means less cart abandonment and more conversion.', 'dokan-lite' ); ?></p>
        </div>
    </div>

    <div class="metabox-holder">
        <div class="changelog-wrap postbox">
            <h3><?php _e( 'Changelog', 'dokan-lite' ); ?></h3>

            <div class="changelog-content inside">
                <pre>
                    <?php echo file_get_contents( DOKAN_DIR . '/changelog.txt' ); ?>
                </pre>
            </div>
        </div>
    </div>
</div>

<style type="text/css">
    ul.action-buttons {
        margin: 0;
        display: block;
        overflow: hidden;
    }

    ul.action-buttons li {
        display: inline;
    }

    .regen-sync-response span {
        color: #8a6d3b;
        background-color: #fcf8e3;
        border-color: #faebcc;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid transparent;
        border-radius: 4px;
        display: block;
    }
    .regen-sync-loader {
        background: url('<?php echo admin_url( 'images/spinner-2x.gif') ?>') no-repeat;
        width: 20px;
        height: 20px;
        display: inline-block;
        background-size: cover;
    }

    .postbox h3 {
        margin: 0;
    }

    #progressbar {
        background-color: #EEE;
        border-radius: 13px; /* (height of inner div) / 2 + padding */
        padding: 3px;
        margin-bottom : 20px;
    }

    #regen-pro {
        background-color: #00A0D2;
        width: 0%; /* Adjust with JavaScript */
        height: 20px;
        border-radius: 10px;
        text-align: center;
        color:#FFF;
    }

    .changelog-wrap {
        margin-top: 30px;
    }

    .changelog-wrap h3 {
        border-bottom: 1px solid #e5e5e5;
    }
    .changelog-content {
        max-height: 200px;
        overflow: scroll;
    }
    #wpbody-content .metabox-holder {
        padding-top: 35px;
    }
</style>
<script type="text/javascript">
    jQuery(function($) {
        var total_orders = 0;
        $('form#regen-sync-table').on('submit', function(e) {
            e.preventDefault();

            var form = $(this),
                submit = form.find('input[type=submit]'),
                loader = form.find('.regen-sync-loader');
                responseDiv = $('.regen-sync-response');


                // ajaxdir = "<?php admin_url( 'admin-ajax.php'); ?>";

            submit.attr('disabled', 'disabled');
            loader.show();

            var s_data = {
                data: form.serialize(),
                action : 'regen_sync_table',
                total_orders : total_orders
            };

            $.post( ajaxurl, s_data, function(resp) {

                if ( resp.success ) {
                    if( resp.data.total_orders != 0 ){
                        total_orders = resp.data.total_orders;
                    }
                    completed = (resp.data.done*100)/total_orders;

                    completed = Math.round(completed);

                    $('#regen-pro').width(completed+'%');
                    if(!$.isNumeric(completed)){
                        $('#regen-pro').html('Finished');
                    }else{
                        $('#regen-pro').html(completed+'%');
                    }

                    $('#progressbar').show();


                    responseDiv.html( '<span>' + resp.data.message +'</span>' );

                    if ( resp.data.done != 'All' ) {
                        form.find('input[name="offset"]').val( resp.data.offset );
                        form.submit();
                        return;
                    } else {
                        submit.removeAttr('disabled');
                        loader.hide();
                        form.find('input[name="offset"]').val( 0 );
                        //responseDiv.html('');
                        // window.location.reload();
                    }
                }
            });
        })
    });
</script>
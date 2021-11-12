<?php
/**
 * Ask for review notice template
 *
 * @since 3.3.1
 */
?>
<style>
    /* Ask for review admin notice styles */
    .dokan-review-notice {
        position: relative;
        padding-right: 40px;
        padding-bottom: 8px;
        border-left: 4px solid #f1545d;
    }

    .dokan-review-notice .dokan-review-notice-logo {
        float: left;
        width: 86px;
        height: auto;
        padding: 10px 12px 0 0;
        box-sizing: border-box;
    }

    .dokan-review-notice .dokan-review-notice-logo img {
        max-width: 100%;
    }

    .dokan-review-notice .dokan-notice-btn {
        margin-right: 2px;
    }

    .dokan-review-notice .dokan-notice-btn-primary {
        color: #fff !important;
        background: #fb6e76 !important;
        border: 1px solid #fb6e76 !important;
    }

    .dokan-review-notice .dokan-notice-btn-primary:hover {
        background: #135e96 !important;
        border-color: #135e96 !important;
    }

    .dokan-review-notice span.dokan-notice-close {
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;
    }
</style>

<div class="notice notice-warning dokan-notice dokan-review-notice">
    <?php do_action( 'dokan_ask_for_review_admin_notice_content_before' ); ?>

    <div class="dokan-review-notice-logo">
        <img src="<?php echo DOKAN_PLUGIN_ASSEST; ?>/images/dokan-logo-small.svg" alt="<?php esc_attr_e( 'Dokan Logo' ) ?>">
    </div>
    <p class="dokan-notice-text"><?php echo wp_kses_post( __( 'Enjoying <strong>Dokan multivendor</strong>? If our plugin is performing well for you, it would be great if you could kindly write a review about <strong>Dokan</strong> on <strong>WordPress.org</strong>. It would give us insights to grow and improve this plugin.', 'dokan-lite' ) ); ?></p>
    <div class="dokan-notice-buttons" >
        <a class="button dokan-notice-btn dokan-notice-btn-primary dokan-notice-action" href="<?php echo esc_url( 'https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post'); ?>" target="_blank"data-key="dokan-notice-postponed" ><?php esc_html_e( 'Yes, You Deserve It', 'dokan-lite' ); ?></a>
        <button class="button dokan-notice-btn dokan-notice-action" href="#" data-key="dokan-notice-postponed" ><?php esc_html_e( 'Maybe Later', 'dokan-lite' ); ?></button>
        <button class="button dokan-notice-btn dokan-notice-close dokan-notice-action" href="#" data-key="dokan-notice-dismiss" ><?php esc_html_e( 'I\'ve Added My Review', 'dokan-lite' ); ?></button>
    </div>
    <span class="dokan-notice-close dokan-notice-action dashicons dashicons-no-alt" data-key="dokan-notice-dismiss" ></span>
    <div class="clear"></div>

    <?php do_action( 'dokan_ask_for_review_admin_notice_content_after' ); ?>
</div>

<script>
    ;(function($) {
        jQuery( document ).ready( function ( $ ) {
            // Dokan ask for reveiw admin notice handler
            $( '.dokan-review-notice .dokan-notice-action' ).on( 'click', function( e ) {
                // Prevent default action if the target is not a link
                if ( 'a' !== e.target.tagName.toLowerCase() ) {
                    e.preventDefault();
                }

                let self  = $( this );
                let key   = self.data( 'key' );

                wp.ajax.send( 'dokan_ask_for_review_notice_action', {
                    data: {
                        key:   key,
                        nonce: '<?php echo wp_create_nonce( 'dokan_admin_review_notice_nonce' ); ?>',
                    },
                    complete: function ( response ) {
                        self.closest( '.dokan-notice' ).fadeOut( 200 );
                    }
                } );
            } );
        } );
    })(jQuery);
</script>

<?php
/**
 * Ask for review notice template
 *
 * @since 3.3.1
 */
?>
<div class="dokan-review-notice info notice">
    <div class="notice-content">
        <div class="logo-wrap">
            <div class="logo"></div>
            <span class="icon icon-info"></span>
        </div>
        <div class="message">
            <div><?php echo wp_kses_post( __( 'Enjoying <strong>Dokan multivendor</strong>? If our plugin is performing well for you, it would be great if you could kindly write a review about <strong>Dokan</strong> on <strong>WordPress.org</strong>. It would give us insights to grow and improve this plugin.', 'dokan-lite' ) ); ?></div>
            <a class="btn btn-primary" href="<?php echo esc_url( 'https://wordpress.org/support/plugin/dokan-lite/reviews/?filter=5#new-post'); ?>" target="_blank"data-key="dokan-notice-postponed" ><?php esc_html_e( 'Yes, You Deserve It', 'dokan-lite' ); ?></a>
            <button class="btn btn-secondary" data-key="dokan-notice-postponed" ><?php esc_html_e( 'Maybe Later', 'dokan-lite' ); ?></button>
            <button class="btn btn-secondary" data-key="dokan-notice-dismiss" ><?php esc_html_e( 'I\'ve Added My Review', 'dokan-lite' ); ?></button>
        </div>
        <button class="close-notice" data-key="dokan-notice-dismiss">
            <span class="dashicons dashicons-no-alt"></span>
        </button>
    </div>
</div>
<style>
    .dokan-review-notice {
        position: relative;
    }

    .dokan-review-notice.notice {
        border-width: 0;
        padding: 0;
        background: transparent;
    }

    .dokan-review-notice.info {
        border-left: 2px solid #2679b1;
    }

    .dokan-review-notice .notice-content {
        display: flex;
        align-items: center;
        padding: 20px 25px;
        border: 1px solid #dfe2e7;
        border-radius: 0 5px 5px 0;
        background: #fff;
    }

    .dokan-review-notice .logo-wrap {
        position: relative;
    }

    .dokan-review-notice .logo-wrap .logo {
        width: 60px;
        height: 60px;
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 62 62' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.90723' y='.79541' width='61' height='61' rx='30.5' fill='%23F16982'/%3E%3Cpath d='m19.688 25.014v-6.1614c1.4588-0.0303 7.7804 0.0301 13.407 3.6546-0.5844-0.2658-1.2264-0.4219-1.8846-0.4584-0.6581-0.0364-1.3177 0.0477-1.9361 0.2469-1.4936 0.5135-2.7441 1.8122-2.8483 3.2016-0.1737 2.3861 0 4.8627 0 7.2488v7.2186c-1.1115 0.0906-2.2577 0.1208-3.2649 0.1208-1.0768 0.0302-2.1188 0.0302-2.9524 0.1208l-0.521 0.0907v-15.283z' fill='%23fff'/%3E%3Cpath d='m17.848 43.77s-0.278-2.3257 2.5007-2.6579c2.7787-0.3323 8.0583 0.302 11.532-1.6008 0 0 2.0494-0.9363 2.4662-1.3893l-0.5558 1.6309s-1.6325 4.9534-6.5994 5.5876c-4.967 0.6041-5.9048-1.7517-9.3434-1.5705z' fill='%23fff'/%3E%3Cpath d='m28.546 45.824c3.9596-0.8457 8.4404-3.3828 8.4404-16.159 0-12.776-17.02-11.689-17.02-11.689 4.0639-2.084 25.008-4.6815 25.008 13.32 0 17.971-16.429 14.528-16.429 14.528z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-review-notice .logo-wrap .icon {
        width: 20px;
        height: 20px;
        position: absolute;
        top: -2px;
        right: -8px;
        border: 2px solid #fff;
        border-radius: 55px;
        background: #ffffff;
    }

    .dokan-review-notice .logo-wrap .icon-info {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg fill='none' viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m10.474 0.79468c-5.5718 0-10.09 4.5178-10.09 10.09 0 5.5718 4.5178 10.09 10.09 10.09 5.5719 0 10.09-4.5186 10.09-10.09 0-5.5719-4.5186-10.09-10.09-10.09zm2.1005 15.637c-0.5194 0.2051-0.9328 0.3605-1.2429 0.4681-0.3092 0.1077-0.6688 0.1615-1.0779 0.1615-0.62872 0-1.1182-0.1538-1.4667-0.4604-0.3485-0.3067-0.5219-0.6953-0.5219-1.1677 0-0.1836 0.01281-0.3716 0.03844-0.5629 0.02648-0.1913 0.06833-0.4066 0.12556-0.6483l0.65003-2.2961c0.05723-0.2203 0.10678-0.4296 0.14607-0.6244 0.03929-0.1964 0.05808-0.3766 0.05808-0.5407 0-0.2921-0.06064-0.4971-0.18108-0.6124-0.12215-0.1153-0.35193-0.17169-0.69445-0.17169-0.16742 0-0.33997 0.02479-0.51678 0.07689-0.17511 0.0538-0.32715 0.1025-0.45186 0.1503l0.17169-0.70724c0.42538-0.1734 0.83282-0.32202 1.2215-0.44503 0.38865-0.12471 0.75594-0.18621 1.1019-0.18621 0.6244 0 1.1062 0.15205 1.4453 0.45272 0.3374 0.30152 0.5074 0.69356 0.5074 1.1754 0 0.0999-0.012 0.2759-0.0351 0.527-0.023 0.252-0.0666 0.4818-0.1298 0.6928l-0.6466 2.2892c-0.053 0.1836-0.1 0.3937-0.1427 0.6286-0.0418 0.2349-0.0623 0.4143-0.0623 0.5348 0 0.304 0.0675 0.5116 0.2041 0.6218 0.135 0.1102 0.3716 0.1657 0.7064 0.1657 0.1581 0 0.3349-0.0282 0.5348-0.0828 0.1981-0.0547 0.3416-0.1034 0.4322-0.1453l-0.1734 0.7064zm-0.1145-9.2917c-0.3015 0.28017-0.6645 0.42026-1.0891 0.42026-0.4236 0-0.7892-0.14009-1.0933-0.42026-0.3024-0.28017-0.4553-0.62099-0.4553-1.019 0-0.39719 0.15375-0.73886 0.4553-1.0216 0.3041-0.28358 0.6697-0.42452 1.0933-0.42452 0.4246 0 0.7884 0.14094 1.0891 0.42452 0.3015 0.28274 0.4527 0.62441 0.4527 1.0216 0 0.39891-0.1512 0.73887-0.4527 1.019z' fill='%232579B1'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-review-notice .message {
        margin: 0 23px;
    }

    .dokan-review-notice .message h3 {
        margin: 0 0 10px;
        font-weight: bold;
        font-size: 18px;
        font-family: Roboto, sans-serif;
    }

    .dokan-review-notice .message div {
        color: #4b4b4b;
        font-weight: 400;
        font-size: 13px;
        font-family: "SF Pro Text", sans-serif;
    }

    .dokan-review-notice .message .btn {
        font-size: 12px;
        font-weight: 300;
        margin-right: 15px;
        margin-top: 10px;
        border-radius: 3px;
        border: 1px solid #00769d;
        cursor: pointer;
        transition: all .2s linear;
        text-decoration: none;
        font-family: "SF Pro Text", sans-serif;
        display: inline-block;
    }

    .dokan-review-notice .message .btn-primary {
        color: #fff;
        background: #2579B1;
        font-weight: 400;
        padding: 8px 15px;
    }

    .dokan-review-notice .message .btn-primary:hover {
        background: transparent;
        color: #2579B1;
    }

    .dokan-review-notice .message .btn-secondary {
        padding: 10px 15px;
        color: #2579B1;
        background: transparent;
        font-weight: 400;
    }

    .dokan-review-notice .message .btn-secondary:hover {
        color: #ffffff;
        background: #2579B1;
    }

    .dokan-review-notice .message a {
        text-decoration: none;
    }

    .dokan-review-notice .close-notice {
        position: absolute;
        top: 10px;
        right: 13px;
        border: 0;
        background: transparent;
        text-decoration: none;
    }

    .dokan-review-notice .close-notice span {
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c2c2c2;
        transition: all .2s ease;
        cursor: pointer;
        border: 1px solid #f3f3f3;
        border-radius: 55px;
        width: 20px;
        height: 20px;
    }

    .dokan-review-notice .close-notice span:hover {
        color: #f16982;
        border-color: #f16982;
    }

    @font-face {
        font-family: "SF Pro Text";
        src: url(<?php echo DOKAN_PLUGIN_ASSEST . '/font/SF-Pro-Text-Regular.otf'; ?>) format('opentype');
        font-weight: 400;
    }
</style>

<script>
    ;(function($) {
        jQuery( document ).ready( function ( $ ) {
            // Dokan ask for review admin notice handler
            $( '.dokan-review-notice button' ).on( 'click', function( e ) {
                e.preventDefault();

                let self  = $( this );
                let key   = self.data( 'key' );

                wp.ajax.send( 'dokan_ask_for_review_notice_action', {
                    data: {
                        key:   key,
                        nonce: '<?php echo wp_create_nonce( 'dokan_admin_review_notice_nonce' ); ?>',
                    },
                    complete: function ( response ) {
                        self.closest( '.dokan-review-notice' ).fadeOut( 200 );
                    }
                } );
            } );
        } );
    })(jQuery);
</script>

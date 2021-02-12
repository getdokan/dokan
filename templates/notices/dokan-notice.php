<?php defined( 'ABSPATH' ) || exit; ?>

<?php foreach( $selected_notices as $notice ): ?>
    <div class="notice dokan-notice dokan-limited-time-promotional-notice">
        <div class="content">
            <div class="thumbnail">
                <img src="<?php echo $notice['thumbnail'] ?>" alt="thumbnail">
            </div>
            <div class="title">
                <?php echo $notice['title'] ?>
            </div>
            <div class="body">
                <?php echo $notice['body'] ?>
            </div>
            <a target="_blank" href="<?php echo $notice['link'] ?>"><?php echo esc_html( $notice['button_text'] ) ?></a>
        </div>
        <span class="prmotion-close-icon dashicons dashicons-no-alt" data-key="<?php echo esc_attr( $notice['key'] ); ?>"></span>
        <div class="clear"></div>
    </div>
<?php endforeach; ?>

<style>

    .dokan-notice {
        border: 0px;
    }

    .dokan-limited-time-promotional-notice {
        padding: 10px;
        position: relative;
        background-color: #4B0063;
    }

    .dokan-limited-time-promotional-notice .prmotion-close-icon {
        position: absolute;
        background: white;
        border-radius: 10px;
        top: 10px;
        right: 10px;
        cursor: pointer;
        padding-top: 0px;
    }

    .dokan-limited-time-promotional-notice .content {
        color: white;
        padding: 14px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .dokan-limited-time-promotional-notice .content .thumbnail img{
        height: 100px;
    }

    .dokan-limited-time-promotional-notice .content .title {
        font-size: 18px;
        margin-left: 24px;
        margin-right: 48px;
    }

    .dokan-limited-time-promotional-notice .content .title span {
        font-weight: bolder;
    }

    .dokan-limited-time-promotional-notice .content .body p {
        font-size: 10px;
    }

    .dokan-limited-time-promotional-notice .content .body span {
        color: #FF6393;
        font-size: 28px;
    }

    .dokan-limited-time-promotional-notice .content a {
        margin-left: 48px;
        text-decoration: none;
        padding: 10px 20px;
        background-color: white;
        color: black;
        border-radius: 22px;
    }
</style>

<script type='text/javascript'>
    jQuery( document ).ready( function ( $ ) {
        $( 'body' ).on( 'click', '.dokan-limited-time-promotional-notice span.prmotion-close-icon', function ( e ) {
            e.preventDefault();

            var self = $( this ),
                key = self.data( 'key' );

            wp.ajax.send( 'dokan_dismiss_limited_time_promotional_notice', {
                data: {
                    dokan_limited_time_promotion_dismissed: true,
                    key: key,
                    nonce: '<?php echo esc_attr( wp_create_nonce( 'dokan_admin' ) ); ?>'
                },
                complete: function ( resp ) {
                    self.closest( '.dokan-limited-time-promotional-notice' ).fadeOut( 200 );
                }
            } );
        } );
    } );
</script>

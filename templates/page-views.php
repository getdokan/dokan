<?php

/**
 * Page Views Template
 *
 * This template can be overridden by copying it to yourtheme/dokan/page-views.php.
 *
 * @var array $args
 *
 * @since DOKAN_SINCE
 *
 * @package Dokan
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! isset( $args ) ) {
    return;
}

?>

<script type="text/javascript">
    jQuery(document).ready( function($) {
        if(localStorage){
            let new_date = new Date().toISOString().slice(0, 10);
            let dokan_pageview_count = JSON.parse(localStorage.getItem("dokan_pageview_count"));
            let post_id = '<?php echo esc_html( $args['post_id'] ); ?>';

            if ( dokan_pageview_count === null || ( dokan_pageview_count.today && dokan_pageview_count.today !== new_date ) ) {
                dokan_pageview_count = { "today": new_date, "post_ids": [] };
            }
            if ( ! dokan_pageview_count.post_ids.includes( post_id )  ) {
                var data = {
                    action: "dokan_pageview",
                    _ajax_nonce: "<?php echo esc_html( $args['nonce'] ); ?>",
                    post_id: "<?php echo esc_html( $args['post_id'] ); ?>",
                }
                $.post( "<?php echo esc_url( $args['ajax_url'] ); ?>", data );
                dokan_pageview_count.post_ids.push( post_id );
                localStorage.setItem( "dokan_pageview_count", JSON.stringify( dokan_pageview_count ) );
            }
        }
    } );
</script>

<?php if ( ! empty( $search_query ) ): ?>
    <h2><?php printf( __( 'Search Results for: %s', 'dokan-lite' ), esc_attr( $search_query ) ); ?></h2>
<?php endif; ?>

<form role="search" method="get" class="dokan-seller-search-form" action="">
    <div class="dokan-row dokan-clearfix">
        <div class="dokan-w4">
            <input type="search" id="search" class="search-field dokan-form-control dokan-seller-search" placeholder="<?php esc_attr_e( 'Search Vendor &hellip;', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $search_query ); ?>" name="dokan_seller_search" title="<?php esc_attr_e( 'Search seller &hellip;', 'dokan-lite' ); ?>" />
        </div>

        <?php do_action( 'dokan_seller_search_form', $search_query ); ?>
    </div>

    <input type="hidden" id="pagination_base" name="pagination_base" value="<?php echo esc_attr( $pagination_base ) ?>" />
    <input type="hidden" id="nonce" name="nonce" value="<?php echo wp_create_nonce( 'dokan-seller-listing-search' ); ?>" />
    <div class="dokan-overlay" style="display: none;"><span class="dokan-ajax-loader"></span></div>
</form>

<script>
    jQuery( document ).ready( function ( $ ) {
        var form = $( '.dokan-seller-search-form' );
        var xhr;
        var timer = null;

        form.on( 'dokan_seller_search', function () {
            if ( timer ) {
                clearTimeout( timer );
            }

            if ( xhr ) {
                xhr.abort();
            }

            var data = {
                pagination_base: form.find('#pagination_base').val(),
                per_row: '<?php echo esc_attr( $per_row ); ?>',
                action: 'dokan_seller_listing_search',
                _wpnonce: form.find('#nonce').val()
            };

            form.trigger( 'dokan_seller_search_populate_data', data );

            timer = setTimeout(function() {
                form.find('.dokan-overlay').show();

                xhr = $.post( dokan.ajaxurl, data, function( response ) {
                    if ( response.success ) {
                        form.find('.dokan-overlay').hide();

                        var data = response.data;
                        $('#dokan-seller-listing-wrap').html( $(data).find( '.seller-listing-content' ) );
                    }
                } );
            }, 500 );
        } );

        form.on( 'dokan_seller_search_populate_data', function ( e, data ) {
            data.search_term = form.find( '#search' ).val();
        } );

        form.on( 'keyup', '#search', function() {
            form.trigger( 'dokan_seller_search' );
        } );
    } );
</script>

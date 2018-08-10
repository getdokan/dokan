<?php if ( ! empty( $search_query ) ): ?>
    <h2><?php printf( __( 'Search Results for: %s', 'dokan-lite' ), $search_query ); ?></h2>
<?php endif; ?>

<form role="search" method="get" class="dokan-seller-search-form" action="">
    <input type="search" id="search" class="search-field dokan-seller-search" placeholder="<?php esc_attr_e( 'Search Vendor &hellip;', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $search_query ); ?>" name="dokan_seller_search" title="<?php esc_attr_e( 'Search seller &hellip;', 'dokan-lite' ); ?>" />
    <input type="hidden" id="pagination_base" name="pagination_base" value="<?php echo $pagination_base ?>" />
    <input type="hidden" id="nonce" name="nonce" value="<?php echo wp_create_nonce( 'dokan-seller-listing-search' ); ?>" />
    <div class="dokan-overlay" style="display: none;"><span class="dokan-ajax-loader"></span></div>
</form>

<script>
    (function($){
        $(document).ready(function(){
            var form = $('.dokan-seller-search-form');
            var xhr;
            var timer = null;

            form.on('keyup', '#search', function() {
                var self = $(this),
                    data = {
                        search_term: self.val(),
                        pagination_base: form.find('#pagination_base').val(),
                        per_row: '<?php echo $per_row; ?>',
                        action: 'dokan_seller_listing_search',
                        _wpnonce: form.find('#nonce').val()
                    };

                if (timer) {
                    clearTimeout(timer);
                }

                if ( xhr ) {
                    xhr.abort();
                }

                timer = setTimeout(function() {
                    form.find('.dokan-overlay').show();

                    xhr = $.post(dokan.ajaxurl, data, function(response) {
                        if (response.success) {
                            form.find('.dokan-overlay').hide();

                            var data = response.data;
                            $('#dokan-seller-listing-wrap').html( $(data).find( '.seller-listing-content' ) );
                        }
                    });
                }, 500);
            } );
        });
    })(jQuery);
</script>

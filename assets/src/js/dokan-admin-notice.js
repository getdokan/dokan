;(function($) {

    /**
    * Dokan ask for reveiw admin notice
    */
    let Dokan_ask_for_reveiw_notice = {
        init : function () {
            $( '.dokan-review-notice .dokan-notice-action' ).on( 'click', function( e ) {
                // Prevent default action if the target is not a link
                if ( 'a' !== e.target.tagName.toLowerCase() ) {
                    e.preventDefault();
                }

                let self  = $( this );
                let key   = self.data( 'key' );
                let nonce = self.data( 'nonce' );

                wp.ajax.send( 'ask_for_review_admin_notice', {
                    data: {
                        dokan_ask_for_review_notice_action: true,
                        key: key,
                        nonce: nonce,
                    },
                    complete: function ( response ) {
                        self.closest( '.dokan-notice' ).fadeOut( 200 );
                    }
                } );

            });
        }
    }

    Dokan_ask_for_reveiw_notice.init();

})(jQuery);

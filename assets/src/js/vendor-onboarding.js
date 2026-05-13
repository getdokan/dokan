(function($) {
    var wrapper = $( '.dps-pack-wrappper' );
    var Dokan_Subscription_details = {
        init : function() {
            wrapper.on( 'change', 'select#dokan-subscription-pack', this.show_details );
            this.show_details();
        },
        show_details : function(){
            let id = $( 'select#dokan-subscription-pack' ).val();
            $('.dps-pack').hide();
            $('.dps-pack-'+id).show();
        }
    };

    $(document).ready(function() {
        if ( wrapper.length ) {
            Dokan_Subscription_details.init();
        }
    });
})(jQuery);

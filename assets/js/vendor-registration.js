(function($) {

var Dokan_Vendor_Registration = {

    init: function() {
        var form = $('form.register');

        // bind events
        $( '.user-role input[type=radio]', form ).on( 'change', this.showSellerForm );
        $( '.tc_check_box', form ).on( 'click', this.onTOC );
        $( '#shop-phone', form ).keydown( this.ensurePhoneNumber );
        $( '#company-name', form ).on( 'focusout', this.generateSlugFromCompany );

        $( '#seller-url', form ).keydown( this.constrainSlug );
        $( '#seller-url', form ).keyup( this.renderUrl );
        $( '#seller-url', form ).on( 'focusout', this.checkSlugAvailability );

        this.validationLocalized();
        // this.validate(this);
    },

    validate: function(self) {

        $('form.register').validate({
            errorPlacement: function(error, element) {
                var form_group = $(element).closest('.form-group');
                form_group.addClass('has-error').append(error);
            },
            success: function(label, element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            submitHandler: function(form) {
                form.submit();
            }
        });
    },

    showSellerForm: function() {
        var value = $(this).val();

        if ( value === 'seller') {
            $('.show_if_seller').find( 'input, select' ).removeAttr( 'disabled' );
            $('.show_if_seller').slideDown();

            if ( $( '.tc_check_box' ).length > 0 ) {
                $('button[name=register]').attr('disabled','disabled');
            }

        } else {
            $('.show_if_seller').find( 'input, select' ).attr( 'disabled', 'disabled' );
            $('.show_if_seller').slideUp();

            if ( $( '.tc_check_box' ).length > 0 ) {
                $( 'button[name=register]' ).removeAttr( 'disabled' );
            }
        }
    },

    onTOC: function() {
        var chk_value = $( this ).val();

        if ( $( this ).prop( "checked" ) ) {
            $( 'input[name=register]' ).removeAttr( 'disabled' );
            $( 'button[name=register]' ).removeAttr( 'disabled' );
            $( 'input[name=dokan_migration]' ).removeAttr( 'disabled' );
        } else {
            $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
            $( 'button[name=register]' ).attr( 'disabled', 'disabled' );
            $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
        }
    },

    ensurePhoneNumber: function(e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 107, 109, 110, 187, 189, 190]) !== -1 ||

            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||

            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
        }

        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    },

    generateSlugFromCompany: function() {
        var value = getSlug( $(this).val() );

        $('#seller-url').val(value);
        $('#url-alart').text( value );
        $('#seller-url').focus();
    },

    constrainSlug: function(e) {
        var text = $(this).val();

        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 109, 110, 173, 189, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                return;
        }

        if ((e.shiftKey || (e.keyCode < 65 || e.keyCode > 90) && (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) ) {
            e.preventDefault();
        }
    },

    checkSlugAvailability: function() {
        var self = $(this),
            data = {
                action : 'shop_url',
                url_slug : self.val(),
                _nonce : dokan.nonce,
            };

        if ( self.val() === '' ) {
            return;
        }

        var row = self.closest('.form-row');
        row.block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        $.post( dokan.ajaxurl, data, function(resp) {

            if ( resp.success === true ) {
                $('#url-alart').removeClass('text-danger').addClass('text-success');
                $('#url-alart-mgs').removeClass('text-danger').addClass('text-success').text(dokan.seller.available);
            } else {
                $('#url-alart').removeClass('text-success').addClass('text-danger');
                $('#url-alart-mgs').removeClass('text-success').addClass('text-danger').text(dokan.seller.notAvailable);
            }

            row.unblock();

        } );
    },

    renderUrl: function() {
        $('#url-alart').text( $(this).val() );
    },

    validationLocalized: function() {
        var dokan_messages = DokanValidateMsg;

        dokan_messages.maxlength   = $.validator.format( dokan_messages.maxlength_msg );
        dokan_messages.minlength   = $.validator.format( dokan_messages.minlength_msg );
        dokan_messages.rangelength = $.validator.format( dokan_messages.rangelength_msg );
        dokan_messages.range       = $.validator.format( dokan_messages.range_msg );
        dokan_messages.max         = $.validator.format( dokan_messages.max_msg );
        dokan_messages.min         = $.validator.format( dokan_messages.min_msg );

        $.validator.messages = dokan_messages;
    }
};

// boot the class onReady
$(function() {
    Dokan_Vendor_Registration.init();

    $('.show_if_seller').find( 'input, select' ).attr( 'disabled', 'disabled' );

    // trigger change if there is an error while registering
    var shouldTrigger = $( '.woocommerce ul' ).hasClass( 'woocommerce-error' ) && ! $( '.show_if_seller' ).is( ':hidden' );

    if ( shouldTrigger ) {
        var form = $('form.register');

        $( '.user-role input[type=radio]', form ).trigger('change');
    }

    // disable migration button if checkbox isn't checked
    if ( $( '.tc_check_box' ).length > 0 ){
        $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
        $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
    }
});

})(jQuery);

// Dokan Login Form Popup
(function($) {
    dokan.login_form_popup = {
        form_html: '',

        init: function () {
            $( 'body' ).on( 'dokan:login_form_popup:show', this.get_form );
            $( 'body' ).on( 'submit', '#dokan-login-form-popup-form', this.submit_form );
            $( 'body' ).on( 'dokan:login_form_popup:working', this.working );
            $( 'body' ).on( 'dokan:login_form_popup:done_working', this.done_working );
        },

        get_form: function (e, options) {
            if ( dokan.login_form_popup.form_html ) {
                dokan.login_form_popup.show_popup();
                return;
            }

            options = $.extend(true, {
                nonce: dokan.nonce,
                action: 'dokan_get_login_form'
            }, options );

            $( 'body' ).trigger( 'dokan:login_form_popup:fetching_form' );

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'get',
                dataType: 'json',
                data: {
                    _wpnonce: options.nonce,
                    action: options.action
                }
            } ).done( function ( response ) {
                dokan.login_form_popup.form_html = response.data;
                dokan.login_form_popup.show_popup();
                $( 'body' ).trigger( 'dokan:login_form_popup:fetched_form' );
            } );
        },

        show_popup: function () {
            $.magnificPopup.open({
                items: {
                    src: dokan.login_form_popup.form_html,
                    type: 'inline'
                },

                callbacks: {
                    open: function () {
                        $( 'body' ).trigger( 'dokan:login_form_popup:opened' );
                    }
                }
            });
        },

        submit_form: function ( e ) {
            e.preventDefault();

            var form_data = $( this ).serialize();
            var error_section = $( '.dokan-login-form-error', '#dokan-login-form-popup-form' );

            error_section.removeClass( 'has-error' ).text('');

            $( 'body' ).trigger( 'dokan:login_form_popup:working' );

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: {
                    _wpnonce: dokan.nonce,
                    action: 'dokan_login_user',
                    form_data: form_data
                }
            } ).done( function ( response ) {
                $( 'body' ).trigger( 'dokan:login_form_popup:logged_in', response );
                $.magnificPopup.close();
            } ).always( function () {
                $( 'body' ).trigger( 'dokan:login_form_popup:done_working' );
            } ).fail( function ( jqXHR ) {
                if ( jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message ) {
                    error_section.addClass( 'has-error' ).text( jqXHR.responseJSON.data.message );
                }
            } );
        },

        working: function () {
            $( 'fieldset', '#dokan-login-form-popup-form' ).prop( 'disabled', true );
            $( '#dokan-login-form-submit-btn' ).addClass( 'dokan-hide' );
            $( '#dokan-login-form-working-btn' ).removeClass( 'dokan-hide' );
        },

        done_working: function () {
            $( 'fieldset', '#dokan-login-form-popup-form' ).prop( 'disabled', false );
            $( '#dokan-login-form-submit-btn' ).removeClass( 'dokan-hide' );
            $( '#dokan-login-form-working-btn' ).addClass( 'dokan-hide' );
        }
    };

    dokan.login_form_popup.init();
})(jQuery);

( function( $ ) {
  $( "button[data-dokan-payment-method]" ).click( function () {
    var btn = $( this );
    var data = {
      _wpnonce                      : $( '#_wpnonce' ).val(),
      action                        : 'dokan_settings',
      form_id                       : 'payment-form',
      dokan_update_payment_settings : 'Update Settings',
      'settings[default-method]'    : btn.data( 'dokan-payment-method' )
    };

    var old_content = btn.html();
    btn.html('<img alt="spinner" src="' + dokan.ajax_loader + '" />');
    btn.attr( 'disabled', 'disabled' );

    $.post( dokan.ajaxurl, data, function ( response ) {
      if ( response.success ) {
        location.reload();
      } else {
        btn.html( old_content );
        btn.removeAttr( 'disabled' );

        var error_area = $( '#vendor-dashboard-payment-settings-error' );
        error_area.css( 'display', 'block' );
        error_area.html( response.data );

        setTimeout( () => {
          error_area.css( 'display', 'none' );
        }, 5000);
      }
    } );
  } );
} ) ( jQuery );

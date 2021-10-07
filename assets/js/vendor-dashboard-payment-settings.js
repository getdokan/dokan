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
    btn.append( ' <span class="dokan-loading"> </span>' );
    btn.attr( 'disabled', 'disabled' );

    $.ajax( {
      url: dokan.ajaxurl,
      method: "post",
      data: data,
      success: function ( response ) {
        if ( response.success ) {
          location.reload();
          } else {
            handleError( response );
          }
      },
      error: function ( response ) {
        handleError( response );
      }
    } );

    function handleError( response ) {
      btn.html( old_content );
      btn.removeAttr( 'disabled' );

      var error_area = $( '#vendor-dashboard-payment-settings-error' );
      error_area.css( 'display', 'block' );
      error_area.html( response.data ? response.data : response.statusText );

      setTimeout( () => {
        error_area.css( 'display', 'none' );
      }, 5000);
    }
  } );
} ) ( jQuery );

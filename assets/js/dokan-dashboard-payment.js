( function dokan_dashboard_payment( $ ) {
  $( "button[data-dokan-payment-method]" ).click( function () {
    var btn = $( this );
    var data = {
      _wpnonce                      : $( '#_wpnonce' ).val(),
      action                        : 'dokan_settings',
      form_id                       : 'payment-form',
      dokan_update_payment_settings : 'Update Settings',
      'settings[default-method]'    : btn.data( 'dokan-payment-method' )
    };

    var old = btn.html();
    btn.html('<img alt="spinner" src="' + dokan.ajax_loader+'" />');
    btn.attr( 'disabled', 'disabled' );

    $.post( dokan.ajaxurl, data, function ( response ) {
      if ( response.success ) {
        location.reload();
      } else {
        btn.html( old );
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

/*  //click on dropdown
  $( "#toggle-vendor-payment-method-drop-down" ).click( function ( e ) {
    var dropdown = $( '#vendor-payment-method-drop-down' );
    var display = dropdown.css( 'display' ) !== 'none' ? 'none' : 'block';
    dropdown.css( 'display', display );
    e.stopPropagation();
  } );

  $( document ).click( function () {
    var dropdown = $( '#vendor-payment-method-drop-down' );
    if ( dropdown.css( 'display' ) !== 'none' ) {
      dropdown.css('display', 'none');
    }
  } );*/

} ) ( jQuery );

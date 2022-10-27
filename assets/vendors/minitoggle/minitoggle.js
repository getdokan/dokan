/* minitoggle js
 * https://www.jqueryscript.net/form/Toggle-Button-Plugin-jQuery-miniToggle.html
 * Copyright (c) 2016 Artem Tabalin; Licensed MIT
 */
;( function ($){
  // minitoggle switcher jquery starts here...
  $.fn["minitoggle"] = function (options) {
    options = options || {};
    const opts = $.extend({
          on : false
        }, options ),
        doToggle = function( toggle ) {
          toggle = toggle.find( '.minitoggle' );
          let active         = toggle.toggleClass( 'active' ).hasClass( 'active' ),
              handle         = toggle.find( '.toggle-handle' ),
              handlePosition = handle.position(),
              offset         = ( active ? toggle.width() - handle.width() - handlePosition.left * 2 : 0 );
          handle.css({
            transform: 'translate3d(' + offset + 'px,0,0)',
          });
          return toggle.trigger({
            type: 'toggle',
            isActive: active
          });
        };
    this.each( function() {
      let self = $( this );
      self.html( '<div class=\'minitoggle\'><div class=\'toggle-handle\'></div></div>' );
      self.click( function() {
        doToggle( self );
      });
      if (opts["on"]) {
        doToggle(self);
      }
    });
  };
} )(jQuery);

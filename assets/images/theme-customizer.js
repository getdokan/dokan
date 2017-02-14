jQuery(function( $ ) {
    "use strict";

    wp.customize( 'dokan_logo', function( value ) {
        value.bind( function( to ) {
            $( '.site-header h1.site-title a' ).css( 'background', "url("+to+") no-repeat scroll 0 0 rgba(0, 0, 0, 0)");
        } );
    });

    wp.customize( 'dokan_link_color', function( value ) {
        value.bind( function( to ) {
            $( '.site-header .cart-area-top a, .site-footer .footer-copy a, a' ).css( 'color', to );
        } );
    });


    wp.customize( 'dokan_link_hover_color', function( value ) {
        value.bind( function( to ) {
            $( '.site-header .cart-area-top a:hover, .site-footer .footer-copy a:hover, a:hover' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_header_bg', function( value ) {
        value.bind( function( to ) {
            $( '.site-header' ).css( 'background-color', to );
        } );
    });

    wp.customize( 'dokan_nav_bg', function( value ) {
        value.bind( function( to ) {
            $( '.navbar-default' ).css( 'background-color', to );
        } );
    });

    wp.customize( 'dokan_nav_color', function( value ) {
        value.bind( function( to ) {
            $( '.navbar-default .navbar-nav > li > a' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_nav_hover', function( value ) {
        value.bind( function( to ) {
            $( '.navbar-default .navbar-nav > li > a:hover' ).css( 'color', to );
        } );
    });

    wp.customize( 'sidebar_widget_header', function( value ) {
        value.bind( function( to ) {
            $( '.widget-title' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_sidebar_widget_link', function( value ) {
        value.bind( function( to ) {
            $( '.widget ul li a' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_sidebar_link_hover', function( value ) {
        value.bind( function( to ) {
            $( '.widget ul li a:hover' ).css( 'color', to );
        } );
    });

    wp.customize( 'footer_widget_header', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer .widget h3' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_footer_widget_link', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer .widget ul li a' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_footer_link_hover', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer .widget ul li a:hover' ).css( 'color', to );
        } );
    });

    wp.customize( 'dokan_footer_text', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer' ).css( 'color', to );
        } );
    });


    wp.customize( 'dokan_footer_bg', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer .footer-widget-area' ).css( 'background', to );
        } );
    });

    wp.customize( 'dokan_footer_bottom_bar_bg_color', function( value ) {
        value.bind( function( to ) {
            $( '.site-footer .copy-container' ).css( 'background', to );
        } );
    });

});
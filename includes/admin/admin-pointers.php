<?php
/**
 * Adds and controls pointers for contextual help/tutorials
 *
 * @author   weDevs
 * 
 * @category Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dokan_Admin_Pointers Class.
 */
class Dokan_Admin_Pointers {

	/**
	 * Constructor.
	 */
	public function __construct() {
            add_action( 'admin_enqueue_scripts', array( $this, 'setup_pointers_for_screen' ), 20 );
	}

	/**
	 * Setup pointers for screen.
	 */
	public function setup_pointers_for_screen() {
            
            if ( ! $screen = get_current_screen() ) {
                return;
            }
            
            switch ( $screen->id ) {
                case 'toplevel_page_dokan' :
                        $this->dashboard_tutorial();
                        break;
                case 'dokan_page_dokan-settings' :
                        $this->settings_tutorial();
                        break;
            }
            
            do_action( 'dokan_after_pointer_setup', $screen, $this );
	}
        
        /**
         *  Render pointers on Dashboard Page
         */
        public function dashboard_tutorial() {
            $pointers = array(
                    'pointers' => array(
                        'title' => array(
                                'target'       => ".at-glance",
                                'next'         => 'overview',
                                'next_trigger' => array(
                                    'target' => '.next',
                                    'event'  => 'click',
                                ),
                                'options'      => array(
                                        'content'  => '<h3>' . esc_html__( 'Important Details At a Glance', 'dokan-lite' ) . '</h3>' .
                                                      '<p>' . esc_html__( 'View the status of your marketplace including vendors and withdraw from here.', 'dokan-lite' ) . '</p>',
                                        'position' => array(
                                                'edge'  => 'top',
                                                'align' => 'left',
                                        ),
                                ),
                                'next_button' => "<button class='next button button-primary right'>".__( 'Next', 'dokan' )."</button>"
                        ),
                        'overview' => array(
                                    'target'       => ".overview",
                                    'next'         => 'updates',
                                    'next_trigger' => array(
                                        'target' => '.next',
                                        'event'  => 'click',
                                    ),
                                    'options'      => array(
                                            'content'  => '<h3>' . esc_html__( 'Your Sales Overview', 'dokan-lite' ) . '</h3>' .
                                                          '<p>' . esc_html__( 'Get a complete overview of your sales, orders and commissions.', 'dokan-lite' ) . '</p>',
                                            'position' => array(
                                                    'edge'  => 'top',
                                                    'align' => 'left',
                                            ),
                                    ),
                            'next_button' => "<button class='next button button-primary right'>".__( 'Next', 'dokan' )."</button>"
                            ),
                        'updates' => array(
                                    'target'       => ".news-updates",
                                    'next'         => '',
                                    'next_trigger' => array(),
                                    'options'      => array(
                                            'content'  => '<h3>' . esc_html__( 'News & Updates', 'dokan-lite' ) . '</h3>' .
                                                          '<p>' . esc_html__( 'Get all the latest news and updates of Dokan from here.', 'dokan-lite' ) . '</p>',
                                            'position' => array(
                                                    'edge'  => 'top',
                                                    'align' => 'left',
                                            ),
                                    ),
                            ),
                    ),
            );
            
            $this->enqueue_pointers( $pointers );
        }
        
        public function settings_tutorial() {
            
        }

        /**
	 * Enqueue pointers and add script to page.
	 * @param array $pointers
	 */
	public function enqueue_pointers( $pointers ) {
//		$pointers = wp_json_encode( $pointers );
		wp_enqueue_style( 'wp-pointer' );
		wp_enqueue_script( 'wp-pointer' );
                
                wp_register_script( 'dokan-pointers', DOKAN_PLUGIN_ASSEST.'/js/pointers.js', array( 'wp-pointer' ) );
                wp_enqueue_script( 'dokan-pointers' );

                wp_localize_script( 'dokan-pointers' , 'Dokan_Pointers', $pointers );
                
//		wc_enqueue_js( "
//			jQuery( function( $ ) {
//				var wc_pointers = {$pointers};
//
//				setTimeout( init_wc_pointers, 800 );
//
//				function init_wc_pointers() {
//					$.each( wc_pointers.pointers, function( i ) {
//						show_wc_pointer( i );
//						return false;
//					});
//				}
//
//				function show_wc_pointer( id ) {
//					var pointer = wc_pointers.pointers[ id ];
//					var options = $.extend( pointer.options, {
//						close: function() {
//							if ( pointer.next ) {
//								show_wc_pointer( pointer.next );
//							}
//						}
//					} );
//					var this_pointer = $( pointer.target ).pointer( options );
//                                        var _buttons = this_pointer.find('.wp-pointer-buttons');
//                                        console.log(_buttons);
//					this_pointer.pointer( 'open' );
//
//					if ( pointer.next_trigger ) {
//						$( pointer.next_trigger.target ).on( pointer.next_trigger.event, function() {
//							setTimeout( function() { this_pointer.pointer( 'close' ); }, 400 );
//						});
//					}
//				}
//			});
//		" );
	}
}

new Dokan_Admin_Pointers();

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
        
        private $screen_id;
	/**
	 * Constructor.
	 */
	public function __construct() {
            add_action( 'admin_enqueue_scripts', array( $this, 'setup_pointers_for_screen' ), 20 );
            add_action( 'wp_ajax_dokan-dismiss-wp-pointer', array( $this, 'dismiss_screen' ) );
	}
        
        /**
         * Dismiss a screen pointers after clicking dismiss 
         * 
         * @param String $screen
         * 
         * @return void
         */
        public function dismiss_screen( $screen = false ) { 
            $screen = isset( $_POST['screen'] ) ? wc_clean( $_POST['screen'] ) : $screen;
            if ( !$screen ) {
                return;
            }
            update_option( 'dokan_pointer_'.$screen , true );
        }
        
        /**
         * Check if pointers for screen is dismissed
         * 
         * @param String $screen
         * 
         * @return void
         */
        public function is_dismissed( $screen ) {
            return get_option( 'dokan_pointer_'.$screen, false );
        }

	/**
	 * Setup pointers for screen.
	 */
	public function setup_pointers_for_screen() {
            
            if ( ! $screen = get_current_screen() ) {
                return;
            }
            
            $this->screen_id = $screen->id;
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
            
            if ( $this->is_dismissed( $this->screen_id ) ) {
                return;
            }
            
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
            
            $this->enqueue_pointers( apply_filters( 'dokan_pointer_'.$this->screen_id, $pointers ) );
            
            $this->dismiss_screen( $this->screen_id );
        }
        
        public function settings_tutorial() {
            
        }

        /**
	 * Enqueue pointers and add script to page.
	 * @param array $pointers
	 */
	public function enqueue_pointers( $pointers ) {
            wp_enqueue_style( 'wp-pointer' );
            wp_enqueue_script( 'wp-pointer' );

            wp_register_script( 'dokan-pointers', DOKAN_PLUGIN_ASSEST.'/js/pointers.js', array( 'wp-pointer' ) );
            wp_enqueue_script( 'dokan-pointers' );
            
            $data = array(
                    'ajaxurl' => admin_url( 'admin-ajax.php' ) ,
                    'screen' => $this->screen_id,
                );
            
            wp_localize_script( 'dokan-pointers' , 'Dokan_Pointers', $pointers );
            wp_localize_script( 'dokan-pointers' , 'dokan_pointer_data', $data );
	}
}

new Dokan_Admin_Pointers();

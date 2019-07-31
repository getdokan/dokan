<?php

namespace WeDevs\Dokan\Admin;

/**
 * Adds and controls pointers for contextual help/tutorials
 *
 * @since 2.6.9
 *
 * @author   weDevs
 *
 * @category Admin
 */
if ( !defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dokan_Admin_Pointers Class.
 */
class Pointers {

    /**
     * Hold current screen ID
     *
     * @var integer
     */
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
        $screen = isset( $_POST['screen'] ) ? sanitize_text_field( wp_unslash( $_POST['screen'] )) : $screen; // WPCS: CSRF ok.

        if ( ! $screen ) {
            return;
        }

        update_option( 'dokan_pointer_' . $screen, true );
    }

    /**
     * Check if pointers for screen is dismissed
     *
     * @param String $screen
     *
     * @return void
     */
    public function is_dismissed( $screen ) {
        return get_option( 'dokan_pointer_' . $screen, false );
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
                'title'    => array(
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
                    'next_button'  => "<button class='next button button-primary right'>" . __( 'Next', 'dokan-lite' ) . "</button>"
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
                    'next_button'  => "<button class='next button button-primary right'>" . __( 'Next', 'dokan-lite' ) . "</button>"
                ),
                'updates'  => array(
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

        $this->enqueue_pointers( apply_filters( 'dokan_pointer_' . $this->screen_id, $pointers ) );

        $this->dismiss_screen( $this->screen_id );
    }

    /**
     * Renders Settings tutorial pointers
     *
     * @return type
     */
    public function settings_tutorial() {
        if ( $this->is_dismissed( $this->screen_id ) ) {
            return;
        }

        $pointers = array(
            'pointers' => array(
                'general'  => array(
                    'target'       => "#dokan_general-tab",
                    'next'         => 'selling',
                    'next_trigger' => array(
                        'target' => '.next',
                        'event'  => 'click',
                    ),
                    'options'      => array(
                        'content'  => '<h3>' . esc_html__( 'General Settings', 'dokan-lite' ) . '</h3>' .
                        '<p>' . esc_html__( 'Configure all general settings for your marketplace from this tab.', 'dokan-lite' ) . '</p>',
                        'position' => array(
                            'edge'  => 'top',
                            'align' => 'left',
                        ),
                    ),
                    'next_button'  => "<button class='next button button-primary right'>" . __( 'Next', 'dokan-lite' ) . "</button>"
                ),
                'selling'  => array(
                    'target'       => "#dokan_selling-tab",
                    'next'         => 'withdraw',
                    'next_trigger' => array(
                        'target' => '.next',
                        'event'  => 'click',
                    ),
                    'options'      => array(
                        'content'  => '<h3>' . esc_html__( 'Selling Options', 'dokan-lite' ) . '</h3>' .
                        '<p>' . esc_html__( 'You can configure different selling options for your vendors', 'dokan-lite' ) . '</p>',
                        'position' => array(
                            'edge'  => 'top',
                            'align' => 'left',
                        ),
                    ),
                    'next_button'  => "<button class='next button button-primary right'>" . __( 'Next', 'dokan-lite' ) . "</button>"
                ),
                'withdraw' => array(
                    'target'       => "#dokan_withdraw-tab",
                    'next'         => 'pages',
                    'next_trigger' => array(
                        'target' => '.next',
                        'event'  => 'click',
                    ),
                    'options'      => array(
                        'content'  => '<h3>' . esc_html__( 'Withdraw Options', 'dokan-lite' ) . '</h3>' .
                        '<p>' . esc_html__( 'Configure your vendor\'s balance withdrawal options', 'dokan-lite' ) . '</p>',
                        'position' => array(
                            'edge'  => 'top',
                            'align' => 'left',
                        ),
                    ),
                    'next_button'  => "<button class='next button button-primary right'>" . __( 'Next', 'dokan-lite' ) . "</button>"
                ),
                'pages'    => array(
                    'target'  => "#dokan_pages-tab",
                    'next'    => '',
                    'options' => array(
                        'content'  => '<h3>' . esc_html__( 'Dokan Pages', 'dokan-lite' ) . '</h3>' .
                        '<p>' . esc_html__( 'Dokan requires some pages to be configured and you can set them up here', 'dokan-lite' ) . '</p>',
                        'position' => array(
                            'edge'  => 'top',
                            'align' => 'left',
                        ),
                    ),
                ),
            ),
        );

        $this->enqueue_pointers( apply_filters( 'dokan_pointer_' . $this->screen_id, $pointers ) );

        $this->dismiss_screen( $this->screen_id );
    }

    /**
     * Enqueue pointers and add script to page.
     * @param array $pointers
     */
    public function enqueue_pointers( $pointers ) {
        wp_enqueue_style( 'wp-pointer' );
        wp_enqueue_script( 'wp-pointer' );

        wp_register_script( 'dokan-pointers', DOKAN_PLUGIN_ASSEST . '/js/pointers.js', array( 'wp-pointer' ) );
        wp_enqueue_script( 'dokan-pointers' );

        $data = array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'screen'  => $this->screen_id,
        );

        wp_localize_script( 'dokan-pointers', 'Dokan_Pointers', $pointers );
        wp_localize_script( 'dokan-pointers', 'dokan_pointer_data', $data );
    }
}

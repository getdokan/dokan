<?php

namespace WeDevs\Dokan;

/**
 * Dokan tracker
 *
 * @since 2.4.11
 * @since 2.8.7 Using AppSero\Insights for tracking
 */
class Tracker {

    /**
     * Insights class
     *
     * @var \Appsero\Insights
     */
    public $insights = null;

    /**
     * Class constructor
     *
     * @return void
     * @since 2.8.7
     *
     */
    public function __construct() {
        $this->appsero_init_tracker_dokan();
    }

    /**
     * Initialize the plugin tracker
     *
     * @return void
     * @since 2.8.7
     *
     */
    public function appsero_init_tracker_dokan() {
        $client = new \Appsero\Client( '559bcc0d-21b4-4b34-8317-3e072badf46d', 'Dokan Multivendor Marketplace', DOKAN_FILE );

        $this->insights = $client->insights();

        $this->insights->add_extra(
            function () {
                return [
                    'products'      => $this->insights->get_post_count( 'product' ),
                    'orders'        => $this->get_order_count(),
                    'is_pro'        => class_exists( 'Dokan_Pro' ) ? 'Yes' : 'No',
                    'wc_version'    => function_exists( 'WC' ) ? WC()->version : null,
                    'dokan_version' => DOKAN_PLUGIN_VERSION,
                ];
            }
        );

        $this->insights->init_plugin();

        add_filter( 'appsero_custom_deactivation_reasons', [ $this, 'get_custom_deactivation_reasons' ], 10, 2 );
    }

    /**
     * Get number of orders
     *
     * @return int
     */
    protected function get_order_count() {
        global $wpdb;

        return (int) $wpdb->get_var( "SELECT count(ID) FROM $wpdb->posts WHERE post_type = 'shop_order' and post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded');" );
    }

    /**
     * Gets custom deactivation reasons
     *
     * @param string[] $reasons
     * @param null|\AppSero\Client $client
     *
     * @return \array
     * @since 3.0.15
     *
     */
    public function get_custom_deactivation_reasons( $reasons, $client = null ) {
        // return if old version of appsero client is loaded, where corresponding hooks provides only one argument
        if ( null === $client ) {
            return $reasons;
        }

        // return if client is not dokan lite
        if ( 'dokan-lite' !== $client->slug ) {
            return $reasons;
        }

        $reasons = [
            [
                'id'          => 'dokan-pro-is-expensive',
                'text'        => 'Dokan PRO is expensive ',
                'placeholder' => 'We’ve discounts going all year round. Please copy & visit this link to instantly get 30% off your purchase: https://wedevs.com/dokan-lite-upgrade-to-pro',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23"><path d="M11.5 0C17.9 0 23 5.1 23 11.5S17.9 23 11.5 23 0 17.9 0 11.5 5.1 0 11.5 0zm0 2C6.3 2 2 6.3 2 11.5S6.3 21 11.5 21s9.5-4.3 9.5-9.5S16.7 2 11.5 2zm.5 3v1.1c.5 0 .9.1 1.4.3.4.1.8.3 1.1.6.3.2.6.5.8.9.2.4.3.8.4 1.3h-2.3c0-.4-.1-.7-.4-1-.3-.3-.6-.4-.9-.4v2.5c.1 0 .3.1.4.1.1 0 .3.1.4.1.8.2 1.4.4 1.8.7s.7.6 1 .9c.2.3.3.6.4.9 0 .3.1.6.1.8 0 .2-.1.5-.2.8-.1.3-.3.6-.6.9-.3.3-.7.6-1.2.8s-1.2.4-2 .4V18h-1v-1.2c-1.2-.1-2.1-.4-2.8-1S7.1 14.4 7 13.2h2.3c0 .5.2 1 .5 1.3.3.3.7.5 1.2.6v-3c-.1 0-.1 0-.2-.1-.1 0-.2 0-.3-.1l-1.2-.3c-.4-.1-.7-.3-1-.5-.3-.2-.6-.5-.7-.8s-.3-.7-.3-1.1c0-.5.1-.9.3-1.3.2-.4.5-.7.8-.9.3-.3.7-.4 1.2-.6l1.4-.3V5h1zm0 7.4v2.7c.2 0 .4-.1.6-.1l.6-.3c.2-.1.3-.3.4-.4.1-.2.2-.4.2-.6 0-.4-.1-.7-.4-.8-.4-.2-.8-.4-1.4-.5zm-1-4.6c-.2 0-.4 0-.5.1-.2 0-.3.1-.5.2l-.3.3c-.1.2-.1.4-.1.6 0 .3.1.6.3.7.2.2.6.3 1.1.4V7.8z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'testing-debugging',
                'text'        => 'I’m Testing or Debugging',
                'placeholder' => 'If you’re temporarily deactivating, please let us know if we can help you in any way.',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23"><path d="M21 17.4c-.1-1.7-1.4-3-3-3.1v-1.2h-.3v1.2c-1.6.1-2.9 1.4-3 3.1h-1.2v.4h1.2c.1 1.7 1.4 3 3 3.1v1.2h.3v-1.2c1.6-.1 2.9-1.4 3-3.1h1.5v-.4H21zm-3.4 3.1c-1.4-.1-2.6-1.3-2.7-2.7h2.7v2.7zm0-3.1h-2.7c.1-1.5 1.2-2.6 2.7-2.7v2.7zm.4 3.1v-2.7h2.7c-.2 1.4-1.3 2.6-2.7 2.7zm0-3.1v-2.7c1.4.1 2.6 1.3 2.7 2.7H18zM16.2 4.9c0-.3.1-.5.4-.6.1 0 2.8-.5 3-2.9 0-.3.2-.5.5-.5s.5.3.4.5c-.2 3.1-3.7 3.8-3.8 3.8h-.1c-.1.1-.3-.1-.4-.3zM1.8 1.5c0-.2.2-.5.4-.5.3 0 .5.2.5.5.2 2.4 2.9 2.8 3 2.9.3 0 .4.3.4.6 0 .2-.2.4-.5.4h-.1c.1-.1-3.5-.7-3.7-3.9zM18.4 9c.1 0 3.4.2 4 2.8 0 .1 0 .3-.1.4-.1.1-.2.2-.3.2h-.1c-.2 0-.4-.2-.5-.4-.5-1.9-3.1-2.1-3.2-2.1-.1 0-.2-.1-.3-.2-.1-.1-.1-.2-.1-.4.1-.1.3-.3.6-.3zM4.1 10s-2.7.2-3.2 2.1c-.1.2-.2.4-.5.4H.3c-.1 0-.2-.1-.3-.2v-.5C.7 9.2 3.9 9 4.1 9c.3 0 .5.2.5.5 0 .2-.2.5-.5.5zM9 2.6v-.3C8.9 1 10 0 11.2 0c1.2 0 2.3 1 2.3 2.3v.3c1.4.6 2.5 1.8 3.3 3.3V6l-.2.1c-1.5.8-3.1 1.2-4.9 1.2-2.5 0-4.7-.9-5.8-1.4l-.2-.1.1-.2c.7-1.4 1.9-2.4 3.2-3zM6.5 16.7c.1.3-.1.5-.3.6 0 0-2.6.7-2.9 3 0 .2-.2.4-.5.4h-.1c-.3 0-.4-.3-.4-.6.4-3 3.5-3.8 3.6-3.8H6c.2 0 .4.2.5.4zm11.3-4.3h-.2c.1-.7.2-1.4.2-2.1 0-1.3-.2-2.5-.7-3.7l-.1-.2-.2.1c-1.2.6-3.2 1-4.6 1.1h-.1v.1c-.4 1.5-.6 3.4-.8 5.2-.2-2.8-.5-5.1-.5-5.2v-.2C8.2 7.3 6 6.4 5.7 6.3l-.2-.1-.1.2c-.5 1.2-.8 2.5-.8 3.9 0 4.5 3 8.2 6.6 8.2.5 0 1-.1 1.4-.2a5.21 5.21 0 0010.4-.6c0-2.9-2.3-5.3-5.2-5.3zm0 10.2a4.9 4.9 0 11.02-9.82 4.9 4.9 0 01-.02 9.82z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'upgrading-to-dokan-pro',
                'text'        => 'I’m Upgrading to Dokan Pro ',
                'placeholder' => 'Great! But don’t be hasty to deactivate. To run Dokan Pro versions, you require the Dokan Lite plugin. It’s a must!',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M21.3 13.4h-2.4l-.4.8c-.2.4-.3.7-.4.8v.1a8.77 8.77 0 01-7.3 4c-1.1 0-2.1-.2-3.1-.6-.9-.3-1.7-.8-2.4-1.4l-.3-.3-.6-.5L7 13.7l.1-.1v-.1c0-.1 0-.1-.1-.1l-.1-.1H.1s-.1 0-.1.1l-.1.1V20.4s0 .1.1.1c.1.1.1.1.2.1h.1L2.8 18l.8.8a10.97 10.97 0 0013.9.4c1.7-1.4 2.9-3.2 3.6-5.3l.2-.5zM10.6 0C8 0 5.7.8 3.8 2.3 2.1 3.7.9 5.5.2 7.7l-.1.4h2.5l.2-.5c.2-.6.4-1 .5-1.2v-.1a8.77 8.77 0 017.3-4c2.1 0 4 .7 5.5 2l.3.2.6.6-2.6 2.6-.1.1v.1c0 .1 0 .1.1.1l.1.1h6.8s.1 0 .1-.1l.1-.1V1s0-.1-.1-.1c0 .1-.1.1-.1.1h-.1l-2.5 2.4-.8-.8c-.9-.8-2-1.4-3.2-1.9C13.3.3 12 0 10.6 0z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'conflicting-with-plugin',
                'text'        => 'The plugin is conflicting with or breaking something',
                'placeholder' => 'Are you aware which plugin or theme it is conflicting with? Even if you aren’t please let us know so we can help you fix it.',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23"><path d="M15.6 17.6l1.6 4c.2.5 0 1.1-.6 1.3-.5.2-1.1 0-1.3-.6-.1-.2-.1-.3-.1-.5l.4-4.2zM6.8 9.3c.6-.4 1.5-.3 1.9.3.4.6.3 1.5-.4 1.9l-5 3.4c-.7.4-.8 1.3-.4 2l1.8 2.6c.2.3.5.5.9.6.4.1.8 0 1.1-.2l5-3.4c.6-.4 1.5-.3 1.9.4.4.6.3 1.5-.4 1.9l-5 3.4c-.5.5-1.4.8-2.2.8-.3 0-.5 0-.8-.1-1.1-.2-2.1-.8-2.7-1.7L.7 18.6c-1.3-1.9-.8-4.5 1.1-5.8l5-3.5zm15.1 6c.6 0 1.1.4 1.1.9 0 .6-.4 1.1-.9 1.1-.2 0-.3 0-.5-.1l-4-1.6 4.3-.3zm-7.8-7.4c.5-.6 1.3-.7 1.9-.3.6.5.7 1.3.3 1.9l-2.8 3.7-.3.3-3.7 2.8c-.2.2-.5.3-.8.3-.4 0-.8-.2-1.1-.6-.5-.6-.3-1.5.3-1.9l3.5-2.7 2.7-3.5zm-1.4-6.1C14-.1 16.6-.6 18.5.7l2.6 1.8c.9.6 1.5 1.6 1.7 2.7.2 1.1 0 2.2-.7 3.1l-3.4 5c-.3.4-.7.6-1.1.6-.3 0-.5-.1-.8-.2-.6-.4-.8-1.3-.4-1.9l3.4-5c.2-.3.3-.7.2-1.1-.1-.4-.3-.7-.6-.9L17 3c-.7-.4-1.5-.3-2 .4l-3.4 5c-.5.6-1.3.7-2 .3-.6-.4-.7-1.3-.3-1.9l3.4-5z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'shifting-to-another-site',
                'text'        => 'I’m shifting to another site',
                'placeholder' => 'That’s perfectly fine. Let us know if you need help migrating data and information from this one!',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 24"><path d="M16.1 19.6v2H9.9v1.9l-3.1-3.8h9.3zM9.3 8.1c.3 0 .6.3.6.6v6.6c0 .3-.3.6-.6.6H.6c-.3 0-.6-.3-.6-.6V8.7c0-.3.3-.6.6-.6h8.7zm13.1 0c.3 0 .6.3.6.6v6.6c0 .3-.3.6-.6.6h-8.8c-.3 0-.6-.3-.6-.6V8.7c0-.3.3-.6.6-.6h8.8zM13 .5l3.1 3.9H6.9v-2H13V.5z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'does-not-have-translation',
                'text'        => 'Does not have the translation I need.',
                'placeholder' => 'Which language(s) are you looking for?',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23"><path d="M2.6 14.8c.3 0 .5.2.5.5s-.2.5-.5.5H1c.1 3.5 3 6.2 6.5 6.2.3 0 .5.2.5.5v.1c0 .2-.2.4-.5.4C3.4 23 0 19.6 0 15.5v-.1-.1c0-.3.2-.5.5-.5h2.1zm18.3-4.1c.7 0 1.2.5 1.2 1.2v8.9c0 .7-.5 1.2-1.2 1.2H12c-.7 0-1.2-.5-1.2-1.2v-7.6h.3c1.2 0 2.2-1 2.2-2.2v-.3h7.6zm-4.5 1.9c-.2 0-.4.1-.5.3l-2.4 6.6v.1c-.1.2.1.5.3.6h.2c.2 0 .4-.1.5-.3l.6-1.6h2.8l.6 1.6c.1.2.4.4.6.3.2-.1.3-.4.2-.6L16.9 13c-.1-.3-.3-.4-.5-.4zm0 1.9l1 2.8h-2.1l1.1-2.8zM11.1 1c.7 0 1.2.6 1.2 1.2v8.9c0 .7-.5 1.2-1.2 1.2h-9c-.6-.1-1.1-.6-1.1-1.2V2.2C.9 1.5 1.5 1 2.2 1h8.9zM6.6 2.5c-.3 0-.5.2-.5.5v1.8H3.4c-.2-.1-.5.2-.5.4 0 .3.2.5.5.5h.8C4.4 7 5 8.2 5.8 9.1c-.7.5-1.5.7-2.4.7-.2 0-.4.2-.5.5 0 .3.2.5.5.5 1.1 0 2.2-.3 3.2-1 .9.7 2 1 3.2 1 .3 0 .5-.2.5-.5s-.2-.5-.5-.5c-.9 0-1.7-.2-2.4-.7.9-.9 1.4-2.1 1.5-3.3h.9c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H7.1V2.9c0-.2-.2-.4-.5-.4zm1.3 3.2c-.1 1.1-.6 2-1.3 2.8-.7-.7-1.2-1.7-1.3-2.8h2.6zM15.5 0C19.6 0 23 3.4 23 7.5v.2c0 .3-.2.5-.5.5h-2.1c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H22C21.9 3.7 19 1 15.5 1c-.3 0-.5-.3-.5-.5 0-.3.2-.5.5-.5z" fill-rule="evenodd" clip-rule="evenodd" fill="#3b86ff"/></svg>',
            ],
            [
                'id'          => 'dont-need-anymore',
                'text'        => 'Don’t need the plugin anymore.',
                'placeholder' => 'Sorry to see you go. If you ever have the need to use Dokan again, please return without hesitation. And we’re always by your side to help.',
                'icon'        => '<svg height="23" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23"><path d="M3.1 4.8c.4 0 .8.2 1.1.4.5.5.6 1.3.2 1.9a8.26 8.26 0 001.3 10.6c3.3 3.1 8.5 3.1 11.7 0 3-2.8 3.5-7.2 1.3-10.6-.2-.2-.2-.5-.2-.8 0-.4.2-.8.4-1.1.7-.7 1.8-.6 2.3.2 2.9 4.5 2.3 10.4-1.5 14.2-4.5 4.4-11.8 4.4-16.3 0A11.1 11.1 0 011.9 5.4c.2-.3.7-.6 1.2-.6zM11.5 0c.5 0 1 .2 1.3.5s.5.8.5 1.3v7.4c0 1-.8 1.8-1.9 1.8s-1.9-.8-1.9-1.8V1.8c.1-1 1-1.8 2-1.8z" fill="#3b86ff"/></svg>',
            ],
        ];

        return $reasons;
    }
}

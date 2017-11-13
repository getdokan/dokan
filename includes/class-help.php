<?php

/**
* Help class for rendering Help section
*/
class Dokan_Help {

    private $transient_key;
    private $api_url;

    private $help_data;

    /**
     * Load autometically when class initiate
     *
     * @since 1.0.0
     */
    public function __construct() {
        $this->api_url       = 'https://api.bitbucket.org/2.0/snippets/wedevs/oErMz/files/dokan-help.json';
        $this->transient_key = 'dokan_help_docs';

        $this->help_data = $this->get_api_data();
    }

    /**
     * Get local Help data
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_local_data() {
        return array(
            array(
                'title' => 'Basics',
                'icon' => 'dashicons-sos',
                'questions' => array(
                    array(
                        'title' => 'What are the System Requirements?',
                        'link' => 'https://wedevs.com/docs/dokan/getting-started/installation-2/'
                    ),
                    array(
                        'title' => 'License Key is not working',
                        'link' => 'https://wedevs.com/docs/dokan/getting-started/license-activation-2/'
                    ),
                    array(
                        'title' => '404 error on Dokan Pages',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/404-page-not-found-error/'
                    ),
                    array(
                            'title' => 'Can not find vendor registration form',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/can-not-find-vendor-registration-form/'
                    )
                )
            ),
            array(
                'title' => 'Payment and Shipping',
                'icon' => 'dashicons-clipboard',
                'questions' => array(
                    array(
                        'title' => 'Available payment gateways?',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/available-payment-gateways-in-dokan/'
                    ),
                    array(
                        'title' => 'Use Local Pickup or Cash on Delivery',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/how-to-use-cash-on-delivery-and-local-pickup-with-dokan/'
                    ),
                    array(
                        'title' => 'How does refunds work in Dokan?',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/refund-in-dokan/'
                    ),
                    array(
                        'title' => 'Payment security and moneyback guarranty',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/escrow-feature-in-dokan/'
                    )
                )
            ),
            array(
                'title' => 'Vendor Related Questions',
                'icon' => 'dashicons-admin-users',
                'questions' => array(
                    array(
                        'title' => 'Controlling Selling Capability',
                        'link' => 'https://wedevs.com/docs/dokan/tutorials/managing-sellers-products/'
                    ),
                    array(
                        'title' => 'Charging the vendor and commission',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/charge-the-vendor-monthly-and-get-sales-commission-too/'
                    ),
                    array(
                        'title' => 'How does Dokan shipping work?',
                        'link' => 'https://wedevs.com/docs/dokan/vendor-guide/how-to-configure-and-use-dokan-shipping/'
                    ),
                    array(
                        'title' => 'Customizing the store page',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/customizing-store-page/'
                    )
                )
            ),
            array(
                'title' => 'Miscellaneous'
                'icon' => 'dashicons-editor-table'
                'questions' => array(
                    array(
                        'title' => 'Mark product and vendor as featured',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/featured-product-and-vendor/'
                    ),
                    array(
                        'title' => 'How to configure taxes',
                        'link' => 'https://wedevs.com/docs/dokan/woocommerce-settings/how-to-use-dokan-tax-settings/'
                    ),
                    array(
                        'title' => 'What is sub-order?',
                        'link' => 'https://wedevs.com/docs/dokan/common-questions/sub-order/'
                    ),
                    array(
                        'title' => 'How to send an announcement to vendor?',
                        'link' => 'https://wedevs.com/docs/dokan/tutorials/how-to-create-an-announcement/'
                    )
                )
            )
        )
    }

    /**
     * Display Help data
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function display() {

    }

    /**
     * Get Help data
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_api_data() {
        $help_docs = get_transient( $this->transient_key );

        if ( false === $help_docs ) {
            $response  = wp_remote_get( $this->api_url, array('timeout' => 15) );
            $help_docs = wp_remote_retrieve_body( $response );

            if ( is_wp_error( $response ) || $response['response']['code'] != 200 ) {
                $help_docs = '[]';
            }

            set_transient( $this->transient_key, $help_docs, 12 * HOUR_IN_SECONDS );
        }

        return json_decode( $help_docs, true );
    }
}

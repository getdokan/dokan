<?php
/**
 * Privacy/GDPR related functionality which ties into WordPress functionality.
 *
 * @since 2.8.2
 * @package dokan\Classes
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WC_Abstract_Privacy' ) ) {
    return;
}

/**
 * Dokan_Privacy Class.
 */
class Dokan_Privacy extends WC_Abstract_Privacy {

    /**
     * Init - hook into events.
     */
    public function __construct() {
        parent::__construct( __( 'Dokan', 'dokan-lite' ) );

        // This hook registers WooCommerce data exporters.
        $this->add_exporter( 'dokan-vendor-data', __( 'Vendor Data', 'dokan-lite' ), array( $this, 'vendor_data_exporter' ) );

        // This hook registers WooCommerce data erasers.
        $this->add_eraser( 'dokan-vendor-data', __( 'Vendor Data', 'dokan-lite' ), array( $this, 'vendor_data_eraser' ) );

        // Handles custom anonomization types not included in core.
        add_filter( 'wp_privacy_anonymize_data', array( $this, 'anonymize_custom_data_types' ), 10, 3 );
    }

    /**
     * Add privacy policy content for the privacy policy page.
     *
     * @since 3.4.0
     */
    public function get_privacy_message() {
        $content = '
            <div contenteditable="false">' .
                '<p class="wp-policy-help">' .
                    __( 'This sample privacy policy includes the basics around what personal data your multivendor store may be collecting, storing and sharing, as well as who may have access to that data. Depending on what settings are enabled and which additional plugins are used, the specific information shared by your store will vary. We recommend consulting with a lawyer when deciding what information to disclose on your privacy policy.', 'dokan-lite' ) .
                '</p>' .
            '</div>' .
            '<p>' . __( 'We collect information about you during the checkout process on our store.', 'dokan-lite' ) . '</p>' .
            '<h2>' . __( 'What we collect and store', 'dokan-lite' ) . '</h2>' .
            '<p>' . __( 'While you visit our site, we’ll track:', 'dokan-lite' ) . '</p>' .
            '<ul>' .
                '<li>' . __( 'Stores you’ve viewed: we’ll use this to, for example, show you vendor stores you’ve recently viewed', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Products you’ve viewed: we’ll use this to, for example, show you products you’ve recently viewed', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Location, IP address and browser type: we’ll use this for purposes like estimating taxes and shipping', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Shipping address: we’ll ask you to enter this so we can, for instance, estimate shipping before you place an order, and send you the order!', 'dokan-lite' ) . '</li>' .
            '</ul>' .
            '<p>' . __( 'We’ll also use cookies to keep track of cart contents while you’re browsing our site.', 'dokan-lite' ) . '</p>' .
            '<div contenteditable="false">' .
                '<p class="wp-policy-help">' . __( 'Note: you may want to further detail your cookie policy, and link to that section from here.', 'dokan-lite' ) . '</p>' .
            '</div>' .
            '<p>' . __( 'When you purchase from us, we’ll ask you to provide information including your name, billing address, shipping address, email address, phone number, credit card/payment details and optional account information like username and password. We’ll use this information for purposes, such as, to:', 'dokan-lite' ) . '</p>' .
            '<ul>' .
                '<li>' . __( 'Send you information about your account and order', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Respond to your requests, including refunds and complaints', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Process payments and prevent fraud', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Set up your account for our store', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Comply with any legal obligations we have, such as calculating taxes', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Improve our store offerings', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Send you marketing messages, if you choose to receive them', 'dokan-lite' ) . '</li>' .
            '</ul>' .
            '<p>' . __( 'If you create an account, we will store your name, address, email and phone number, which will be used to populate the checkout for future orders.', 'dokan-lite' ) . '</p>' .
            '<p>' . __( 'We generally store information about you for as long as we need the information for the purposes for which we collect and use it, and we are not legally required to continue to keep it. For example, we will store order information for XXX years for tax and accounting purposes. This includes your name, email address and billing and shipping addresses.', 'dokan-lite' ) . '</p>' .
            '<p>' . __( 'We will also store comments or reviews, if you choose to leave them.', 'dokan-lite' ) . '</p>' .
            '<h2>' . __( 'Who on our team has access', 'dokan-lite' ) . '</h2>' .
            '<p>' . __( 'Members of our team have access to the information you provide us. For example, both Administrators and Shop Managers can access:', 'dokan-lite' ) . '</p>' .
            '<ul>' .
                '<li>' . __( 'Order information like what was purchased, when it was purchased and where it should be sent, and', 'dokan-lite' ) . '</li>' .
                '<li>' . __( 'Customer information like your name, email address, and billing and shipping information.', 'dokan-lite' ) . '</li>' .
            '</ul>' .
            '<p>' . __( 'Our team members have access to this information to help fulfill orders, process refunds and support you.', 'dokan-lite' ) . '</p>' .
            '<h2>' . __( 'What we share with others', 'dokan-lite' ) . '</h2>' .
            '<div contenteditable="false">' .
                '<p class="wp-policy-help">' . __( 'In this section you should list who you’re sharing data with, and for what purpose. This could include, but may not be limited to, analytics, marketing, payment gateways, shipping providers, and third party embeds.', 'dokan-lite' ) . '</p>' .
            '</div>' .
            '<p>' . __( 'We share information with third parties who help us provide our orders and store services to you; for example --', 'dokan-lite' ) . '</p>' .
            '<h3>' . __( 'Payments', 'dokan-lite' ) . '</h3>' .
            '<div contenteditable="false">' .
                '<p class="wp-policy-help">' . __( 'In this subsection you should list which third party payment processors you’re using to take payments on your store since these may handle customer data. We’ve included PayPal as an example, but you should remove this if you’re not using PayPal.', 'dokan-lite' ) . '</p>' .
            '</div>' .
            '<p>' . __( 'We accept payments through PayPal. When processing payments, some of your data will be passed to PayPal, including information required to process or support the payment, such as the purchase total and billing information.', 'dokan-lite' ) . '</p>' .
            '<p>' . __( 'Please see the <a href="https://www.paypal.com/us/webapps/mpp/ua/privacy-full">PayPal Privacy Policy</a> for more details.', 'dokan-lite' ) . '</p>'.
            '<h3>' . __( 'Modules', 'dokan-lite' ) . '</h3>' .
            '<div contenteditable="false">' .
                '<p class="wp-policy-help">' . __( 'Dokan has premium modules that perform specific and special purpose tasks. Each of the modules collect additional information. Also third party extensions and integrations collect data that is applicable to the each of their individual privacy policy.', 'dokan-lite' ) . '</p>' .
            '</div>';

        return apply_filters( 'dokan_privacy_policy_content', $content );
    }

    /**
     * Handle some custom types of data and anonymize them.
     *
     * @param string $anonymous Anonymized string.
     * @param string $type Type of data.
     * @param string $data The data being anonymized.
     *
     * @return string Anonymized string.
     */
    public function anonymize_custom_data_types( $anonymous, $type, $data ) {
        switch ( $type ) {
            case 'address_state':
            case 'address_country':
                $anonymous = ''; // Empty string - we don't want to store anything after removal.
                break;
            case 'phone':
                $anonymous = preg_replace( '/\d/u', '0', $data );
                break;
            case 'numeric_id':
                $anonymous = 0;
                break;
        }
        return $anonymous;
    }

    /**
     * Export vendor personal data
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function vendor_data_exporter( $email_address, $page ) {
        $user           = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.
        $data_to_export = array();

        if ( ! user_can( $user->ID, 'dokandar' ) ) {
            return array(
                'data' => $data_to_export,
                'done' => true,
            );
        }

        if ( $user instanceof WP_User ) {
            $data_to_export[] = array(
                'group_id'    => 'dokan_vendor',
                'group_label' => __( 'Vendor Data', 'dokan-lite' ),
                'item_id'     => 'user',
                'data'        => $this->get_vendor_personal_data( $user ),
            );
        }

        return array(
            'data' => $data_to_export,
            'done' => true,
        );
    }

    /**
     * Get vendor pers
     *
     * @since 2.8.2
     *
     * @return void
     */
    public function get_vendor_personal_data( $user ) {
        $personal_data = array();
        $vendor        = dokan()->vendor->get( $user->ID );

        if ( ! $vendor ) {
            return array();
        }

        $props_to_export = apply_filters( 'dokan_privacy_export_vendor_personal_data_props', array(
            'store_name' => __( 'Store Name', 'dokan-lite' ),
            'social'     => __( 'Social', 'dokan-lite' ),
            'phone'      => __( 'Phone', 'dokan-lite' ),
            'address'    => __( 'Address', 'dokan-lite' ),
            'location'   => __( 'GEO Locations', 'dokan-lite' ),
            'banner'     => __( 'Banner Url', 'dokan-lite' ),
            'gravatar'   => __( 'Gravatar Url', 'dokan-lite' ),
        ), $vendor );

        $shop_data = $vendor->get_shop_info();

        foreach ( $props_to_export as $prop => $description ) {
            $value = '';

            if ( isset( $shop_data[$prop] ) && !is_array( $shop_data[$prop] ) ) {
                $value = $shop_data[$prop];
            }

            if ( 'social' === $prop ) {
                $social_data = array();
                $social_field = array(
                    'fb'        => __( 'Facebook', 'dokan-lite' ),
                    'gplus'     => __( 'Google Plus', 'dokan-lite' ),
                    'twitter'   => __( 'Twitter', 'dokan-lite' ),
                    'pinterest' => __( 'Pinterest', 'dokan-lite' ),
                    'linkedin'  => __( 'Linkedin', 'dokan-lite' ),
                    'youtube'   => __( 'Youtube', 'dokan-lite' ),
                    'instagram' => __( 'Instagram', 'dokan-lite' ),
                    'flickr'    => __( 'Flickr', 'dokan-lite' )
                );

                foreach ( $social_field as $social_key => $social_data_title ) {
                    if ( !empty( $shop_data['social'][$social_key] ) ) {
                        $social_data[] = $social_data_title . ': ' . '<a href="' . $shop_data['social'][$social_key] .'">' . $shop_data['social'][$social_key] . '</a>';
                    }
                }

                $value = implode( ', ', $social_data );
            }

            if ( 'address' === $prop ) {
                $address_data = array();
                $address_field = array(
                    'street_1' => __( 'Address 1', 'dokan-lite' ),
                    'street_2' => __( 'Address 2', 'dokan-lite' ),
                    'city'     => __( 'City', 'dokan-lite' ),
                    'zip'      => __( 'Postal Code', 'dokan-lite' ),
                    'country'  => __( 'Country', 'dokan-lite' ),
                    'state'    => __( 'State', 'dokan-lite' )
                );

                foreach ( $address_field as $address_key => $address_data_title ) {
                    if ( !empty( $shop_data['address'][$address_key] ) ) {

                        if ( 'country' === $address_key ) {

                            $countries      = WC()->countries->get_countries();
                            $country_name   = ! empty( $countries[ $shop_data['address'][$address_key] ] ) ? $countries[ $shop_data['address'][$address_key] ] : '';
                            $address_data[] = $address_data_title . ': ' . $country_name;

                        } elseif ( 'state' === $address_key ) {

                            $states         = WC()->countries->get_states( $shop_data['address']['country'] );
                            $state_name     = isset( $states[ $shop_data['address'][$address_key] ] ) ? $states[ $shop_data['address'][$address_key] ] : $shop_data['address'][$address_key];
                            $address_data[] = $address_data_title . ': ' . $state_name;

                        } else {
                            $address_data[] = $address_data_title . ': '. $shop_data['address'][$address_key];
                        }
                    }
                }

                $value = implode( ', ', $address_data );
            }

            if ( in_array( $prop, array( 'banner', 'gravatar' ) ) ) {
                $attachment_url = wp_get_attachment_url( $shop_data[$prop] );
                $value          = sprintf( '<a href="%1$s">%1$s</a>', $attachment_url );
            }

            $value = apply_filters( 'dokan_privacy_export_vendor_personal_data_prop_value', $value, $prop, $vendor );

            if ( $value ) {
                $personal_data[] = array(
                    'name'  => $description,
                    'value' => $value
                );
            }
        }

        $payment_data = array();
        $payment_profile = $vendor->get_payment_profiles();

        foreach ( $payment_profile as $payment_method => $method_data ) {
            $value = '';

            if ( 'bank' === $payment_method ) {
                $bank_data   = array();
                $name        = __( 'Bank Details', 'dokan-lite' );
                $bank_fields = array(
                    'ac_name'        =>  __( 'Account Name', 'dokan-lite' ),
                    'ac_number'      =>  __( 'Account Number', 'dokan-lite' ),
                    'bank_name'      =>  __( 'Bank Name', 'dokan-lite' ),
                    'bank_addr'      =>  __( 'Bank Address', 'dokan-lite' ),
                    'routing_number' =>  __( 'Routing Number', 'dokan-lite' ),
                    'iban'           =>  __( 'IBAN', 'dokan-lite' ),
                    'swift'          =>  __( 'Swift Code', 'dokan-lite' ),
                );

                foreach ( $bank_fields as $field_key => $field_value ) {
                    $bank_data[] = $field_value . ': ' . $payment_profile['bank'][$field_key];
                }

                $value = implode( ', ', $bank_data );
            }

            if ( 'paypal' === $payment_method ) {
                $name  = __( 'PayPal Email', 'dokan-lite' );
                $value = isset( $method_data['email'] ) ? $method_data['email'] : '';
            }

            if ( 'skrill' === $payment_method ) {
                $name  = __( 'Skrill Email', 'dokan-lite' );
                $value = isset( $method_data['email'] ) ? $method_data['email'] : '';
            }

            if ( $value ) {
                $payment_data[] = array(
                    'name'  => $name,
                    'value' => $value,
                );
            }

            $payment_data = apply_filters( 'dokan_privacy_export_vendor_payment_data', $payment_data, $value, $name, $payment_profile );
        }

        $personal_data = array_merge( $personal_data, $payment_data );

        /**
         * Allow extensions to register their own personal data for this vendor for the export.
         *
         * @since 2.8.2
         * @param array    $personal_data Array of name value pairs.
         * @param WC_Order $order A vendor object.
         */
        $personal_data = apply_filters( 'dokan_privacy_export_vendor_personal_data', $personal_data, $vendor );

        return $personal_data;
    }

    /**
     * vendor_data_eraser
     *
     * @since 2.8.2
     *
     * @return array
     */
    public function vendor_data_eraser( $email_address, $page ) {
        $response = array(
            'items_removed'  => false,
            'items_retained' => false,
            'message'        => array(),
            'done'           => true,
        );

        $user = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.

        $vendor = dokan()->vendor->get( $user->ID );

        if ( ! $vendor ) {
            return;
        }

        $shop_data = $vendor->get_shop_info();

        if ( ! is_array( $shop_data ) || empty( $shop_data ) ) {
            return;
        }

        $this->erase_array_data( $shop_data );

        $update_data = array();
        $updated_data = $shop_data;

        if ( is_array( $updated_data ) && ! empty( $updated_data ) ) {
            $erased = true;
        } else {
            $erased = false;
        }

        if ( $erased ) {
            update_user_meta( $user->ID, 'dokan_profile_settings', $updated_data );

            $response['messages'][]    = sprintf( __( 'Vendor %s data is removed.', 'dokan-lite' ), $vendor->get_name() );
            $response['items_removed'] = true;
        }


        /**
         * Allow extensions to remove data for this vendor and adjust the response.
         *
         * @since 2.8.2
         *
         * @param array    $response Array resonse data. Must include messages, num_items_removed, num_items_retained, done.
         */
        return apply_filters( 'dokan_privacy_erase_personal_data_vendor', $response, $vendor );
    }

    /**
     * Errase array data
     *
     * @since 2.8.2
     *
     * @param array
     *
     * @return array
     */
    public function erase_array_data( &$data ) {
        if ( ! is_array( $data ) ) {
            return;
        }

        foreach ( $data as $key => &$value ) {
            if ( is_array( $value ) ) {
                $this->erase_array_data($value);
            } else {
                $value = '';
            }
        }
    }

}

new Dokan_Privacy();

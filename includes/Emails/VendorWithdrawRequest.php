<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Vendor_Withdraw_Request
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class VendorWithdrawRequest extends WC_Email {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id             = 'dokan_vendor_withdraw_request';
        $this->title          = __( 'Dokan New Withdrawal Request', 'dokan-lite' );
        $this->description    = __( 'These emails are sent to chosen recipient(s) when a vendor send request to withdraw', 'dokan-lite' );
        $this->template_html  = 'emails/withdraw-new.php';
        $this->template_plain = 'emails/plain/withdraw-new.php';
        $this->template_base  = DOKAN_DIR . '/templates/';
        $this->placeholders   = [
            '{store_name}'    => '',
            '{amount}'        => '',
            '{method}'        => '',
            '{profile_url}'   => '',
            '{withdraw_page}' => '',
            // Only for backward compatibility.
            '{user_name}'     => '',
            '{site_name}'     => $this->get_from_name(),
        ];

        // Triggers for this email
        add_action( 'dokan_after_withdraw_request', array( $this, 'trigger' ), 30, 3 );

        // Call parent constructor
        parent::__construct();

        // Other settings
        $this->recipient = $this->get_option( 'recipient', get_option( 'admin_email' ) );
    }

    /**
     * Get email subject.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}] A New withdrawal request is made by {store_name}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( 'New Withdraw Request from - {store_name}', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int $user_id User ID.
     * @param mixed $amount Withdrawal amount.
     * @param string $method Withdrawal method.
     */
    public function trigger( $user_id, $amount, $method ) {
        $seller = new Vendor( $user_id );

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->setup_locale();
        $this->object                          = $seller;
        $this->placeholders['{store_name}']    = $seller->get_shop_name();
        $this->placeholders['{amount}']        = dokan()->email->currency_symbol( $amount );
        $this->placeholders['{method}']        = dokan_withdraw_get_method_title( $method );
        $this->placeholders['{profile_url}']   = $seller->get_profile_url();
        $this->placeholders['{withdraw_page}'] = admin_url( 'admin.php?page=dokan#/withdraw?status=pending' );
        $this->placeholders['{user_name}']     = $seller->get_shop_name(); // for backward compatibility.

        $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        $this->restore_locale();
    }

        /**
     * Get content html.
     *
     * @access public
     * @return string
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html, array(
                'seller'             => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => false,
                'email'              => $this,
                'data'               => $this->placeholders,
            ), 'dokan/', $this->template_base
        );
    }

    /**
     * Get content plain.
     *
     * @access public
     * @return string
     */
    public function get_content_plain() {
        return wc_get_template_html(
            $this->template_plain, array(
                'seller'             => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => true,
                'email'              => $this,
                'data'               => $this->placeholders,
            ), 'dokan/', $this->template_base
        );
    }

    /**
     * Initialise settings form fields.
     */
    public function init_form_fields() {
        $placeholders = $this->placeholders;
        unset( $placeholders['{site_name}'], $placeholders['{user_name}'] );
        /* translators: %s: list of placeholders */
        $placeholder_text  = sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>' . implode( '</code>, <code>', array_keys( $placeholders ) ) . '</code>' );
        $this->form_fields = array(
            'enabled' => array(
                'title'         => __( 'Enable/Disable', 'dokan-lite' ),
                'type'          => 'checkbox',
                'label'         => __( 'Enable this email notification', 'dokan-lite' ),
                'default'       => 'yes',
            ),
            'recipient' => array(
                'title'         => __( 'Recipient(s)', 'dokan-lite' ),
                'type'          => 'text',
                // translators: 1) Email recipients
                'description'   => sprintf( __( 'Enter recipients (comma separated) for this email. Defaults to %s.', 'dokan-lite' ), '<code>' . esc_attr( get_option( 'admin_email' ) ) . '</code>' ),
                'placeholder'   => '',
                'default'       => '',
                'desc_tip'      => true,
            ),
            'subject' => array(
                'title'         => __( 'Subject', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => $placeholder_text,
                'placeholder'   => $this->get_default_subject(),
                'default'       => '',
            ),
            'heading' => array(
                'title'         => __( 'Email heading', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => $placeholder_text,
                'placeholder'   => $this->get_default_heading(),
                'default'       => '',
            ),
            'additional_content' => array(
                'title'       => __( 'Additional content', 'dokan-lite' ),
                'description' => __( 'Text to appear below the main email content.', 'dokan-lite' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 75px;',
                'placeholder' => __( 'N/A', 'dokan-lite' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_additional_content(),
                'desc_tip'    => true,
            ),
            'email_type' => array(
                'title'         => __( 'Email type', 'dokan-lite' ),
                'type'          => 'select',
                'description'   => __( 'Choose which format of email to send.', 'dokan-lite' ),
                'default'       => 'html',
                'class'         => 'email_type wc-enhanced-select',
                'options'       => $this->get_email_type_options(),
                'desc_tip'      => true,
            ),
        );
    }
}

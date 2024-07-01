<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Approved
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class WithdrawApproved extends WC_Email {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id             = 'dokan_vendor_withdraw_approved';
        $this->title          = __( 'Dokan Withdraw Approved', 'dokan-lite' );
        $this->description    = __( 'These emails are sent to vendor when a vendor withdraw request is approved', 'dokan-lite' );
        $this->template_html  = 'emails/withdraw-approve.php';
        $this->template_plain = 'emails/plain/withdraw-approve.php';
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
        add_action( 'dokan_withdraw_request_approved', [ $this, 'trigger' ], 30 );

        // Call parent constructor
        parent::__construct();

        // Other settings
        $this->recipient = 'vendor@ofthe.product';
    }

    /**
     * Get email subject.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}] Your withdrawal request was approved', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( 'Withdrawal request for {amount} is approved', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw .
     */
    public function trigger( $withdraw ) {
        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->setup_locale();
        $seller       = new Vendor( $withdraw->get_user_id() );
        $this->object = $seller;

        $this->placeholders['{store_name}']    = $seller->get_shop_name();
        $this->placeholders['{amount}']        = dokan()->email->currency_symbol( $withdraw->get_amount() );
        $this->placeholders['{method}']        = dokan_withdraw_get_method_title( $withdraw->get_method() );
        $this->placeholders['{profile_url}']   = esc_url( dokan_get_navigation_url( 'edit-account' ) );
        $this->placeholders['{withdraw_page}'] = esc_url( dokan_get_navigation_url( 'withdraw-requests' ) );
        $this->placeholders['{user_name}']     = $seller->get_shop_name(); // for backward compatibility.

        $this->send( $seller->get_email(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
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
            $this->template_html, [
                'seller'             => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => false,
                'email'              => $this,
                'data'               => $this->placeholders,
            ], 'dokan/', $this->template_base
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
            $this->template_plain, [
                'seller'             => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => true,
                'email'              => $this,
                'data'               => $this->placeholders,
            ], 'dokan/', $this->template_base
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
        $this->form_fields = [
            'enabled'    => [
                'title'   => __( 'Enable/Disable', 'dokan-lite' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable this email notification', 'dokan-lite' ),
                'default' => 'yes',
            ],
            'subject'    => [
                'title'       => __( 'Subject', 'dokan-lite' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_subject(),
                'default'     => '',
            ],
            'heading'    => [
                'title'       => __( 'Email heading', 'dokan-lite' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_heading(),
                'default'     => '',
            ],
            'additional_content' => array(
                'title'       => __( 'Additional content', 'dokan-lite' ),
                'description' => __( 'Text to appear below the main email content.', 'dokan-lite' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 75px;',
                'placeholder' => __( 'N/A', 'dokan-lite' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_additional_content(),
                'desc_tip'    => true,
            ),
            'email_type' => [
                'title'       => __( 'Email type', 'dokan-lite' ),
                'type'        => 'select',
                'description' => __( 'Choose which format of email to send.', 'dokan-lite' ),
                'default'     => 'html',
                'class'       => 'email_type wc-enhanced-select',
                'options'     => $this->get_email_type_options(),
                'desc_tip'    => true,
            ],
        ];
    }
}

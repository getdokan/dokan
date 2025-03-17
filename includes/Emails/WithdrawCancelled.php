<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * Withdraw Request Cancelled
 *
 * An email sent to the vendor when a withdrawal request is cancelled by admin.
 *
 * @class       Dokan_Email_Withdraw_Cancelled
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class WithdrawCancelled extends WC_Email {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id               = 'dokan_vendor_withdraw_cancelled';
        $this->title            = __( 'Dokan Withdraw cancelled', 'dokan-lite' );
        $this->description      = __( 'These emails are sent to vendor when a vendor withdraw request is cancelled', 'dokan-lite' );
        $this->template_html    = 'emails/withdraw-cancel.php';
        $this->template_plain   = 'emails/plain/withdraw-cancel.php';
        $this->template_base    = DOKAN_DIR . '/templates/';
        $this->placeholders = [
            '{store_name}'        => '',
            '{amount}'            => '',
            '{receivable_amount}' => '',
            '{method}'            => '',
            '{profile_url}'       => '',
            '{withdraw_page}'     => dokan_get_navigation_url( 'withdraw' ),
            '{note}'              => '',
            // Only for backward compatibility.
            '{user_name}'         => '',
            '{site_name}'         => $this->get_from_name(),
        ];

        // Triggers for this email
        add_action( 'dokan_withdraw_request_cancelled', array( $this, 'trigger' ), 30, 2 );

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
        return __( '[{site_title}] Your withdrawal request was cancelled', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( 'Withdrawal request for {amount} is cancelled', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw.
     */
    public function trigger( $withdraw ) {
        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->setup_locale();
        $seller                      = new Vendor( $withdraw->get_user_id() );
        $this->object                = $seller;

        $this->placeholders['{store_name}']        = $seller->get_shop_name();
        $this->placeholders['{amount}']            = dokan()->email->currency_symbol( $withdraw->get_amount() );
        $this->placeholders['{receivable_amount}'] = dokan()->email->currency_symbol( $withdraw->get_receivable_amount() );
        $this->placeholders['{method}']            = dokan_withdraw_get_method_title( $withdraw->get_method() );
        $this->placeholders['{profile_url}']       = dokan_get_navigation_url( 'edit-account' );
        $this->placeholders['{note}']              = $withdraw->get_note();
        $this->placeholders['{user_name}']         = $seller->get_shop_name(); // Only for  backward compatibility.

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
        ob_start();
        wc_get_template(
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
        return ob_get_clean();
    }

    /**
     * Get content plain.
     *
     * @access public
     * @return string
     */
    public function get_content_plain() {
        ob_start();
        wc_get_template(
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
        return ob_get_clean();
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

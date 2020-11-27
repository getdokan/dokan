<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;

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
        $this->id               = 'dokan_vendor_withdraw_request';
        $this->title            = __( 'Dokan New Withdrawal Request', 'dokan-lite' );
        $this->description      = __( 'These emails are sent to chosen recipient(s) when a vendor send request to withdraw', 'dokan-lite' );
        $this->template_html    = 'emails/withdraw-new.php';
        $this->template_plain   = 'emails/plain/withdraw-new.php';
        $this->template_base    = DOKAN_DIR . '/templates/';

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
        return __( '[{site_name}] A New withdrawal request is made by {user_name}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( 'New Withdraw Request from - {user_name}', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int $product_id The product ID.
     * @param array $postdata.
     */
    public function trigger( $user_id, $amount, $method ) {
        $seller = get_user_by( 'id', $user_id );

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->object                = $seller;
        $this->find['username']      = '{user_name}';
        $this->find['amount']        = '{amount}';
        $this->find['method']        = '{method}';
        $this->find['profile_url']   = '{profile_url}';
        $this->find['withdraw_page'] = '{withdraw_page}';
        $this->find['site_name']     = '{site_name}';
        $this->find['site_url']      = '{site_url}';

        $this->replace['username']      = $seller->user_login;
        $this->replace['amount']        = wc_price( $amount );
        $this->replace['method']        = dokan_withdraw_get_method_title( $method );
        $this->replace['profile_url']   = admin_url( 'user-edit.php?user_id=' . $seller->ID );
        $this->replace['withdraw_page'] = admin_url( 'admin.php?page=dokan#/withdraw?status=pending' );
        $this->replace['site_name']     = $this->get_from_name();
        $this->replace['site_url']      = site_url();

        $this->setup_locale();
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
        ob_start();

        wc_get_template(
            $this->template_html, array(
				'seller'        => $this->object,
				'email_heading' => $this->get_heading(),
				'sent_to_admin' => true,
				'plain_text'    => false,
				'email'         => $this,
				'data'          => $this->replace,
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
            $this->template_html, array(
				'seller'        => $this->object,
				'email_heading' => $this->get_heading(),
				'sent_to_admin' => true,
				'plain_text'    => true,
				'email'         => $this,
				'data'          => $this->replace,
            ), 'dokan/', $this->template_base
        );

        return ob_get_clean();
    }

    /**
     * Initialise settings form fields.
     */
    public function init_form_fields() {
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
                'description'   => sprintf( __( 'Enter recipients (comma separated) for this email. Defaults to %s.', 'dokan-lite' ), '<code>' . esc_attr( get_option( 'admin_email' ) ) . '</code>' ),
                'placeholder'   => '',
                'default'       => '',
                'desc_tip'      => true,
            ),
            'subject' => array(
                'title'         => __( 'Subject', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                /* translators: %s: list of placeholders */
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name},{amount},{user_name}</code>' ),
                'placeholder'   => $this->get_default_subject(),
                'default'       => '',
            ),
            'heading' => array(
                'title'         => __( 'Email heading', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                /* translators: %s: list of placeholders */
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name},{amount},{user_name}</code>' ),
                'placeholder'   => $this->get_default_heading(),
                'default'       => '',
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

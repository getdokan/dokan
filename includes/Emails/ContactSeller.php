<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * Customer Email to vendor from contact form widget.
 *
 * @class       Dokan_Email_Contact_Seller
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class ContactSeller extends WC_Email {

    /**
     * Reply email
     *
     * @since DOKAN_LITE_SINCE
     *
     * @var string
     */
    private $from_email;

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id             = 'dokan_contact_seller';
        $this->title          = __( 'Dokan Contact Vendor', 'dokan-lite' );
        $this->description    = __( 'These emails are sent to a vendor who is contacted by customer via contact form widget ', 'dokan-lite' );
        $this->template_html  = 'emails/contact-seller.php';
        $this->template_plain = 'emails/plain/contact-seller.php';
        $this->template_base  = DOKAN_DIR . '/templates/';
        $this->placeholders   = [
            '{store_name}'     => '',
            '{customer_name}'  => '',
            '{customer_email}' => '',
            '{message}'        => '',
            // only for backward compatibility
            '{site_name}'      => $this->get_from_name(),
            '{seller_name}'    => '',
        ];

        // Triggers for this email
        add_action( 'dokan_trigger_contact_seller_mail', array( $this, 'trigger' ), 30, 4 );

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
        return __( '[{customer_name}] sent you a message from your store at - {site_title}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( '{customer_name} - Sent a message from {site_title}', 'dokan-lite' );
    }

    /**
     * Trigger this email.
     */
    public function trigger( $seller_email, $contact_name, $contact_email, $contact_message ) {
        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }
        $this->setup_locale();

        $this->from_email = $contact_email;

        $seller = get_user_by( 'email', $seller_email );
        $seller = new Vendor( $seller );

        $this->placeholders['{store_name}']     = $seller->get_shop_name();
        $this->placeholders['{customer_name}']  = $contact_name;
        $this->placeholders['{customer_email}'] = $contact_email;
        $this->placeholders['{message}']        = $contact_message;
        $this->placeholders['{seller_name}']    = $seller->get_shop_name(); // only for backward compatibility.
        $this->send( $seller_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        $this->restore_locale();
    }

    /**
     * Get the from address for outgoing emails.
     *
     * @return string
     */
    public function get_from_address( $from_email = '' ) {
        return $this->from_email;
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
     * Initialize settings form fields.
     */
    public function init_form_fields() {
        $placeholders = $this->placeholders;
        unset( $placeholders['{site_name}'], $placeholders['{seller_name}'] );
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

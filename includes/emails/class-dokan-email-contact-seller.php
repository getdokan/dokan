<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Dokan_Email_Contact_Seller' ) ) :

/**
 * Customer Email to vendor from contact form widget.
 *
 * @class       Dokan_Email_Contact_Seller
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class Dokan_Email_Contact_Seller extends WC_Email {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id               = 'dokan_contact_seller';
		$this->title            = __( 'Dokan Contact Vendor', 'dokan-lite' );
		$this->description      = __( 'These emails are sent to a vendor who is contacted by customer via contact form widget ', 'dokan-lite' );
                $this->template_html    = 'emails/contact-seller.php';
		$this->template_plain   = 'emails/plain/contact-seller.php';
                $this->template_base    = DOKAN_DIR.'/templates/';
                
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
            return __( '[{customer_name}] sent you a message from your store at - {site_name}', 'dokan-lite' );
	}

	/**
	 * Get email heading.
	 *
	 * @since  3.1.0
	 * @return string
	 */
	public function get_default_heading() {
            return __( '{customer_name} - Sent a message from {site_name}', 'dokan-lite' );
	}

	/**
	 * Trigger the this email.
	 */
	public function trigger( $seller_email, $contact_name, $contact_email, $contact_message ) {
            
            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }
            
            $seller = get_user_by( 'email', $seller_email );

            $this->find['seller_name']    = '{seller_name}';
            $this->find['customer_name']  = '{customer_name}';
            $this->find['customer_email'] = '{customer_email}';
            $this->find['message']        = '{message}';
            $this->find['site_name']      = '{site_name}';
            $this->find['site_url']       = '{site_url}';

            $this->replace['seller_name']    = $seller->display_name;
            $this->replace['customer_name']  = $contact_name;
            $this->replace['customer_email'] = $contact_email;
            $this->replace['message']        = $contact_message;
            $this->replace['site_name']      = $this->get_from_name();
            $this->replace['site_url']       = site_url();

            $this->setup_locale();
            $this->send( $seller_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
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
                wc_get_template( $this->template_html, array(
                    'email_heading' => $this->get_heading(),
                    'sent_to_admin' => true,
                    'plain_text'    => false,
                    'email'         => $this,
                    'data'          => $this->replace
                ), 'dokan/', $this->template_base );
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
                wc_get_template( $this->template_html, array(
                    'email_heading' => $this->get_heading(),
                    'sent_to_admin' => true,
                    'plain_text'    => true,
                    'email'         => $this,
                    'data'          => $this->replace
                ), 'dokan/', $this->template_base );
            return ob_get_clean();
	}

	/**
	 * Initialize settings form fields.
	 */
	public function init_form_fields() {
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
				/* translators: %s: list of placeholders */
				'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{seller_name}, {customer_name}, {site_name}</code>' ),
				'placeholder'   => $this->get_default_subject(),
				'default'       => '',
			),
			'heading' => array(
				'title'         => __( 'Email heading', 'dokan-lite' ),
				'type'          => 'text',
				'desc_tip'      => true,
				/* translators: %s: list of placeholders */
				'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{seller_name}, {customer_name}, {site_name}</code>' ),
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

endif;

return new Dokan_Email_Contact_Seller();

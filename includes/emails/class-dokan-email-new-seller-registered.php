<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Dokan_Email_New_Seller' ) ) :

/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Seller
 * @version     2.6.6
 * @package     Dokan/Classes/Emails
 * @author      weDevs
 * @extends     WC_Email
 */
class Dokan_Email_New_Seller extends WC_Email {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id               = 'dokan_new_seller';
		$this->title            = __( 'Dokan New Seller Registered', 'dokan-lite' );
		$this->description      = __( 'These emails are sent to chosen recipient(s) when a new vendor registers in marketplace', 'dokan-lite' );
                $this->template_html    = 'emails/new-seller-registered.php';
		$this->template_plain   = 'emails/plain/new-seller-registered.php';
                $this->template_base    = DOKAN_DIR.'/templates/';
                
		// Triggers for this email
		add_action( 'dokan_new_seller_created', array( $this, 'trigger' ), 30, 2 );

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
            return __( '[{site_name}] A New vendor has registered', 'dokan-lite' );
	}

	/**
	 * Get email heading.
	 *
	 * @since  3.1.0
	 * @return string
	 */
	public function get_default_heading() {
            return __( 'New Vendor Registered - {seller_name}', 'dokan-lite' );
	}

	/**
	 * Trigger the sending of this email.
	 *
	 * @param int $product_id The product ID.
	 * @param array $postdata.
	 */
	public function trigger( $user_id, $dokan_settings ) {
            
            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }
            
            $seller                    = get_user_by( 'id', $user_id );
            $this->object              = $seller;
            $this->find['seller_name'] = '{seller_name}';
            $this->find['store_url']   = '{store_url}';
            $this->find['store_name']  = '{store_name}';
            $this->find['seller_edit'] = '{seller_edit}';
            $this->find['site_name']   = '{site_name}';
            $this->find['site_url']    = '{site_url}';

            $this->replace['seller_name']  = $seller->display_name;
            $this->replace['store_url']    = dokan_get_store_url( $seller->ID );
            $this->replace['store_name']   = $dokan_settings['store_name'];
            $this->replace['seller_edit']  = admin_url( 'user-edit.php?user_id=' . $user_id );
            $this->replace['site_name']    = $this->get_from_name();
            $this->replace['site_url']     = site_url();

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
                wc_get_template( $this->template_html, array(
                    'seller'        => $this->object,
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
                    'seller'        => $this->object,
                    'email_heading' => $this->get_heading(),
                    'sent_to_admin' => true,
                    'plain_text'    => true,
                    'email'         => $this,
                    'data'          => $this->replace
                ), 'dokan/', $this->template_base );
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
				'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}, {store_name}, {seller_name}</code>' ),
				'placeholder'   => $this->get_default_subject(),
				'default'       => '',
			),
			'heading' => array(
				'title'         => __( 'Email heading', 'dokan-lite' ),
				'type'          => 'text',
				'desc_tip'      => true,
				/* translators: %s: list of placeholders */
				'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}, {store_name}, {seller_name}</code>' ),
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

return new Dokan_Email_New_Seller();

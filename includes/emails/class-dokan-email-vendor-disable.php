<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'Dokan_Email_Vendor_Disable' ) ) :

    /**
    * Admin announcement Email to vendors
    *
    * @class       Dokan_Email_Vendor_Disable
    * @version     2.7.9
    * @author      weDevs
    * @extends     WC_Email
    */
    class Dokan_Email_Vendor_Disable extends WC_Email {

        /**
        * Constructor.
        */
        public function __construct() {
            $this->id               = 'dokan_email_vendor_disable';
            $this->title            = __( 'Dokan Vendor Disable', 'dokan' );
            $this->description      = __( 'This email is set to a vendor when his account is deactivated by admin', 'dokan' );
            $this->template_html    = 'emails/vendor-disabled.php';
            $this->template_plain   = 'emails/plain/vendor-disabled.php';
            $this->template_base    = DOKAN_DIR.'/templates/';

            // Triggers for this email
            add_action( 'dokan_vendor_disabled', array( $this, 'trigger' ), 10, 2 );

            // Call parent constructor
            parent::__construct();

            $this->recipient = 'vendor@ofthe.product';
        }

        /**
        * Get email subject.
        * @return string
        */
        public function get_default_subject() {
            return __( '[{site_name}] Your account is deactivated', 'dokan' );
        }

        /**
        * Get email heading.
        * @return string
        */
        public function get_default_heading() {
            return __( 'Your vendor account is deactivated', 'dokan' );
        }

        /**
        * Trigger the this email.
        */
        public function trigger( $seller_id, $status ) {
            if ( ! $this->is_enabled() ) {
                return;
            }

            $this->find['site_name']        = '{site_name}';
            $this->replace['site_name']     = $this->get_from_name();

            $this->setup_locale();

            $seller = get_user_by( 'ID', $seller_id );
            $seller_email = $seller->user_email;

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
                'sent_to_admin' => false,
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
                'sent_to_admin' => false,
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
                    'title'         => __( 'Enable/Disable', 'dokan' ),
                    'type'          => 'checkbox',
                    'label'         => __( 'Enable this email notification', 'dokan' ),
                    'default'       => 'yes',
                ),

                'subject' => array(
                    'title'         => __( 'Subject', 'dokan' ),
                    'type'          => 'text',
                    'desc_tip'      => true,
                    /* translators: %s: list of placeholders */
                    'description'   => sprintf( __( 'Available placeholders: %s', 'dokan' ), '<code>{title}, {message}, {site_name}</code>' ),
                    'placeholder'   => $this->get_default_subject(),
                    'default'       => '',
                ),
                'heading' => array(
                    'title'         => __( 'Email heading', 'dokan' ),
                    'type'          => 'text',
                    'desc_tip'      => true,
                    /* translators: %s: list of placeholders */
                    'description'   => sprintf( __( 'Available placeholders: %s', 'dokan' ), '<code>{title}, {message}, {site_name}</code>' ),
                    'placeholder'   => $this->get_default_heading(),
                    'default'       => '',
                ),
                'email_type' => array(
                    'title'         => __( 'Email type', 'dokan' ),
                    'type'          => 'select',
                    'description'   => __( 'Choose which format of email to send.', 'dokan' ),
                    'default'       => 'html',
                    'class'         => 'email_type wc-enhanced-select',
                    'options'       => $this->get_email_type_options(),
                    'desc_tip'      => true,
                ),
            );
        }
    }

endif;

return new Dokan_Email_Vendor_Disable();

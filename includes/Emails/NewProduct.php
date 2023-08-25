<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;

/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Product
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class NewProduct extends WC_Email {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id             = 'new_product';
        $this->title          = __( 'Dokan New Product', 'dokan-lite' );
        $this->description    = __( 'New Product emails are sent to chosen recipient(s) when a new product is created by vendors.', 'dokan-lite' );
        $this->template_html  = 'emails/new-product.php';
        $this->template_plain = 'emails/plain/new-product.php';
        $this->template_base  = DOKAN_DIR . '/templates/';
        $this->placeholders = [
            '{product_title}' => '',
            '{price}'         => '',
            '{seller_name}'   => '',
            '{seller_url}'    => '',
            '{category}'      => '',
            '{product_link}'  => '',
            '{site_name}'     => '',
            '{site_url}'      => '',
        ];

        // Triggers for this email
        add_action( 'dokan_new_product_added', array( $this, 'trigger' ), 30, 2 );

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
            return __( '[{site_name}] A New product is added by ({seller_name}) - {product_title}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
            return __( 'New product added by Vendor {seller_name}', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int $product_id The product ID.
     * @param array $postdata.
     */
    public function trigger( $product_id, $postdata ) {
        if ( dokan_get_option( 'product_add_mail', 'dokan_general', 'on' ) !== 'on' ) {
            return;
        }

        if ( dokan_get_new_post_status() === 'pending' ) {
            do_action( 'dokan_email_trigger_new_pending_product', $product_id, $postdata );

            return;
        }

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }
        $this->setup_locale();

        $product       = wc_get_product( $product_id );
        $seller_id     = get_post_field( 'post_author', $product_id );
        $seller        = get_user_by( 'id', $seller_id );
        $category      = wp_get_post_terms( dokan_get_prop( $product, 'id' ), 'product_cat', array( 'fields' => 'names' ) );
        $category_name = $category ? reset( $category ) : 'N/A';

        if ( is_a( $product, 'WC_Product' ) ) {
            $this->object = $product;
            $this->placeholders['{product_title}'] = $product->get_title();
            $this->placeholders['{price}']         = $product->get_price();
            $this->placeholders['{seller_name}']   = $seller->display_name;
            $this->placeholders['{seller_url}']    = dokan_get_store_url( $seller->ID );
            $this->placeholders['{category}']      = $category_name;
            $this->placeholders['{product_link}']  = admin_url( 'post.php?action=edit&post=' . $product_id );
            $this->placeholders['{site_name}']     = $this->get_from_name();
            $this->placeholders['{site_url}']      = site_url();
        }

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
                        'product'            => $this->object,
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
                    $this->template_html, array(
                        'product'            => $this->object,
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
        /* translators: %s: list of placeholders */
        $placeholder_text  = sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>' . implode( '</code>, <code>', array_keys( $this->placeholders ) ) . '</code>' );
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

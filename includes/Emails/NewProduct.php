<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

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
            '{store_name}'    => '',
            '{seller_url}'    => '',
            '{category}'      => '',
            '{product_link}'  => '',
            // only for backward compatibility
            '{site_name}'     => $this->get_from_name(),
            '{seller_name}'   => '',
        ];

        // Triggers for this email
        add_action( 'dokan_new_product_added', array( $this, 'trigger' ), 30, 1 );
        add_action( 'dokan_product_updated', array( $this, 'trigger' ), 30, 1 );

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
            return __( '[{site_title}] A New product is added by ({store_name}) - {product_title}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
            return __( 'New product added by Vendor {store_name}', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int $product_id The product ID.
     */
    public function trigger( $product_id ) {
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }

        // we've added _dokan_new_product_email_sent from version 3.8.2
        // so, we are assuming if the meta doesn't exist, email was already sent to the client
        $email_sent = $product->get_meta( '_dokan_new_product_email_sent' );
        if ( empty( $email_sent ) || true === wc_string_to_bool( $email_sent ) ) {
            return;
        }

        if ( 'publish' !== $product->get_status() ) {
            return;
        }

        $product->update_meta_data( '_dokan_new_product_email_sent', 'yes' );
        $product->save();

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->setup_locale();

        $seller_id     = get_post_field( 'post_author', $product_id );
        $seller        = new Vendor( $seller_id );
        $category      = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'names' ) );
        $category_name = $category ? implode( ', ', $category ) : 'N/A';
        $this->object  = $product;

        $this->placeholders['{product_title}'] = $product->get_title();
        $this->placeholders['{price}']         = dokan()->email->currency_symbol( $product->get_price() );
        $this->placeholders['{store_name}']    = $seller->get_shop_name();
        $this->placeholders['{seller_url}']    = $seller->get_shop_url();
        $this->placeholders['{category}']      = $category_name;
        $this->placeholders['{product_link}']  = admin_url( 'post.php?action=edit&post=' . $product_id );
        $this->placeholders['{seller_name}']   = $seller->get_shop_name(); //for backward compatibility.

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
            $this->template_html,
            array(
                'product'            => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => false,
                'email'              => $this,
                'data'               => $this->placeholders,
            ),
            'dokan/',
            $this->template_base
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
            $this->template_plain,
            array(
                'product'            => $this->object,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
                'plain_text'         => true,
                'email'              => $this,
                'data'               => $this->placeholders,
            ),
            'dokan/',
            $this->template_base
        );
    }

    /**
     * Initialise settings form fields.
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

<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * New Product Published Email to vendor.
 *
 * An email sent to the vendor when a pending Product is published by admin.
 *
 * @class       Dokan_Email_Product_Published
 * @version     2.6.8
 * @author      weDevs
 * @extends     WC_Email
 */
class ProductPublished extends WC_Email {

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id             = 'pending_product_published';
        $this->title          = __( 'Dokan Pending Product Published', 'dokan-lite' );
        $this->description    = __( 'These emails are sent to vendor of the product when a pending product is published.', 'dokan-lite' );
        $this->template_html  = 'emails/product-published.php';
        $this->template_plain = 'emails/plain/product-published.php';
        $this->template_base  = DOKAN_DIR . '/templates/';
        $this->placeholders   = [
            '{product_title}'     => '',
            '{price}'             => '',
            '{store_name}'        => '',
            '{product_url}'       => '',
            '{product_edit_link}' => '',
            // only for backward compatibility.
            '{site_name}'         => $this->get_from_name(),
            '{seller_name}'       => '',
        ];

        // Triggers for this email
        add_action( 'dokan_pending_product_published_notification', array( $this, 'trigger' ), 30, 2 );

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
            return __( '[{site_title}] Your product - {product_title} - is now published', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
            return __( '{product_title} - is published', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param \WP_Post $post The product as post.
     * @param \WP_User $seller.
     */
    public function trigger( $post, $seller ) {
		if ( ! $this->is_enabled() || ! $this->get_recipient() || ! $seller ) {
			return;
		}

        $product = wc_get_product( $post->ID );
        if ( ! $product ) {
            return;
        }
        $this->setup_locale();

        $product_edit_url = remove_query_arg( '_dokan_edit_product_nonce', dokan_edit_product_url( $post->ID ) );
        $product_edit_url = add_query_arg( '_view_mode', 'product_email', $product_edit_url );

        $this->object = $product;
        $seller = new Vendor( $seller );

        $this->placeholders['{product_title}']     = $product->get_title();
        $this->placeholders['{price}']             = dokan()->email->currency_symbol( $product->get_price() );
        $this->placeholders['{store_name}']        = $seller->get_shop_name();
        $this->placeholders['{product_url}']       = get_permalink( $post->ID );
        $this->placeholders['{product_edit_link}'] = $product_edit_url;
        $this->placeholders['{seller_name}']       = $seller->get_shop_name(); // Only for backward compatibility.

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
                'product'            => $this->object,
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

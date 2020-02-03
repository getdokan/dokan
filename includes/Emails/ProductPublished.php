<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;

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
        $this->id               = 'pending_product_published';
        $this->title            = __( 'Dokan Pending Product Published', 'dokan-lite' );
        $this->description      = __( 'These emails are sent to vendor of the product when a pending product is published.', 'dokan-lite' );
        $this->template_html    = 'emails/product-published.php';
        $this->template_plain   = 'emails/plain/product-published.php';
        $this->template_base    = DOKAN_DIR.'/templates/';

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
            return __( '[{site_name}] Your product - {product_title} - is now published', 'dokan-lite' );
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
     * @param int $product_id The product ID.
     * @param array $postdata.
     */
    public function trigger( $post, $seller ) {

            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }

            $product       = wc_get_product( $post->ID );

            if ( is_a( $product, 'WC_Product' ) ) {
                $this->object                = $product;

                $this->find['product-title']     = '{product_title}';
                $this->find['price']             = '{price}';
                $this->find['seller-name']       = '{seller_name}';
                $this->find['product_url']       = '{product_url}';
                $this->find['product_edit_link'] = '{product_edit_link}';
                $this->find['site_name']         = '{site_name}';
                $this->find['site_url']          = '{site_url}';

                $this->replace['product-title']     = $product->get_title();
                $this->replace['price']             = $product->get_price();
                $this->replace['seller-name']       = $seller->display_name;
                $this->replace['product_url']       = get_permalink( $post->ID );
                $this->replace['product_edit_link'] = dokan_edit_product_url( $post->ID );
                $this->replace['site_name']         = $this->get_from_name();
                $this->replace['site_url']          = site_url();
            }

            $this->setup_locale();
            $this->send( $seller->user_email, $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
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
                    'product'       => $this->object,
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
                    'product'       => $this->object,
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

            'subject' => array(
                'title'         => __( 'Subject', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                /* translators: %s: list of placeholders */
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}, {product_title}, {seller_name}</code>' ),
                'placeholder'   => $this->get_default_subject(),
                'default'       => '',
            ),
            'heading' => array(
                'title'         => __( 'Email heading', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                /* translators: %s: list of placeholders */
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}, {product_title}, {seller_name}</code>' ),
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

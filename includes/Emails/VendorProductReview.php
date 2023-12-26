<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;

/**
 * Send email to vendor when a product is reviewed
 *
 * @since       3.9.2
 *
 * @class       Dokan_Email_Vendor_Product_Review
 *
 * @author      weDevs
 *
 * @extends     WC_Email
 */
class VendorProductReview extends WC_Email {

    /**
     * Reply email
     *
     * @since 3.9.2
     *
     * @var string
     */
    private $from_email;

    /**
     * Constructor.
     *
     * @since 3.9.2
     */
    public function __construct() {
        $this->id             = 'dokan_contact_seller';
        $this->title          = __( 'Dokan Vendor Product Review', 'dokan-lite' );
        $this->description    = __( 'After a product has been reviewed, an email is sent to the vendor containing information about the review. The email may include details such as the reviewer’s name, the product’s name and description, the review rating, and the review text. The email may also contain a link to the review page where the vendor can view the review and respond to it if necessary.', 'dokan-lite' );
        $this->template_html  = 'emails/vendor-product-review.php';
        $this->template_plain = 'emails/plain/vendor-product-review.php';
        $this->template_base  = DOKAN_DIR . '/templates/';
        $this->placeholders   = [
            '{store_name}'     => '',
            '{product_name}'   => '',
            '{customer_name}'  => '',
            '{rating}'         => '',
            '{review_text}'    => '',
            '{review_link}'    => '',
        ];

        // Triggers for this email
        add_action( 'wp_set_comment_status', [ $this, 'trigger' ], 35, 1 );
        add_action( 'comment_post', [ $this, 'trigger' ], 35, 1 );

        // Call parent constructor
        parent::__construct();

        // Other settings
        $this->recipient = 'vendor@ofthe.product';
    }

    /**
     * Get the email subject.
     *
     * @since  3.9.2
     *
     * @return string
     */
    public function get_default_subject() {
        return __( 'New Product Review Alert from {site_title}', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since  3.9.2
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'New Product Review Alert From Your Store: {store_name} at - {site_title}', 'dokan-lite' );
    }

    /**
     * Trigger this email.
     *
     * @since 3.9.2
     *
     * @param int $comment_id
     *
     * @return void
     */
    public function trigger( $comment_id ) {
        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $comment = get_comment( $comment_id );
        if ( ! $comment ) {
            // the comment does not exist
            return;
        }

        $product = wc_get_product( $comment->comment_post_ID );
        if ( ! $product ) {
            // the review is not for a product
            return;
        }

        $this->setup_locale();

        $this->from_email = get_option( 'admin_email' );

        // get the vendor
        $seller = dokan_get_vendor_by_product( $product->get_id() );

        $this->placeholders['{store_name}']     = $seller->get_shop_name();
        $this->placeholders['{product_name}']   = $product->get_title();
        $this->placeholders['{customer_name}']  = $comment->comment_author;
        $this->placeholders['{rating}']         = (int) get_comment_meta( $comment->comment_ID, 'rating', true );
        $this->placeholders['{review_text}']    = wp_specialchars_decode( $comment->comment_content );
        $this->placeholders['{review_link}']    = get_comment_link( $comment );
        $this->send( $seller->get_email(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        $this->restore_locale();
    }

    /**
     * Get the from address for outgoing emails.
     *
     * @since 3.9.2
     *
     * @return string
     */
    public function get_from_address( $from_email = '' ) {
        return $this->from_email;
    }

    /**
     * Get content html.
     *
     * @since 3.9.2
     *
     * @return string
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html,
            [
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => false,
                'plain_text'         => false,
                'email'              => $this,
                'data'               => $this->placeholders,
            ],
            'dokan/', $this->template_base
        );
    }

    /**
     * Get content plain.
     *
     * @since 3.9.2
     *
     * @return string
     */
    public function get_content_plain() {
        return wc_get_template_html(
            $this->template_plain,
            [
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => false,
                'plain_text'         => true,
                'email'              => $this,
                'data'               => $this->placeholders,
            ],
            'dokan/', $this->template_base
        );
    }

    /**
     * Initialize settings form fields.
     *
     * @since 3.9.2
     */
    public function init_form_fields() {
        /* translators: %s: list of placeholders */
        $placeholder_text  = sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>' . implode( '</code>, <code>', array_keys( $this->placeholders ) ) . '</code>' );
        $this->form_fields = [
            'enabled' => [
                'title'   => __( 'Enable/Disable', 'dokan-lite' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable this email notification', 'dokan-lite' ),
                'default' => 'yes',
            ],

            'subject'            => [
                'title'       => __( 'Subject', 'dokan-lite' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_subject(),
                'default'     => $this->get_default_subject(),
            ],
            'heading'            => [
                'title'       => __( 'Email heading', 'dokan-lite' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_heading(),
                'default'     => $this->get_default_heading(),
            ],
            'additional_content' => [
                'title'       => __( 'Additional content', 'dokan-lite' ),
                'description' => __( 'Text to appear below the main email content.', 'dokan-lite' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 75px;',
                'placeholder' => __( 'N/A', 'dokan-lite' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_additional_content(),
                'desc_tip'    => false,
            ],
            'email_type'         => [
                'title'       => __( 'Email type', 'dokan-lite' ),
                'type'        => 'select',
                'description' => __( 'Choose which format of email to send.', 'dokan-lite' ),
                'default'     => 'html',
                'class'       => 'email_type wc-enhanced-select',
                'options'     => $this->get_email_type_options(),
                'desc_tip'    => true,
            ],
        ];
    }
}

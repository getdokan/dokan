<?php
/**
 * Vendor enable email to vendors.
 *
 * An email sent to the vendor(s) when a he or she is enabled by the admin
 *
 * @class       Dokan_Email_Vendor_Disable
 * @version     2.7.9
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php _e( 'Hello', 'dokan' ); ?>,
</p>
<p>
    <?php _e( 'Sorry, your vendor account is deactivated.', 'dokan' ); ?>
</p>
<p>
    <?php _e( 'You can\'t sell or upload product anymore. To activate your account please contact with the admin.', 'dokan' ); ?>
</p>
<?php
do_action( 'woocommerce_email_footer', $email );

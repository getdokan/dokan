<?php

namespace WeDevs\Dokan;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Fake Mailer Class
 *
 * @since DOKAN_SINCE Moved this class from includes/wc-functions.php file
 */
class FakeMailer {
    public function Send() {
    }
}

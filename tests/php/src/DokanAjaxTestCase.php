<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\Factories\DokanFactory;
use WP_Ajax_UnitTestCase;

abstract class DokanAjaxTestCase extends WP_Ajax_UnitTestCase {
    use DBAssertionTrait;

	public function setUp(): void {
        parent::setUp();

        // Remove unnecessary actions
        remove_action( 'admin_init', [ dokan()->core, 'block_admin_access' ], 10 );
        remove_action( 'admin_init', [ dokan()->core, 'redirect_after_activate' ], 999 );

        remove_action( 'admin_init', [ \WC_Tracks_Client::class, 'maybe_set_identity_cookie' ] );
	}

	/**
	 * @inheritDoc
     *
	 * @return DokanFactory The fixture factory.
	 */
	protected static function factory() {
		static $factory = null;

		if ( ! $factory ) {
			$factory = new DokanFactory();
		}

		return $factory;
	}
}

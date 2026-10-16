<?php

namespace WeDevs\Dokan\Test\Helpers;

use ActionScheduler_QueueRunner;
use ActionScheduler_Store;

/**
 * Helper code for wc-admin unit tests.
 *
 * @package WooCommerce\Admin\Tests\Framework\Helpers
 */

/**
 * Class WC_Helper_Queue.
 *
 * This helper class should ONLY be used for unit tests!.
 */
class WC_Helper_Queue {
	/**
	 * Get all pending queued actions.
	 *
	 * @return array Pending jobs.
	 */
	public static function get_all_pending() {
		$jobs = WC()->queue()->search(
			array(
				'per_page' => -1,
				'status'   => 'pending',
				'claimed'  => false,
			)
		);

		return $jobs;
	}

	/**
	 * Run all pending queued actions that are due within the next minute.
	 *
	 * Only near-due actions are run. Recurring actions (e.g.
	 * `dokan_daily_midnight_cron`) and self-rescheduling ones (e.g.
	 * `woocommerce_cancel_unpaid_orders`) queue their next instance every time
	 * they are processed, even on failure, so draining every pending action
	 * never terminates. Those next instances land in the future, while the
	 * wc-admin import chain schedules at `time() + 5`, so a one-minute horizon
	 * runs the chains tests rely on and stops at the reschedules. Each action
	 * is also processed at most once, so one that stays pending cannot spin
	 * the loop either.
	 *
	 * @return void
	 */
	public static function run_all_pending() {
		$queue_runner = new ActionScheduler_QueueRunner();
		$processed    = [];

		do {
			$ran  = false;
			$jobs = WC()->queue()->search(
				array(
					'per_page'     => -1,
					'status'       => 'pending',
					'claimed'      => false,
					'date'         => as_get_datetime_object( time() + MINUTE_IN_SECONDS ),
					'date_compare' => '<=',
				)
			);

			foreach ( $jobs as $job_id => $job ) {
				if ( isset( $processed[ $job_id ] ) ) {
					continue;
				}

				$processed[ $job_id ] = true;
				$ran                  = true;
				$queue_runner->process_action( $job_id );
			}
		} while ( $ran );
	}

	/**
	 * Cancel all pending actions.
	 *
	 * @return void
	 */
	public static function cancel_all_pending() {
		// Force immediate hard delete for Action Scheduler < 3.0.
		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->posts} WHERE post_type = 'scheduled-action'" );

		// Delete actions for Action Scheduler >= 3.0.
		$store = ActionScheduler_Store::instance();

		if ( is_callable( array( $store, 'cancel_actions_by_group' ) ) ) {
			$store->cancel_actions_by_group( 'wc-admin-data' );
		}
	}
}

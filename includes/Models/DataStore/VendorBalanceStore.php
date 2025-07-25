<?php

namespace WeDevs\Dokan\Models\DataStore;

use DateTimeImmutable;
use WeDevs\Dokan\Models\BaseModel;
use WeDevs\Dokan\Models\VendorBalance;

/**
 * Class VendorBalanceStore
 *
 * @since 4.0.4
 */
class VendorBalanceStore extends BaseDataStore {

	/**
	 * @inheritDoc
	 */
	protected function get_fields_with_format(): array {
        return [
			'vendor_id' => '%d',
			'trn_id' => '%d',
			'trn_type' => '%s',
			'perticulars' => '%s',
			'debit' => '%f',
			'credit' => '%f',
			'status' => '%s',
			'trn_date' => '%s',
			'balance_date' => '%s',
        ];
    }


	/**
	 * @inheritDoc
	 */
	public function get_table_name(): string {
        return 'dokan_vendor_balance';
    }

	/**
	 * Used to get perticulars through the get_perticulars method by the DataStore.
	 *
	 * @param VendorBalance $model
	 * @param string $context
	 * @return string
	 */
	protected function get_perticulars( VendorBalance $model, string $context = 'edit' ): string {
		return $model->get_particulars( $context );
	}

	/**
	 * Retrieve the total balance for a given vendor.
	 *
	 * @param int          $vendor_id
	 * @param DateTimeImmutable $balance_date
	 * @return float
	 */
	public function get_total_earning_by_vendor( $vendor_id, DateTimeImmutable $balance_date ): float {
		global $wpdb;

		$on_date = $balance_date->format( 'Y-m-d' );

		$earning_status = dokan_withdraw_get_active_order_status();
		$earning_status[] = 'approved';
		$earning_status = apply_filters( 'dokan_vendor_total_balance_order_status', $earning_status, $vendor_id, $balance_date );
		$statuses_str = "'" . implode( "', '", esc_sql( $earning_status ) ) . "'";

		$trn_types = apply_filters(
            'dokan_vendor_total_balance_trn_types', [
				VendorBalance::TRN_TYPE_DOKAN_ORDERS,
				VendorBalance::TRN_TYPE_DOKAN_REFUND,
			], $vendor_id, $balance_date
        );

		$trn_types_str = "'" . implode( "', '", esc_sql( $trn_types ) ) . "'";

		$this->add_sql_clause( 'select', 'SUM(debit) - SUM(credit) AS earnings' );
		$this->add_sql_clause( 'from', $this->get_table_name_with_prefix() );
		$this->add_sql_clause( 'where', $wpdb->prepare( ' AND vendor_id = %d', $vendor_id ) );
		$this->add_sql_clause( 'where', $wpdb->prepare( ' AND DATE(balance_date) <= %s ', $on_date ) );
		$this->add_sql_clause( 'where', " AND trn_type IN ($trn_types_str)" );
		$this->add_sql_clause( 'where', " AND status IN ($statuses_str)" );

		$query_statement = $this->get_query_statement();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$earnings = $wpdb->get_var(
			$query_statement
		);

		return floatval( $earnings );
	}
}

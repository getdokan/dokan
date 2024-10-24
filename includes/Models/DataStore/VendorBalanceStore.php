<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Models\BaseModel;
use WeDevs\Dokan\Models\VendorBalance;

class VendorBalanceStore extends BaseDataStore {

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
	 * Get the balance to insert into the database.
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 * @return string
	 */
    protected function get_balance_date( VendorBalance $model, string $context = 'edit' ) {
		if ( $model->get_balance_date( $context ) ) {
			return $model->get_balance_date( $context )->date( 'Y-m-d H:i:s' );
		}

		return '';
	}

	/**
	 * Get the transaction date to insert into the database.
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 * @return string
	 */
    protected function get_trn_date( VendorBalance $model, string $context = 'edit' ) {
		if ( $model->get_trn_date( $context ) ) {
			return $model->get_trn_date( $context )->date( 'Y-m-d H:i:s' );
		}

		return '';
	}
}

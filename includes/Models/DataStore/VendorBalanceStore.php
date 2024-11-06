<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Models\BaseModel;
use WeDevs\Dokan\Models\VendorBalance;

/**
 * Class VendorBalanceStore
 *
 * @since DOKAN_SINCE
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
}

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
	 * Update vendor balance by transaction.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param int   $trn_id   The transaction ID.
	 * @param string $trn_type The type of transaction. Valid values are
	 *                         {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_ORDERS},
	 *                         {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_WITHDRAW},
	 *                         and {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_REFUND}.
	 * @param array $data     The data to update.
	 *
	 * @return bool True if updated successfully. False otherwise.
	 */
	public function update_by_transaction( int $trn_id, string $trn_type, array $data ) {
		global $wpdb;

		$fields_format = $this->get_fields_with_format();
		$data_format = [];

		foreach ( $data as $key => $value ) {
			$data_format[] = $fields_format[ $key ];
		}

		$result = $wpdb->update(
            $this->get_table_name_with_prefix(),
            $data,
            [
				'trn_id'   => $trn_id,
				'trn_type' => $trn_type,
			],
			$data_format,
            [ '%d', '%s' ]
        );

		return $result;
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

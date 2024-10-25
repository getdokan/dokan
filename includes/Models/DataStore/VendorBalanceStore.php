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

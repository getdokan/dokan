<?php

namespace WeDevs\Dokan\Models\DataStore;

class VendorBalanceStore extends BaseDataStore {

	protected function get_fields_with_format(): array {
        return [
			'vendor_id' => '%d',
			'trn_id' => '%d',
			'trn_type' => '%d',
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
}

<?php

namespace WeDevs\Dokan\Test\Models;

use WeDevs\Dokan\Models\VendorBalance;
use WeDevs\Dokan\Test\DokanTestCase;

class VendorBalanceModelTest extends DokanTestCase {
    /**
     * Indicates if the test is a unit test.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    public function test_save_method() {
        $vendor_balance = new VendorBalance();
        $vendor_balance->set_debit( 100 );
        $vendor_balance->set_trn_id( 1 );
        $vendor_balance->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_ORDERS );
        $vendor_balance->set_particulars( 'test' );
        $vendor_balance->save();

        $this->assertNotEmpty( $vendor_balance->get_id() );
        $this->assertDatabaseCount(
            'dokan_vendor_balance', 1, [
				'id' => $vendor_balance->get_id(),
				// 'debit' => 100,
                'trn_id' => 1,
                'trn_type' => VendorBalance::TRN_TYPE_DOKAN_ORDERS,
			]
        );
    }

    public function test_update_method() {
        $vendor_balance = new VendorBalance();
        $vendor_balance->save();

        $this->assertEmpty( $vendor_balance->get_particulars() );

        $vendor_balance->set_particulars( 'test123' );
        var_dump( $vendor_balance->get_changes(), $vendor_balance->get_particulars( 'edit' ) );
        $vendor_balance->save();

        $this->assertDatabaseHas(
            'dokan_vendor_balance', [
				'perticulars' => 'test123',
			]
        );
    }

    public function test_delete_method() {
        $vendor_balance = new VendorBalance();
        $vendor_balance->save();
        $id = $vendor_balance->get_id();
        $this->assertNotEmpty( $vendor_balance->get_id() );

        $vendor_balance->delete();

        $this->assertDatabaseCount( 'dokan_vendor_balance', 0, [ 'id' => $id ] );
    }
}

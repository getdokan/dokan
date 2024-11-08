<?php

namespace WeDevs\Dokan\Test\Models;

use Mockery;
use WeDevs\Dokan\Models\VendorBalance;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\DokanPro\Modules\DeliveryTime\StorePickup\Vendor;

/**
 * @group data-store
 */
class VendorBalanceModelTest extends DokanTestCase {

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

        // Change the particulars
        $vendor_balance->set_particulars( 'test123' );
        $vendor_balance->save();

        // Assert changes are applied to the database.
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

    public function test_read_method() {
        $vendor_balance = new VendorBalance();
        $vendor_balance->set_particulars( 'test' );
        $vendor_balance->set_debit( 100 );
        $vendor_balance->set_trn_id( 1 );
        $vendor_balance->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_ORDERS );
        $vendor_balance->set_vendor_id( 1 );
        $vendor_balance->set_trn_date( '2020-01-01' );
        $vendor_balance->set_status( 'wc-pending' );
        $vendor_balance->set_balance_date( '2020-01-01' );

        $vendor_balance->save();

        $this->assertNotEmpty( $vendor_balance->get_id() );

        $existing_vendor_balance = new VendorBalance( $vendor_balance->get_id() );

        $this->assertEquals( $vendor_balance->get_particulars(), $existing_vendor_balance->get_particulars() );
        $this->assertEquals( $vendor_balance->get_debit(), $existing_vendor_balance->get_debit() );
        $this->assertEquals( $vendor_balance->get_trn_id(), $existing_vendor_balance->get_trn_id() );
        $this->assertEquals( $vendor_balance->get_trn_type(), $existing_vendor_balance->get_trn_type() );
        $this->assertEquals( $vendor_balance->get_vendor_id(), $existing_vendor_balance->get_vendor_id() );
        $this->assertEquals( $vendor_balance->get_trn_date()->date_i18n(), $existing_vendor_balance->get_trn_date()->date_i18n() );
        $this->assertEquals( $vendor_balance->get_status(), $existing_vendor_balance->get_status() );
        $this->assertEquals( $vendor_balance->get_balance_date()->date_i18n(), $existing_vendor_balance->get_balance_date()->date_i18n() );
    }

    public function test_update_transaction_method() {
        $vendor_balance = new VendorBalance();
        $vendor_balance->set_particulars( 'test' );
        $vendor_balance->set_debit( 100 );
        $vendor_balance->set_trn_id( 1 );
        $vendor_balance->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_ORDERS );
        $vendor_balance->set_vendor_id( 1 );
        $vendor_balance->set_trn_date( '2020-01-01' );
        $vendor_balance->set_status( 'wc-pending' );
        $vendor_balance->set_balance_date( '2020-01-01' );
        $vendor_balance->save();

        $result = VendorBalance::update_by_transaction(
            1, VendorBalance::TRN_TYPE_DOKAN_ORDERS, [
				'debit' => 200,
			]
        );

        $updated_vendor_balance = new VendorBalance( $vendor_balance->get_id() );
        $this->assertEquals( 200, $updated_vendor_balance->get_debit() );
    }

    public function test_dokan_sync_insert_order_function() {
        $order_id = $this->create_single_vendor_order( $this->seller_id1 );
        // Clear data that were created by create_single_vendor_order
        dokan()->order->delete_seller_order( $order_id, $this->seller_id1 );

        $this->assertDatabaseMissing(
            'dokan_vendor_balance', [
                'trn_id' => $order_id,
            ]
        );

        $order_service = Mockery::mock( '\WeDevs\Dokan\Order\Manager[is_order_already_synced]' );
        $order_service->shouldReceive( 'is_order_already_synced' )->andReturn( false );
        dokan()->get_container()->extend( 'order' )->setConcrete( $order_service );
        // Resync the order.
        dokan_sync_insert_order( $order_id );

        // Check if balance is created for the order
        $this->assertDatabaseCount(
            'dokan_vendor_balance', 1, [
                'trn_id' => $order_id,
                'trn_type' => VendorBalance::TRN_TYPE_DOKAN_ORDERS,
                'vendor_id' => $this->seller_id1,
            ]
        );
    }

    public function test_get_total_earning_by_vendor_method() {

        $trn_id = 1;

        $vendor_balance = new VendorBalance();
        $vendor_balance->set_particulars( 'test' );
        $vendor_balance->set_debit( 100 );
        $vendor_balance->set_status( 'wc-completed' );
        $vendor_balance->set_trn_id( $trn_id++ );
        $vendor_balance->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_ORDERS );
        $vendor_balance->set_vendor_id( $this->seller_id1 );
        $vendor_balance->set_trn_date( '2020-01-01' );
        $vendor_balance->set_balance_date( '2020-01-01' );
        $vendor_balance->save();

        $vendor_balance->set_id( 0 );
        $vendor_balance->set_debit( 0 );

        $vendor_balance_2 = clone $vendor_balance;
        $vendor_balance_2->set_trn_id( $trn_id++ );
        $vendor_balance_2->set_debit( 60 );
        $vendor_balance_2->save();

        $vendor_balance_refund = clone $vendor_balance;
        $vendor_balance_refund->set_trn_id( $trn_id++ );
        $vendor_balance_refund->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_REFUND );
        $vendor_balance_refund->set_status( 'approved' );
        $vendor_balance_refund->set_credit( 20 );
        $vendor_balance_refund->save();

        $vendor_balance_withdraw = clone $vendor_balance;
        $vendor_balance_withdraw->set_trn_id( $trn_id++ );
        $vendor_balance_withdraw->set_trn_type( VendorBalance::TRN_TYPE_DOKAN_WITHDRAW );
        $vendor_balance_withdraw->set_status( 'approved' );
        $vendor_balance_withdraw->set_credit( 30 );
        $vendor_balance_withdraw->save();

        $total_balance = VendorBalance::get_total_earning_by_vendor(
            $this->seller_id1
        );
        // 100 + 60 - 20 - 30 = 110
        $this->assertGreaterThan( 110, $total_balance );
    }
}

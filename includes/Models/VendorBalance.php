<?php

namespace WeDevs\Dokan\Models;

class VendorBalance extends BaseModel {

    // 'vendor_id' => '%d',
	//      'trn_id' => '%d',
	//      'trn_type' => '%d',
	//      'perticulars' => '%s',
	//      'debit' => '%f',
	//      'credit' => '%f',
	//      'status' => '%s',
	//      'trn_date' => '%s',
	//      'balance_date' => '%s'

	public function get_vendor_id( string $context = 'view' ) {
		return $this->get_prop( 'vendor_id', $context );
	}

    public function set_vendor_id( int $id ) {
		return $this->set_prop( 'vendor_id', $id );
	}

    public function get_trn_id( string $context = 'view' ) {
		return $this->get_prop( 'trn_id', $context );
	}

    public function set_trn_id( int $id ) {
		return $this->set_prop( 'trn_id', $id );
	}

    public function get_trn_type( string $context = 'view' ) {
		return $this->get_prop( 'trn_type', $context );
	}

    public function set_trn_type( string $type ) {
		return $this->set_prop( 'trn_type', $type );
	}

    public function get_particulars( string $context = 'view' ) {
		return $this->get_prop( 'perticulars', $context );
	}

    public function set_particulars( string $note ) {
		return $this->set_prop( 'perticulars', $note );
	}

    public function get_debit( string $context = 'view' ) {
		return $this->get_prop( 'debit', $context );
	}

    public function set_debit( float $amount ) {
		return $this->set_prop( 'debit', $amount );
	}

    public function get_credit( string $context = 'view' ) {
		return $this->get_prop( 'credit', $context );
	}

    public function set_credit( float $amount ) {
		return $this->set_prop( 'credit', $amount );
	}

    public function get_trn_date( string $context = 'view' ) {
		return $this->get_prop( 'trn_date', $context );
	}

    public function set_trn_date( float $amount ) {
		return $this->set_date_prop( 'trn_date', $amount );
	}

    public function get_balance_date( string $context = 'view' ) {
		return $this->get_prop( 'balance_date', $context );
	}

    public function set_balance_date( float $amount ) {
		return $this->set_date_prop( 'balance_date', $amount );
	}
}

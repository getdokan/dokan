<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\VendorBalanceStore;

class VendorBalance extends BaseModel {
	const TRN_TYPE_DOKAN_ORDERS = 'dokan_orders';
	const TRN_TYPE_DOKAN_WITHDRAW = 'dokan_withdraw';
	const TRN_TYPE_DOKAN_REFUND = 'dokan_refund';

	/**
	 * This is the name of this object type.
	 *
	 * @var string
	 */
	protected $object_type = 'dokan_vendor_balance';

	/**
	 * Cache group.
	 *
	 * @var string
	 */
	protected $cache_group = 'dokan_vendor_balance';

	/**
	 * The default data of the object.
	 *
	 * @var array
	 */
	protected $data = [
		'vendor_id' => 0,
		'trn_id' => 0,
		'trn_type' => '',
		'perticulars' => '',
		'debit' => 0,
		'credit' => 0,
		'status' => '',
		'trn_date' => '',
		'balance_date' => '',
	];

	/**
	 * Initializes the vendor balance model.
	 *
	 * @param int $id The ID of the vendor balance to initialize. Default is 0.
	 */
	public function __construct( int $id = 0 ) {
		parent::__construct( $id );
		$this->set_id( $id );
		$this->data_store = apply_filters( $this->get_hook_prefix() . 'data_store', new VendorBalanceStore() );

		if ( $this->get_id() > 0 ) {
			$this->data_store->read( $this );
		}
	}

	/**
	 * Updates the vendor balance based on a transaction.
	 *
	 * @param int    $trn_id   The transaction ID.
	 * @param string $trn_type The type of transaction. Valid values are
	 *                         {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_ORDERS},
	 *                         {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_WITHDRAW},
	 *                         and {@see WeDevs\Dokan\Models\VendorBalance::TRN_TYPE_DOKAN_REFUND}.
	 * @param array  $data     The data to update.
	 *
	 * @return bool True if updated successfully. False otherwise.
	 */
	public static function update_by_transaction( int $trn_id, string $trn_type, array $data ) {
		$model = new static();
		return $model->get_data_store()->update_by_transaction( $trn_id, $trn_type, $data );
	}

    /**
     * Gets the vendor ID of the vendor balance.
     *
     * @param string $context What the value is for. Valid values are 'view' and 'edit'.
     * @return int The vendor ID.
     */
	public function get_vendor_id( string $context = 'view' ) {
		return $this->get_prop( 'vendor_id', $context );
	}

    /**
     * Sets the vendor ID of the vendor balance.
     *
     * @param int $id The vendor ID.
     * @return void
     */
    public function set_vendor_id( int $id ) {
		return $this->set_prop( 'vendor_id', $id );
	}

	/**
	 * Gets the transaction ID.
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 * @return int The transaction ID.
	 */
    public function get_trn_id( string $context = 'view' ) {
		return $this->get_prop( 'trn_id', $context );
	}

    /**
     * Sets the transaction ID.
     *
     * @param int $id The transaction ID.
     * @return void
     */
    public function set_trn_id( int $id ) {
		return $this->set_prop( 'trn_id', $id );
	}

    /**
     * Gets the transaction type.
     *
     * @param string $context What the value is for. Valid values are 'view' and 'edit'.
     * @return string The transaction type. Valid values are:
     *                'dokan_orders', 'dokan_withdraw', 'dokan_refund'.
     */
    public function get_trn_type( string $context = 'view' ) {
		return $this->get_prop( 'trn_type', $context );
	}

    /**
     * Sets the transaction type for the transaction.
     *
     * @param string $type The type of the transaction. Valid values are:
     *                    'dokan_orders, 'dokan_withdraw', 'dokan_refund'.
     * @return void
     */
    public function set_trn_type( string $type ) {
		return $this->set_prop( 'trn_type', $type );
	}

    /**
     * Gets the particulars for the transaction.
     *
     * @param string $context What the value is for. Valid values are 'view' and 'edit'.
     * @return string The particulars.
     */
    public function get_particulars( string $context = 'view' ): string {
		return (string) $this->get_prop( 'perticulars', $context );
	}

    /**
	 * Set the perticulars (note) for the transaction.
	 *
	 * @param string $note The note to be stored.
	 * @return void
	 */
    public function set_particulars( string $note ) {
		return $this->set_prop( 'perticulars', $note );
	}

    /**
	 * Set the perticulars (note) for the transaction.
	 *
	 * @param string $note The note to be stored.
	 * @return void
	 */
    protected function set_perticulars( string $note ) {
		return $this->set_particulars( $note );
	}

    /**
	 * Get the debit amount.
	 *
	 * @param string $context The context in which to get the debit amount.
	 * @return float The debit amount.
	 */
    public function get_debit( string $context = 'view' ): float {
		return floatval( $this->get_prop( 'debit', $context ) );
	}

    /**
	 * Set the debit amount.
	 *
	 * @param float $amount The debit amount.
	 * @return void
	 */
    public function set_debit( float $amount ) {
		return $this->set_prop( 'debit', $amount );
	}

    /**
	 * Get the credit amount.
	 *
	 * @param string $context The context in which to get the credit amount.
	 * @return float The credit amount.
	 */
    public function get_credit( string $context = 'view' ) {
		return floatval( $this->get_prop( 'credit', $context ) );
	}

    /**
	 * Set the credit amount.
	 *
	 * @param float $amount The credit amount.
	 * @return void
	 */
    public function set_credit( float $amount ) {
		return $this->set_prop( 'credit', $amount );
	}

	/**
	 * Get the status of the vendor balance.
	 *
	 * @param string $context The context in which to get the status. Valid values are 'view' and 'edit'.
	 * @return string The status of the vendor balance.
	 */
	public function get_status( string $context = 'view' ): string {
		return $this->get_prop( 'status', $context );
	}

	/**
	 * Set the status of the vendor balance.
	 *
	 * @param string $status The status to be set.
	 * @return void
	 */
	public function set_status( string $status ) {
		return $this->set_prop( 'status', $status );
	}

	/**
	 * Get the transaction date.
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 * @return \WC_DateTime The transaction date.
	 */
    public function get_trn_date( string $context = 'view' ) {
		return $this->get_prop( 'trn_date', $context );
	}

    /**
	 * Set the transaction date.
	 *
	 * @param string $date The transaction date. Accepts date in `Y-m-d` or  `Y-m-d H:i:s` format.
	 * @return void
	 */
    public function set_trn_date( string $date ) {
		return $this->set_date_prop( 'trn_date', $date );
	}

    /**
	 * Get the balance date.
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 * @return \WC_DateTime The balance date.
	 */
    public function get_balance_date( string $context = 'view' ) {
		return $this->get_prop( 'balance_date', $context );
	}

    /**
	 * Set the balance date.
	 *
	 * @param string $date The balance date. Accepts date in `Y-m-d` or  `Y-m-d H:i:s` format.
	 * @return void
	 */
    public function set_balance_date( string $date ) {
		return $this->set_date_prop( 'balance_date', $date );
	}
}

<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\VendorBalanceStore;
use WeDevs\Dokan\Cache;

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
		$this->data_store = apply_filters( $this->get_hook_prefix() . 'data_store', dokan()->get_container()->get( VendorBalanceStore::class ) );

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
	 * @return int Number of affected rows.
	 */
	public static function update_by_transaction( int $trn_id, string $trn_type, array $data ): int {
		$model = new static();

		return $model->get_data_store()->update_by(
            [
				'trn_id'   => $trn_id,
				'trn_type' => $trn_type,
            ],
            $data
        );
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
		$this->set_prop( 'vendor_id', $id );
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
		$this->set_prop( 'trn_id', $id );
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
		$this->set_prop( 'trn_type', $type );
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
		$this->set_prop( 'perticulars', $note );
	}

    /**
	 * Set the perticulars (note) for the transaction.
	 *
	 * @param string $note The note to be stored.
	 * @return void
	 */
    protected function set_perticulars( string $note ) {
		$this->set_particulars( $note );
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
		$this->set_prop( 'debit', $amount );
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
		$this->set_prop( 'credit', $amount );
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
		$this->set_prop( 'status', $status );
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
		$this->set_date_prop( 'trn_date', $date );
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
		$this->set_date_prop( 'balance_date', $date );
	}

	/**
	 * Calculates and retrieves the total earnings of a vendor up to a specific date.
	 *
	 * This calculation includes:
	 *    - The sum of completed order amounts
	 *    - Minus the sum of refunded amounts
	 *    - Ignores/Excludes any withdrawals from the total earnings
	 *
	 * @param int    $vendor_id The unique identifier for the vendor.
	 * @param string $on_date   Optional date in 'Y-m-d' format to calculate earnings up to. Defaults to the current date if not provided.
	 *
	 * @return float The vendor's total earnings up to the specified date.
	 */
	public static function get_total_earning_by_vendor( $vendor_id, $on_date = null ) {
		$on_date     = $on_date && strtotime( $on_date ) ? dokan_current_datetime()->modify( $on_date ) : dokan_current_datetime();
        $cache_group = "seller_order_data_{$vendor_id}";
        $cache_key   = "seller_earnings_{$vendor_id}_{$on_date->format('Y_m_d')}";
        $earning     = Cache::get( $cache_key, $cache_group );

        if ( false === $earning ) {
			$earning = ( new static() )->get_data_store()->get_total_earning_by_vendor( $vendor_id, $on_date );
            Cache::set( $cache_key, $earning, $cache_group );
        }

		return $earning;
	}
}

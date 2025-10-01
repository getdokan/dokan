<?php

namespace WeDevs\Dokan\Models;

use WeDevs\Dokan\Models\DataStore\VendorOrderStatsStore;

/**
 * Vendor Order Stats Model Class
 *
 * @since 4.1.0
 */
class VendorOrderStats extends BaseModel {

	/**
	 * This is the name of this object type.
	 *
	 * @var string
	 */
	protected $object_type = 'dokan_vendor_order_stats';

	/**
	 * The default data of the object.
	 *
	 * @var array
	 */
	protected $data = [
		'order_id'            => 0,
		'vendor_id'           => 0,
		'order_type'          => 0,
		'vendor_earning'      => 0,
		'vendor_gateway_fee'  => 0,
		'vendor_shipping_fee' => 0,
		'vendor_discount'     => 0,
		'admin_commission'    => 0,
		'admin_gateway_fee'   => 0,
		'admin_shipping_fee'  => 0,
		'admin_discount'      => 0,
		'admin_subsidy'       => 0,
	];

	/**
	 * Initializes the vendor order stats model.
	 *
	 * @since 4.1.0
	 *
	 * @param int $id The ID of the vendor order stats to initialize. Default is 0.
	 */
	public function __construct( int $id = 0 ) {
		parent::__construct( $id );
		$this->set_id( $id );
		$this->data_store = apply_filters( $this->get_hook_prefix() . 'data_store', dokan()->get_container()->get( VendorOrderStatsStore::class ) );

		if ( $this->get_id() > 0 ) {
			$this->data_store->read( $this );
		}
	}

	/**
	 * Gets the order ID.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return int The order ID.
	 */
	public function get_order_id( string $context = 'view' ) {
		return $this->get_prop( 'order_id', $context );
	}

	/**
	 * Sets the order ID.
	 *
	 * @since 4.1.0
	 *
	 * @param int $id The order ID.
	 *
	 * @return void
	 */
	public function set_order_id( int $id ) {
		$this->set_prop( 'order_id', $id );
	}

	/**
	 * Gets the vendor ID.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return int The vendor ID.
	 */
	public function get_vendor_id( string $context = 'view' ) {
		return $this->get_prop( 'vendor_id', $context );
	}

	/**
	 * Sets the vendor ID.
	 *
	 * @since 4.1.0
	 *
	 * @param int $id The vendor ID.
	 *
	 * @return void
	 */
	public function set_vendor_id( int $id ) {
		$this->set_prop( 'vendor_id', $id );
	}

	/**
	 * Gets the order type.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return int The order type.
	 */
	public function get_order_type( string $context = 'view' ) {
		return $this->get_prop( 'order_type', $context );
	}

	/**
	 * Sets the order type.
	 *
	 * @since 4.1.0
	 *
	 * @param int $type The order type.
	 *
	 * @return void
	 */
	public function set_order_type( int $type ) {
		$this->set_prop( 'order_type', $type );
	}

	/**
	 * Gets the vendor earning.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The vendor earning.
	 */
	public function get_vendor_earning( string $context = 'view' ) {
		return (float) $this->get_prop( 'vendor_earning', $context );
	}

	/**
	 * Sets the vendor earning.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The vendor earning.
	 *
	 * @return void
	 */
	public function set_vendor_earning( float $amount ) {
		$this->set_prop( 'vendor_earning', $amount );
	}

	/**
	 * Gets the vendor gateway fee.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The vendor gateway fee.
	 */
	public function get_vendor_gateway_fee( string $context = 'view' ) {
		return (float) $this->get_prop( 'vendor_gateway_fee', $context );
	}

	/**
	 * Sets the vendor gateway fee.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The vendor gateway fee.
	 *
	 * @return void
	 */
	public function set_vendor_gateway_fee( float $amount ) {
		$this->set_prop( 'vendor_gateway_fee', $amount );
	}

	/**
	 * Gets the vendor shipping fee.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The vendor shipping fee.
	 */
	public function get_vendor_shipping_fee( string $context = 'view' ) {
		return (float) $this->get_prop( 'vendor_shipping_fee', $context );
	}

	/**
	 * Sets the vendor shipping fee.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The vendor shipping fee.
	 *
	 * @return void
	 */
	public function set_vendor_shipping_fee( float $amount ) {
		$this->set_prop( 'vendor_shipping_fee', $amount );
	}

	/**
	 * Gets the vendor discount.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The vendor discount.
	 */
	public function get_vendor_discount( string $context = 'view' ) {
		return (float) $this->get_prop( 'vendor_discount', $context );
	}

	/**
	 * Sets the vendor discount.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The vendor discount.
	 *
	 * @return void
	 */
	public function set_vendor_discount( float $amount ) {
		$this->set_prop( 'vendor_discount', $amount );
	}

	/**
	 * Gets the admin commission.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The admin commission.
	 */
	public function get_admin_commission( string $context = 'view' ) {
		return (float) $this->get_prop( 'admin_commission', $context );
	}

	/**
	 * Sets the admin commission.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The admin commission.
	 *
	 * @return void
	 */
	public function set_admin_commission( float $amount ) {
		$this->set_prop( 'admin_commission', $amount );
	}

	/**
	 * Gets the admin gateway fee.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The admin gateway fee.
	 */
	public function get_admin_gateway_fee( string $context = 'view' ) {
		return (float) $this->get_prop( 'admin_gateway_fee', $context );
	}

	/**
	 * Sets the admin gateway fee.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The admin gateway fee.
	 *
	 * @return void
	 */
	public function set_admin_gateway_fee( float $amount ) {
		$this->set_prop( 'admin_gateway_fee', $amount );
	}

	/**
	 * Gets the admin shipping fee.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The admin shipping fee.
	 */
	public function get_admin_shipping_fee( string $context = 'view' ) {
		return (float) $this->get_prop( 'admin_shipping_fee', $context );
	}

	/**
	 * Sets the admin shipping fee.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The admin shipping fee.
	 *
	 * @return void
	 */
	public function set_admin_shipping_fee( float $amount ) {
		$this->set_prop( 'admin_shipping_fee', $amount );
	}

	/**
	 * Gets the admin discount.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The admin discount.
	 */
	public function get_admin_discount( string $context = 'view' ) {
		return (float) $this->get_prop( 'admin_discount', $context );
	}

	/**
	 * Sets the admin discount.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The admin discount.
	 *
	 * @return void
	 */
	public function set_admin_discount( float $amount ) {
		$this->set_prop( 'admin_discount', $amount );
	}

	/**
	 * Gets the admin subsidy.
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The admin subsidy.
	 */
	public function get_admin_subsidy( string $context = 'view' ) {
		return (float) $this->get_prop( 'admin_subsidy', $context );
	}

	/**
	 * Sets the admin subsidy.
	 *
	 * @since 4.1.0
	 *
	 * @param float $amount The admin subsidy.
	 *
	 * @return void
	 */
	public function set_admin_subsidy( float $amount ) {
		$this->set_prop( 'admin_subsidy', $amount );
	}

	/**
	 * Get total sales (vendor earning + admin commission)
	 *
	 * @since 4.1.0
	 *
	 * @param string $context What the value is for. Valid values are 'view' and 'edit'.
	 *
	 * @return float The total sales amount.
	 */
	public function get_total_sales( string $context = 'view' ) {
		return $this->get_vendor_earning( $context ) + $this->get_admin_commission( $context );
	}

	/**
	 * Get count of active vendors within a date range.
	 *
	 * @since 4.1.0
	 *
	 * @param string $start_date Start date in Y-m-d format.
	 * @param string $end_date   End date in Y-m-d format.
	 *
	 * @return int Count of active vendors.
	 */
	public static function get_active_vendors_count( string $start_date, string $end_date ): int {
		return ( new static() )->get_data_store()->get_active_vendors_count( $start_date, $end_date );
	}

	/**
	 * Get top performing vendors.
	 *
	 * @since 4.1.0
	 *
	 * @param int $limit Number of vendors to retrieve. Default 5.
	 *
	 * @return array Array of vendor data with sales metrics.
	 */
	public static function get_top_performing_vendors( int $limit = 5 ): array {
		return ( new static() )->get_data_store()->get_top_performing_vendors( $limit );
	}

    /**
     * Get sales chart data for a date range.
     *
     * @since 4.1.0
     *
     * @param string $start_date Start date in Y-m-d format.
     * @param string $end_date   End date in Y-m-d format.
     *
     * @return array Sales chart data with totals.
     */
    public static function get_sales_chart_data( string $start_date, string $end_date, bool $group_by_day = false ): array {
		return ( new static() )->get_data_store()->get_sales_chart_data( $start_date, $end_date, $group_by_day );
	}
}

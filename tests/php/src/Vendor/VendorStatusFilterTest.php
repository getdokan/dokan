<?php

namespace WeDevs\Dokan\Test\Vendor;

use WP_UnitTestCase;
use WP_User_Query;

/**
 * The status filter on the vendor listing.
 *
 * @group vendor
 */
class VendorStatusFilterTest extends WP_UnitTestCase {

    /**
     * @var int Vendor with dokan_enable_selling = yes.
     */
    private $approved;

    /**
     * @var int Vendor with dokan_enable_selling = no.
     */
    private $disabled;

    /**
     * @var int Vendor that never had the flag written.
     */
    private $flagless;

    public function set_up() {
        parent::set_up();

        $this->approved = $this->factory()->user->create( [ 'role' => 'seller' ] );
        $this->disabled = $this->factory()->user->create( [ 'role' => 'seller' ] );
        $this->flagless = $this->factory()->user->create( [ 'role' => 'seller' ] );

        update_user_meta( $this->approved, 'dokan_enable_selling', 'yes' );
        update_user_meta( $this->disabled, 'dokan_enable_selling', 'no' );
        delete_user_meta( $this->flagless, 'dokan_enable_selling' );
    }

    /**
     * Run the listing scoped to the three fixtures and return the matched IDs.
     */
    private function ids_for( $status ): array {
        $args = [
            'include' => [ $this->approved, $this->disabled, $this->flagless ],
            'fields'  => 'ID',
            'number'  => -1,
        ];

        if ( null !== $status ) {
            $args['status'] = $status;
        }

        $ids = array_map( 'intval', dokan()->vendor->get_vendors( $args ) );
        sort( $ids );

        return $ids;
    }

    public function status_provider(): array {
        return [
            'default is approved'    => [ null, 'approved' ],
            'approved string'        => [ 'approved', 'approved' ],
            'approved array'         => [ [ 'approved' ], 'approved' ],
            'pending string'         => [ 'pending', 'pending' ],
            'pending array'          => [ [ 'pending' ], 'pending' ],
            'unknown reads pending'  => [ 'no', 'pending' ],
            'all string'             => [ 'all', 'all' ],
            'approved plus pending'  => [ [ 'approved', 'pending' ], 'all' ],
            'all plus approved'      => [ [ 'all', 'approved' ], 'all' ],
            'empty list'             => [ [], 'all' ],
        ];
    }

    /**
     * @dataProvider status_provider
     */
    public function test_status_filter( $status, string $expected ) {
        $expected_ids = [
            'approved' => [ $this->approved ],
            'pending'  => [ $this->disabled, $this->flagless ],
            'all'      => [ $this->approved, $this->disabled, $this->flagless ],
        ][ $expected ];
        sort( $expected_ids );

        $this->assertSame( $expected_ids, $this->ids_for( $status ) );
        $this->assertSame( count( $expected_ids ), dokan()->vendor->get_total() );
    }

    public function test_pending_filter_is_detached_after_the_query() {
        $this->ids_for( 'pending' );

        $this->assertFalse( has_action( 'pre_user_query', [ dokan()->vendor, 'exclude_approved_vendors' ] ) );

        $query = new WP_User_Query(
            [
                'include' => [ $this->approved ],
                'fields'  => 'ID',
            ]
        );

        $this->assertSame( [ $this->approved ], array_map( 'intval', $query->get_results() ) );
    }

    public function test_pending_filter_keeps_caller_meta_query() {
        update_user_meta( $this->disabled, 'dokan_store_name', 'Disabled Shop' );
        update_user_meta( $this->flagless, 'dokan_store_name', 'Flagless Shop' );

        $ids = dokan()->vendor->get_vendors(
            [
                'include'    => [ $this->approved, $this->disabled, $this->flagless ],
                'status'     => 'pending',
                'fields'     => 'ID',
                'number'     => -1,
                'meta_query' => [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                    [
                        'key'     => 'dokan_store_name',
                        'value'   => 'Flagless',
                        'compare' => 'LIKE',
                    ],
                ],
            ]
        );

        $this->assertSame( [ $this->flagless ], array_map( 'intval', $ids ) );
    }
}

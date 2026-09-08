<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_User_Query;

/**
 * The status filter on the vendor listing.
 *
 * @group vendor
 */
class VendorStatusFilterTest extends DokanTestCase {

    /**
     * The listing is queried directly here, so the REST server and the shared user fixtures are dead weight.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    /**
     * @var int Vendor with dokan_enable_selling = yes.
     */
    protected $approved;

    /**
     * @var int Vendor with dokan_enable_selling = no.
     */
    protected $disabled;

    /**
     * @var int Vendor that never had the flag written.
     */
    protected $flagless;

    public function set_up() {
        parent::set_up();

        // Not the seller factory: it runs Dokan registration, which writes the very flag the flagless fixture must not have.
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
    protected function ids_for( $status, array $extra = [] ): array {
        $args = $extra + [
            'include' => [ $this->approved, $this->disabled, $this->flagless ],
            'fields'  => 'ID',
            'number'  => -1,
        ];

        if ( null !== $status ) {
            $args['status'] = $status;
        }

        return array_map( 'intval', dokan()->vendor->get_vendors( $args ) );
    }

    public function status_provider(): array {
        return [
            'default is approved'   => [ null, 'approved' ],
            'approved string'       => [ 'approved', 'approved' ],
            'pending array'         => [ [ 'pending' ], 'pending' ],
            'all string'            => [ 'all', 'all' ],
            'approved plus pending' => [ [ 'approved', 'pending' ], 'all' ],
            'all plus approved'     => [ [ 'all', 'approved' ], 'all' ],
            // An unknown status names nothing to filter on, so it must not widen the listing.
            'unknown alone'         => [ 'rejected', 'approved' ],
            'unknown with approved' => [ [ 'approved', 'rejected' ], 'approved' ],
            'unknown with pending'  => [ [ 'pending', 'rejected' ], 'pending' ],
            'empty list'            => [ [], 'approved' ],
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

        $this->assertEqualSets( $expected_ids, $this->ids_for( $status ) );
        $this->assertSame( count( $expected_ids ), dokan()->vendor->get_total() );
    }

    /**
     * The bug behind #3321: the Pending tab counted vendors it could not list.
     */
    public function test_pending_counter_matches_the_pending_list() {
        Cache::invalidate_group( 'vendors' );

        $listed = dokan()->vendor->get_vendors(
            [
                'status' => 'pending',
                'fields' => 'ID',
                'number' => -1,
            ]
        );

        $counts = dokan_get_seller_status_count();

        $this->assertSame( count( $listed ), $counts['inactive'] );
        $this->assertSame( count( $listed ), dokan_get_pending_vendor_count() );
    }

    /**
     * The callback stays hooked after the listing, so it must sit out every query that did not ask for pending.
     */
    public function test_hooked_filter_is_a_noop_for_other_queries() {
        $this->ids_for( 'pending' );

        $this->assertEqualSets( [ $this->approved ], $this->unfiltered_ids() );
    }

    /**
     * The hook is global while the listing runs, so it must not reach anyone else's query.
     */
    public function test_pending_filter_leaves_a_nested_user_query_alone() {
        $nested = null;

        $spy = function () use ( &$nested, &$spy ) {
            remove_action( 'pre_user_query', $spy, 5 );

            $nested = $this->unfiltered_ids();
        };

        add_action( 'pre_user_query', $spy, 5 );

        try {
            $this->ids_for( 'pending' );
        } finally {
            remove_action( 'pre_user_query', $spy, 5 );
        }

        $this->assertEqualSets( [ $this->approved ], $nested );
    }

    /**
     * A listing started from inside pre_get_users must not disarm the pending listing already running.
     */
    public function test_nested_listing_does_not_disarm_the_pending_filter() {
        $nested = null;

        $spy = function () use ( &$nested, &$spy ) {
            remove_action( 'pre_get_users', $spy, 5 );

            $nested = $this->ids_for( 'approved' );
        };

        add_action( 'pre_get_users', $spy, 5 );

        try {
            $outer = $this->ids_for( 'pending' );
        } finally {
            remove_action( 'pre_get_users', $spy, 5 );
        }

        $this->assertEqualSets( [ $this->approved ], $nested );
        $this->assertEqualSets( [ $this->disabled, $this->flagless ], $outer );
    }

    public function test_pending_filter_keeps_caller_meta_query() {
        update_user_meta( $this->disabled, 'dokan_store_name', 'Disabled Shop' );
        update_user_meta( $this->flagless, 'dokan_store_name', 'Flagless Shop' );

        $ids = $this->ids_for(
            'pending',
            [
                'meta_query' => [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                    [
                        'key'     => 'dokan_store_name',
                        'value'   => 'Flagless',
                        'compare' => 'LIKE',
                    ],
                ],
            ]
        );

        $this->assertEqualSets( [ $this->flagless ], $ids );
    }

    public function test_featured_narrows_the_pending_list() {
        update_user_meta( $this->flagless, 'dokan_feature_seller', 'yes' );

        $this->assertEqualSets(
            [ $this->flagless ],
            $this->ids_for( 'pending', [ 'featured' => 'yes' ] )
        );
    }

    /**
     * The approved fixture through a plain user query: filtered means the pending clause leaked.
     */
    protected function unfiltered_ids(): array {
        $query = new WP_User_Query(
            [
                'include' => [ $this->approved ],
                'fields'  => 'ID',
            ]
        );

        return array_map( 'intval', $query->get_results() );
    }
}

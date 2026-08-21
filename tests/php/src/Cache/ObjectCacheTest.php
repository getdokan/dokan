<?php

namespace WeDevs\Dokan\Test\Cache;

use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Object_Cache;

/**
 * Tests for the ObjectCache trait's group invalidation contract.
 *
 * @group cache
 */
class ObjectCacheTest extends DokanTestCase {

    /**
     * Invalidation must make every value cached under the group unreachable.
     */
    public function test_invalidated_group_values_become_unreachable() {
        Cache::set( 'balance', 100, 'withdraws' );
        $this->assertSame( 100, Cache::get( 'balance', 'withdraws' ) );

        $this->assertTrue( Cache::invalidate_group( 'withdraws' ) );

        $this->assertFalse( Cache::get( 'balance', 'withdraws' ) );
    }

    /**
     * The group must accept and serve fresh values after an invalidation.
     */
    public function test_cache_works_again_after_invalidation() {
        Cache::set( 'balance', 100, 'withdraws' );
        Cache::invalidate_group( 'withdraws' );

        Cache::set( 'balance', 200, 'withdraws' );

        $this->assertSame( 200, Cache::get( 'balance', 'withdraws' ) );
    }

    /**
     * Invalidating one group must not touch values cached in other groups.
     */
    public function test_invalidating_one_group_leaves_other_groups_intact() {
        Cache::set( 'item_a', 1, 'withdraws' );
        Cache::set( 'item_b', 2, 'vendors' );

        Cache::invalidate_group( 'withdraws' );

        $this->assertFalse( Cache::get( 'item_a', 'withdraws' ) );
        $this->assertSame( 2, Cache::get( 'item_b', 'vendors' ) );
    }

    /**
     * Invalidation must never flush a cache group: on persistent backends such as
     * Redis, wp_cache_flush_group() costs a full keyspace scan per call, and the
     * time-prefix rewrite already makes the group's old keys unreachable.
     *
     * @see https://github.com/getdokan/dokan/issues/3369
     */
    public function test_invalidate_group_never_flushes_a_cache_group() {
        global $wp_object_cache;

        $original = $wp_object_cache;

        $spy = new class() extends WP_Object_Cache {
            /**
             * Groups passed to flush_group() during the test.
             *
             * @var array
             */
            public $flushed_groups = [];

            public function flush_group( $group ) {
                $this->flushed_groups[] = $group;

                return parent::flush_group( $group );
            }
        };

        $wp_object_cache = $spy; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

        try {
            Cache::set( 'balance', 100, 'withdraws' );
            Cache::invalidate_group( 'withdraws' );
        } finally {
            $wp_object_cache = $original; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        }

        $this->assertSame( [], $spy->flushed_groups );
    }
}

<?php

namespace WeDevs\Dokan\Test\Smoke;

use WeDevs\Dokan\Test\Helpers\PoisonWorld;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Walks every readable Dokan REST route as guest, customer, vendor, and admin.
 *
 * A route passes when it answers with anything below 500 and raises no PHP warning
 * or Throwable. Authorization is not asserted here: a 401 or 403 is a pass. The
 * walk runs twice, once on an empty install and once on the poison world, because
 * both "nothing exists yet" and "the data is nasty" are shapes a hand-written test
 * rarely covers.
 *
 * Every integer parameter is also walked with {@see PoisonWorld::MISSING_ID}, since
 * the most common fatal is a getter returning `false` for an id that is gone.
 *
 * @since DOKAN_SINCE
 *
 * @group smoke
 * @group fatal-smoke
 */
class RestRouteSmokeTest extends SmokeTestCase {

    /**
     * Route-regex prefixes that are walked.
     *
     * @var string[]
     */
    protected array $namespaces = [ '/dokan/' ];

    /**
     * Maximum parameter combinations per route, so a route with three placeholders
     * does not explode the walk.
     */
    protected const MAX_COMBINATIONS = 8;

    public function test_readable_routes_survive_an_empty_install(): void {
        $this->walk( 'rest:empty', null );
        $this->assert_no_fatals( 'rest:empty' );
    }

    public function test_readable_routes_survive_the_poison_world(): void {
        $world = $this->seed_poison_world();

        $this->walk( 'rest:poison', $world );
        $this->assert_no_fatals( 'rest:poison' );
    }

    /**
     * @param string           $walk  Walk name for labels.
     * @param PoisonWorld|null $world Seeded world, or null for the empty install.
     *
     * @return void
     */
    protected function walk( string $walk, ?PoisonWorld $world ): void {
        $actors = [
            'guest'    => 0,
            'customer' => $this->customer_id,
            'vendor'   => $this->seller_id1,
            'admin'    => $this->admin_id,
        ];

        foreach ( $this->readable_routes() as $route ) {
            foreach ( $this->paths_for_route( $route, $world ) as $path ) {
                foreach ( $actors as $actor => $user_id ) {
                    $label = sprintf( '[%s][%s] GET %s', $walk, $actor, $path );

                    $this->probe(
                        $label,
                        function () use ( $user_id, $path ) {
                            wp_set_current_user( $user_id );

                            $request = new WP_REST_Request( 'GET', $path );

                            /** @var WP_REST_Response $response */
                            $response = $this->server->dispatch( $request );
                            $status   = $response->get_status();

                            if ( $status >= 500 ) {
                                $data = $response->get_data();

                                return sprintf( 'HTTP %d %s', $status, is_array( $data ) ? wp_json_encode( $data ) : '' );
                            }

                            // Serialising the response is part of answering the request.
                            $this->server->response_to_data( $response, false );

                            return '';
                        }
                    );
                }
            }
        }
    }

    /**
     * Registered route regexes that accept GET under the walked namespaces.
     *
     * @return string[]
     */
    protected function readable_routes(): array {
        $routes = [];

        foreach ( $this->server->get_routes() as $regex => $endpoints ) {
            if ( ! $this->is_walked_namespace( $regex ) ) {
                continue;
            }

            foreach ( $endpoints as $endpoint ) {
                if ( empty( $endpoint['methods'] ) || ! is_array( $endpoint['methods'] ) ) {
                    continue;
                }

                if ( ! empty( $endpoint['methods']['GET'] ) ) {
                    $routes[] = $regex;
                    break;
                }
            }
        }

        sort( $routes );

        return $routes;
    }

    /**
     * @param string $regex Route regex.
     *
     * @return bool
     */
    protected function is_walked_namespace( string $regex ): bool {
        foreach ( $this->namespaces as $prefix ) {
            if ( str_starts_with( $regex, $prefix ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Concrete request paths for a route regex.
     *
     * Each named group is replaced by every candidate value the poison world has
     * for it, plus the missing id for integer groups, then the cartesian product is
     * capped at {@see self::MAX_COMBINATIONS}.
     *
     * @param string           $regex Route regex such as `/dokan/v1/orders/(?P<id>[\d]+)`.
     * @param PoisonWorld|null $world Seeded world.
     *
     * @return string[]
     */
    protected function paths_for_route( string $regex, ?PoisonWorld $world ): array {
        if ( ! preg_match_all( '/\(\?P<(\w+)>((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/', $regex, $groups, PREG_SET_ORDER | PREG_OFFSET_CAPTURE ) ) {
            return [ $regex ];
        }

        $candidates = [];
        foreach ( $groups as $group ) {
            $name         = $group[1][0];
            $pattern      = $group[2][0];
            $before       = substr( $regex, 0, $group[0][1] );
            $candidates[] = $this->candidates_for( $name, $pattern, $before, $world );
        }

        $paths = [];
        foreach ( $this->combinations( $candidates ) as $values ) {
            $path = $regex;
            // Replace from the last group to the first so offsets stay valid.
            for ( $i = count( $groups ) - 1; $i >= 0; $i-- ) {
                $path = substr_replace( $path, (string) $values[ $i ], $groups[ $i ][0][1], strlen( $groups[ $i ][0][0] ) );
            }

            // Only walk paths the route would actually match.
            if ( preg_match( '@^' . $regex . '$@i', $path ) ) {
                $paths[] = $path;
            }
        }

        return array_values( array_unique( $paths ) );
    }

    /**
     * Candidate values for one named route parameter.
     *
     * @param string           $name    Group name, e.g. `id` or `product_id`.
     * @param string           $pattern Group pattern, e.g. `[\d]+`.
     * @param string           $before  Route text preceding the group, used to find the resource for `id`.
     * @param PoisonWorld|null $world   Seeded world.
     *
     * @return array<int|string>
     */
    protected function candidates_for( string $name, string $pattern, string $before, ?PoisonWorld $world ): array {
        $numeric = (bool) preg_match( '/^\[?\\\\d\]?\+$|^\[0-9\]\+$|^\d\+$/', $pattern );

        $resource = $name;
        if ( 'id' === $name || preg_match( '/^(id|ID)$/', $name ) ) {
            $segments = array_values( array_filter( explode( '/', trim( $before, '/' ) ) ) );
            $resource = $segments ? end( $segments ) : '';
        } elseif ( str_ends_with( $name, '_id' ) ) {
            $resource = substr( $name, 0, -3 );
        }

        $values = $world ? $world->ids_for_resource( $resource ) : [];

        if ( $numeric ) {
            $values[] = PoisonWorld::MISSING_ID;

            return array_values( array_unique( $values ) );
        }

        // Non-numeric placeholders: a known slug where one applies, otherwise a harmless token.
        $slugs = [
            'slug'       => $world ? [ $this->vendor_slug( $world ) ] : [ 'poison-store' ],
            'store_slug' => $world ? [ $this->vendor_slug( $world ) ] : [ 'poison-store' ],
            'status'     => [ 'pending', 'poison' ],
            'type'       => [ 'simple', 'poison' ],
            'key'        => [ 'poison' ],
            'section'    => [ 'dokan_general', 'poison' ],
            'tab'        => [ 'poison' ],
            'slug_or_id' => [ 'poison' ],
            'context'    => [ 'view' ],
        ];

        if ( isset( $slugs[ $name ] ) ) {
            return $slugs[ $name ];
        }

        return array_merge( $values, [ 'poison' ] );
    }

    /**
     * @param PoisonWorld $world Seeded world.
     *
     * @return string
     */
    protected function vendor_slug( PoisonWorld $world ): string {
        $vendor = dokan()->vendor->get( (int) $world->id( 'vendor' ) );
        $slug   = $vendor ? (string) $vendor->get_shop_url() : '';
        $slug   = basename( untrailingslashit( $slug ) );

        return '' !== $slug ? $slug : 'poison-store';
    }

    /**
     * Cartesian product of candidate lists, capped.
     *
     * @param array<int,array<int|string>> $lists One list per route group.
     *
     * @return array<int,array<int|string>>
     */
    protected function combinations( array $lists ): array {
        $result = [ [] ];

        foreach ( $lists as $list ) {
            $next = [];
            foreach ( $result as $prefix ) {
                foreach ( $list as $value ) {
                    $next[] = array_merge( $prefix, [ $value ] );
                    if ( count( $next ) >= self::MAX_COMBINATIONS ) {
                        break 2;
                    }
                }
            }
            $result = $next;
        }

        return $result;
    }
}

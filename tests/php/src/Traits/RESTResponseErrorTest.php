<?php

namespace WeDevs\Dokan\Test\Traits;

use Exception;
use WP_Error;
use WeDevs\Dokan\Exceptions\DokanException;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Traits\RESTResponseError;

/**
 * @group rest-response-error
 */
class RESTResponseErrorTest extends DokanTestCase {

    protected $is_unit_test = true;

    /**
     * Converts an exception the way a REST controller would.
     *
     * @param Exception $e
     *
     * @return WP_Error
     */
    private function convert( Exception $e ) {
        $controller = new class() {
            use RESTResponseError;

            public function convert( Exception $e ) {
                return $this->send_response_error( $e );
            }
        };

        return $controller->convert( $e );
    }

    public function test_string_code_is_unchanged() {
        $error = $this->convert( new DokanException( 'my_code', 'My message', 403 ) );

        $this->assertSame( 'my_code', $error->get_error_code() );
        $this->assertSame( 'My message', $error->get_error_message() );
        $this->assertSame( [ 'status' => 403 ], $error->get_error_data() );
    }

    public function test_plain_exception_returns_default_error() {
        $error = $this->convert( new Exception( 'Internal detail' ) );

        $this->assertSame( 'something_went_wrong', $error->get_error_code() );
        $this->assertSame( 422, $error->get_error_data()['status'] );
    }

    public function test_wp_error_without_data_gets_exception_status() {
        $original = new WP_Error( 'wrapped_code', 'Wrapped message' );
        $error    = $this->convert( new DokanException( $original ) );
        $response = rest_convert_error_to_response( $error );

        $this->assertSame( 'wrapped_code', $error->get_error_code() );
        $this->assertSame( 'Wrapped message', $error->get_error_message() );
        $this->assertSame( 422, $response->get_status() );
        $this->assertEmpty( $original->get_error_data(), 'The caller WP_Error must not be modified.' );
    }

    public function test_wp_error_keeps_its_own_status() {
        $error = $this->convert( new DokanException( new WP_Error( 'not_found', 'Missing', [ 'status' => 404 ] ) ) );

        $this->assertSame( 404, rest_convert_error_to_response( $error )->get_status() );
    }

    public function test_wp_error_array_data_is_merged_without_stale_copy() {
        $error = $this->convert( new DokanException( new WP_Error( 'with_data', 'Message', [ 'field' => 'amount' ] ), '', 400 ) );

        $this->assertSame( [ 'field' => 'amount', 'status' => 400 ], $error->get_error_data() );
        $this->assertSame( [ [ 'field' => 'amount', 'status' => 400 ] ], $error->get_all_error_data( 'with_data' ) );
        $this->assertSame( 400, rest_convert_error_to_response( $error )->get_status() );
    }

    public function test_wp_error_scalar_data_is_kept_and_status_attached() {
        $error = $this->convert( new DokanException( new WP_Error( 'scalar', 'Message', 'some-text' ) ) );

        $this->assertSame( [ 'data' => 'some-text', 'status' => 422 ], $error->get_error_data() );
        $this->assertSame( 422, rest_convert_error_to_response( $error )->get_status() );
    }

    public function test_wp_error_with_integer_code() {
        $error = $this->convert( new DokanException( new WP_Error( 1001, 'Numeric code' ) ) );

        $this->assertSame( 1001, $error->get_error_code() );
        $this->assertSame( 422, rest_convert_error_to_response( $error )->get_status() );
    }

    public function test_wp_error_with_multiple_codes() {
        $original = new WP_Error( 'first', 'First message' );
        $original->add( 'second', 'Second message' );

        $error    = $this->convert( new DokanException( $original ) );
        $response = rest_convert_error_to_response( $error );
        $body     = $response->get_data();

        $this->assertSame( 422, $response->get_status() );
        $this->assertSame( 'first', $body['code'] );
        $this->assertSame( 'second', $body['additional_errors'][0]['code'] );
    }

    public function test_empty_wp_error_returns_default_error() {
        $error = $this->convert( new DokanException( new WP_Error() ) );

        $this->assertSame( 'something_went_wrong', $error->get_error_code() );
        $this->assertSame( 422, $error->get_error_data()['status'] );
    }
}

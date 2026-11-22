<?php

namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\VendorRegistration\AnswersAdmin;
use WeDevs\Dokan\VendorRegistration\VendorAnswers;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * A vendor's custom sign-up answers for the admin's vendor page: read, and edit the ones that changed.
 *
 * @since DOKAN_SINCE
 */
class VendorRegistrationAnswersController extends DokanBaseController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'vendor-registration/answers';

    /**
     * Register routes.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            [
                'args'   => [
                    'id' => [
                        'description' => __( 'Vendor ID.', 'dokan-lite' ),
                        'type'        => 'integer',
                        'required'    => true,
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'permission_callback' => [ $this, 'permissions_check' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'permissions_check' ],
                    'args'                => [
                        'answers' => [
                            'description' => __( 'Answers keyed by meta key.', 'dokan-lite' ),
                            'type'        => 'object',
                            'required'    => true,
                        ],
                    ],
                ],
                'schema' => [ $this, 'get_public_item_schema' ],
            ]
        );
    }

    /**
     * The same people who may edit the answers on the Edit User screen.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return bool|WP_Error
     */
    public function permissions_check( $request ) {
        if ( dokan_get_container()->get( AnswersAdmin::class )->can_manage( (int) $request['id'] ) ) {
            return true;
        }

        return new WP_Error( 'dokan_rest_cannot_view', __( 'Sorry, you cannot manage this vendor\'s sign-up answers.', 'dokan-lite' ), [ 'status' => rest_authorization_required_code() ] );
    }

    /**
     * Get a vendor's answers, grouped by section.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response
     */
    public function get_item( $request ) {
        return $this->prepare_item_for_response( (int) $request['id'], $request );
    }

    /**
     * Save the answers that changed; the rest are left as they are.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $answers = $request['answers'];

        if ( ! is_array( $answers ) ) {
            return new WP_Error( 'dokan_rest_invalid_answers', __( 'Answers must be an object keyed by meta key.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $result = dokan_get_container()->get( VendorAnswers::class )->update_changed( (int) $request['id'], $answers );

        if ( is_wp_error( $result ) ) {
            $result->add_data( [ 'status' => 400 ] );

            return $result;
        }

        return $this->prepare_item_for_response( (int) $request['id'], $request );
    }

    /**
     * Prepare a vendor's answers for the response.
     *
     * @since DOKAN_SINCE
     *
     * @param int             $vendor_id Vendor ID.
     * @param WP_REST_Request $request   Request.
     *
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $vendor_id, $request ) {
        $answers  = dokan_get_container()->get( VendorAnswers::class );
        $form     = $answers->get_form( $vendor_id );
        $sections = [];

        foreach ( $answers->get_sections( $vendor_id ) as $section ) {
            $fields = [];

            foreach ( $section['fields'] as $field ) {
                $fields[] = [
                    'key'         => (string) $field['meta_key'],
                    'label'       => (string) $field['label'],
                    'type'        => (string) $field['type'],
                    'required'    => ! empty( $field['required'] ),
                    'help'        => (string) ( $field['help'] ?? '' ),
                    'placeholder' => (string) ( $field['placeholder'] ?? '' ),
                    'options'     => array_values( (array) ( $field['options'] ?? [] ) ),
                    'value'       => is_array( $field['value'] ) ? array_values( array_map( 'strval', array_filter( $field['value'], 'is_scalar' ) ) ) : (string) $field['value'],
                    'display'     => $answers->format_value( $field ),
                ];
            }

            $sections[] = [
                'id'     => (string) $section['id'],
                'title'  => (string) $section['title'],
                'fields' => $fields,
            ];
        }

        $page_id = (int) ( $form['page_id'] ?? 0 );
        $data    = [
            'vendor_id' => $vendor_id,
            'page'      => $page_id ? [
                'id'    => $page_id,
                'title' => (string) get_the_title( $page_id ),
                'url'   => (string) get_permalink( $page_id ),
            ] : null,
            'sections'  => $sections,
        ];

        /**
         * Filter a vendor's sign-up answers in the REST response.
         *
         * @since DOKAN_SINCE
         *
         * @param array           $data      Response data.
         * @param int             $vendor_id Vendor ID.
         * @param WP_REST_Request $request   Request.
         */
        $data = apply_filters( 'dokan_rest_prepare_vendor_registration_answers', $data, $vendor_id, $request );

        return rest_ensure_response( $data );
    }

    /**
     * Item schema.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_item_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'vendor-registration-answers',
            'type'       => 'object',
            'properties' => [
                'vendor_id' => [
                    'description' => __( 'Vendor ID.', 'dokan-lite' ),
                    'type'        => 'integer',
                ],
                'page'      => [
                    'description' => __( 'The page whose form the answers belong to.', 'dokan-lite' ),
                    'type'        => [ 'object', 'null' ],
                ],
                'sections'  => [
                    'description' => __( 'Custom fields with their answers, grouped by form section.', 'dokan-lite' ),
                    'type'        => 'array',
                ],
            ],
        ];
    }
}

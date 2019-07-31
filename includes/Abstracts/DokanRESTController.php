<?php

namespace WeDevs\Dokan\Abstracts;

use WC_Data_Exception;
use WC_REST_Exception;
use WP_Error;
use WP_Query;
use WP_REST_Controller;
use WP_REST_Response;

/**
* Base REST Controller for dokan
*
* @since 2.8.0
*
* @package dokan
*/
abstract class DokanRESTController extends WP_REST_Controller {

    /**
     * Get object.
     *
     * @param  int $id Object ID.
     * @return object WC_Data object or WP_Error object.
     */
    protected function get_object( $id ) {
        return new WP_Error( 'invalid-method', sprintf( __( "Method '%s' not implemented. Must be overridden in subclass.", 'dokan-lite' ), __METHOD__ ), array( 'status' => 405 ) );
    }

    /**
     * Get a collection of posts.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_items( $request ) {
        $query_args   = $this->prepare_objects_query( $request );
        $query        = new WP_Query();
        $result       = $query->query( $query_args );

        $data         = array();
        $data_objects = array();
        $objects      = array_map( array( $this, 'get_object' ), $result );

        foreach ( $objects as $object ) {
            $data           = $this->prepare_data_for_response( $object, $request );
            $data_objects[] = $this->prepare_response_for_collection( $data );
        }

        $response = rest_ensure_response( $data_objects );
        $response = $this->format_collection_response( $response, $request, $query->found_posts );

        return $response;
    }

    /**
     * Get Item for an object
     *
     * @since 2.8.0
     *
     * @return object
     */
    public function get_item( $request ) {
        $id   = (int) $request['id'];
        $post = get_post( $id );

        if ( ! empty( $post->post_type ) && 'product_variation' === $post->post_type && 'product' === $this->post_type ) {
            return new WP_Error( "dokan_rest_invalid_{$this->post_type}_id", __( 'To manipulate product variations you should use the /products/&lt;product_id&gt;/variations/&lt;id&gt; endpoint.', 'dokan-lite' ), array( 'status' => 404 ) );
        } elseif ( empty( $id ) || empty( $post->ID ) || $post->post_type !== $this->post_type ) {
            return new WP_Error( "dokan_rest_invalid_{$this->post_type}_id", __( 'Invalid ID.', 'dokan-lite' ), array( 'status' => 404 ) );
        }

        $data     = $this->prepare_data_for_response( $this->get_object( $post ), $request );
        $response = rest_ensure_response( $data );

        return $response;
    }

    /**
     * Create Item
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function create_item( $request ) {

        $validate = $this->validation_before_create_item( $request );

        if ( is_wp_error( $validate ) ) {
            return $validate;
        }

        try {
            $object = $this->prepare_object_for_database( $request, true );

            if ( is_wp_error( $object ) ) {
                return $object;
            }

            $object->save();

            //Update post author
            wp_update_post( array( 'ID' => $object->get_id(), 'post_author' => dokan_get_current_user_id() ) );

            /**
             * Fires after a single object is created or updated via the REST API.
             *
             * @param WC_Data         $object    Inserted object.
             * @param WP_REST_Request $request   Request object.
             * @param boolean         $creating  True when creating object, false when updating.
             */
            do_action( "dokan_rest_insert_{$this->post_type}_object", $object, $request, true );

            return $this->prepare_data_for_response( $this->get_object( $object->get_id() ), $request );
        } catch ( WC_Data_Exception $e ) {
            return new WP_Error( $e->getErrorCode(), $e->getMessage(), $e->getErrorData() );
        } catch ( WC_REST_Exception $e ) {
            return new WP_Error( $e->getErrorCode(), $e->getMessage(), array( 'status' => $e->getCode() ) );
        }
    }

    /**
     * Update an Item
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function update_item( $request ) {
        $validate = $this->validation_before_update_item( $request );

        if ( is_wp_error( $validate ) ) {
            return $validate;
        }

        try {
            $object = $this->prepare_object_for_database( $request, false );

            if ( is_wp_error( $object ) ) {
                return $object;
            }

            $object->save();
            $this->update_additional_fields_for_object( $object, $request );

            /**
             * Fires after a single object is created or updated via the REST API.
             *
             * @param WC_Data         $object    Inserted object.
             * @param WP_REST_Request $request   Request object.
             * @param boolean         $creating  True when creating object, false when updating.
             */
            do_action( "dokan_rest_insert_{$this->post_type}_object", $object, $request, false );

            return $this->prepare_data_for_response( $this->get_object( $object->get_id() ), $request );
        } catch ( WC_Data_Exception $e ) {
            return new WP_Error( $e->getErrorCode(), $e->getMessage(), $e->getErrorData() );
        } catch ( WC_REST_Exception $e ) {
            return new WP_Error( $e->getErrorCode(), $e->getMessage(), array( 'status' => $e->getCode() ) );
        }
    }

    /**
     * Delete an item
     *
     * @since 2.8.0
     *
     * @return void
     */
    public function delete_item( $request ) {

        $validate = $this->validation_before_delete_item( $request );

        if ( is_wp_error( $validate ) ) {
            return $validate;
        }

        $object   = $this->get_object( (int) $request['id'] );
        $data     = $this->prepare_data_for_response( $object, $request );
        $response = rest_ensure_response( $data );

        // If we're forcing, then delete permanently.
        $object->delete( true );
        $result = 0 === $object->get_id();

        if ( ! $result ) {
            return new WP_Error( 'dokan_rest_cannot_delete', sprintf( __( 'The %s cannot be deleted.', 'dokan-lite' ), $this->post_type ), array( 'status' => 500 ) );
        }

        do_action( "dokan_rest_delete_{$this->post_type}_object", $object, $response, $request );

        return $response;
    }

    /**
     * Prepare_object_for_database
     *
     * @since 2.8.0
     *
     * @return void
     */
    protected function prepare_object_for_database( $request ) {
        return new WP_Error( 'invalid-method', sprintf( __( "Method '%s' not implemented. Must be overridden in subclass.", 'dokan-lite' ), __METHOD__ ), array( 'status' => 405 ) );
    }

    /**
     * Prepares a response for insertion into a collection.
     *
     * @since 4.7.0
     *
     * @param WP_REST_Response $response Response object.
     * @return array|mixed Response data, ready for insertion into collection data.
     */
    public function prepare_response_for_collection( $response ) {
        if ( ! ( $response instanceof WP_REST_Response ) ) {
            return $response;
        }

        $data   = (array) $response->get_data();
        $server = rest_get_server();

        if ( method_exists( $server, 'get_compact_response_links' ) ) {
            $links = call_user_func( array( $server, 'get_compact_response_links' ), $response );
        } else {
            $links = call_user_func( array( $server, 'get_response_links' ), $response );
        }

        if ( ! empty( $links ) ) {
            $data['_links'] = $links;
        }

        return $data;
    }

    /**
     * Validate before create an Item
     *
     * @since 2.8.0
     *
     * @return void
     */
    protected function validation_before_create_item( $request ) {
        return true;
    }

    /**
     * Validate before update an Item
     *
     * @since 2.8.0
     *
     * @return void
     */
    protected function validation_before_update_item( $request ) {
        return true;
    }

    /**
     * Validate before delete an Item
     *
     * @since 2.8.0
     *
     * @return void
     */
    protected function validation_before_delete_item( $request ) {
        return true;
    }

    /**
     * Prepares the object for the REST response.
     *
     * @since  2.8.0
     * @param  Dokan_Data         $object  Object data.
     * @param  WP_REST_Request $request Request object.
     * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
     */
    protected function prepare_data_for_response( $object, $request ) {
        return new WP_Error( 'invalid-method', sprintf( __( "Method '%s' not implemented. Must be overridden in subclass.", 'dokan-lite' ), __METHOD__ ), array( 'status' => 405 ) );
    }

    /**
     * Prepare objects query.
     *
     * @since  2.8.0
     * @param  WP_REST_Request $request Full details about the request.
     * @return array
     */
    protected function prepare_objects_query( $request ) {
        $args                        = array();
        $args['fields']              = 'ids';
        $args['post_status']         = !isset( $request['post_status'] ) ? $this->post_status : $request['post_status'];
        $args['author']              = !isset( $request['id'] ) ? dokan_get_current_user_id() : $request['id'];
        $args['offset']              = $request['offset'];
        $args['order']               = $request['order'];
        $args['orderby']             = $request['orderby'];
        $args['paged']               = $request['page'];
        $args['post__in']            = $request['include'];
        $args['post__not_in']        = $request['exclude'];
        $args['posts_per_page']      = $request['per_page'];
        $args['name']                = $request['slug'];
        $args['post_parent__in']     = $request['parent'];
        $args['post_parent__not_in'] = $request['parent_exclude'];
        $args['s']                   = $request['search'];

        if ( 'date' === $args['orderby'] ) {
            $args['orderby'] = 'date ID';
        }

        if ( ! isset( $args['orderby'] ) ) {
            $args['orderby'] = 'post_date';
        }

        $args['date_query'] = array();
        // Set before into date query. Date query must be specified as an array of an array.
        if ( isset( $request['before'] ) ) {
            $args['date_query'][0]['before'] = $request['before'];
        }

        // Set after into date query. Date query must be specified as an array of an array.
        if ( isset( $request['after'] ) ) {
            $args['date_query'][0]['after'] = $request['after'];
        }

        // Force the post_type argument, since it's not a user input variable.
        $args['post_type'] = $this->post_type;

        /**
         * Filter the query arguments for a request.
         *
         * Enables adding extra arguments or setting defaults for a post
         * collection request.
         *
         * @param array           $args    Key value array of query var to query value.
         * @param WP_REST_Request $request The request used.
         */
        $args = apply_filters( "dokan_rest_{$this->post_type}_object_query", $args, $request );

        return $this->prepare_items_query( $args, $request );
    }

    /**
     * Determine the allowed query_vars for a get_items() response and
     * prepare for WP_Query.
     *
     * @param array           $prepared_args
     * @param WP_REST_Request $request
     * @return array          $query_args
     */
    protected function prepare_items_query( $prepared_args = array(), $request = null ) {

        $valid_vars = array_flip( $this->get_allowed_query_vars() );

        $query_args = array();
        foreach ( $valid_vars as $var => $index ) {
            if ( isset( $prepared_args[ $var ] ) ) {
                $query_args[ $var ] = apply_filters( "dokan_rest_query_var-{$var}", $prepared_args[ $var ] );
            }
        }

        $query_args['ignore_sticky_posts'] = true;

        if ( 'include' === $query_args['orderby'] ) {
            $query_args['orderby'] = 'post__in';
        } elseif ( 'id' === $query_args['orderby'] ) {
            $query_args['orderby'] = 'ID';
        }

        return $query_args;
    }

    /**
     * Get all the WP Query vars that are allowed for the API request.
     *
     * @return array
     */
    protected function get_allowed_query_vars() {
        global $wp;

        $valid_vars    = apply_filters( 'query_vars', $wp->public_query_vars );
        $post_type_obj = get_post_type_object( $this->post_type );

        $rest_valid = array(
            'date_query',
            'ignore_sticky_posts',
            'offset',
            'post_status',
            'post__in',
            'post__not_in',
            'post_parent',
            'post_parent__in',
            'post_parent__not_in',
            'posts_per_page',
            'meta_query',
            'tax_query',
            'meta_key',
            'meta_value',
            'meta_compare',
            'meta_value_num',
        );
        $valid_vars = array_merge( $valid_vars, $rest_valid );
        $valid_vars = apply_filters( 'dokan_rest_query_vars', $valid_vars );

        return $valid_vars;
    }

    /**
     * Format item's collection for response
     *
     * @param  object $response
     * @param  object $request
     * @param  array $items
     * @param  int $total_items
     *
     * @return object
     */
    public function format_collection_response( $response, $request, $total_items ) {
        if ( $total_items === 0 ) {
            return $response;
        }

        // Store pagation values for headers then unset for count query.
        $per_page = (int) ( ! empty( $request['per_page'] ) ? $request['per_page'] : 20 );
        $page     = (int) ( ! empty( $request['page'] ) ? $request['page'] : 1 );

        $response->header( 'X-WP-Total', (int) $total_items );

        $max_pages = ceil( $total_items / $per_page );

        $response->header( 'X-WP-TotalPages', (int) $max_pages );
        $base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->base ) ) );

        if ( $page > 1 ) {
            $prev_page = $page - 1;
            if ( $prev_page > $max_pages ) {
                $prev_page = $max_pages;
            }
            $prev_link = add_query_arg( 'page', $prev_page, $base );
            $response->link_header( 'prev', $prev_link );
        }
        if ( $max_pages > $page ) {

            $next_page = $page + 1;
            $next_link = add_query_arg( 'page', $next_page, $base );
            $response->link_header( 'next', $next_link );
        }

        return $response;
    }

}

<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WP\MCP\Transport\HttpTransport;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * The MCP Adapter's HTTP transport with the marketplace's rule at the door.
 *
 * The adapter's own permission callback reduces the answer to yes or no; answering here keeps
 * the reason, so an assistant that is turned away can tell the user why. Loaded only when the
 * adapter asks for it, so the parent class always exists.
 *
 * @since DOKAN_SINCE
 */
class Transport extends HttpTransport {

    /**
     * Decide whether the request may use Dokan's MCP endpoint.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_REST_Request $request The request.
     *
     * @return true|\WP_Error
     */
    public function check_permission( WP_REST_Request $request ) {
        $allowed = Server::authorize();

        if ( true === $allowed ) {
            // Tools on this server run without the adapter's meta-tool filters, so nothing else marks the request before a permission callback asks.
            RequestContext::flag_mcp_request();
        }

        return $allowed;
    }
}

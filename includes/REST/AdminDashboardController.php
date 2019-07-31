<?php

namespace WeDevs\Dokan\REST;

use WP_Error;
use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTAdminController;

/**
* Admin Dashboard
*
* @since 2.8.0
*
* @package dokan
*/
class AdminDashboardController extends DokanRESTAdminController {

    /**
     * Route base.
     *
     * @var string
     */
    protected $base = 'dashboard';

    /**
     * Register all routes releated with stores
     *
     * @return void
     */
    public function register_routes() {

        register_rest_route( $this->namespace, '/' . $this->base . '/feed', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_feeds' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'items' => array(
                        'type'        => 'integer',
                        'description' => __( 'Number of feed item', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => 5
                    ),
                    'show_summary' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing summary', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => false
                    ),
                    'show_author' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing author', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => false
                    ),
                    'show_date' => array(
                        'type'        => 'boolean',
                        'description' => __( 'Flag for showing date', 'dokan-lite' ),
                        'required'    => false,
                        'default'     => true
                    ),
                )
            ),
        ) );

    }

    /**
     * Get rss feeds
     *
     * @since 2.8.0
     *
     * @return WP_REST_Response
     */
    public function get_feeds( $request ) {
        $items = (int) $request['items'];

        if ( $items < 1 || 20 < $items ) {
            $items = 10;
        }

        $show_summary  = (int) $request['show_summary'];
        $show_author   = (int) $request['show_author'];
        $show_date     = (int) $request['show_date'];

        $url = 'https://wedevs.com/account/tag/dokan/feed/';
        $rss = fetch_feed( $url );

        if ( is_wp_error( $rss ) ) {
            return $rss;
        }

        if ( ! $rss->get_item_quantity() ) {
            return new WP_Error( 'error', __( 'An error has occurred, which probably means the feed is down. Try again later.', 'dokan-lite' ) );
            $rss->__destruct();
            unset($rss);
        }

        $feeds = array();
        foreach ( $rss->get_items( 0, $items ) as $item ) {
            $link = $item->get_link();
            while ( stristr( $link, 'http' ) != $link ) {
                $link = substr( $link, 1 );
            }
            $link = esc_url( strip_tags( $link ) );

            $title = esc_html( trim( strip_tags( $item->get_title() ) ) );
            if ( empty( $title ) ) {
                $title = __( 'Untitled', 'dokan-lite' );
            }

            $desc = @html_entity_decode( $item->get_description(), ENT_QUOTES, get_option( 'blog_charset' ) );
            $desc = esc_attr( wp_trim_words( $desc, 55, ' [&hellip;]' ) );

            $summary = $date = $author = '';
            if ( $show_summary ) {
                $summary = $desc;

                // Change existing [...] to [&hellip;].
                if ( '[...]' == substr( $summary, -5 ) ) {
                    $summary = substr( $summary, 0, -5 ) . '[&hellip;]';
                }

                $summary = esc_html( $summary );
            }

            if ( $show_date ) {
                $date = $item->get_date( 'U' );

                if ( $date ) {
                    $date = date_i18n( get_option( 'date_format' ), $date );
                }
            }

            if ( $show_author ) {
                $author = $item->get_author();

                if ( is_object($author) ) {
                    $author = $author->get_name();
                    $author = esc_html( strip_tags( $author ) );
                }
            }

            $feeds[] = array(
                'link'    => $link,
                'title'   => $title,
                'desc'    => $desc,
                'summary' => $summary,
                'date'    => $date,
                'author'  => $author
            );
        }

        $rss->__destruct();
        unset($rss);

        return rest_ensure_response( $feeds );
    }

}

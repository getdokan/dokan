<?php

namespace WeDevs\Dokan;

/**
 * Cache Invalidate class.
 *
 * Handles all of the common caches.
 *
 * @since 3.3.2
 */
class CacheInvalidate {

    /**
     * Constructor
     *
     * @since 3.3.2
     */
    public function __construct() {
        // Clear global comment related caches.
        add_action( 'comment_post', [ $this, 'comment_created' ], 10, 3 );
        add_action( 'edit_comment', [ $this, 'comment_updated' ], 10, 2 );
        add_action( 'delete_comment', [ $this, 'comment_deleted' ], 10, 2 );
    }

    /**
     * Invalidate comments cache group of the specific post type.
     *
     * @since 3.3.2
     *
     * @param string $group
     * @param int    $user_id
     *
     * @return void
     */
    public function clear_comment_cache( $post_type, $user_id ) {
        $group = "count_{$post_type}_comments_{$user_id}";

        Cache::invalidate_group( $group );
    }

    /**
     * Fires after new comment is being added.
     *
     * @since 3.3.2
     *
     * @param int $comment_id
     * @param int|string $comment_approved
     * @param array $comment_data
     *
     * @return void
     */
    private function comment_created( $comment_id, $comment_approved, $comment_data ) {
        $post_type = get_post_type( $comment_data['comment_post_ID'] );
        $seller_id = get_post_field( 'post_author', $comment_data['comment_post_ID'] );

        $this->clear_comment_cache( $post_type, $seller_id );
    }

    /**
     * Fires after comment is being updated.
     *
     * @since 3.3.2
     *
     * @param int $comment_id
     * @param array $comment_data
     *
     * @return void
     */
    private function comment_updated( $comment_id, $comment_data ) {
        $post_type = get_post_type( $comment_data['comment_post_ID'] );
        $seller_id = get_post_field( 'post_author', $comment_data['comment_post_ID'] );

        $this->clear_comment_cache( $post_type, $seller_id );
    }

    /**
     * Fires after a comment is being deleted.
     *
     * @since 3.3.2
     *
     * @param int         $comment_id
     * @param \WP_Comment $comment
     *
     * @return void
     */
    private function comment_deleted( $comment_id, $comment ) {
        $post_type = get_post_type( $comment->comment_post_ID );
        $seller_id = get_post_field( 'post_author', $comment->comment_post_ID );

        $this->clear_comment_cache( $post_type, $seller_id );
    }
}

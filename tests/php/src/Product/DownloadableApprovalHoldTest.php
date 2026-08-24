<?php

namespace WeDevs\Dokan\Test\Product;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Order;
use WC_Product;
use WC_Product_Download;

/**
 * Downloadable files a vendor changes while a product awaits approval must not reach
 * existing customers until an administrator approves the update (dokan-pro#6045).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-product-downloads
 * @group dokan-downloadable-approval
 *
 * @covers ::dokan_hold_downloadable_files_meta_write
 * @covers ::dokan_apply_staged_downloadable_files
 * @covers ::dokan_downloadable_hold_applies
 */
class DownloadableApprovalHoldTest extends DokanTestCase {

    /**
     * URL of the approved file customers already hold.
     *
     * @var string
     */
    protected string $approved_url;

    /**
     * URL of the replacement file the vendor submits.
     *
     * @var string
     */
    protected string $replacement_url;

    /**
     * Approved-directories mode captured in set_up() and restored in tear_down().
     *
     * @var string
     */
    protected string $previous_download_mode;

    public function set_up() {
        parent::set_up();

        // Disable the approved-directories gate so the example.com files validate.
        $approved_directories         = wc_get_container()->get( DownloadApprovedDirectories::class );
        $this->previous_download_mode = $approved_directories->get_mode();
        $approved_directories->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        $this->approved_url    = 'https://example.com/approved-' . uniqid() . '.pdf';
        $this->replacement_url = 'https://example.com/replacement-' . uniqid() . '.pdf';
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        wc_get_container()->get( DownloadApprovedDirectories::class )->set_mode( $this->previous_download_mode );

        parent::tear_down();
    }

    /**
     * A vendor's replacement file is held while the product awaits review: the live files
     * and the customer's permission both stay on the approved file.
     */
    public function test_replacement_file_is_held_while_awaiting_review() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ), 'The replacement should be staged.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ), 'Customers must keep the approved file.' );
        $this->assertSame( [ $this->approved_url ], $this->permission_urls( $product ), 'The download permission must not move.' );
    }

    /**
     * Publishing the product delivers the staged file and moves existing customers onto it.
     */
    public function test_publishing_releases_the_staged_file_to_existing_customers() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );
        $this->set_status( $product, 'publish' );

        $this->assertNull( $this->staged( $product ), 'Staging should be cleared on release.' );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ), 'The approved replacement should be live.' );
        $this->assertSame( [ $this->replacement_url ], $this->permission_urls( $product ), 'Existing customers should be moved onto it.' );
    }

    /**
     * `private` is an administrator decision too, so it releases the submission.
     */
    public function test_private_status_also_releases_the_staged_file() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );
        $this->set_status( $product, 'private' );

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->permission_urls( $product ) );
    }

    /**
     * Draft is not an approval, so a change saved as draft is held just like pending.
     */
    public function test_draft_status_is_held_too() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'draft' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ) );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
        $this->assertSame( [ $this->approved_url ], $this->permission_urls( $product ) );
    }

    /**
     * Removing every file is held as well, and the removal applies on approval.
     */
    public function test_removing_every_file_is_held_then_applied_on_approval() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [] );

        $this->assertSame( [], $this->staged( $product ), 'An empty submission is still a submission.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ), 'Customers keep their file until approval.' );

        $this->set_status( $product, 'publish' );

        $this->assertSame( [], $this->live_urls( $product ) );
        $this->assertSame( [], $this->permission_urls( $product ), 'Approval applies the removal.' );
    }

    /**
     * Editing the product again while it waits replaces the pending submission rather
     * than stacking a second one.
     */
    public function test_a_second_edit_replaces_the_pending_submission() {
        $product = $this->create_sold_downloadable_product();
        $third   = 'https://example.com/third-' . uniqid() . '.pdf';

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );
        $this->submit_files( $product, [ $third ] );

        $this->assertSame( [ $third ], $this->staged_urls( $product ) );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
    }

    /**
     * Putting the approved files back withdraws the pending submission.
     */
    public function test_resubmitting_the_approved_files_withdraws_the_submission() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        // only the vendor withdraws their own submission; anyone else saving the product
        // is re-submitting the rendered approved set and must not discard it
        wp_set_current_user( $this->seller_id1 );
        $this->submit_files( $product, [ $this->approved_url ] );
        wp_set_current_user( 0 );

        $this->assertNull( $this->staged( $product ), 'Nothing is pending once the approved files are back.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
    }

    /**
     * An administrator opening a pending product to review it, and saving without
     * publishing, must not destroy the vendor's submission.
     */
    public function test_an_admin_saving_without_publishing_keeps_the_submission() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        // the wp-admin meta box re-submits the rendered rows, which show the approved set
        wp_set_current_user( $this->admin_id );
        $this->submit_files( $product, [ $this->approved_url ] );
        wp_set_current_user( 0 );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ), 'The submission must survive an admin review save.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
    }

    /**
     * Nobody has bought the product yet, so there is no one to protect and the change
     * goes live immediately.
     */
    public function test_a_product_without_buyers_is_not_held() {
        $product = $this->create_downloadable_product( $this->seller_id1 );

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );
    }

    /**
     * A vendor allowed to publish directly has no review step, so nothing is held.
     */
    public function test_a_trusted_vendor_is_not_held() {
        update_user_meta( $this->seller_id1, 'dokan_publishing', 'yes' );

        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'draft' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );

        delete_user_meta( $this->seller_id1, 'dokan_publishing' );
    }

    /**
     * A shop manager is the reviewer, not the reviewed, so their own product is not held.
     */
    public function test_a_shop_managers_own_product_is_not_held() {
        $product = $this->create_sold_downloadable_product( $this->admin_id );

        $this->set_status( $product, 'draft' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );
    }

    /**
     * Approving through the REST/CRUD path — read the product, flip the status, save the
     * files it handed back — must deliver the staged submission rather than orphaning the
     * customer's permission.
     */
    public function test_approving_through_a_crud_save_delivers_the_staged_file() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $saving = wc_get_product( $product->get_id() );
        $saving->set_status( 'publish' );
        $saving->set_downloads( $this->downloads_for( [ $this->approved_url ] ) );
        $saving->save();

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );
        $this->assertSame( [ $this->replacement_url ], $this->permission_urls( $product ), 'The permission must match the live file.' );
    }

    /**
     * An administrator who actually edits the files while approving overrides the
     * vendor's submission, and existing customers follow the administrator's file.
     */
    public function test_an_admin_editing_the_files_while_approving_wins() {
        $product   = $this->create_sold_downloadable_product();
        $admin_url = 'https://example.com/admin-' . uniqid() . '.pdf';

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $saving = wc_get_product( $product->get_id() );
        $saving->set_status( 'publish' );
        $saving->set_downloads( $this->downloads_for( [ $admin_url ] ) );
        $saving->save();

        $this->assertNull( $this->staged( $product ) );
        $this->assertSame( [ $admin_url ], $this->live_urls( $product ) );
        $this->assertSame( [ $admin_url ], $this->permission_urls( $product ) );
    }

    /**
     * Trashing a pending product discards the submission, so untrashing and publishing
     * later does not silently deliver it.
     */
    public function test_trashing_discards_the_pending_submission() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        wp_trash_post( $product->get_id() );

        $this->assertNull( $this->staged( $product ) );

        wp_untrash_post( $product->get_id() );
        $this->set_status( $product, 'publish' );

        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
    }

    /* ---------------------------------------------------------------------- helpers */

    /**
     * Create a downloadable product owned by a seller, holding the approved file.
     */
    protected function create_downloadable_product( int $author ): WC_Product {
        $product = $this->factory()->product->create_downloadable_product( $this->downloads_for( [ $this->approved_url ] ) );

        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $author,
            ]
        );

        return wc_get_product( $product->get_id() );
    }

    /**
     * Create a downloadable product a customer has already purchased and can download.
     */
    protected function create_sold_downloadable_product( ?int $author = null ): WC_Product {
        $product = $this->create_downloadable_product( $author ?? $this->seller_id1 );

        $order = new WC_Order();
        $order->set_customer_id( $this->customer_id );
        $order->add_product( $product, 1 );
        $order->calculate_totals();
        $order->set_status( 'completed' );
        $order->save();

        return $product;
    }

    /**
     * Build WC_Product_Download objects for a list of file URLs.
     *
     * @return WC_Product_Download[]
     */
    protected function downloads_for( array $urls ): array {
        $downloads = [];

        foreach ( $urls as $url ) {
            $download = new WC_Product_Download();
            $download->set_id( md5( $url ) );
            $download->set_name( basename( $url ) );
            $download->set_file( $url );

            $downloads[] = $download;
        }

        return $downloads;
    }

    /**
     * Save a vendor's submitted file set the way the product editor does.
     */
    protected function submit_files( WC_Product $product, array $urls ): void {
        $saving = wc_get_product( $product->get_id() );
        $saving->set_downloads( $this->downloads_for( $urls ) );
        $saving->save();
    }

    /**
     * Move the product to a status without touching its files.
     */
    protected function set_status( WC_Product $product, string $status ): void {
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_status' => $status,
            ]
        );
    }

    /**
     * Staged submission, or null when nothing is pending.
     */
    protected function staged( WC_Product $product ): ?array {
        return dokan_get_staged_downloadable_files( $product->get_id() );
    }

    /**
     * File URLs of the staged submission.
     */
    protected function staged_urls( WC_Product $product ): array {
        return $this->urls_of( (array) $this->staged( $product ) );
    }

    /**
     * File URLs currently live on the product.
     */
    protected function live_urls( WC_Product $product ): array {
        $live = get_post_meta( $product->get_id(), '_downloadable_files', true );

        return $this->urls_of( is_array( $live ) ? $live : [] );
    }

    /**
     * File URLs the customer's download permissions currently point at.
     */
    protected function permission_urls( WC_Product $product ): array {
        global $wpdb;

        $ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT DISTINCT download_id FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions WHERE product_id = %d",
                $product->get_id()
            )
        );

        $live = get_post_meta( $product->get_id(), '_downloadable_files', true );
        $live = is_array( $live ) ? $live : [];
        $urls = [];

        foreach ( $ids as $id ) {
            // an id that is no longer on the product means an orphaned permission
            $urls[] = isset( $live[ $id ] ) ? $live[ $id ]['file'] : 'orphaned:' . $id;
        }

        sort( $urls );

        return $urls;
    }

    /**
     * Sorted file URLs of a `_downloadable_files` style array.
     */
    protected function urls_of( array $files ): array {
        $urls = [];

        foreach ( $files as $file ) {
            if ( is_array( $file ) && ! empty( $file['file'] ) ) {
                $urls[] = $file['file'];
            }
        }

        sort( $urls );

        return $urls;
    }
}

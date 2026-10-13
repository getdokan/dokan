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

    /**
     * `private` is not an approval a vendor can grant themselves, so it holds like any
     * other non-published status (dokan-pro#6045 was reachable through it).
     */
    public function test_private_status_is_held_not_released() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'private' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ) );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
        $this->assertSame( [ $this->approved_url ], $this->permission_urls( $product ) );
    }

    /**
     * A vendor cannot post a status the dashboard never offered them, so they cannot put
     * their own product into a state that releases their submission.
     */
    public function test_a_vendor_cannot_submit_a_status_they_were_not_offered() {
        $product = $this->create_sold_downloadable_product();
        $this->set_status( $product, 'pending' );

        wp_set_current_user( $this->seller_id1 );

        $offered = array_keys( (array) dokan_get_available_post_status( $product->get_id() ) );

        $this->assertNotContains( 'private', $offered, 'The dashboard must never offer `private`.' );
        $this->assertNotContains( 'private', dokan_get_downloadable_files_released_statuses( $product->get_id() ), 'A vendor-reachable status must not release files.' );

        wp_set_current_user( 0 );
    }

    /**
     * Rejecting a product discards the submission, so the next approval cannot deliver the
     * very file the administrator turned down.
     */
    public function test_rejecting_discards_the_pending_submission() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ) );

        $this->set_status( $product, 'reject' );

        $this->assertNull( $this->staged( $product ), 'A rejection must drop the submission.' );

        $this->set_status( $product, 'publish' );

        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ), 'A rejected file must never be delivered.' );
        $this->assertSame( [ $this->approved_url ], $this->permission_urls( $product ) );
    }

    /**
     * Unticking "Downloadable" is held too: it revokes access rather than substituting it,
     * so an existing customer keeps their download until an admin approves the removal.
     */
    public function test_unticking_downloadable_is_held_then_applied_on_approval() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );

        $saving = wc_get_product( $product->get_id() );
        $saving->set_downloadable( false );
        $saving->save();

        $this->assertSame( 'yes', get_post_meta( $product->get_id(), '_downloadable', true ), 'The flag must stay live while held.' );
        $this->assertSame( 'no', dokan_get_staged_downloadable_flag( $product->get_id() ), 'The untick must be staged.' );
        $this->assertCount( 1, wc_get_customer_available_downloads( $this->customer_id ), 'The customer keeps their download.' );

        $this->set_status( $product, 'publish' );

        $this->assertSame( 'no', get_post_meta( $product->get_id(), '_downloadable', true ), 'Approval applies the removal.' );
        $this->assertNull( dokan_get_staged_downloadable_flag( $product->get_id() ) );
        $this->assertCount( 0, wc_get_customer_available_downloads( $this->customer_id ) );
    }

    /**
     * Re-ticking "Downloadable" while the product waits withdraws the pending removal.
     */
    public function test_reticking_downloadable_withdraws_the_pending_removal() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );

        $saving = wc_get_product( $product->get_id() );
        $saving->set_downloadable( false );
        $saving->save();

        $this->assertSame( 'no', dokan_get_staged_downloadable_flag( $product->get_id() ) );

        // the vendor re-ticks the box on the product form and saves
        $this->submit_classic_form( $product, [ $this->approved_url ], true );

        $this->assertNull( dokan_get_staged_downloadable_flag( $product->get_id() ) );
        $this->assertSame( 'yes', get_post_meta( $product->get_id(), '_downloadable', true ) );
    }

    /**
     * The vendor namespace must hand a vendor their own held submission, otherwise saving
     * back what it showed them silently destroys their upload.
     */
    public function test_the_vendor_rest_namespace_shows_the_staged_files() {
        $product = $this->create_sold_downloadable_product();
        $id      = $product->get_id();

        $this->set_status( $product, 'pending' );
        wp_set_current_user( $this->seller_id1 );
        $this->submit_files( $product, [ $this->replacement_url ] );

        $response = rest_do_request( new \WP_REST_Request( 'GET', '/dokan/v1/products/' . $id ) );
        $data     = $response->get_data();

        $this->assertSame( 200, $response->get_status() );
        $this->assertTrue( $data['dokan_downloads_awaiting_approval'], 'The vendor must be told the files are held.' );
        $this->assertSame( [ $this->replacement_url ], wp_list_pluck( $data['downloads'], 'file' ), 'The vendor must be shown what they submitted.' );

        // saving back exactly what the API handed them must not read as a withdrawal
        $request = new \WP_REST_Request( 'PUT', '/dokan/v1/products/' . $id );
        $request->set_body_params( [ 'downloads' => $data['downloads'] ] );
        rest_do_request( $request );

        $this->assertSame( [ $this->replacement_url ], $this->staged_urls( $product ), 'The submission must survive the round trip.' );

        wp_set_current_user( 0 );
    }

    /**
     * An administrator pressing "Discard pending files" drops the submission and leaves the
     * approved files with existing customers.
     */
    public function test_discarding_drops_the_submission_and_keeps_the_approved_files() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );
        $this->submit_files( $product, [ $this->replacement_url ] );

        wp_set_current_user( $this->admin_id );
        $_POST['dokan_discard_pending_downloads'] = '1';
        $_POST['woocommerce_meta_nonce']          = wp_create_nonce( 'woocommerce_save_data' );

        $this->set_status( $product, 'publish' );

        unset( $_POST['dokan_discard_pending_downloads'], $_POST['woocommerce_meta_nonce'] );
        wp_set_current_user( 0 );

        $this->assertNull( $this->staged( $product ), 'The submission must be discarded.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ), 'The approved files must stay live.' );
        $this->assertSame( [ $this->approved_url ], $this->permission_urls( $product ) );
    }

    /**
     * The staging records who wrote it, so the admin review panel does not attribute a
     * reviewer's own edit to the vendor.
     */
    public function test_staging_records_who_submitted_it() {
        $product = $this->create_sold_downloadable_product();

        $this->set_status( $product, 'pending' );

        wp_set_current_user( $this->seller_id1 );
        $this->submit_files( $product, [ $this->replacement_url ] );
        wp_set_current_user( 0 );

        $this->assertSame(
            $this->seller_id1,
            (int) get_post_meta( $product->get_id(), '_dokan_pending_downloadable_files_author', true )
        );
    }

    /**
     * A variation's files are held by its parent's status and released when the parent is
     * published, so a variable product gets the same protection as a simple one.
     */
    public function test_a_variation_is_held_by_its_parent_and_released_with_it() {
        $parent = new \WC_Product_Variable();
        $parent->set_name( 'Variable downloadable' );
        $parent->set_status( 'publish' );
        $parent->save();

        wp_update_post(
            [
                'ID'          => $parent->get_id(),
                'post_author' => $this->seller_id1,
            ]
        );

        $variation = new \WC_Product_Variation();
        $variation->set_parent_id( $parent->get_id() );
        $variation->set_regular_price( '10' );
        $variation->set_downloadable( true );
        $variation->set_downloads( $this->downloads_for( [ $this->approved_url ] ) );
        $variation->save();

        $order = new WC_Order();
        $order->set_customer_id( $this->customer_id );
        $order->add_product( wc_get_product( $variation->get_id() ), 1 );
        $order->calculate_totals();
        $order->set_status( 'completed' );
        $order->save();

        wp_update_post(
            [
                'ID'          => $parent->get_id(),
                'post_status' => 'pending',
            ]
        );

        $saving = wc_get_product( $variation->get_id() );
        $saving->set_downloads( $this->downloads_for( [ $this->replacement_url ] ) );
        $saving->save();

        $this->assertSame( [ $this->replacement_url ], $this->urls_of( (array) dokan_get_staged_downloadable_files( $variation->get_id() ) ) );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( wc_get_product( $variation->get_id() ) ), 'The customer keeps the approved file.' );
        $this->assertSame( 'yes', get_post_meta( $parent->get_id(), '_dokan_pending_downloadable_children', true ), 'The parent must know a child is staged.' );

        wp_update_post(
            [
                'ID'          => $parent->get_id(),
                'post_status' => 'publish',
            ]
        );

        $this->assertNull( dokan_get_staged_downloadable_files( $variation->get_id() ) );
        $this->assertSame( [ $this->replacement_url ], $this->live_urls( wc_get_product( $variation->get_id() ) ) );
        $this->assertSame(
            [ $this->replacement_url ],
            array_map( static fn( $download ) => $download['file']['file'], wc_get_customer_available_downloads( $this->customer_id ) ),
            'The customer follows the approved replacement.'
        );
    }

    /**
     * Saving the same files through a different path re-keys their download ids (the classic
     * form uses md5(url), CRUD saves use UUIDs or attachment ids). Permissions are keyed by
     * download id, so they must follow the re-key even while the product is held — otherwise
     * the customer loses access to a file that never changed.
     */
    public function test_a_download_id_rekey_keeps_the_customer_permission_aligned() {
        $product = $this->create_sold_downloadable_product();
        $id      = $product->get_id();

        $this->set_status( $product, 'pending' );

        // same file, different id — exactly what a CRUD save followed by a classic-form save does
        $rekeyed = new WC_Product_Download();
        $rekeyed->set_id( 'attachment-9999' );
        $rekeyed->set_name( basename( $this->approved_url ) );
        $rekeyed->set_file( $this->approved_url );

        $saving = wc_get_product( $id );
        $saving->set_downloads( [ $rekeyed ] );
        $saving->save();

        $this->assertNull( $this->staged( $product ), 'An id-only change is not a submission.' );
        $this->assertSame( [ $this->approved_url ], $this->live_urls( $product ) );
        $this->assertSame(
            [ $this->approved_url ],
            $this->permission_urls( $product ),
            'The permission must follow the re-key rather than being orphaned.'
        );
        $this->assertCount( 1, wc_get_customer_available_downloads( $this->customer_id ), 'The customer keeps their download.' );
    }

    /**
     * A CRUD/REST file change must move existing customers onto the new file, exactly as the
     * classic vendor form does. WooCommerce fires its own action for these saves and nothing
     * listened to it, so the permission was left pointing at a download id the product no
     * longer offered and the customer's Downloads page went empty.
     */
    public function test_a_crud_file_change_keeps_the_customer_permission_aligned() {
        $product = $this->create_sold_downloadable_product();

        // published and trusted: no hold, so the change applies immediately and the
        // permission has to follow it
        update_user_meta( $this->seller_id1, 'dokan_publishing', 'yes' );

        $saving = wc_get_product( $product->get_id() );
        $saving->set_downloads( $this->downloads_for( [ $this->replacement_url ] ) );
        $saving->save();

        delete_user_meta( $this->seller_id1, 'dokan_publishing' );

        $this->assertSame( [ $this->replacement_url ], $this->live_urls( $product ) );
        $this->assertSame(
            [ $this->replacement_url ],
            $this->permission_urls( $product ),
            'The permission must follow a CRUD file change, not be orphaned.'
        );
        $this->assertCount( 1, wc_get_customer_available_downloads( $this->customer_id ), 'The customer must keep a working download.' );
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
     * Save the product the way the classic vendor product form does.
     */
    protected function submit_classic_form( WC_Product $product, array $urls, bool $downloadable = true ): void {
        $data = [
            '_visibility'    => 'visible',
            '_stock_status'  => 'instock',
            'product_type'   => 'simple',
            '_regular_price' => '10',
            '_sku'           => '',
        ];

        if ( $downloadable ) {
            $data['_downloadable']    = 'on';
            $data['_download_limit']  = '';
            $data['_download_expiry'] = '';
            $data['_wc_file_urls']    = $urls;
            $data['_wc_file_names']   = array_map( 'basename', $urls );
        }

        dokan_process_product_meta( $product->get_id(), $data );
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

<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Product\Hooks;
use WeDevs\Dokan\CJDropshipping\Product\Importer;
use WeDevs\Dokan\CJDropshipping\Queue;
use WeDevs\Dokan\CJDropshipping\Vendor\Alerts;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Product_Variable;
use WC_Product_Variation;

/**
 * CJ photos: copied at import, updated only when CJ's photo addresses change.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class ImagesTest extends DokanTestCase {

    protected Hooks $hooks;

    protected int $parent;

    protected int $v1;

    protected int $v2;

    public function set_up() {
        parent::set_up();

        Schema::install();
        add_filter( 'dokan_cj_email_vendor_alerts', '__return_false' );
        delete_user_meta( $this->seller_id1, Alerts::META );
        as_unschedule_all_actions( Importer::IMAGES_UPDATE_HOOK );

        // Downloads become attachments with the CJ address, like the real sideload.
        $this->hooks = new class() extends Hooks {
            public array $downloads = [];

            protected function sideload( string $url, int $product_id, int $vendor_id ): int {
                $existing = get_posts(
                    [
                        'post_type'   => 'attachment',
                        'post_status' => 'inherit',
                        'author'      => $vendor_id,
                        'fields'      => 'ids',
                        'meta_key'    => '_dokan_cj_source_url', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                        'meta_value'  => $url, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
                    ]
                );

                if ( $existing ) {
                    return (int) $existing[0];
                }

                $this->downloads[] = $url;

                return ImagesTest::attachment( $vendor_id, $url );
            }
        };

        $parent = new WC_Product_Variable();
        $parent->set_name( 'CJ phone case' );
        $parent->update_meta_data( '_dokan_cj_pid', 'P1' );
        $this->parent = $parent->save();
        wp_update_post(
            [
                'ID'          => $this->parent,
                'post_author' => $this->seller_id1,
            ]
        );

        $links = new LinkRepository();

        foreach ( [ 'V1', 'V2' ] as $vid ) {
            $variation = new WC_Product_Variation();
            $variation->set_parent_id( $this->parent );
            $variation->set_regular_price( '10' );
            $id = $variation->save();
            $links->link( $id, $this->parent, $this->seller_id1, $vid, 'P1' );
            $this->{ strtolower( $vid ) } = $id;
        }

        $this->cj_photos(
            'a0', [ 'a1', 'a2' ], [
				'V1' => 'v1',
				'V2' => 'v2',
			]
        );
        $this->hooks->import_images( $this->parent );
        $this->hooks->downloads = [];
    }

    /**
     * An attachment owned by a vendor; with a CJ address when given one.
     */
    public static function attachment( int $vendor_id, string $url = '' ): int {
        $id = wp_insert_attachment(
            [
                'post_title'     => $url ? $url : 'own photo',
                'post_mime_type' => 'image/jpeg',
                'post_status'    => 'inherit',
                'post_author'    => $vendor_id,
            ]
        );

        if ( $url ) {
            update_post_meta( $id, '_dokan_cj_source_url', $url );
        }

        return (int) $id;
    }

    /**
     * What CJ's product details say about photos; names become CJ addresses.
     */
    protected function cj_photos( string $main, array $gallery, array $variants ): array {
        $url     = fn( $name ) => "https://cf.cjdropshipping.com/{$name}.jpg";
        $details = [
            'fetched_at' => time(),
            'pid'        => 'P1',
            'image'      => $url( $main ),
            'images'     => array_map( $url, $gallery ),
            'variants'   => [],
        ];

        foreach ( $variants as $vid => $name ) {
            $details['variants'][] = [
                'vid'   => $vid,
                'image' => $url( $name ),
            ];
        }

        set_transient( 'dokan_cj_product_' . md5( 'P1' ), $details, HOUR_IN_SECONDS );

        return $details;
    }

    protected function source( int $image_id ): string {
        return basename( (string) get_post_meta( $image_id, '_dokan_cj_source_url', true ), '.jpg' );
    }

    protected function gallery_names(): array {
        return array_map(
            fn( $id ) => $this->source( (int) $id ) ? $this->source( (int) $id ) : 'own',
            wc_get_product( $this->parent )->get_gallery_image_ids()
        );
    }

    public function test_import_records_cj_photo_addresses() {
        $saved = get_post_meta( $this->parent, Hooks::IMAGES_META, true );

        $this->assertStringEndsWith( 'a0.jpg', $saved['main'] );
        $this->assertCount( 2, $saved['gallery'] );
        $this->assertSame( [ 'V1', 'V2' ], array_keys( $saved['variants'] ) );
        $this->assertSame( 'a0', $this->source( (int) wc_get_product( $this->parent )->get_image_id() ) );
        $this->assertSame( [ 'a1', 'a2' ], $this->gallery_names() );
    }

    public function test_unchanged_or_reordered_photos_queue_nothing() {
        Hooks::check_images(
            $this->parent, $this->cj_photos(
                'a0', [ 'a2', 'a1' ], [
					'V2' => 'v2',
					'V1' => 'v1',
				]
            )
        );

        $this->assertFalse( Queue::is_pending( Importer::IMAGES_UPDATE_HOOK ) );
    }

    public function test_products_imported_before_the_check_start_from_todays_photos() {
        delete_post_meta( $this->parent, Hooks::IMAGES_META );

        Hooks::check_images( $this->parent, $this->cj_photos( 'b0', [ 'b1' ], [] ) );

        $this->assertFalse( Queue::is_pending( Importer::IMAGES_UPDATE_HOOK ) );
        $this->assertStringEndsWith( 'b0.jpg', get_post_meta( $this->parent, Hooks::IMAGES_META, true )['main'] );
    }

    public function test_cj_photo_changes_replace_only_cj_photos_and_keep_the_vendors() {
        $product  = wc_get_product( $this->parent );
        $old_main = (int) $product->get_image_id();
        $old_v1   = (int) wc_get_product( $this->v1 )->get_image_id();

        // The vendor swapped CJ's a2 for a photo of their own.
        $gallery    = $product->get_gallery_image_ids();
        $gallery[1] = self::attachment( $this->seller_id1 );
        $product->set_gallery_image_ids( $gallery );
        $product->save();

        // CJ: new main, a2 dropped, b2 added, new V1 photo, V2 unchanged.
        Hooks::check_images(
            $this->parent, $this->cj_photos(
                'b0', [ 'a1', 'b2' ], [
					'V1' => 'w1',
					'V2' => 'v2',
				]
            )
        );
        $this->assertTrue( Queue::is_pending( Importer::IMAGES_UPDATE_HOOK, [ 'product_id' => $this->parent ] ) );

        $this->hooks->update_images( $this->parent );

        $this->assertSame( [ 'https://cf.cjdropshipping.com/b0.jpg', 'https://cf.cjdropshipping.com/b2.jpg', 'https://cf.cjdropshipping.com/w1.jpg' ], $this->hooks->downloads );
        $this->assertSame( 'b0', $this->source( (int) wc_get_product( $this->parent )->get_image_id() ) );
        $this->assertSame( [ 'a1', 'own', 'b2' ], $this->gallery_names() );
        $this->assertSame( 'w1', $this->source( (int) wc_get_product( $this->v1 )->get_image_id() ) );
        $this->assertSame( 'v2', $this->source( (int) wc_get_product( $this->v2 )->get_image_id() ) );

        // Replaced copies nobody uses are deleted.
        $this->assertNull( get_post( $old_main ) );
        $this->assertNull( get_post( $old_v1 ) );

        $this->assertArrayHasKey( 'images_updated:' . $this->parent, Alerts::all( $this->seller_id1 ) );
        $this->assertStringEndsWith( 'w1.jpg', get_post_meta( $this->parent, Hooks::IMAGES_META, true )['variants']['V1'] );
    }

    public function test_a_main_photo_the_vendor_replaced_stays() {
        $product = wc_get_product( $this->parent );
        $own     = self::attachment( $this->seller_id1 );
        $product->set_image_id( $own );
        $product->save();

        $this->cj_photos(
            'b0', [ 'a1', 'a2' ], [
				'V1' => 'v1',
				'V2' => 'v2',
			]
        );
        $this->hooks->update_images( $this->parent );

        $this->assertSame( [], $this->hooks->downloads );
        $this->assertSame( $own, (int) wc_get_product( $this->parent )->get_image_id() );
        $this->assertSame( [], Alerts::all( $this->seller_id1 ) );
    }

    public function test_a_photo_another_product_still_uses_is_not_deleted() {
        $old_main = (int) wc_get_product( $this->parent )->get_image_id();

        $other = new WC_Product_Variable();
        $other->set_image_id( $old_main );
        $other->save();

        $this->cj_photos(
            'b0', [ 'a1', 'a2' ], [
				'V1' => 'v1',
				'V2' => 'v2',
			]
        );
        $this->hooks->update_images( $this->parent );

        $this->assertSame( 'b0', $this->source( (int) wc_get_product( $this->parent )->get_image_id() ) );
        $this->assertNotNull( get_post( $old_main ) );
    }
}

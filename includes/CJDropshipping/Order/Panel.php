<?php

namespace WeDevs\Dokan\CJDropshipping\Order;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Vendor\Access;
use WeDevs\Dokan\Contracts\Hookable;
use WC_Order;
use WP_Error;

/**
 * "Order this on CJ" panel on the vendor's order page, and the order-side rules (epic §5).
 *
 * @since DOKAN_SINCE
 */
class Panel implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'dokan_order_detail_after_order_items', [ $this, 'render' ], 12 );
        add_action( 'woocommerce_update_order', [ $this, 'notify_if_changed' ], 20, 2 );
        add_filter( 'woocommerce_ajax_add_order_item_validation', [ $this, 'block_manual_add' ], 10, 2 );
        add_filter( 'woocommerce_rest_pre_insert_shop_order_object', [ $this, 'block_rest_add' ], 20, 3 );
        add_filter( 'dokan_rest_prepare_shop_order_object', [ $this, 'add_rest_flags' ], 20, 2 );
    }

    /**
     * Render the panel for the store owner.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order shown.
     *
     * @return void
     */
    public function render( $order ): void {
        if ( ! $order instanceof WC_Order || ! Fulfilment::has_cj_items( $order ) ) {
            return;
        }

        $user_id = get_current_user_id();
        $reason  = Access::blocked_reason( $user_id );

        if ( 'staff' === $reason ) {
            echo '<div class="dokan-panel dokan-panel-default"><div class="dokan-panel-body">' . esc_html__( 'This order has CJ products. Only the store owner can order them on CJ.', 'dokan-lite' ) . '</div></div>';

            return;
        }

        if ( '' !== $reason || (int) dokan_get_seller_id_by_order( $order->get_id() ) !== $user_id ) {
            return;
        }

        $fulfilment = new Fulfilment();
        $groups     = $fulfilment->groups( $order );
        $freight    = Fulfilment::quoted_freight( $order );
        $address    = Fulfilment::address( $order );
        $count      = count( $groups );
        $index      = 0;
        ?>
        <div class="dokan-panel dokan-panel-default dokan-cj-panel" id="dokan-cj-panel" data-order="<?php echo esc_attr( $order->get_id() ); ?>">
            <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Order this on CJ', 'dokan-lite' ); ?></strong></div>
            <div class="dokan-panel-body">
                <?php if ( Fulfilment::changed_since_ordered( $order ) ) : ?>
                    <div class="dokan-alert dokan-alert-warning" data-testid="cj-changed"><?php esc_html_e( 'This order changed after you ordered on CJ. Update your CJ order.', 'dokan-lite' ); ?></div>
                <?php endif; ?>

                <p><?php esc_html_e( 'Place one CJ order per group below in your CJ account, paid with your CJ balance, then save CJ\'s order number here.', 'dokan-lite' ); ?></p>

                <div class="dokan-cj-address">
                    <strong><?php esc_html_e( 'Ship to', 'dokan-lite' ); ?></strong>
                    <pre data-testid="cj-address" style="white-space:pre-wrap;margin:4px 0;"><?php echo esc_html( implode( "\n", $address ) ); ?></pre>
                    <button type="button" class="dokan-btn dokan-btn-default dokan-btn-sm dokan-cj-copy" data-copy="<?php echo esc_attr( implode( "\n", $address ) ); ?>"><?php esc_html_e( 'Copy address', 'dokan-lite' ); ?></button>
                </div>

                <?php foreach ( $groups as $warehouse => $group ) : ?>
                    <?php
                    ++$index;
                    $ref = $group['ref'] ? $group['ref'] : [];
                    ?>
                    <div class="dokan-cj-group" data-warehouse="<?php echo esc_attr( $warehouse ); ?>" style="border-top:1px solid #eee;margin-top:12px;padding-top:12px;">
                        <h4 style="margin:0 0 6px;">
                            <?php
                            echo esc_html(
                                sprintf(
                                    /* translators: 1: group number, 2: number of groups, 3: warehouse country */
                                    __( 'CJ order %1$d of %2$d: ships from %3$s', 'dokan-lite' ),
                                    $index,
                                    $count,
                                    Fulfilment::warehouse_name( $warehouse )
                                )
                            );
                            ?>
                        </h4>
                        <?php if ( $group['method'] ) : ?>
                            <p style="margin:0 0 6px;">
                                <?php
                                /* translators: %s: CJ shipping method */
                                echo esc_html( sprintf( __( 'Pick this shipping method on CJ: %s', 'dokan-lite' ), $group['method'] ) );
                                ?>
                            </p>
                        <?php endif; ?>
                        <table class="dokan-table dokan-table-condensed">
                            <thead><tr><th><?php esc_html_e( 'Item', 'dokan-lite' ); ?></th><th><?php esc_html_e( 'CJ SKU', 'dokan-lite' ); ?></th><th><?php esc_html_e( 'Qty', 'dokan-lite' ); ?></th><th><?php esc_html_e( 'CJ cost', 'dokan-lite' ); ?></th></tr></thead>
                            <tbody>
                            <?php foreach ( $group['items'] as $item ) : ?>
                                <tr>
                                    <td><?php echo esc_html( $item['name'] ); ?></td>
                                    <td><code><?php echo esc_html( $item['cj_sku'] ); ?></code> <button type="button" class="dokan-btn dokan-btn-default dokan-btn-sm dokan-cj-copy" data-copy="<?php echo esc_attr( $item['cj_sku'] ); ?>"><?php esc_html_e( 'Copy', 'dokan-lite' ); ?></button></td>
                                    <td><?php echo esc_html( $item['quantity'] ); ?></td>
                                    <td><?php echo wp_kses_post( wc_price( $item['cost'], [ 'currency' => $order->get_currency() ] ) ); ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                        <p style="margin:0 0 6px;">
                            <?php
                            echo wp_kses_post(
                                sprintf(
                                    /* translators: 1: CJ cost of items, 2: freight the buyer paid */
                                    __( 'You pay CJ about %1$s for the items, plus freight (the buyer paid %2$s for it).', 'dokan-lite' ),
                                    wc_price( $group['cost'], [ 'currency' => $order->get_currency() ] ),
                                    wc_price( $freight[ $warehouse ] ?? 0, [ 'currency' => $order->get_currency() ] )
                                )
                            );
                            ?>
                        </p>
                        <div class="dokan-cj-ref" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
                            <label><?php esc_html_e( 'CJ order number', 'dokan-lite' ); ?><br><input type="text" class="dokan-form-control dokan-cj-order-no" value="<?php echo esc_attr( $ref['cj_order_no'] ?? '' ); ?>"></label>
                            <label><?php esc_html_e( 'Tracking number', 'dokan-lite' ); ?><br><input type="text" class="dokan-form-control dokan-cj-tracking-no" value="<?php echo esc_attr( $ref['tracking_no'] ?? '' ); ?>"></label>
                            <button type="button" class="dokan-btn dokan-btn-theme dokan-cj-save"><?php esc_html_e( 'Save', 'dokan-lite' ); ?></button>
                        </div>
                        <p class="dokan-cj-message" role="status" style="margin:6px 0 0;"></p>
                    </div>
                <?php endforeach; ?>

                <?php if ( 'processing' === $order->get_status() ) : ?>
                    <div style="border-top:1px solid #eee;margin-top:12px;padding-top:12px;">
                        <button type="button" class="dokan-btn dokan-btn-default dokan-cj-delivered" <?php disabled( ! $fulfilment->is_fully_ordered( $order ) ); ?>><?php esc_html_e( 'Mark as delivered', 'dokan-lite' ); ?></button>
                        <span class="description"><?php esc_html_e( 'Completes the order once the buyer has the parcel.', 'dokan-lite' ); ?></span>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
        $this->print_script();
    }

    /**
     * Copy, save and deliver without a page reload.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function print_script(): void {
        $config = [
            'root'      => esc_url_raw( rest_url( 'dokan/v1/cj-dropshipping/orders/' ) ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'copied'    => __( 'Copied', 'dokan-lite' ),
            'saved'     => __( 'Saved.', 'dokan-lite' ),
            /* translators: %s: other order numbers */
            'duplicate' => __( 'Saved, but this CJ order number is also on order %s. Check you didn\'t paste the wrong one.', 'dokan-lite' ),
            'failed'    => __( 'Could not save. Try again.', 'dokan-lite' ),
        ];
        ?>
        <script>
        ( function () {
            var cfg = <?php echo wp_json_encode( $config ); ?>;
            var panel = document.getElementById( 'dokan-cj-panel' );
            if ( ! panel ) { return; }
            var order = panel.getAttribute( 'data-order' );
            var post = function ( path, body ) {
                return fetch( cfg.root + order + path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce }, body: JSON.stringify( body || {} ) } )
                    .then( function ( r ) { return r.json().then( function ( d ) { if ( ! r.ok ) { throw d; } return d; } ); } );
            };
            panel.addEventListener( 'click', function ( e ) {
                var t = e.target;
                if ( t.classList.contains( 'dokan-cj-copy' ) ) {
                    navigator.clipboard && navigator.clipboard.writeText( t.getAttribute( 'data-copy' ) );
                    var label = t.textContent; t.textContent = cfg.copied; setTimeout( function () { t.textContent = label; }, 1500 );
                }
                if ( t.classList.contains( 'dokan-cj-save' ) ) {
                    var group = t.closest( '.dokan-cj-group' ), msg = group.querySelector( '.dokan-cj-message' );
                    t.disabled = true;
                    post( '', { warehouse: group.getAttribute( 'data-warehouse' ), cj_order_no: group.querySelector( '.dokan-cj-order-no' ).value, tracking_no: group.querySelector( '.dokan-cj-tracking-no' ).value } )
                        .then( function ( d ) {
                            msg.textContent = d.duplicates && d.duplicates.length ? cfg.duplicate.replace( '%s', '#' + d.duplicates.join( ', #' ) ) : cfg.saved;
                            var deliver = panel.querySelector( '.dokan-cj-delivered' ); if ( deliver ) { deliver.disabled = ! d.fully_ordered; }
                        } )
                        .catch( function ( err ) { msg.textContent = ( err && err.message ) || cfg.failed; } )
                        .finally( function () { t.disabled = false; } );
                }
                if ( t.classList.contains( 'dokan-cj-delivered' ) ) {
                    t.disabled = true;
                    post( '/delivered' ).then( function () { window.location.reload(); } ).catch( function ( err ) { t.disabled = false; alert( ( err && err.message ) || cfg.failed ); } );
                }
            } );
        } )();
        </script>
        <?php
    }

    /**
     * Email the vendor once when an order changes after they ordered on CJ (D4).
     *
     * @since DOKAN_SINCE
     *
     * @param int      $order_id Order id.
     * @param WC_Order $order    Order.
     *
     * @return void
     */
    public function notify_if_changed( $order_id, $order = null ): void {
        $order = $order instanceof WC_Order ? $order : wc_get_order( $order_id );

        if ( ! $order instanceof WC_Order || $order->get_meta( Fulfilment::CHANGED_META ) || ! Fulfilment::changed_since_ordered( $order ) ) {
            return;
        }

        $order->update_meta_data( Fulfilment::CHANGED_META, time() );
        $order->save_meta_data();

        $vendor = get_userdata( (int) dokan_get_seller_id_by_order( $order->get_id() ) );

        if ( ! $vendor ) {
            return;
        }

        $mailer = WC()->mailer();
        /* translators: %s: order number */
        $subject = sprintf( __( 'Order #%s changed after you ordered on CJ', 'dokan-lite' ), $order->get_order_number() );
        $body    = __( 'The address or items of this order changed after you saved the CJ order number. Update your CJ order so CJ ships the right items to the right address.', 'dokan-lite' );

        // No nonce: it would belong to whoever saved the order; the email view mode is allowed.
        $link = add_query_arg(
            [
                'order_id'   => $order->get_id(),
                '_view_mode' => 'email',
            ],
            dokan_get_navigation_url( 'orders' )
        );

        $mailer->send( $vendor->user_email, $subject, $mailer->wrap_message( $subject, wpautop( esc_html( $body ) ) . '<p><a href="' . esc_url( $link ) . '">' . esc_html__( 'Open the order', 'dokan-lite' ) . '</a></p>' ) );
    }

    /**
     * CJ products can't be added to orders built by hand (D5).
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Error|mixed $error   Validation error so far.
     * @param \WC_Product    $product Product being added.
     *
     * @return WP_Error|mixed
     */
    public function block_manual_add( $error, $product ) {
        if ( ! $product instanceof \WC_Product ) {
            return $error;
        }

        $parent_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();

        if ( ! ( new LinkRepository() )->is_cj_product( $parent_id ) ) {
            return $error;
        }

        $error = is_wp_error( $error ) ? $error : new WP_Error();
        /* translators: %s: product name */
        $error->add( 'dokan_cj_manual_order', sprintf( __( '%s is a CJ Dropshipping product and can only be bought through checkout, where CJ prices the shipping.', 'dokan-lite' ), $product->get_name() ) );

        return $error;
    }

    /**
     * Orders made through REST, e.g. Pro's vendor manual orders, can't take CJ items either (D5).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order|WP_Error|mixed $order    Order about to be saved.
     * @param mixed                   $request  Request.
     * @param bool                    $creating Whether it's new.
     *
     * @return WC_Order|WP_Error|mixed
     */
    public function block_rest_add( $order, $request = null, $creating = false ) {
        if ( ! $order instanceof WC_Order ) {
            return $order;
        }

        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product || $item->get_meta( '_dokan_cj_vid' ) ) {
                continue;
            }

            $error = $this->block_manual_add( null, $item->get_product() );

            if ( is_wp_error( $error ) ) {
                $error->add_data( [ 'status' => 400 ] );

                return $error;
            }
        }

        return $order;
    }

    /**
     * Tell the vendor order list which orders have CJ items and whether they're ordered on CJ.
     *
     * @since DOKAN_SINCE
     *
     * @param \WP_REST_Response $response Response.
     * @param WC_Order|mixed    $order    Order.
     *
     * @return \WP_REST_Response
     */
    public function add_rest_flags( $response, $order ) {
        if ( ! $order instanceof WC_Order || ! Fulfilment::has_cj_items( $order ) ) {
            return $response;
        }

        $data             = $response->get_data();
        $data['dokan_cj'] = [
            'ordered' => ( new Fulfilment() )->is_fully_ordered( $order ),
        ];
        $response->set_data( $data );

        return $response;
    }
}

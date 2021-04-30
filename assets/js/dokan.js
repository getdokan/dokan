jQuery(function($) {

    $('.tips').tooltip();

    $('ul.order-status').on('click', 'a.dokan-edit-status', function(e) {
        $(this).addClass('dokan-hide').closest('li').next('li').removeClass('dokan-hide');

        return false;
    });

    $('ul.order-status').on('click', 'a.dokan-cancel-status', function(e) {
        $(this).closest('li').addClass('dokan-hide').prev('li').find('a.dokan-edit-status').removeClass('dokan-hide');

        return false;
    });

    $('form#dokan-order-status-form').on('submit', function(e) {
        e.preventDefault();

        var self = $(this),
            li = self.closest('li');

        li.block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        $.post( dokan.ajaxurl, self.serialize(), function(response) {
            li.unblock();

            if ( response.success ) {
                var prev_li = li.prev();

                li.addClass('dokan-hide');
                prev_li.find('label').replaceWith(response.data);
                prev_li.find('a.dokan-edit-status').removeClass('dokan-hide');
            } else {
                alert( response.data );
            }
        });
    });

    $('form#add-order-note').on( 'submit', function(e) {
        e.preventDefault();

        if (!$('textarea#add-note-content').val()) return;

        $('#dokan-order-notes').block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        $.post( dokan.ajaxurl, $(this).serialize(), function(response) {
            $('ul.order_notes').prepend( response );
            $('#dokan-order-notes').unblock();
            $('#add-note-content').val('');
        });

        return false;

    })

    $('#dokan-order-notes').on( 'click', 'a.delete_note', function() {

        var note = $(this).closest('li.note');

        $('#dokan-order-notes').block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        var data = {
            action: 'dokan_delete_order_note',
            note_id: $(note).attr('rel'),
            security: $('#delete-note-security').val()
        };

        $.post( dokan.ajaxurl, data, function(response) {
            $(note).remove();
            $('#dokan-order-notes').unblock();
        });

        return false;

    });

    $('.order_download_permissions').on('click', 'button.grant_access', function() {
        var self = $(this),
            product = $('select.grant_access_id').val();

        if (!product) return;

        $('.order_download_permissions').block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        var data = {
            action: 'dokan_grant_access_to_download',
            product_ids: product,
            loop: $('.order_download_permissions .panel').size(),
            order_id: self.data('order-id'),
            security: self.data('nonce')
        };

        $.post(dokan.ajaxurl, data, function( response ) {

            if ( response ) {

                $('#accordion').append( response );

            } else {

                alert('Could not grant access - the user may already have permission for this file or billing email is not set. Ensure the billing email is set, and the order has been saved.');

            }

            $( '.datepicker' ).datepicker();
            $('.order_download_permissions').unblock();

        });

        return false;
    });

    $('.order_download_permissions').on('click', 'button.revoke_access', function(e){
        e.preventDefault();
        var answer = confirm('Are you sure you want to revoke access to this download?');

        if (answer){

            var self = $(this),
                el = self.closest('.dokan-panel');

            var product = self.attr('rel').split(",")[0];
            var file = self.attr('rel').split(",")[1];

            if (product > 0) {

                $(el).block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

                var data = {
                    action: 'dokan_revoke_access_to_download',
                    product_id: product,
                    download_id: file,
                    order_id: self.data('order-id'),
                    permission_id: self.data('permission-id'),
                    security: self.data('nonce')
                };

                $.post(dokan.ajaxurl, data, function(response) {
                    // Success
                    $(el).fadeOut('300', function(){
                        $(el).remove();
                    });
                });

            } else {
                $(el).fadeOut('300', function(){
                    $(el).remove();
                });
            }

        }

        return false;
    });

});

/*global woocommerce_admin_meta_boxes, woocommerce_admin, accounting */
;(function($) {
    /**
     * Order Items Panel
     */
    var dokan_seller_meta_boxes_order_items = {
        init: function() {

            let formatMap = {
                // Day
                d: 'dd',
                D: 'D',
                j: 'd',
                l: 'DD',

                // Month
                F: 'MM',
                m: 'mm',
                M: 'M',
                n: 'm',

                // Year
                o: 'yy', // not exactly same. see php date doc for details
                Y: 'yy',
                y: 'y'
            }

            let i = 0;
            let char = '';
            let datepickerFormat = '';

            for (i = 0; i < dokan.i18n_date_format.length; i++) {
                char = dokan.i18n_date_format[i];

                if (char in formatMap) {
                    datepickerFormat += formatMap[char];
                } else {
                    datepickerFormat += char;
                }
            }

            $( "#shipped-date" ).datepicker({
                dateFormat: datepickerFormat
            });

            //saving note
            $( 'body' ).on('click','#dokan-add-tracking-number', this.showTrackingForm );
            $( 'body' ).on('click','#dokan-cancel-tracking-note', this.cancelTrackingForm );
            $( 'body' ).on('click','#add-tracking-details', this.insertShippingTrackingInfo);

            $( '#woocommerce-order-items' )
                .on( 'click', 'button.refund-items', this.refund_items )
                .on( 'click', '.cancel-action', this.cancel )

                // Refunds
                .on( 'click', 'button.do-api-refund, button.do-manual-refund', this.refunds.do_refund )
                .on( 'change', '.refund input.refund_line_total, .refund input.refund_line_tax', this.refunds.input_changed )
                .on( 'change keyup', '.wc-order-refund-items #refund_amount', this.refunds.amount_changed )
                .on( 'change', 'input.refund_order_item_qty', this.refunds.refund_quantity_changed )

                // Subtotal/total
                .on( 'keyup', '.woocommerce_order_items .split-input input:eq(0)', function() {
                    var $subtotal = $( this ).next();
                    if ( $subtotal.val() === '' || $subtotal.is( '.match-total' ) ) {
                        $subtotal.val( $( this ).val() ).addClass( 'match-total' );
                    }
                })

                .on( 'keyup', '.woocommerce_order_items .split-input input:eq(1)', function() {
                    $( this ).removeClass( 'match-total' );
                })
        },

        showTrackingForm: function(e) {
            e.preventDefault();
            var self = $(this);

            self.closest('div').find('form#add-shipping-tracking-form').slideDown( 300, function() {
                $(this).removeClass('dokan-hide');
            });
        },

        cancelTrackingForm: function(e) {
            e.preventDefault();
            var self = $(this);

            self.closest('form#add-shipping-tracking-form').slideUp( 300, function() {
                $(this).addClass('dokan-hide');
            });
        },

        insertShippingTrackingInfo: function(e){
            e.preventDefault();

            var shipping_tracking_info = {
                shipping_provider: $('#shipping_provider').val(),
                shipping_number: $('#tracking_number').val(),
                shipped_date: $('#shipped-date').val(),
                action: $('#action').val(),
                post_id: $('#post-id').val(),
                security: $('#security').val()
            };

            $('#dokan-order-notes').block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

            $.post( dokan.ajaxurl, shipping_tracking_info, function(response) {
                $('ul.order_notes').prepend( response );
                $('#dokan-order-notes').unblock();
                $('form#add-shipping-tracking-form').find("input[type=text], textarea").val("");
            });

            return false;

        },

        block: function() {
            $( '#woocommerce-order-items' ).block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });
        },

        unblock: function() {
            $( '#woocommerce-order-items' ).unblock();
        },

        reload_items: function() {
            var data = {
                order_id: dokan_refund.post_id,
                action:   'dokan_load_order_items',
                security: dokan_refund.order_item_nonce
            };

            dokan_seller_meta_boxes_order_items.block();

            $.ajax({
                url:  dokan_refund.ajax_url,
                data: data,
                type: 'POST',
                success: function( response ) {
                    $( '.dokan-panel-default #woocommerce-order-items' ).empty();
                    $( '.dokan-panel-default #woocommerce-order-items' ).append( response );
                    // wc_meta_boxes_order.init_tiptip();
                }
            });
        },

        refund_items: function() {
            $( 'div.wc-order-refund-items' ).slideDown();
            $( 'div.wc-order-bulk-actions' ).slideUp();
            $( 'div.wc-order-totals-items' ).slideUp();
            $( '#woocommerce-order-items div.refund' ).show();
            $( '.wc-order-edit-line-item .wc-order-edit-line-item-actions' ).hide();
            return false;
        },

        cancel: function() {
            $( this ).closest( 'div.wc-order-data-row' ).slideUp();
            $( 'div.wc-order-bulk-actions' ).slideDown();
            $( 'div.wc-order-totals-items' ).slideDown();
            $( '#woocommerce-order-items div.refund' ).hide();
            $( '.wc-order-edit-line-item .wc-order-edit-line-item-actions' ).show();

            // Reload the items
            if ( 'true' === $( this ).attr( 'data-reload' ) ) {
                dokan_seller_meta_boxes_order_items.reload_items();
            }

            return false;
        },

        refunds: {

            do_refund: function() {
                dokan_seller_meta_boxes_order_items.block();

                if ( window.confirm( dokan_refund.i18n_do_refund ) ) {
                    var refund_amount = $( 'input#refund_amount' ).val();
                    var refund_reason = $( 'input#refund_reason' ).val();

                    // Get line item refunds
                    var line_item_qtys       = {};
                    var line_item_totals     = {};
                    var line_item_tax_totals = {};

                    $( '.refund input.refund_order_item_qty' ).each(function( index, item ) {
                        if ( $( item ).closest( 'tr' ).data( 'order_item_id' ) ) {
                            if ( item.value ) {
                                line_item_qtys[ $( item ).closest( 'tr' ).data( 'order_item_id' ) ] = item.value;
                            }
                        }
                    });

                    $( '.refund input.refund_line_total' ).each(function( index, item ) {
                        if ( $( item ).closest( 'tr' ).data( 'order_item_id' ) ) {
                            line_item_totals[ $( item ).closest( 'tr' ).data( 'order_item_id' ) ] = accounting.unformat( item.value, dokan_refund.mon_decimal_point );
                        }
                    });

                    $( '.refund input.refund_line_tax' ).each(function( index, item ) {
                        if ( $( item ).closest( 'tr' ).data( 'order_item_id' ) ) {
                            var tax_id = $( item ).data( 'tax_id' );

                            if ( ! line_item_tax_totals[ $( item ).closest( 'tr' ).data( 'order_item_id' ) ] ) {
                                line_item_tax_totals[ $( item ).closest( 'tr' ).data( 'order_item_id' ) ] = {};
                            }

                            line_item_tax_totals[ $( item ).closest( 'tr' ).data( 'order_item_id' ) ][ tax_id ] = accounting.unformat( item.value, dokan_refund.mon_decimal_point );
                        }
                    });

                    var data = {
                        action:                 'dokan_refund_request',
                        order_id:               dokan_refund.post_id,
                        refund_amount:          refund_amount,
                        refund_reason:          refund_reason,
                        line_item_qtys:         JSON.stringify( line_item_qtys, null, '' ),
                        line_item_totals:       JSON.stringify( line_item_totals, null, '' ),
                        line_item_tax_totals:   JSON.stringify( line_item_tax_totals, null, '' ),
                        api_refund:             $( this ).is( '.do-api-refund' ),
                        restock_refunded_items: $( '#restock_refunded_items:checked' ).size() ? 'true' : 'false',
                        security:               dokan_refund.order_item_nonce
                    };

                    $.post( dokan_refund.ajax_url, data, function( response ) {
                        response.data.message ? window.alert( response.data.message ) : null;
                        dokan_seller_meta_boxes_order_items.reload_items();
                    }).fail( function ( jqXHR ) {
                        var message = [];

                        if ( jqXHR.responseJSON.data ) {
                            var data = jqXHR.responseJSON.data;

                            if ( $.isArray( data ) ) {
                                message = jqXHR.responseJSON.data.map( function ( item ) {
                                    return item.message;
                                } );
                            } else {
                                message.push( data );
                            }
                        }

                        window.alert( message.join( ' ' ) );
                        dokan_seller_meta_boxes_order_items.unblock();
                    } );
                } else {
                    dokan_seller_meta_boxes_order_items.unblock();
                }
            },

            input_changed: function() {
                var refund_amount = 0;
                var $items        = $( '.woocommerce_order_items' ).find( 'tr.item, tr.fee, tr.shipping' );

                $items.each(function() {
                    var $row               = $( this );
                    var refund_cost_fields = $row.find( '.refund input:not(.refund_order_item_qty)' );

                    refund_cost_fields.each(function( index, el ) {
                        refund_amount += parseFloat( accounting.unformat( $( el ).val() || 0, dokan_refund.mon_decimal_point ) );
                    });
                });

                $( '#refund_amount' )
                    .val( accounting.formatNumber(
                        refund_amount,
                        dokan_refund.currency_format_num_decimals,
                        '',
                        dokan_refund.mon_decimal_point
                    ) )
                    .change();
            },

            amount_changed: function() {
                var total = accounting.unformat( $( this ).val(), dokan_refund.mon_decimal_point );

                $( 'button .wc-order-refund-amount .amount' ).text( accounting.formatMoney( total, {
                    symbol:    dokan_refund.currency_format_symbol,
                    decimal:   dokan_refund.currency_format_decimal_sep,
                    thousand:  dokan_refund.currency_format_thousand_sep,
                    precision: dokan_refund.currency_format_num_decimals,
                    format:    dokan_refund.currency_format
                } ) );
            },

            // When the refund qty is changed, increase or decrease costs
            refund_quantity_changed: function() {
                var $row              = $( this ).closest( 'tr.item' );
                var qty               = $row.find( 'input.quantity' ).val();
                var refund_qty        = $( this ).val();
                var line_total        = $( 'input.line_total', $row );
                var refund_line_total = $( 'input.refund_line_total', $row );

                // Totals
                var unit_total = accounting.unformat( line_total.attr( 'data-total' ), dokan_refund.mon_decimal_point ) / qty;

                refund_line_total.val(
                    parseFloat( accounting.formatNumber( unit_total * refund_qty, dokan_refund.rounding_precision, '' ) )
                        .toString()
                        .replace( '.', dokan_refund.mon_decimal_point )
                ).change();

                // Taxes
                $( 'td.line_tax', $row ).each( function() {
                    var line_total_tax        = $( 'input.line_tax', $( this ) );
                    var refund_line_total_tax = $( 'input.refund_line_tax', $( this ) );
                    var unit_total_tax = accounting.unformat( line_total_tax.attr( 'data-total_tax' ), dokan_refund.mon_decimal_point ) / qty;

                    if ( 0 < unit_total_tax ) {
                        refund_line_total_tax.val(
                            parseFloat( accounting.formatNumber( unit_total_tax * refund_qty, dokan_refund.rounding_precision, '' ) )
                                .toString()
                                .replace( '.', dokan_refund.mon_decimal_point )
                        ).change();
                    } else {
                        refund_line_total_tax.val( 0 ).change();
                    }
                });

                // Restock checkbox
                if ( refund_qty > 0 ) {
                    $( '#restock_refunded_items' ).closest( 'tr' ).show();
                } else {
                    $( '#restock_refunded_items' ).closest( 'tr' ).hide();
                    $( '.woocommerce_order_items input.refund_order_item_qty' ).each( function() {
                        if ( $( this ).val() > 0 ) {
                            $( '#restock_refunded_items' ).closest( 'tr' ).show();
                        }
                    });
                }

                $( this ).trigger( 'refund_quantity_changed' );
            }
        },
    };

    dokan_seller_meta_boxes_order_items.init();

    // Ajax search customers
    $( '#dokan-filter-customer' ).filter( ':not(.enhanced)' ).each( function() {
        var select2_args = {
            allowClear:  $( this ).data( 'allow_clear' ) ? true : false,
            placeholder: $( this ).data( 'placeholder' ),
            minimumInputLength: $( this ).data( 'minimum_input_length' ) ? $( this ).data( 'minimum_input_length' ) : '1',
            escapeMarkup: function( m ) {
                return m;
            },
            language: {
                errorLoading: function() {
                    // Workaround for https://github.com/select2/select2/issues/4355 instead of i18n_ajax_error.
                    return dokan.i18n_searching;
                },
                inputTooLong: function( args ) {
                    var overChars = args.input.length - args.maximum;

                    if ( 1 === overChars ) {
                        return dokan.i18n_input_too_long_1;
                    }

                    return dokan.i18n_input_too_long_n.replace( '%qty%', overChars );
                },
                inputTooShort: function( args ) {
                    var remainingChars = args.minimum - args.input.length;

                    if ( 1 === remainingChars ) {
                        return dokan.i18n_input_too_short_1;
                    }

                    return dokan.i18n_input_too_short_n.replace( '%qty%', remainingChars );
                },
                loadingMore: function() {
                    return dokan.i18n_load_more;
                },
                maximumSelected: function( args ) {
                    if ( args.maximum === 1 ) {
                        return dokan.i18n_selection_too_long_1;
                    }

                    return dokan.i18n_selection_too_long_n.replace( '%qty%', args.maximum );
                },
                noResults: function() {
                    return dokan.i18n_no_matches;
                },
                searching: function() {
                    return dokan.i18n_searching;
                }
            },
            ajax: {
                url:         dokan.ajaxurl,
                dataType:    'json',
                delay:       1000,
                data:        function( params ) {
                    return {
                        term:     params.term,
                        action:   'dokan_json_search_vendor_customers',
                        security: dokan.search_customer_nonce,
                        exclude:  $( this ).data( 'exclude' )
                    };
                },
                processResults: function( data ) {
                    var terms = [];
                    if ( data ) {
                        $.each( data, function( id, text ) {
                            terms.push({
                                id: id,
                                text: text
                            });
                        });
                    }
                    return {
                        results: terms
                    };
                },
                cache: true
            }
        };

        $( this ).select2( select2_args ).addClass( 'enhanced' );

        if ( $( this ).data( 'sortable' ) ) {
            var $select = $(this);
            var $list   = $( this ).next( '.select2-container' ).find( 'ul.select2-selection__rendered' );

            $list.sortable({
                placeholder : 'ui-state-highlight select2-selection__choice',
                forcePlaceholderSize: true,
                items       : 'li:not(.select2-search__field)',
                tolerance   : 'pointer',
                stop: function() {
                    $( $list.find( '.select2-selection__choice' ).get().reverse() ).each( function() {
                        var id     = $( this ).data( 'data' ).id;
                        var option = $select.find( 'option[value="' + id + '"]' )[0];
                        $select.prepend( option );
                    } );
                }
            });
        }
    });

})(jQuery);


;(function($){

    var variantsHolder = $('#variants-holder');
    var product_gallery_frame;
    var product_featured_frame;
    var $image_gallery_ids = $('#product_image_gallery');
    var $product_images = $('#product_images_container ul.product_images');

    var Dokan_Editor = {

        /**
         * Constructor function
         */
        init: function() {

            product_type = 'simple';

            $('.product-edit-container').on( 'click', '.dokan-section-heading', this.toggleProductSection );

            $('.product-edit-container').on('click', 'input[type=checkbox]#_downloadable', this.downloadable );
            $('.product-edit-container').on('click', 'a.sale-schedule', this.showDiscountSchedule );

            // gallery
            $('body, #dokan-product-images').on('click', 'a.add-product-images', this.gallery.addImages );
            $('body, #dokan-product-images').on( 'click', 'a.action-delete', this.gallery.deleteImage );
            this.gallery.sortable();

            // featured image
            $('body, .product-edit-container').on('click', 'a.dokan-feat-image-btn', this.featuredImage.addImage );
            $('body, .product-edit-container').on('click', 'a.dokan-remove-feat-image', this.featuredImage.removeImage );

            $('body, #variable_product_options').on( 'click', '.sale_schedule', this.saleSchedule );
            $('body, #variable_product_options').on( 'click', '.cancel_sale_schedule', this.cancelSchedule );

            // new product design variations
            $('.product-edit-container').on( 'change', 'input[type=checkbox]#_manage_stock', this.showManageStock );
            $( '.product-edit-container' ).on( 'click', 'a.upload_file_button', this.fileDownloadable );


            // File inputs
            $('body').on('click', 'a.insert-file-row', function(){
                $(this).closest('table').find('tbody').append( $(this).data( 'row' ) );
                return false;
            });

            $('body').on('click', 'a.dokan-product-delete', function() {
                $(this).closest('tr').remove();
                return false;
            });

            $( 'body' ).on( 'submit', 'form.dokan-product-edit-form', this.inputValidate );

            // For new desing in product page
            $( '.dokan-product-listing' ).on( 'click', 'a.dokan-add-new-product', this.addProductPopup );

            this.loadSelect2();
            this.bindProductTagDropdown();
            this.attribute.sortable();
            this.checkProductPostboxToggle();
            $( '.product-edit-container .dokan-product-attribute-wrapper' ).on( 'click', 'a.dokan-product-toggle-attribute, .dokan-product-attribute-heading', this.attribute.toggleAttribute );
            $( '.product-edit-container .dokan-product-attribute-wrapper' ).on( 'click', 'a.add_new_attribute', this.attribute.addNewAttribute );
            $( '.product-edit-container .dokan-product-attribute-wrapper' ).on( 'keyup', 'input.dokan-product-attribute-name', this.attribute.dynamicAttrNameChange );
            $( '.dokan-product-attribute-wrapper ul.dokan-attribute-option-list' ).on( 'click', 'button.dokan-select-all-attributes', this.attribute.selectAllAttr );
            $( '.dokan-product-attribute-wrapper ul.dokan-attribute-option-list' ).on( 'click', 'button.dokan-select-no-attributes', this.attribute.selectNoneAttr );
            $( '.dokan-product-attribute-wrapper ul.dokan-attribute-option-list' ).on( 'click', 'button.dokan-add-new-attribute', this.attribute.addNewExtraAttr );
            $( '.product-edit-container .dokan-product-attribute-wrapper' ).on( 'click', 'a.dokan-product-remove-attribute', this.attribute.removeAttribute );
            $( '.product-edit-container .dokan-product-attribute-wrapper' ).on( 'click', 'a.dokan-save-attribute', this.attribute.saveAttribute );
            $( 'body' ).on( 'click', '.product-container-footer input[type="submit"]', this.createNewProduct );

            this.attribute.disbalePredefinedAttribute();

            $( 'body' ).trigger( 'dokan-product-editor-loaded', this );
        },

        saleSchedule: function() {
            var $wrap = $(this).closest( '.dokan-product-field-content', 'div, table' );
            $(this).hide();

            $wrap.find('.cancel_sale_schedule').show();
            $wrap.find('.sale_price_dates_fields').show();

            return false;
        },

        cancelSchedule: function() {
            var $wrap = $(this).closest( '.dokan-product-field-content', 'div, table' );

            $(this).hide();
            $wrap.find('.sale_schedule').show();
            $wrap.find('.sale_price_dates_fields').hide();
            $wrap.find('.sale_price_dates_fields').find('input').val('');

            return false;
        },


        checkProductPostboxToggle: function() {
            var toggle = JSON.parse( localStorage.getItem( 'toggleClasses' ) );

            $.each( toggle, function(el, i) {
                var wrapper    = $( '.' + el.replace( /_/g, '-' ) ),
                    content    = wrapper.find( '.dokan-section-content' ),
                    targetIcon = wrapper.find( 'i.fa-sort-desc' );

                if ( i ) {
                    content.show();
                    targetIcon.removeClass( 'fa-flip-horizointal' ).addClass( 'fa-flip-vertical' );
                    targetIcon.css( 'marginTop', '9px' );
                } else {
                    content.hide();
                    targetIcon.removeClass( 'fa-flip-vertical' ).addClass( 'fa-flip-horizointal' );
                    targetIcon.css( 'marginTop', '0px' );
                }
            });
        },

        toggleProductSection: function(e) {
            e.preventDefault();

            var self = $(this);
            if ( JSON.parse( localStorage.getItem( 'toggleClasses' ) ) != null ) {
                var toggleClasses = JSON.parse( localStorage.getItem( 'toggleClasses' ) );
            } else {
                var toggleClasses = {};
            }

            self.closest( '.dokan-edit-row' ).find('.dokan-section-content').slideToggle( 300, function() {
                if( $(this).is( ':visible' ) ) {
                    var targetIcon = self.find( 'i.fa-sort-desc' );
                    targetIcon.removeClass( 'fa-flip-horizointal' ).addClass( 'fa-flip-vertical' );
                    targetIcon.css( 'marginTop', '9px' );
                    toggleClasses[self.data('togglehandler')] = true;
                } else {
                    var targetIcon = self.find( 'i.fa-sort-desc' );
                    targetIcon.removeClass( 'fa-flip-vertical' ).addClass( 'fa-flip-horizointal' );
                    targetIcon.css( 'marginTop', '0px' );
                    toggleClasses[self.data('togglehandler')] = false;
                }

                localStorage.setItem( 'toggleClasses', JSON.stringify( toggleClasses ) );
            });

        },

        loadSelect2: function() {
            $('.dokan-select2').select2(
                {
                    "language": {
                        "noResults": function () {
                            return dokan.i18n_no_result_found;
                        }
                    }
                }
            );
        },

        bindProductTagDropdown: function () {
            $(".product_tag_search").select2({
                allowClear: false,
                tags: ( dokan.product_vendors_can_create_tags && 'on' === dokan.product_vendors_can_create_tags ),
                ajax: {
                    url: dokan.ajaxurl,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            q: params.term,
                            action: 'dokan_json_search_products_tags',
                            security: dokan.search_products_tags_nonce,
                            page: params.page || 1
                        };
                    },
                    processResults: function( data ) {
                        var options = [];
                        if ( data ) {
                            $.each( data, function( index, text ) {
                                options.push( { id: text[0], text: text[1]  } );
                            });
                        }
                        return {
                            results: options,
                            pagination: {
                                more: options.length == 0 ? false : true
                            }
                        };
                    },
                    cache: true
                },
                language: {
                    errorLoading: function() {
                        return dokan.i18n_searching;
                    },
                    inputTooLong: function( args ) {
                        var overChars = args.input.length - args.maximum;

                        if ( 1 === overChars ) {
                            return dokan.i18n_input_too_long_1;
                        }

                        return dokan.i18n_input_too_long_n.replace( '%qty%', overChars );
                    },
                    inputTooShort: function( args ) {
                        var remainingChars = args.minimum - args.input.length;

                        if ( 1 === remainingChars ) {
                            return dokan.i18n_input_too_short_1;
                        }

                        return dokan.i18n_input_too_short_n.replace( '%qty%', remainingChars );
                    },
                    loadingMore: function() {
                        return dokan.i18n_load_more;
                    },
                    maximumSelected: function( args ) {
                        if ( args.maximum === 1 ) {
                            return dokan.i18n_selection_too_long_1;
                        }

                        return dokan.i18n_selection_too_long_n.replace( '%qty%', args.maximum );
                    },
                    noResults: function() {
                        return dokan.i18n_no_matches;
                    },
                    searching: function() {
                        return dokan.i18n_searching;
                    }
                },
            });
        },

        addProductPopup: function (e) {
            e.preventDefault();
            Dokan_Editor.openProductPopup();
        },

        openProductPopup: function() {
            var productTemplate = wp.template( 'dokan-add-new-product' );
            $.magnificPopup.open({
                fixedContentPos: true,
                items: {
                    src: productTemplate().trim(),
                    type: 'inline'
                },
                callbacks: {
                    open: function() {
                        $(this.content).closest('.mfp-wrap').removeAttr('tabindex');
                        Dokan_Editor.loadSelect2();
                        Dokan_Editor.bindProductTagDropdown();

                        $('.sale_price_dates_from, .sale_price_dates_to').on('focus', function() {
                            $(this).css('z-index', '99999');
                        });

                        $( ".sale_price_dates_fields input" ).datepicker({
                            defaultDate: "",
                            dateFormat: "yy-mm-dd",
                            numberOfMonths: 1
                        });

                        $('.tips').tooltip();

                        Dokan_Editor.gallery.sortable();

                        $( 'body' ).trigger( 'dokan-product-editor-popup-opened', Dokan_Editor );
                    },
                    close: function() {
                        product_gallery_frame = undefined;
                        product_featured_frame = undefined;
                    }
                }
            });
        },

        createNewProduct: function (e) {
            e.preventDefault();

            var self = $(this),
                form = self.closest('form#dokan-add-new-product-form'),
                btn_id = self.attr('data-btn_id');

            form.find( 'span.dokan-show-add-product-error' ).html('');
            form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'inline-block' );

            self.attr( 'disabled', 'disabled' );

            if ( form.find( 'input[name="post_title"]' ).val() == '' ) {
                $( 'span.dokan-show-add-product-error' ).html( dokan.product_title_required );
                self.removeAttr( 'disabled' );
                form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'none' );
                return;
            }

            if ( form.find( 'select[name="product_cat"]' ).val() == '-1' ) {
                $( 'span.dokan-show-add-product-error' ).html( dokan.product_category_required );
                self.removeAttr( 'disabled' );
                form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'none' );
                return;
            }

            var data = {
                action:   'dokan_create_new_product',
                postdata: form.serialize(),
                _wpnonce : dokan.nonce
            };

            $.post( dokan.ajaxurl, data, function( resp ) {
                if ( resp.success ) {
                    self.removeAttr( 'disabled' );
                    if ( btn_id == 'create_new' ) {
                        $.magnificPopup.close();
                        window.location.href = resp.data;
                    } else {
                        $('.dokan-dashboard-product-listing-wrapper').load( window.location.href + ' table.product-listing-table' );
                        $.magnificPopup.close();
                        Dokan_Editor.openProductPopup();
                    }
                } else {
                    self.removeAttr( 'disabled' );
                    $( 'span.dokan-show-add-product-error' ).html( resp.data );
                }
                form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'none' );
            });
        },

        attribute: {

            toggleAttribute: function(e) {
                e.preventDefault();

                var self = $(this),
                    list = self.closest('li'),
                    item = list.find('.dokan-product-attribute-item');

                if ( $(item).hasClass('dokan-hide') ) {
                    self.closest('.dokan-product-attribute-heading').css({ borderBottom: '1px solid #e3e3e3' });
                    $(item).slideDown( 200, function() {
                        self.find('i.fa').removeClass('fa-flip-horizointal').addClass('fa-flip-vertical');
                        $(this).removeClass('dokan-hide');
                        if ( ! $(e.target).hasClass( 'dokan-product-attribute-heading' ) ) {
                            $(e.target).closest('a').css('top', '12px');
                        } else if ( $(e.target).hasClass( 'dokan-product-attribute-heading' ) ) {
                            self.find( 'a.dokan-product-toggle-attribute' ).css('top', '12px');
                        }
                    });
                } else {
                    $(item).slideUp( 200, function() {
                        $(this).addClass('dokan-hide');
                        self.find('i.fa').removeClass('fa-flip-vertical').addClass('fa-flip-horizointal');
                        if ( ! $(e.target).hasClass('dokan-product-attribute-heading') ) {
                            $(e.target).closest('a').css('top', '7px');
                        } else if ( $(e.target).hasClass( 'dokan-product-attribute-heading' ) ) {
                            self.find('a.dokan-product-toggle-attribute').css('top', '7px');
                        }
                        self.closest('.dokan-product-attribute-heading').css({ borderBottom: 'none' });

                    })
                }
                return false;
            },

            sortable: function() {
                $('.dokan-product-attribute-wrapper ul').sortable({
                    items: 'li.product-attribute-list',
                    cursor: 'move',
                    scrollSensitivity:40,
                    forcePlaceholderSize: true,
                    forceHelperSize: false,
                    helper: 'clone',
                    opacity: 0.65,
                    placeholder: 'dokan-sortable-placeholder',
                    start:function(event,ui){
                        ui.item.css('background-color','#f6f6f6');
                    },
                    stop:function(event,ui){
                        ui.item.removeAttr('style');
                    },
                    update: function(event, ui) {
                        var attachment_ids = '';
                        Dokan_Editor.attribute.reArrangeAttribute();
                    }
                });
            },

            dynamicAttrNameChange: function(e) {
                e.preventDefault();
                var self = $(this),
                    value = self.val();

                if ( value == '' ) {
                    self.closest( 'li' ).find( 'strong' ).html( 'Attribute Name' );
                } else {
                    self.closest( 'li' ).find( 'strong' ).html( value );
                }
            },

            selectAllAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values option' ).attr( 'selected', 'selected' );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values' ).change();
                return false;
            },

            selectNoneAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values option' ).removeAttr( 'selected' );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values' ).change();
                return false;
            },

            reArrangeAttribute: function() {
                var attributeWrapper = $('.dokan-product-attribute-wrapper').find('ul.dokan-attribute-option-list');
                attributeWrapper.find( 'li.product-attribute-list' ).css( 'cursor', 'default' ).each(function( i ) {
                    $(this).find('.attribute_position').val(i);
                });
            },

            addNewExtraAttr: function(e) {
                e.preventDefault();

                var $wrapper           = $(this).closest( 'li.product-attribute-list' );
                var attribute          = $wrapper.data( 'taxonomy' );
                var new_attribute_name = window.prompt( dokan.new_attribute_prompt );

                if ( new_attribute_name ) {

                    var data = {
                        action:   'dokan_add_new_attribute',
                        taxonomy: attribute,
                        term:     new_attribute_name,
                        _wpnonce : dokan.nonce
                    };

                    $.post( dokan.ajaxurl, data, function( response ) {
                        if ( response.error ) {
                            window.alert( response.error );
                        } else if ( response.slug ) {
                            $wrapper.find( 'select.dokan_attribute_values' ).append( '<option value="' + response.slug + '" selected="selected">' + response.name + '</option>' );
                            $wrapper.find( 'select.dokan_attribute_values' ).change();
                        }

                    });
                }
            },

            addNewAttribute: function(e) {
                e.preventDefault();

                var self  = $(this),
                    attrWrap  = self.closest('.dokan-attribute-type').find('select#predefined_attribute'),
                    attribute = attrWrap.val(),
                    size         = $( 'ul.dokan-attribute-option-list .product-attribute-list' ).length;


                var data = {
                    action   : 'dokan_get_pre_attribute',
                    taxonomy : attribute,
                    i        : size,
                    _wpnonce : dokan.nonce
                };

                self.closest('.dokan-attribute-type').find('span.dokan-attribute-spinner').removeClass('dokan-hide');

                $.post( dokan.ajaxurl, data, function( resp ) {
                    if ( resp.success ) {
                        var attributeWrapper = $('.dokan-product-attribute-wrapper').find('ul.dokan-attribute-option-list');
                        $html = $.parseHTML(resp.data);
                        $($html).find('.dokan-product-attribute-item').removeClass('dokan-hide');
                        $($html).find('i.fa.fa-sort-desc').removeClass('fa-flip-horizointal').addClass('fa-flip-vertical');
                        $($html).find('a.dokan-product-toggle-attribute').css('top','12px');
                        $($html).find('.dokan-product-attribute-heading').css({ borderBottom: '1px solid #e3e3e3' });

                        attributeWrapper.append( $html );
                        $( 'select#product_type' ).trigger('change');
                        Dokan_Editor.loadSelect2();
                        Dokan_Editor.attribute.reArrangeAttribute();
                    };

                    self.closest('.dokan-attribute-type').find('span.dokan-attribute-spinner').addClass('dokan-hide');

                    if ( attribute ) {
                        attrWrap.find( 'option[value="' + attribute + '"]' ).attr( 'disabled','disabled' );
                        attrWrap.val( '' );
                    }
                });
            },

            removeAttribute: function(evt) {
                evt.stopPropagation();

                if ( window.confirm( dokan.remove_attribute ) ) {
                    var $parent = $( this ).closest('li.product-attribute-list');

                    $parent.fadeOut( 300, function() {
                        if ( $parent.is( '.taxonomy' ) ) {
                            $parent.find( 'select, input[type=text]' ).val( '' );
                            $( 'select.dokan_attribute_taxonomy' ).find( 'option[value="' + $parent.data( 'taxonomy' ) + '"]' ).removeAttr( 'disabled' );
                        } else {
                            $parent.find( 'select, input[type=text]' ).val( '' );
                            $parent.hide();
                        }

                        Dokan_Editor.attribute.reArrangeAttribute();
                    });
                }

                return false;
            },

            saveAttribute: function(e) {
                e.preventDefault();

                var self = $(this),
                    data = {
                        post_id:  $('#dokan-edit-product-id').val(),
                        data:     $( 'ul.dokan-attribute-option-list' ).find( 'input, select, textarea' ).serialize(),
                        action:   'dokan_save_attributes'
                    };

                $( '.dokan-product-attribute-wrapper' ).block({
                    message: null,
                    fadeIn: 50,
                    fadeOut: 1000,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });

                $.post( dokan.ajaxurl, data, function( resp ) {
                    // Load variations panel.
                    $( '#dokan-variable-product-options' ).load( window.location.toString() + ' #dokan-variable-product-options-inner', function() {
                        $( '#dokan-variable-product-options' ).trigger( 'reload' );
                        $( 'select#product_type' ).trigger('change');
                        $( '.dokan-product-attribute-wrapper' ).unblock();
                    });
                });

            },

            disbalePredefinedAttribute: function() {
                $( 'ul.dokan-attribute-option-list li.product-attribute-list' ).each( function( index, el ) {
                    if ( $( el ).css( 'display' ) !== 'none' && $( el ).is( '.taxonomy' ) ) {
                        $( 'select#predefined_attribute' ).find( 'option[value="' + $( el ).data( 'taxonomy' ) + '"]' ).attr( 'disabled', 'disabled' );
                    }
                });
            }
        },

        inputValidate: function( e ) {
            e.preventDefault();

            if ( $( '#post_title' ).val().trim() == '' ) {
                $( '#post_title' ).focus();
                $( 'div.dokan-product-title-alert' ).removeClass('dokan-hide');
                return;
            }else{
                $( 'div.dokan-product-title-alert' ).hide();
            }

            if ( $( 'select.product_cat' ).val() == -1 ) {
                $( 'select.product_cat' ).focus();
                $( 'div.dokan-product-cat-alert' ).removeClass('dokan-hide');
                return;
            }else{
                $( 'div.dokan-product-cat-alert' ).hide();
            }
            $( 'input[type=submit]' ).attr( 'disabled', 'disabled' );
            this.submit();
        },

        downloadable: function() {
            if ( $(this).prop('checked') ) {
                $(this).closest('aside').find('.dokan-side-body').removeClass('dokan-hide');
            } else {
                $(this).closest('aside').find('.dokan-side-body').addClass('dokan-hide');
            }
        },

        showDiscountSchedule: function(e) {
            e.preventDefault();
            $('.sale-schedule-container').slideToggle('fast');
        },

        showManageStock: function(e) {
            if ( $(this).is(':checked') ) {
                $('.show_if_stock').slideDown('fast');
            } else {
                $('.show_if_stock').slideUp('fast');
            }
        },

        gallery: {

            addImages: function(e) {
                e.preventDefault();

                var self = $(this),
                    p_images = self.closest('.dokan-product-gallery').find('#product_images_container ul.product_images'),
                    images_gid = self.closest('.dokan-product-gallery').find('#product_image_gallery');

                if ( product_gallery_frame ) {
                    product_gallery_frame.open();
                    return;
                } else {
                    // Create the media frame.
                    product_gallery_frame = wp.media({
                        // Set the title of the modal.
                        title: dokan.i18n_choose_gallery,
                        button: {
                            text: dokan.i18n_choose_gallery_btn_text,
                        },
                        multiple: true
                    });

                    product_gallery_frame.on( 'select', function() {

                        var selection = product_gallery_frame.state().get('selection');

                        selection.map( function( attachment ) {

                            attachment = attachment.toJSON();

                            if ( attachment.id ) {
                                attachment_ids = [];

                                $('<li class="image" data-attachment_id="' + attachment.id + '">\
                                        <img src="' + attachment.url + '" />\
                                        <a href="#" class="action-delete">&times;</a>\
                                    </li>').insertBefore( p_images.find('li.add-image') );

                                $('#product_images_container ul li.image').css('cursor','default').each(function() {
                                    var attachment_id = jQuery(this).attr( 'data-attachment_id' );
                                    attachment_ids.push( attachment_id );
                                });
                            }

                        } );

                        images_gid.val( attachment_ids.join(',') );
                    });

                    product_gallery_frame.open();
                }

            },

            deleteImage: function(e) {
                e.preventDefault();

                var self = $(this),
                    p_images = self.closest('.dokan-product-gallery').find('#product_images_container ul.product_images'),
                    images_gid = self.closest('.dokan-product-gallery').find('#product_image_gallery');

                self.closest('li.image').remove();

                var attachment_ids = [];

                $('#product_images_container ul li.image').css('cursor','default').each(function() {
                    var attachment_id = $(this).attr( 'data-attachment_id' );
                    attachment_ids.push( attachment_id );
                });

                images_gid.val( attachment_ids.join(',') );

                return false;
            },

            sortable: function() {
                // Image ordering
                $('body').find('#product_images_container ul.product_images').sortable({
                    items: 'li.image',
                    cursor: 'move',
                    scrollSensitivity:40,
                    forcePlaceholderSize: true,
                    forceHelperSize: false,
                    helper: 'clone',
                    opacity: 0.65,
                    placeholder: 'dokan-sortable-placeholder',
                    start:function(event,ui){
                        ui.item.css('background-color','#f6f6f6');
                    },
                    stop:function(event,ui){
                        ui.item.removeAttr('style');
                    },
                    update: function(event, ui) {
                        var attachment_ids = [];

                        $('body').find('#product_images_container ul li.image').css('cursor','default').each(function() {
                            var attachment_id = jQuery(this).attr( 'data-attachment_id' );
                            attachment_ids.push( attachment_id );
                        });

                        $('body').find('#product_image_gallery').val( attachment_ids.join(',') );
                    }
                });
            }
        },

        featuredImage: {

            addImage: function(e) {
                e.preventDefault();

                var self = $(this);

                if ( product_featured_frame ) {
                    product_featured_frame.open();
                    return;
                } else {
                    product_featured_frame = wp.media({
                        // Set the title of the modal.
                        title: dokan.i18n_choose_featured_img,
                        button: {
                            text: dokan.i18n_choose_featured_img_btn_text,
                        }
                    });

                    product_featured_frame.on('select', function() {
                        var selection = product_featured_frame.state().get('selection');

                        selection.map( function( attachment ) {
                            attachment = attachment.toJSON();

                            // set the image hidden id
                            self.siblings('input.dokan-feat-image-id').val(attachment.id);

                            // set the image
                            var instruction = self.closest('.instruction-inside');
                            var wrap = instruction.siblings('.image-wrap');

                            // wrap.find('img').attr('src', attachment.sizes.thumbnail.url);
                            wrap.find('img').attr('src', attachment.url);
                            wrap.find('img').removeAttr( 'srcset' );

                            instruction.addClass('dokan-hide');
                            wrap.removeClass('dokan-hide');
                        });
                    });

                    product_featured_frame.open();
                }
            },

            removeImage: function(e) {
                e.preventDefault();

                var self = $(this);
                var wrap = self.closest('.image-wrap');
                var instruction = wrap.siblings('.instruction-inside');

                instruction.find('input.dokan-feat-image-id').val('0');
                wrap.addClass('dokan-hide');
                instruction.removeClass('dokan-hide');
            }
        },

        fileDownloadable: function(e) {
            e.preventDefault();

            var self = $(this),
                downloadable_frame;

            if ( downloadable_frame ) {
                downloadable_frame.open();
                return;
            }

            downloadable_frame = wp.media({
                title: dokan.i18n_choose_file,
                button: {
                    text: dokan.i18n_choose_file_btn_text,
                },
                multiple: true
            });

            downloadable_frame.on('select', function() {
                var selection = downloadable_frame.state().get('selection');

                selection.map( function( attachment ) {
                    attachment = attachment.toJSON();

                    self.closest('tr').find( 'input.wc_file_url, input.wc_variation_file_url').val(attachment.url);
                });
            });

            downloadable_frame.on( 'ready', function() {
                downloadable_frame.uploader.options.uploader.params = {
                    type: 'downloadable_product'
                };
            });

            downloadable_frame.open();
        }
    };

    // On DOM ready
    $(function() {
        Dokan_Editor.init();

        // PRODUCT TYPE SPECIFIC OPTIONS.
        $( 'select#product_type' ).change( function() {
            // Get value.
            var select_val = $( this ).val();

            if ( 'variable' === select_val ) {
                $( 'input#_manage_stock' ).change();
                $( 'input#_downloadable' ).prop( 'checked', false );
                $( 'input#_virtual' ).removeAttr( 'checked' );
            }

            show_and_hide_panels();

            $( document.body ).trigger( 'dokan-product-type-change', select_val, $( this ) );

        }).change();

        $('.product-edit-container').on('change', 'input#_downloadable, input#_virtual', function() {
            show_and_hide_panels();
        }).change();

        $( 'input#_downloadable' ).change();
        $( 'input#_virtual' ).change();

        function show_and_hide_panels() {
            var product_type    = $( '#product_type' ).val();
            var is_virtual      = $( 'input#_virtual:checked' ).length;
            var is_downloadable = $( 'input#_downloadable:checked' ).length;

            // Hide/Show all with rules.
            var hide_classes = '.hide_if_downloadable, .hide_if_virtual';
            var show_classes = '.show_if_downloadable, .show_if_virtual';

            $.each( Object.keys( dokan.product_types ), function( index, value ) {
                hide_classes = hide_classes + ', .hide_if_' + value;
                show_classes = show_classes + ', .show_if_' + value;
            });

            $( hide_classes ).show();
            $( show_classes ).hide();

            // Shows rules.
            if ( is_downloadable ) {
                $( '.show_if_downloadable' ).show();
            }
            if ( is_virtual ) {
                $( '.show_if_virtual' ).show();
            }

            $( '.show_if_' + product_type ).show();

            // Hide rules.
            if ( is_downloadable ) {
                $( '.hide_if_downloadable' ).hide();
            }
            if ( is_virtual ) {
                $( '.hide_if_virtual' ).hide();
            }

            $( '.hide_if_' + product_type ).hide();

            $( 'input#_manage_stock' ).change();
        }

        // Sale price schedule.
        $( '.sale_price_dates_fields' ).each( function() {
            var $these_sale_dates = $( this );
            var sale_schedule_set = false;
            var $wrap = $these_sale_dates.closest( 'div, table' );

            $these_sale_dates.find( 'input' ).each( function() {
                if ( '' !== $( this ).val() ) {
                    sale_schedule_set = true;
                }
            });

            if ( sale_schedule_set ) {
                $wrap.find( '.sale_schedule' ).hide();
                $wrap.find( '.sale_price_dates_fields' ).show();
            } else {
                $wrap.find( '.sale_schedule' ).show();
                $wrap.find( '.sale_price_dates_fields' ).hide();
            }
        });

        $( '.product-edit-container' ).on( 'click', '.sale_schedule', function() {
            var $wrap = $(this).closest( '.product-edit-container, div.dokan-product-variation-itmes, table' );
            $( this ).hide();
            $wrap.find( '.cancel_sale_schedule' ).show();
            $wrap.find( '.sale_price_dates_fields' ).show();

            return false;
        });

        $( '.product-edit-container' ).on( 'click', '.cancel_sale_schedule', function() {
            var $wrap = $( '.product-edit-container, div.dokan-product-variation-itmes, table' );

            $( this ).hide();
            $wrap.find( '.sale_schedule' ).show();
            $wrap.find( '.sale_price_dates_fields' ).hide();
            $wrap.find( '.sale_price_dates_fields' ).find( 'input' ).val('');

            return false;
        });

        function dokan_show_earning_suggestion( callback ) {
            let commission = $('span.vendor-earning').attr( 'data-commission' );
            let product_id = $( 'span.vendor-earning' ).attr( 'data-product-id' );
            let product_price = $( 'input.dokan-product-regular-price' ).val();
            let sale_price = $( 'input.dokan-product-sales-price' ).val();
            let earning_suggestion = $('.simple-product span.vendor-price');

            earning_suggestion.html( 'Calculating' );

            $.get( dokan.ajaxurl, {
                action: 'get_vendor_earning',
                product_id: product_id,
                product_price: product_price,
                product_price: sale_price ? sale_price : product_price,
                _wpnonce: dokan.nonce
            } )
            .done( ( response ) => {
                earning_suggestion.html( response );

                if ( typeof callback === 'function' ) {
                    callback();
                }
            } );
        }

        $( "input.dokan-product-regular-price, input.dokan-product-sales-price" ).on( 'keyup', _.debounce( () => {
            dokan_show_earning_suggestion( function() {

                if ( $( '#product_type' ).val() == 'simple' || $( '#product_type' ).text() == '' ) {
                    if ( Number( $('.simple-product span.vendor-price').text() ) < 0  ) {
                        $( $('.dokan-product-less-price-alert').removeClass('dokan-hide') );
                        $( 'input[type=submit]' ).attr( 'disabled', 'disabled' );
                        $( 'button[type=submit]' ).attr( 'disabled', 'disabled' );
                    } else {
                        $( $('.dokan-product-less-price-alert').addClass('dokan-hide') );
                        $( 'input[type=submit]' ).removeAttr( 'disabled');
                        $( 'button[type=submit]' ).removeAttr( 'disabled');
                    }
                }
            } );

        }, 750 ) );

        /**
         * Handle the editing of the post_name. Create the required HTML elements and
         * update the changes via Ajax.
         *
         * @global
         *
         * @return {void}
         */
        function dokanProductEditPermalink() {
            var i, slug_value,
                $el, revert_e,
                c              = 0,
                real_slug      = $('#post_name'),
                revert_slug    = real_slug.val(),
                permalink      = $( '#sample-permalink' ),
                permalinkOrig  = permalink.html(),
                permalinkInner = $( '#sample-permalink a' ).html(),
                buttons        = $('#edit-slug-buttons'),
                buttonsOrig    = buttons.html(),
                full           = $('#editable-post-name-full');

            // Deal with Twemoji in the post-name.
            full.find( 'img' ).replaceWith( function() { return this.alt; } );
            full = full.html();

            permalink.html( permalinkInner );

            // Save current content to revert to when cancelling.
            $el      = $( '#editable-post-name' );
            revert_e = $el.html();

            buttons.html( '<button type="button" class="save button button-small">' + dokan.i18n_ok_text + '</button> <button type="button" class="cancel button-link">' + dokan.i18n_cancel_text + '</button>' );

            // Save permalink changes.
            buttons.children( '.save' ).click( function() {
                var new_slug = $el.children( 'input' ).val();

                if ( new_slug == $('#editable-post-name-full').text() ) {
                    buttons.children('.cancel').click();
                    return;
                }

                $.post(
                    ajaxurl,
                    {
                        action: 'sample-permalink',
                        post_id: $('#dokan-edit-product-id').val(),
                        new_slug: new_slug,
                        new_title: $('#post_title').val(),
                        samplepermalinknonce: $('#samplepermalinknonce').val()
                    },
                    function(data) {
                        var box = $('#edit-slug-box');
                        box.html(data);
                        if (box.hasClass('hidden')) {
                            box.fadeIn('fast', function () {
                                box.removeClass('hidden');
                            });
                        }

                        buttons.html(buttonsOrig);
                        permalink.html(permalinkOrig);
                        real_slug.val(new_slug);
                        $( '.edit-slug' ).focus();
                        $( '#editable-post-name-full-dokan' ).val( $('#editable-post-name-full').html() );
                    }
                );
            });

            // Cancel editing of permalink.
            buttons.children( '.cancel' ).click( function() {
                $('#view-post-btn').show();
                $el.html(revert_e);
                buttons.html(buttonsOrig);
                permalink.html(permalinkOrig);
                real_slug.val(revert_slug);
                $( '.edit-slug' ).focus();
            });

            // If more than 1/4th of 'full' is '%', make it empty.
            for ( i = 0; i < full.length; ++i ) {
                if ( '%' == full.charAt(i) )
                    c++;
            }
            slug_value = ( c > full.length / 4 ) ? '' : full;

            $el.html( '<input type="text" id="new-post-slug" value="' + slug_value + '" autocomplete="off" />' ).children( 'input' ).keydown( function( e ) {
                var key = e.which;
                // On [Enter], just save the new slug, don't save the post.
                if ( 13 === key ) {
                    e.preventDefault();
                    buttons.children( '.save' ).click();
                }
                // On [Esc] cancel the editing.
                if ( 27 === key ) {
                    buttons.children( '.cancel' ).click();
                }
            } ).keyup( function() {
                real_slug.val( this.value );
            }).focus();
        }

        $( '#dokan-product-title-area' ).on( 'click', '.edit-slug', function() {
            dokanProductEditPermalink();
        });

        if ( $('#dokan-edit-product-id').val() && $('#post_title').val() && $('#samplepermalinknonce').val() ) {
            $.post(
                ajaxurl,
                {   
                    action: 'sample-permalink',
                    post_id: $('#dokan-edit-product-id').val(),
                    new_slug: $('#edited-post-name-dokan').val(),
                    new_title: $('#post_title').val(),
                    samplepermalinknonce: $('#samplepermalinknonce').val()
                },
                function(data) {
                    var box = $('#edit-slug-box');
                    box.html(data);
                }
            );
        }

        function debounce_delay( callback, ms ) {
            var timer   = 0;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                  callback.apply(context, args);
                }, ms || 0);
            };
        }

    });

})(jQuery);

jQuery(function($) {
  var api = wp.customize;

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  // Toggle list table rows on small screens.
  $('.dokan-table tbody').on('click', '.toggle-row', function() {
    $(this)
      .closest('tr')
      .toggleClass('is-expanded');
  });

  $('.dokan-start-date').datepicker({
    defaultDate: '',
    dateFormat: 'yy-mm-dd',
    numberOfMonths: 1,
    onSelect: function(selectedDate) {
      let date = new Date(selectedDate);
      date.setDate(date.getDate() + 1);
      $('.dokan-end-date').datepicker('option', {
        minDate: date
      });
    }
  });

  $('.dokan-end-date').datepicker({
    defaultDate: '',
    dateFormat: 'yy-mm-dd',
    numberOfMonths: 1,
    onSelect: function(selectedDate) {
      let date = new Date(selectedDate);
      date.setDate(date.getDate() - 1);
      $('dokan-start-date').datepicker('option', {
        maxDate: date
      });
    }
  });

  $('.tips').tooltip();

  function showTooltip(x, y, contents) {
    jQuery('<div class="chart-tooltip">' + contents + '</div>')
      .css({
        top: y - 16,
        left: x + 20
      })
      .appendTo('body')
      .fadeIn(200);
  }

  var prev_data_index = null;
  var prev_series_index = null;

  jQuery('.chart-placeholder').bind('plothover', function(event, pos, item) {
    if (item) {
      if (
        prev_data_index != item.dataIndex ||
        prev_series_index != item.seriesIndex
      ) {
        prev_data_index = item.dataIndex;
        prev_series_index = item.seriesIndex;

        jQuery('.chart-tooltip').remove();

        if (item.series.points.show || item.series.enable_tooltip) {
          var y = item.series.data[item.dataIndex][1];

          tooltip_content = '';

          if (item.series.prepend_label)
            tooltip_content = tooltip_content + item.series.label + ': ';

          if (item.series.prepend_tooltip)
            tooltip_content = tooltip_content + item.series.prepend_tooltip;

          tooltip_content = tooltip_content + y;

          if (item.series.append_tooltip)
            tooltip_content = tooltip_content + item.series.append_tooltip;

          if (item.series.pie.show) {
            showTooltip(pos.pageX, pos.pageY, tooltip_content);
          } else {
            showTooltip(item.pageX, item.pageY, tooltip_content);
          }
        }
      }
    } else {
      jQuery('.chart-tooltip').remove();
      prev_data_index = null;
    }
  });
});

//dokan settings
(function($) {
  $.validator.setDefaults({ ignore: ':hidden' });

  var validatorError = function(error, element) {
    var form_group = $(element).closest('.dokan-form-group');
    form_group.addClass('has-error').append(error);
  };

  var validatorSuccess = function(label, element) {
    $(element)
      .closest('.dokan-form-group')
      .removeClass('has-error');
  };

  var api = wp.customize;

  var Dokan_Settings = {
    init: function() {
      var self = this;

      //image upload
      $('a.dokan-banner-drag').on('click', this.imageUpload);
      $('a.dokan-remove-banner-image').on('click', this.removeBanner);

      $('a.dokan-pro-gravatar-drag').on('click', this.gragatarImageUpload);
      $('a.dokan-gravatar-drag').on('click', this.simpleImageUpload);
      $('a.dokan-remove-gravatar-image').on('click', this.removeGravatar);

      $('.dokan-update-setting-top-button').click(function(){
          $("input[name='dokan_update_store_settings']").click();
      });

      this.validateForm(self);

      return false;
    },

    calculateImageSelectOptions: function(attachment, controller) {
      var xInit = parseInt(dokan.store_banner_dimension.width, 10),
        yInit = parseInt(dokan.store_banner_dimension.height, 10),
        flexWidth = !!parseInt(dokan.store_banner_dimension['flex-width'], 10),
        flexHeight = !!parseInt(
          dokan.store_banner_dimension['flex-height'],
          10
        ),
        ratio,
        xImg,
        yImg,
        realHeight,
        realWidth,
        imgSelectOptions;

      realWidth = attachment.get('width');
      realHeight = attachment.get('height');

      this.headerImage = new api.HeaderTool.ImageModel();
      this.headerImage.set({
        themeWidth: xInit,
        themeHeight: yInit,
        themeFlexWidth: flexWidth,
        themeFlexHeight: flexHeight,
        imageWidth: realWidth,
        imageHeight: realHeight
      });

      controller.set('canSkipCrop', !this.headerImage.shouldBeCropped());

      ratio = xInit / yInit;
      xImg = realWidth;
      yImg = realHeight;

      if (xImg / yImg > ratio) {
        yInit = yImg;
        xInit = yInit * ratio;
      } else {
        xInit = xImg;
        yInit = xInit / ratio;
      }

      imgSelectOptions = {
        handles: true,
        keys: true,
        instance: true,
        persistent: true,
        imageWidth: realWidth,
        imageHeight: realHeight,
        x1: 0,
        y1: 0,
        x2: xInit,
        y2: yInit
      };

      if (flexHeight === false && flexWidth === false) {
        imgSelectOptions.aspectRatio = xInit + ':' + yInit;
      }
      if (flexHeight === false) {
        imgSelectOptions.maxHeight = yInit;
      }
      if (flexWidth === false) {
        imgSelectOptions.maxWidth = xInit;
      }

      return imgSelectOptions;
    },

    onSelect: function() {
      this.frame.setState('cropper');
    },

    onCropped: function(croppedImage) {
      var url = croppedImage.url,
        attachmentId = croppedImage.attachment_id,
        w = croppedImage.width,
        h = croppedImage.height;
      this.setImageFromURL(url, attachmentId, w, h);
    },

    onSkippedCrop: function(selection) {
      var url = selection.get('url'),
        w = selection.get('width'),
        h = selection.get('height');
      this.setImageFromURL(url, selection.id, w, h);
    },

    setImageFromURL: function(url, attachmentId, width, height) {
      var banner_profile_upload_status = false;
      if ($(this.uploadBtn).hasClass('dokan-banner-drag')) {
        var wrap = $(this.uploadBtn).closest('.dokan-banner');

        wrap.find('input.dokan-file-field').val(attachmentId);
        wrap.find('img.dokan-banner-img').attr('src', url);

        $(this.uploadBtn)
          .parent()
          .siblings('.image-wrap', wrap)
          .removeClass('dokan-hide');

        $(this.uploadBtn)
          .parent('.button-area')
          .addClass('dokan-hide');

        banner_profile_upload_status = true;

      } else if ($(this.uploadBtn).hasClass('dokan-pro-gravatar-drag')) {
        var wrap = $(this.uploadBtn).closest('.dokan-gravatar');

        wrap.find('input.dokan-file-field').val(attachmentId);
        wrap.find('img.dokan-gravatar-img').attr('src', url);

        banner_profile_upload_status = true;

        $(this.uploadBtn)
          .parent()
          .siblings('.gravatar-wrap', wrap)
          .removeClass('dokan-hide');

        $(this.uploadBtn)
          .parent('.gravatar-button-area')
          .addClass('dokan-hide');
      }

      if ( banner_profile_upload_status === true ) {
        $(window).on("beforeunload", function() {
          return dokan.dokan_banner_added_alert_msg;
        });

        $(document).ready(function() {
          $("#store-form").on("submit", function(e) {
            $(window).off("beforeunload");
            return true;
          });
        });
      }
    },

    removeImage: function() {
      api.HeaderTool.currentHeader.trigger('hide');
      api.HeaderTool.CombinedList.trigger('control:removeImage');
    },

    imageUpload: function(e) {
      e.preventDefault();

      var file_frame,
        settings = Dokan_Settings;

      settings.uploadBtn = this;

      settings.frame = wp.media({
        multiple: false,
        button: {
          text: dokan.selectAndCrop,
          close: false
        },
        states: [
          new wp.media.controller.Library({
            title: dokan.chooseImage,
            library: wp.media.query({ type: 'image' }),
            multiple: false,
            date: false,
            priority: 20,
            suggestedWidth: dokan.store_banner_dimension.width,
            suggestedHeight: dokan.store_banner_dimension.height
          }),
          new wp.media.controller.Cropper({
            suggestedWidth: 5000,
            imgSelectOptions: settings.calculateImageSelectOptions
          })
        ]
      });

      settings.frame.on('select', settings.onSelect, settings);
      settings.frame.on('cropped', settings.onCropped, settings);
      settings.frame.on('skippedcrop', settings.onSkippedCrop, settings);

      settings.frame.open();
    },

    calculateImageSelectOptionsProfile: function(attachment, controller) {
      var xInit = 150,
        yInit = 150,
        flexWidth = !!parseInt(dokan.store_banner_dimension['flex-width'], 10),
        flexHeight = !!parseInt(
          dokan.store_banner_dimension['flex-height'],
          10
        ),
        ratio,
        xImg,
        yImg,
        realHeight,
        realWidth,
        imgSelectOptions;

      realWidth = attachment.get('width');
      realHeight = attachment.get('height');

      this.headerImage = new api.HeaderTool.ImageModel();
      this.headerImage.set({
        themeWidth: xInit,
        themeHeight: yInit,
        themeFlexWidth: flexWidth,
        themeFlexHeight: flexHeight,
        imageWidth: realWidth,
        imageHeight: realHeight
      });

      controller.set('canSkipCrop', !this.headerImage.shouldBeCropped());

      ratio = xInit / yInit;
      xImg = realWidth;
      yImg = realHeight;

      if (xImg / yImg > ratio) {
        yInit = yImg;
        xInit = yInit * ratio;
      } else {
        xInit = xImg;
        yInit = xInit / ratio;
      }

      imgSelectOptions = {
        handles: true,
        keys: true,
        instance: true,
        persistent: true,
        imageWidth: realWidth,
        imageHeight: realHeight,
        x1: 0,
        y1: 0,
        x2: xInit,
        y2: yInit
      };

      if (flexHeight === false && flexWidth === false) {
        imgSelectOptions.aspectRatio = xInit + ':' + yInit;
      }
      if (flexHeight === false) {
        imgSelectOptions.maxHeight = yInit;
      }
      if (flexWidth === false) {
        imgSelectOptions.maxWidth = xInit;
      }

      return imgSelectOptions;
    },

    simpleImageUpload: function(e) {
      e.preventDefault();
      var file_frame,
        self = $(this);

      // If the media frame already exists, reopen it.
      if (file_frame) {
        file_frame.open();
        return;
      }

      // Create the media frame.
      file_frame = wp.media.frames.file_frame = wp.media({
        title: jQuery(this).data('uploader_title'),
        button: {
          text: jQuery(this).data('uploader_button_text')
        },
        multiple: false
      });

      // When an image is selected, run a callback.
      file_frame.on('select', function() {
        var attachment = file_frame
          .state()
          .get('selection')
          .first()
          .toJSON();

        var wrap = self.closest('.dokan-gravatar');
        wrap.find('input.dokan-file-field').val(attachment.id);
        wrap.find('img.dokan-gravatar-img').attr('src', attachment.url);
        self
          .parent()
          .siblings('.gravatar-wrap', wrap)
          .removeClass('dokan-hide');
        self.parent('.gravatar-button-area').addClass('dokan-hide');
      });

      // Finally, open the modal
      file_frame.open();
    },

    gragatarImageUpload: function(e) {
      e.preventDefault();

      var file_frame,
        settings = Dokan_Settings;

      settings.uploadBtn = this;

      settings.frame = wp.media({
        multiple: false,
        button: {
          text: dokan.selectAndCrop,
          close: false
        },
        states: [
          new wp.media.controller.Library({
            title: dokan.chooseImage,
            library: wp.media.query({ type: 'image' }),
            multiple: false,
            date: false,
            priority: 20,
            suggestedWidth: 150,
            suggestedHeight: 150
          }),
          new wp.media.controller.Cropper({
            imgSelectOptions: settings.calculateImageSelectOptionsProfile
          })
        ]
      });

      settings.frame.on('select', settings.onSelect, settings);
      settings.frame.on('cropped', settings.onCropped, settings);
      settings.frame.on('skippedcrop', settings.onSkippedCrop, settings);

      settings.frame.open();
    },

    submitSettings: function(form_id) {
      if (typeof tinyMCE != 'undefined') {
        tinyMCE.triggerSave();
      }

      var self = $('form#' + form_id),
        form_data =
          self.serialize() + '&action=dokan_settings&form_id=' + form_id;

      self.find('.ajax_prev').append('<span class="dokan-loading"> </span>');
      $('.dokan-update-setting-top-button span.dokan-loading').remove();
      $('.dokan-update-setting-top-button').append('<span class="dokan-loading"> </span>');
      $.post(dokan.ajaxurl, form_data, function(resp) {
        self.find('span.dokan-loading').remove();
        $('.dokan-update-setting-top-button span.dokan-loading').remove();
        $('html,body').animate({ scrollTop: 100 });

        if (resp.success) {
          // Harcoded Customization for template-settings function
          $('.dokan-ajax-response').html(
            $('<div/>', {
              class: 'dokan-alert dokan-alert-success',
              html: '<p>' + resp.data.msg + '</p>'
            })
          );

          $('.dokan-ajax-response').append(resp.data.progress);
        } else {
          $('.dokan-ajax-response').html(
            $('<div/>', {
              class: 'dokan-alert dokan-alert-danger',
              html: '<p>' + resp.data + '</p>'
            })
          );
        }
      });
    },

    validateForm: function(self) {
      $(
        'form#settings-form, form#profile-form, form#store-form, form#payment-form'
      ).validate({
        //errorLabelContainer: '#errors'
        submitHandler: function(form) {
          self.submitSettings(form.getAttribute('id'));
        },
        errorElement: 'span',
        errorClass: 'error',
        errorPlacement: validatorError,
        success: validatorSuccess,
        ignore:
          '.select2-search__field, :hidden, .mapboxgl-ctrl-geocoder--input'
      });
    },

    removeBanner: function(e) {
      e.preventDefault();

      var self = $(this);
      var wrap = self.closest('.image-wrap');
      var instruction = wrap.siblings('.button-area');

      wrap.find('input.dokan-file-field').val('0');
      wrap.addClass('dokan-hide');
      instruction.removeClass('dokan-hide');
    },

    removeGravatar: function(e) {
      e.preventDefault();

      var self = $(this);
      var wrap = self.closest('.gravatar-wrap');
      var instruction = wrap.siblings('.gravatar-button-area');

      wrap.find('input.dokan-file-field').val('0');
      wrap.addClass('dokan-hide');
      instruction.removeClass('dokan-hide');
    }
  };

  var Dokan_Withdraw = {
    init: function() {
      var self = this;

      this.withdrawValidate(self);
    },

    withdrawValidate: function(self) {
      $('form.withdraw').validate({
        //errorLabelContainer: '#errors'

        errorElement: 'span',
        errorClass: 'error',
        errorPlacement: validatorError,
        success: validatorSuccess
      });
    }
  };

  var Dokan_Seller = {
    init: function() {
      this.validate(this);
    },

    validate: function(self) {
      $('form#dokan-form-contact-seller').validate({
        errorPlacement: validatorError,
        errorElement: 'span',
        success: function(label, element) {
          label.removeClass('error');
          label.remove();
        },
        submitHandler: function(form) {
          $(form).block({
            message: null,
            overlayCSS: {
              background:
                '#fff url(' + dokan.ajax_loader + ') no-repeat center',
              opacity: 0.6
            }
          });

          var form_data = $(form).serialize();
          $.post(dokan.ajaxurl, form_data, function(resp) {
            $(form).unblock();

            if (typeof resp.data !== 'undefined') {
              $(form)
                .find('.ajax-response')
                .html(resp.data);
            }

            $(form)
              .find('input[type=text], input[type=email], textarea')
              .val('')
              .removeClass('valid');
          });
        }
      });
    }
  };

  $(function() {
    Dokan_Settings.init();
    Dokan_Withdraw.init();
    Dokan_Seller.init();

    $('.dokan-form-horizontal').on(
      'change',
      'input[type=checkbox]#lbl_setting_minimum_quantity',
      function() {
        var showSWDiscount = $('.show_if_needs_sw_discount');
        if ($(this).is(':checked')) {
          showSWDiscount.find('input[type="number"]').val('');
          showSWDiscount.slideDown('slow');
        } else {
          showSWDiscount.slideUp('slow');
        }
      }
    );
  });
})(jQuery);

//localize Validation messages
(function($) {
  var dokan_messages = DokanValidateMsg;

  dokan_messages.maxlength = $.validator.format(dokan_messages.maxlength_msg);
  dokan_messages.minlength = $.validator.format(dokan_messages.minlength_msg);
  dokan_messages.rangelength = $.validator.format(
    dokan_messages.rangelength_msg
  );
  dokan_messages.range = $.validator.format(dokan_messages.range_msg);
  dokan_messages.max = $.validator.format(dokan_messages.max_msg);
  dokan_messages.min = $.validator.format(dokan_messages.min_msg);

  $.validator.messages = dokan_messages;

  $(document)
    .on('click', '#dokan_store_tnc_enable', function(e) {
      if ($(this).is(':checked')) {
        $('#dokan_tnc_text').show();
      } else {
        $('#dokan_tnc_text').hide();
      }
    })
    .ready(function(e) {
      if ($('#dokan_store_tnc_enable').is(':checked')) {
        $('#dokan_tnc_text').show();
      } else {
        $('#dokan_tnc_text').hide();
      }
    });
})(jQuery);

(function($) {
  var hasSelectiveRefresh =
    'undefined' !== typeof wp && wp.customize && wp.customize.selectiveRefresh;

  function resize_dummy_image() {
    var width = dokan.store_banner_dimension.width,
      height =
        (dokan.store_banner_dimension.height /
          dokan.store_banner_dimension.width) *
        $('#dokan-content').width();

    $('.dokan-profile-frame-wrapper .profile-info-img.dummy-image').css({
      height: height
    });
  }

  resize_dummy_image();

  $(window).on('resize', function(e) {
    resize_dummy_image();
  });

  if (hasSelectiveRefresh) {
    wp.customize.selectiveRefresh.bind('partial-content-rendered', function(
      placement
    ) {
      console.log('placement', placement);
      if (placement.partial.id === 'store_header_template') {
        resize_dummy_image();
      }
    });
  }

  // Ajax product search box
  $(':input.dokan-product-search')
    .filter(':not(.enhanced)')
    .each(function() {
      var select2_args = {
        allowClear: $(this).data('allow_clear') ? true : false,
        placeholder: $(this).data('placeholder'),
        minimumInputLength: $(this).data('minimum_input_length')
          ? $(this).data('minimum_input_length')
          : '3',
        escapeMarkup: function(m) {
          return m;
        },
        language: {
          errorLoading: function() {
            // Workaround for https://github.com/select2/select2/issues/4355 instead of i18n_ajax_error.
            return dokan.i18n_searching;
          },
          inputTooLong: function(args) {
            var overChars = args.input.length - args.maximum;

            if (1 === overChars) {
              return dokan.i18n_input_too_long_1;
            }

            return dokan.i18n_input_too_long_n.replace('%qty%', overChars);
          },
          inputTooShort: function(args) {
            var remainingChars = args.minimum - args.input.length;

            if (1 === remainingChars) {
              return dokan.i18n_input_too_short_1;
            }

            return dokan.i18n_input_too_short_n.replace(
              '%qty%',
              remainingChars
            );
          },
          loadingMore: function() {
            return dokan.i18n_load_more;
          },
          maximumSelected: function(args) {
            if (args.maximum === 1) {
              return dokan.i18n_selection_too_long_1;
            }

            return dokan.i18n_selection_too_long_n.replace(
              '%qty%',
              args.maximum
            );
          },
          noResults: function() {
            return dokan.i18n_no_matches;
          },
          searching: function() {
            return dokan.i18n_searching;
          }
        },
        ajax: {
          url: dokan.ajaxurl,
          dataType: 'json',
          delay: 250,
          data: function(params) {
            return {
              term: params.term,
              action:
                $(this).data('action') ||
                'dokan_json_search_products_and_variations',
              security: dokan.search_products_nonce,
              exclude: $(this).data('exclude'),
              user_ids: $(this).data('user_ids'),
              include: $(this).data('include'),
              limit: $(this).data('limit')
            };
          },
          processResults: function(data) {
            var terms = [];

            if (data) {
              $.each(data, function(id, text) {
                terms.push({ id: id, text: text });
              });
            }
            return {
              results: terms
            };
          },
          cache: true
        }
      };

      // select2_args = $.extend( select2_args, {} );

      $(this)
        .select2(select2_args)
        .addClass('enhanced');

      if ($(this).data('sortable')) {
        var $select = $(this);
        var $list = $(this)
          .next('.select2-container')
          .find('ul.select2-selection__rendered');

        $list.sortable({
          placeholder: 'ui-state-highlight select2-selection__choice',
          forcePlaceholderSize: true,
          items: 'li:not(.select2-search__field)',
          tolerance: 'pointer',
          stop: function() {
            $(
              $list
                .find('.select2-selection__choice')
                .get()
                .reverse()
            ).each(function() {
              var id = $(this).data('data').id;
              var option = $select.find('option[value="' + id + '"]')[0];
              $select.prepend(option);
            });
          }
        });
      }
    });

  /**
   * Trigger bulk item checkbox selections
   */
  var bulkItemsSelection = {
    init: function() {
      selected_items = [];

      $('#cb-select-all').on('change', function(e) {
        var self = $(this);

        var item_id = $('.cb-select-items');

        if (self.is(':checked')) {
          item_id.each(function(key, value) {
            var item = $(value);
            item.prop('checked', 'checked');
          });
        } else {
          item_id.each(function(key, value) {
            $(value).prop('checked', '');
            selected_items.pop();
          });
        }
      });
    }
  };

  bulkItemsSelection.init();

  $('.product-cat-stack-dokan li.has-children').on(
    'click',
    '> a span.caret-icon',
    function(e) {
      e.preventDefault();
      var self = $(this),
        liHasChildren = self.closest('li.has-children');

      if (!liHasChildren.find('> ul.children').is(':visible')) {
        self.find('i.fa').addClass('fa-rotate-90');
        if (liHasChildren.find('> ul.children').hasClass('level-0')) {
          self.closest('a').css({ borderBottom: 'none' });
        }
      }

      liHasChildren.find('> ul.children').slideToggle('fast', function() {
        if (!$(this).is(':visible')) {
          self.find('i.fa').removeClass('fa-rotate-90');

          if (liHasChildren.find('> ul.children').hasClass('level-0')) {
            self.closest('a').css({ borderBottom: '1px solid #eee' });
          }
        }
      });
    }
  );

  $('.store-cat-stack-dokan li.has-children').on(
    'click',
    '> a span.caret-icon',
    function(e) {
      e.preventDefault();
      var self = $(this),
        liHasChildren = self.closest('li.has-children');

      if (!liHasChildren.find('> ul.children').is(':visible')) {
        self.find('i.fa').addClass('fa-rotate-90');
        if (liHasChildren.find('> ul.children').hasClass('level-0')) {
          self.closest('a').css({ borderBottom: 'none' });
        }
      }

      liHasChildren.find('> ul.children').slideToggle('fast', function() {
        if (!$(this).is(':visible')) {
          self.find('i.fa').removeClass('fa-rotate-90');

          if (liHasChildren.find('> ul.children').hasClass('level-0')) {
            self.closest('a').css({ borderBottom: '1px solid #eee' });
          }
        }
      });
    }
  );

  $(document).ready(function() {
    var selectedLi = $('#cat-drop-stack ul').find('a.selected');
    selectedLi.css({ fontWeight: 'bold' });

    selectedLi.parents('ul.children').each(function(i, val) {
      $(val).css({ display: 'block' });
    });
  });
})(jQuery);

(function($) {
  // Field validation error tips
  $(document.body)
    .on('wc_add_error_tip', function(e, element, error_type) {
      var offset = element.position();

      if (element.parent().find('.wc_error_tip').length === 0) {
        element.after(
          '<div class="wc_error_tip ' +
            error_type +
            '">' +
            dokan[error_type] +
            '</div>'
        );
        element
          .parent()
          .find('.wc_error_tip')
          .css(
            'left',
            offset.left +
              element.width() -
              element.width() / 2 -
              $('.wc_error_tip').width() / 2
          )
          .css('top', offset.top + element.height())
          .fadeIn('100');
      }
    })

    .on('wc_remove_error_tip', function(e, element, error_type) {
      element
        .parent()
        .find('.wc_error_tip.' + error_type)
        .fadeOut('100', function() {
          $(this).remove();
        });
    })

    .on('click', function() {
      $('.wc_error_tip').fadeOut('100', function() {
        $(this).remove();
      });
    })

    .on(
      'blur',
      '.wc_input_decimal[type=text], .wc_input_price[type=text], .wc_input_country_iso[type=text]',
      function() {
        $('.wc_error_tip').fadeOut('100', function() {
          $(this).remove();
        });
      }
    )

    .on(
      'change',
      '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc-order-totals #refund_amount[type=text]',
      function() {
        var regex,
          decimalRegex,
          decimailPoint = dokan.decimal_point;

        if ($(this).is('.wc_input_price') || $(this).is('#refund_amount')) {
          decimailPoint = dokan.mon_decimal_point;
        }

        regex = new RegExp('[^-0-9%\\' + decimailPoint + ']+', 'gi');
        decimalRegex = new RegExp('\\' + decimailPoint + '+', 'gi');

        var value = $(this).val();
        var newvalue = value
          .replace(regex, '')
          .replace(decimalRegex, decimailPoint);

        if (value !== newvalue) {
          $(this).val(newvalue);
        }
      }
    )

    .on(
      'keyup',
      // eslint-disable-next-line max-len
      '.wc_input_price[type=text], .wc_input_decimal[type=text], .wc_input_country_iso[type=text], .wc-order-totals #refund_amount[type=text]',
      function() {
        var regex, error, decimalRegex;
        var checkDecimalNumbers = false;

        if ($(this).is('.wc_input_price') || $(this).is('#refund_amount')) {
          checkDecimalNumbers = true;
          regex = new RegExp(
            '[^-0-9%\\' + dokan.mon_decimal_point + ']+',
            'gi'
          );
          decimalRegex = new RegExp(
            '[^\\' + dokan.mon_decimal_point + ']',
            'gi'
          );
          error = 'i18n_mon_decimal_error';
        } else if ($(this).is('.wc_input_country_iso')) {
          regex = new RegExp('([^A-Z])+|(.){3,}', 'im');
          error = 'i18n_country_iso_error';
        } else {
          checkDecimalNumbers = true;
          regex = new RegExp('[^-0-9%\\' + dokan.decimal_point + ']+', 'gi');
          decimalRegex = new RegExp('[^\\' + dokan.decimal_point + ']', 'gi');
          error = 'i18n_decimal_error';
        }

        var value = $(this).val();
        var newvalue = value.replace(regex, '');

        // Check if newvalue have more than one decimal point.
        if (
          checkDecimalNumbers &&
          1 < newvalue.replace(decimalRegex, '').length
        ) {
          newvalue = newvalue.replace(decimalRegex, '');
        }

        if (value !== newvalue) {
          $(document.body).triggerHandler('wc_add_error_tip', [$(this), error]);
        } else {
          $(document.body).triggerHandler('wc_remove_error_tip', [
            $(this),
            error
          ]);
        }
      }
    )

    .on(
      'change',
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price], #_subscription_sale_price.wc_input_price[type=text]',
      function() {
        var sale_price_field = $(this),
          product_type_selector = $('#product_type'),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
        } else if ( product_type_selector.length && 'subscription' === product_type_selector.find(':selected').val() ) {
          regular_price_field = $('#_subscription_price');
        } else {
          regular_price_field = $('#_regular_price');
        }

        var sale_price = parseFloat(
          window.accounting.unformat(
            sale_price_field.val(),
            dokan.mon_decimal_point
          )
        );
        var regular_price = parseFloat(
          window.accounting.unformat(
            regular_price_field.val(),
            dokan.mon_decimal_point
          )
        );

        if (sale_price >= regular_price) {
          $(this).val('');
        }
      }
    )

    .on(
      'keyup',
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price], #_subscription_sale_price.wc_input_price[type=text]',
      function() {
        var sale_price_field = $(this),
          product_type_selector = $('#product_type'),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
        } else if ( product_type_selector.length && 'subscription' === product_type_selector.find(':selected').val() ) {
          regular_price_field = $('#_subscription_price');
        } else {
          regular_price_field = $('#_regular_price');
        }

        var sale_price = parseFloat(
          window.accounting.unformat(
            sale_price_field.val(),
            dokan.mon_decimal_point
          )
        );
        var regular_price = parseFloat(
          window.accounting.unformat(
            regular_price_field.val(),
            dokan.mon_decimal_point
          )
        );

        if (sale_price >= regular_price) {
          $(document.body).triggerHandler('wc_add_error_tip', [
            $(this),
            'i18n_sale_less_than_regular_error'
          ]);
        } else {
          $(document.body).triggerHandler('wc_remove_error_tip', [
            $(this),
            'i18n_sale_less_than_regular_error'
          ]);
        }
      }
    )

    .on('init_tooltips', function() {
      $('.tips, .help_tip, .woocommerce-help-tip').tipTip({
        attribute: 'data-tip',
        fadeIn: 50,
        fadeOut: 50,
        delay: 200
      });

      $('.column-wc_actions .wc-action-button').tipTip({
        fadeIn: 50,
        fadeOut: 50,
        delay: 200
      });

      // Add tiptip to parent element for widefat tables
      $('.parent-tips').each(function() {
        $(this)
          .closest('a, th')
          .attr('data-tip', $(this).data('tip'))
          .tipTip({
            attribute: 'data-tip',
            fadeIn: 50,
            fadeOut: 50,
            delay: 200
          })
          .css('cursor', 'help');
      });
    });
})(jQuery);

;(function($) {
    var storeLists = {
        /**
         * Query holder
         *
         * @type object
         */
        query: {},

        /**
         * Form holder
         *
         * @type object
         */
        form: null,

        /**
         * Category item string holder
         *
         * @type array
         */
        cateItemStringArray: [],

        /**
         * Init all the methods
         *
         * @return void
         */
        init: function() {
            $( '#dokan-store-listing-filter-wrap .sort-by #stores_orderby' ).on( 'change', this.buildSortByQuery );
            $( '#dokan-store-listing-filter-wrap .toggle-view span' ).on( 'click', this.toggleView );
            $( '#dokan-store-listing-filter-wrap .dokan-store-list-filter-button, #dokan-store-listing-filter-wrap .dokan-icons, #dokan-store-listing-filter-form-wrap .apply-filter #cancel-filter-btn ' ).on( 'click', this.toggleForm );

            // Build query string
            $( '#dokan-store-listing-filter-form-wrap .store-search-input' ).on( 'change', this.buildSearchQuery );

            // Submit the form
            $( '#dokan-store-listing-filter-form-wrap .apply-filter #apply-filter-btn' ).on( 'click', this.submitForm );

            this.maybeHideListView();

            const self = storeLists;

            self.form = document.forms.dokan_store_lists_filter_form;

            const view = self.getLocal( 'dokan-layout' );

            if ( view ) {
                const toggleBtns = $( '.toggle-view span' );
                self.setView( view, toggleBtns );
            }

            const params = self.getParams();

            if ( params.length ) {
                let openTheForm = false;

                params.forEach( function( param ) {
                    const keys = Object.keys( param );
                    const values = Object.values( param );

                    if ( ! keys.includes( 'stores_orderby' ) || params.length > 1 ) {
                        openTheForm = true;
                    }

                    self.setParams( keys, values );
                });

                if ( openTheForm ) {
                    $( '#dokan-store-listing-filter-form-wrap' ).slideToggle();
                }
            }

            if ( $( "#dokan-store-listing-filter-form-wrap" ).length ) {
                $('.store-search-input').keypress(function (e) {
                    var key = e.which;
                    if( key == 13 ) {
                        $( "#dokan-store-listing-filter-form-wrap" ).submit();
                        return false;  
                    }
                });
            }
        },

        buildSortByQuery: function( event ) {
            const self = storeLists;

            self.query.stores_orderby = event.target.value;
            self.submitForm( event );
        },

        /**
         * Toggle store layout view
         *
         * @param  string event
         *
         * @return void
         */
        toggleView: function( event ) {
            const self = storeLists;
            const currentElement = $( event.target );
            const elements = currentElement.parent().find( 'span' );
            const view = currentElement.data( 'view' );

            self.setView( view, elements );
            self.setLocal( 'dokan-layout', view );
        },

        /**
         * Set grid or list view
         *
         * @param string view
         * @param array elements
         *
         * @return void
         */
        setView: function( view, elements ) {
            if ( typeof view === 'undefined'
                || view.length < 1
                || typeof elements === 'undefined'
                || elements.length < 1
                ) {
                return;
            }

            const listingWrap = $( '#dokan-seller-listing-wrap' );

            [...elements].forEach( function( value ) {
                const element = $( value );

                if ( view === element.data( 'view' ) ) {
                    element.addClass( 'active' );
                    listingWrap.addClass( view );
                } else {
                    element.removeClass( 'active' );
                    listingWrap.removeClass( element.data( 'view' ) );
                }
            });
        },

        /**
         * Toggle form
         *
         * @param  string event
         *
         * @return void
         */
        toggleForm: function( event ) {
            event.preventDefault();

            $( '#dokan-store-listing-filter-form-wrap' ).slideToggle();
        },

        /**
         * Build Search Query
         *
         * @param  string event
         *
         * @return void
         */
        buildSearchQuery: function( event ) {
            if ( event.target.value ) {
                storeLists.query.dokan_seller_search = event.target.value;
            } else {
                delete storeLists.query.dokan_seller_search;
            }
        },

        /**
         * Submit the form
         *
         * @param  string event
         *
         * @return void
         */
        submitForm: function( event ) {
            event.preventDefault();

            const queryString = decodeURIComponent( $.param( storeLists.query ) );
            const target      = '/page';
            const pathName    = window.location.pathname;
            const path        = pathName.includes( target ) ? pathName.substr( 0, pathName.indexOf( target ) ) : '';

            window.history.pushState( null, null, `${path}?${queryString}` );
            window.location.reload();
        },

        /**
         * Add data into local storage
         *
         * @param string key
         * @param mix value
         *
         * @return void
         */
        setLocal: function( key, value ) {
            window.localStorage.setItem( key, value );
        },

        /**
         * Get data from local storage
         *
         * @param  string key
         *
         * @return mix
         */
        getLocal: function( key ) {
            return window.localStorage.getItem( key );
        },

        setParams: function( key, value ) {
            const self = storeLists;
            const elements = self.form ? self.form.elements : '';
            const sortingForm = document.forms.stores_sorting;
            const sortingFormElements = sortingForm ? sortingForm.elements : '';

            Object.values( sortingFormElements ).forEach( function( element ) {
                if ( element.name === key[0] ) {
                    $( element ).val( value[0] );
                }
            });

            // on reload, if query string exists, set the form input elment value
            Object.values( elements ).forEach( function( element ) {
                if ( key.includes( element.name ) ) {
                    if ( element.type === 'checkbox' ) {
                        element.checked = ['yes', 'true', '1'].includes( value[0] ) ? true : false;
                    } else if ( [ 'text', 'search' ].includes( element.type ) ) {
                        element.value = value[0];
                    }
                }

                // for backward compatibility we'll allow `store_category[]` query_var.
                if ( key[0].includes( 'store_categories[' ) || key[0].includes( 'store_category[' ) ) {
                    const trimedValue = value[0].split( ' ' ).join( '-' );
                    const cateItem = $( `[data-slug=${trimedValue}]` );

                    if ( ! self.cateItemStringArray.includes( cateItem.text().trim() ) ) {
                        self.cateItemStringArray.push( cateItem.text().trim() );
                    }

                    cateItem.addClass( 'dokan-btn-theme' );

                } else if ( key[0] === 'rating' ) {
                    const trimedValue = value[0].split( ' ' ).join( '-' );

                    $( `[data-${key[0]}=${trimedValue}]` ).addClass( 'active' );
                    $( `[data-rating=${trimedValue}]` ).parent().addClass( 'selected' );
                }
            });

            key.forEach( function( param, index ) {
                if ( ! param.includes( '[' ) ) {
                    self.query[ param ] = value[ index ];
                }
            });
        },

        /**
         * Get params from
         *
         * @return array
         */
        getParams: function() {
            const params = new URLSearchParams( location.search );
            const allParams = [];

            params.forEach( function( value, key ) {
                allParams.push( {
                    [key]: value
                } );
            });

            return allParams;
        },

        /**
         * On mobile screen hide the grid, list view button
         *
         * @return void
         */
        maybeHideListView: function() {
            const self = storeLists;

            if ( window.matchMedia( '(max-width: 767px)' ).matches ) {
                if ( 'list-view' === self.getLocal( 'dokan-layout' ) ) {
                    self.setLocal( 'dokan-layout', 'grid-view' );
                }
            }

            $( window ).on( 'resize', function() {
                const container = $(this);

                if ( container.width() < 767 ) {
                    $( '#dokan-seller-listing-wrap' ).removeClass( 'list-view' );
                    $( '#dokan-seller-listing-wrap' ).addClass( 'grid-view' );
                } else {
                    $( '.toggle-view.item span' ).last().removeClass( 'active' );
                    $( '.toggle-view.item span' ).first().addClass( 'active' );
                }
            });
        }
    };

    if ( window.dokan ) {
        window.dokan.storeLists = storeLists;
        window.dokan.storeLists.init();
    }

})(jQuery);

;(function($){

    var variantsHolder = $('#variants-holder');
    var product_gallery_frame;
    var product_featured_frame;
    var $image_gallery_ids = $('#product_image_gallery');
    var $product_images = $('#product_images_container ul.product_images');

    var Dokan_Editor = {

        modal: false,
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

            this.setCorrectProductId();

            $( 'body' ).trigger( 'dokan-product-editor-loaded', this );

            $( "input.dokan-product-regular-price, input.dokan-product-sales-price" ).on( 'keyup', _.debounce( () => {
                Dokan_Editor.dokan_show_earning_suggestion( Dokan_Editor.earning_suggestion_callbak );
            }, 750 ) );

            if ( wp && wp.hooks && wp.hooks.addAction ) {
                wp.hooks.addAction( 'dokan_selected_multistep_category', 'dokan-get-product-earning-suggestion', function() {
                    Dokan_Editor.dokan_show_earning_suggestion( Dokan_Editor.earning_suggestion_callbak );
                } );

                wp.hooks.addAction( 'dokan_removed_multistep_category', 'dokan-get-product-earning-suggestion', function() {
                    Dokan_Editor.dokan_show_earning_suggestion( Dokan_Editor.earning_suggestion_callbak );
                } );
            }
        },

        setCorrectProductId : function () {
            let productForm = $( '.dokan-product-edit-form' );
            if ( ! productForm ) {
              return;
            }
            let productId = $( '#dokan_product_id' ).val();

            if ( window.history.replaceState ) {
                let url = new URL( document.location );
                let searchParams = url.searchParams;

                let currentProductId = searchParams.get( 'product_id' );
                if ( ! ( '' === currentProductId || '0' === currentProductId ) ) {
                    return;
                }

                // new value of "product_id" is set to new value
                searchParams.set('product_id', productId );

                let action = searchParams.get( 'action' );
                if ( 'edit' !== action ) {
                    return;
                }

                // change the search property of the main url
                url.search = searchParams.toString();

                // the new url string
                let newUrl = url.toString();
                let stateData = {
                    product_id: productId,
                }

              window.history.replaceState( stateData, document.title, newUrl );
            }
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
            $(".product_brand_search").select2({
                allowClear: false,
                minimumInputLength: 0,
                maximumSelectionLength: -1,
                ajax: {
                    url: dokan.ajaxurl,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            q: params.term,
                            action: 'dokan_json_search_products_brands',
                            security: dokan.search_products_brands_nonce,
                            page: params.page || 1
                        };
                    },
                    processResults: function ( data ) {
                        const options = [];
                        if ( data ) {
                            $.each( data, function ( index, text ) {
                                options.push( {
                                    id: text[ 0 ],
                                    text: text[ 1 ],
                                } );
                            } );
                        }
                        return {
                            results: options,
                            pagination: {
                                more: options.length == 0 ? false : true
                            },
                        };
                    },
                    cache: true,
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
                escapeMarkup: function ( markup ) {
                    return markup;
                },
                templateResult: function ( item ) {
                    return `<span>${ item.text }</span>`;
                },
                templateSelection: function ( item ) {
                    return item.text.replaceAll( '—', '' );
                },
            });
            $(".product_tag_search").select2({
                allowClear: false,
                tags: ( dokan.product_vendors_can_create_tags && 'on' === dokan.product_vendors_can_create_tags ),
                createTag: function ( $params ) {
                    var $term = $.trim( $params.term );
                    if ( $term === '' ) {
                      return null;
                    }

                    return {
                      id: $term,
                      text: $term,
                      newTag: true // add additional parameters
                    }
                },
                insertTag: function ( data, tag ) {
                    var $found = false;

                    $.each( data, function ( index, value ) {
                        if ( $.trim( tag.text ).toUpperCase() == $.trim( value.text ).toUpperCase() ) {
                            $found = true;
                        }
                    });

                    if ( ! $found ) data.unshift( tag );
                },
                minimumInputLength: 0,
                maximumSelectionLength: dokan.maximum_tags_select_length !== undefined ? dokan.maximum_tags_select_length : -1,
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
                escapeMarkup: function (markup) { return markup; },
                templateResult: function (item) {
                    return `<span>${item.text}</span>`;
                },
                templateSelection: function (item) {
                    return item.text;
                },
            });
        },

        addProductPopup: function (e) {
            e.preventDefault();
            Dokan_Editor.openProductPopup();
        },

        openProductPopup: function() {
            const productTemplate = wp.template( 'dokan-add-new-product' ),
                modalElem = $( '#dokan-add-product-popup' );
                Dokan_Editor.modal = modalElem.iziModal( {
                headerColor : dokan.modal_header_color,
                overlayColor: 'rgba(0, 0, 0, 0.8)',
                width       : 690,
                top         : 32,
                onOpening   : () => {
                  Dokan_Editor.reRenderPopupElements();
                },
                onClosed: () => {
                    product_gallery_frame  = undefined;
                    product_featured_frame = undefined;
                    $( '#dokan-add-new-product-popup input[name="_sale_price_dates_from"], #dokan-add-new-product-popup input[name="_sale_price_dates_to"]' ).datepicker( 'destroy' );
                },
            } );
            Dokan_Editor.modal.iziModal( 'setContent', productTemplate().trim() );
            Dokan_Editor.modal.iziModal( 'open' );
        },

        reRenderPopupElements: function() {
            Dokan_Editor.loadSelect2();
            Dokan_Editor.bindProductTagDropdown();

            $( '#dokan-add-new-product-popup .sale_price_dates_fields input' ).daterangepicker({
                singleDatePicker: true,
                showDropdowns: false,
                autoApply: true,
                parentEl: '#dokan-add-new-product-popup',
                opens: 'left',
                autoUpdateInput : false,
            } ).on( 'apply.daterangepicker', function( ev, picker ) {
                $( this ).val( picker.startDate.format( 'YYYY-MM-DD' ) );
            } );

            $( '.tips' ).tooltip();

            Dokan_Editor.gallery.sortable();
            $( 'body' ).trigger( 'dokan-product-editor-popup-opened', Dokan_Editor );
        },

        createNewProduct: function (e) {
            e.preventDefault();

            var self = $(this),
                form = self.closest('form#dokan-add-new-product-form'),
                btn_id = self.attr('data-btn_id');

            form.find( 'span.dokan-show-add-product-success' ).html('');
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

            Dokan_Editor.modal.iziModal('startLoading');
            $.post( dokan.ajaxurl, data, function( resp ) {
                if ( resp.success ) {
                    self.removeAttr( 'disabled' );
                    if ( btn_id === 'create_new' ) {
                        $( '#dokan-add-product-popup' ).iziModal('close');
                        window.location.href = resp.data;
                    } else {
                        product_featured_frame = undefined;
                        $('.dokan-dashboard-product-listing-wrapper').load( window.location.href + ' table.product-listing-table' );
                        Dokan_Editor.modal.iziModal('resetContent');
                        Dokan_Editor.openProductPopup();
                        Dokan_Editor.reRenderPopupElements();
                        $( 'span.dokan-show-add-product-success' ).html( dokan.product_created_response );

                        setTimeout(function() {
                            $( 'span.dokan-show-add-product-success' ).html( '' );
                        }, 3000);
                    }
                } else {
                    self.removeAttr( 'disabled' );
                    $( 'span.dokan-show-add-product-error' ).html( resp.data );
                }
                form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'none' );
            })
            .always( function () {
                Dokan_Editor.modal.iziModal('stopLoading');
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
                    self.closest( 'li' ).find( 'strong' ).html( dokan.i18n_attribute_label );
                } else {
                    self.closest( 'li' ).find( 'strong' ).html( value );
                }
            },

            selectAllAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values option' ).attr( 'selected', true );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values' ).trigger( 'change' );
                return false;
            },

            selectNoneAttr: function(e) {
                e.preventDefault();
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values option' ).attr( 'selected', false );
                $( this ).closest( 'li.product-attribute-list' ).find( 'select.dokan_attribute_values' ).trigger( 'change' );
                return false;
            },

            reArrangeAttribute: function() {
                var attributeWrapper = $('.dokan-product-attribute-wrapper').find('ul.dokan-attribute-option-list');
                attributeWrapper.find( 'li.product-attribute-list' ).css( 'cursor', 'default' ).each(function( i ) {
                    $(this).find('.attribute_position').val(i);
                });
            },

            addNewExtraAttr: async function(e) {
                e.preventDefault();

                var $wrapper           = $(this).closest( 'li.product-attribute-list' );
                var attribute          = $wrapper.data( 'taxonomy' );
                let result             = await dokan_sweetalert( dokan.new_attribute_prompt, {
                    action : 'prompt',
                    input  :'text'
                } );
                var new_attribute_name = result.value;

                if ( new_attribute_name ) {

                    var data = {
                        action:   'dokan_add_new_attribute',
                        taxonomy: attribute,
                        term:     new_attribute_name,
                        _wpnonce : dokan.nonce
                    };

                    $.post( dokan.ajaxurl, data, function( response ) {
                        if ( response.error ) {
                            dokan_sweetalert( response.error, {
                                action : 'alert',
                                icon   : 'warning'
                            } );
                        } else if ( response.slug ) {
                            $wrapper.find( 'select.dokan_attribute_values' ).append( '<option value="' + response.slug + '" selected="selected">' + response.name + '</option>' );
                            $wrapper.find( 'select.dokan_attribute_values' ).trigger( 'change' );
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
                        Dokan_Editor.loadSelect2();
                        Dokan_Editor.bindProductTagDropdown();
                        Dokan_Editor.attribute.reArrangeAttribute();

                        if ( "variable" !== $( 'select#product_type' ).val() ) {
                            let labels = $( 'div.dokan-product-attribute-wrapper label.show_if_variable' );

                            for( let label of labels ) {
                                let checkBox = $( label ).find('input[type="checkbox"]');

                                if ( checkBox.length > 0 && checkBox[0].getAttribute('name')?.startsWith('attribute_variation[') ) {
                                    $( label ).hide();
                                }
                            }
                        }
                    }

                    self.closest('.dokan-attribute-type').find('span.dokan-attribute-spinner').addClass('dokan-hide');

                    if ( attribute ) {
                        attrWrap.find( 'option[value="' + attribute + '"]' ).attr( 'disabled','disabled' );
                        attrWrap.val( '' );
                    }
                })
                .done(function() {
                    $( 'select#product_type' ).trigger('change');
                });
            },

            removeAttribute: async function(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                const isRemoved = await dokan_sweetalert( dokan.remove_attribute, {
                    action :'confirm',
                    icon   :'warning'
                } );

                if ( 'undefined' !== isRemoved && isRemoved.isConfirmed ) {
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
            const product_type = $( '#product_type' ).val();

            if ( $(this).is(':checked') && 'external' !== product_type ) {
                $('.show_if_stock').slideDown('fast');
            } else {
                $('.show_if_stock').slideUp('fast');
            }

            if ( 'simple' === product_type ) {
                $(this).is(':checked') ? $('.hide_if_stock_global').slideUp('fast') : $('.hide_if_stock_global').slideDown('fast');
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
                        library: {
                            type: 'image',
                        },
                        button: {
                            text: dokan.i18n_choose_gallery_btn_text,
                        },
                        multiple: true
                    });

                    product_gallery_frame.on( 'select', function() {

                        var selection = product_gallery_frame.state().get('selection');

                        selection.map( function( attachment ) {
                            attachment     = attachment.toJSON();
                            attachment_ids = [];

                            // Check if attachment doesn't exist or attachment type is not image
                            if ( ! attachment.id || 'image' !== attachment.type ) {
                                return;
                            }

                            $('<li class="image" data-attachment_id="' + attachment.id + '">\
                                    <img src="' + attachment.url + '" />\
                                    <a href="#" class="action-delete">&times;</a>\
                                </li>').insertBefore( p_images.find('li.add-image') );

                            $('#product_images_container ul li.image').css('cursor','default').each(function() {
                                var attachment_id = jQuery(this).attr( 'data-attachment_id' );
                                attachment_ids.push( attachment_id );
                            });

                            images_gid.val( attachment_ids.join(',') );
                        } );
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
            calculateImageSelectOptions: function(attachment, controller) {
                let realWidth = attachment.get('width');
                let realHeight = attachment.get('height');
                let xInit = parseInt(realWidth, 10),
                    yInit = parseInt(realHeight, 10),
                    flexWidth = !!parseInt(realWidth, 10),
                    flexHeight = !!parseInt(realHeight, 10),
                    ratio,
                    xImg,
                    yImg,
                    imgSelectOptions;

                // Add check before accessing wp.customize
                if ( typeof wp !== 'undefined' && wp.customize ) {
                    const api = wp.customize;
                    this.headerImage = new api.HeaderTool.ImageModel();
                    this.headerImage.set(
                        {
                            themeWidth: xInit,
                            themeHeight: yInit,
                            themeFlexWidth: flexWidth,
                            themeFlexHeight: flexHeight,
                            imageWidth: realWidth,
                            imageHeight: realHeight,
                        }
                    );
                }

                controller.set('canSkipCrop', true);

                // Add validation before ratio calculation
                if ( !yInit ) {
                    return {};
                }
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
                    y2: yInit,
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
            imageContainer: null,
            onSelect: function() {
                product_featured_frame.setState('cropper');
            },

            onCropped: function(croppedImage) {
                let url = croppedImage.url, attachmentId = croppedImage.attachment_id;

                Dokan_Editor.featuredImage.setSelectedImage(
                    url,
                    attachmentId
                );
            },
            onSkippedCrop: function(selection) {
                let url = selection.get('url'), id = selection.id;
                Dokan_Editor.featuredImage.setSelectedImage( url, id );
            },
            setSelectedImage: function( url, id ) {
                // set the image hidden id
                Dokan_Editor.featuredImage.imageContainer.siblings('input.dokan-feat-image-id').val(id);

                // set the image
                let instruction = Dokan_Editor.featuredImage.imageContainer.closest('.instruction-inside');
                let wrap = instruction.siblings('.image-wrap');

                wrap.find('img').attr('src', url);
                wrap.find('img').removeAttr( 'srcset' );

                instruction.addClass('dokan-hide');
                wrap.removeClass('dokan-hide');
            },
            addImage: function(e) {
                e.preventDefault();

                let self = $(this);

                if ( product_featured_frame ) {
                    product_featured_frame.open();
                    return;
                } else {
                    product_featured_frame = wp.media({
                        multiple: false,
                        button: {
                            text: dokan.selectAndCrop,
                            close: false
                        },
                        states: [
                            new wp.media.controller.Library({
                                title: dokan.i18n_choose_featured_img,
                                library: wp.media.query({ type: 'image' }),
                                multiple: false,
                                date: false,
                            }),
                            new wp.media.controller.Cropper({
                                imgSelectOptions: Dokan_Editor.featuredImage.calculateImageSelectOptions.bind(
                                    Dokan_Editor.featuredImage
                                )
                            })
                        ]
                    });

                    Dokan_Editor.featuredImage.imageContainer = self;
                    product_featured_frame.on('select', Dokan_Editor.featuredImage.onSelect);
                    product_featured_frame.on('cropped', Dokan_Editor.featuredImage.onCropped);
                    product_featured_frame.on('skippedcrop', Dokan_Editor.featuredImage.onSkippedCrop);
                    product_featured_frame.on('close', function() {
                        product_featured_frame = undefined;
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
        },

        dokan_show_earning_suggestion: function( callback ) {
            let commission = $('span.vendor-earning').attr( 'data-commission' );
            let product_id = $( 'span.vendor-earning' ).attr( 'data-product-id' );
            let product_price = $( 'input.dokan-product-regular-price' ).val();
            let sale_price = $( 'input.dokan-product-sales-price' ).val();
            let earning_suggestion = $('.simple-product span.vendor-price');
            let category_ids = $('input[name="chosen_product_cat[]"]').map(function() {
                return $(this).val();
            }).get();

            let priceAmount = sale_price ? sale_price : product_price;

            jQuery.ajax({
                url: window.dokan.rest.root + `dokan/v1/commission`,
                beforeSend: function ( xhr ) {
                    xhr.setRequestHeader( 'X-WP-Nonce', window.dokan.rest.nonce );
                },
                type: 'GET',
                data: {
                    product_id: product_id,
                    amount: priceAmount ? Dokan_Editor.unformatMoney( priceAmount ) : 0,
                    // vendor_id
                    category_ids,
                    context: 'seller'
                }
            }).done( ( response ) => {
                if ( ! isNaN( response ) ) {
                    earning_suggestion.html( Dokan_Editor.formatMoney( response ) );
                }

                if ( typeof callback === 'function' ) {
                    callback();
                }
            } );
        },

        formatMoney( amount ) {
            return accounting.formatMoney( amount, {
                symbol: dokan.currency_format_symbol,
                decimal: dokan.currency_format_decimal_sep,
                thousand: dokan.currency_format_thousand_sep,
                precision: dokan.currency_format_num_decimals,
                format: dokan.currency_format,
            } );
        },

        unformatMoney( amount ) {
            return accounting.unformat( amount, dokan.mon_decimal_point );
        },

        earning_suggestion_callbak: function() {

            if ( $( '#product_type' ).val() == 'simple' || $( '#product_type' ).text() == '' ) {
                let vandorPrice = $(
                    '.simple-product span.vendor-price'
                ).text();
                vandorPrice = Dokan_Editor.unformatMoney( vandorPrice );

                if ( vandorPrice < 0 ) {
                    $( $('.dokan-product-less-price-alert').removeClass('dokan-hide') );
                    $( 'input[type=submit]' ).attr( 'disabled', 'disabled' );
                    $( 'button[type=submit]' ).attr( 'disabled', 'disabled' );
                } else {
                    $( $('.dokan-product-less-price-alert').addClass('dokan-hide') );
                    $( 'input[type=submit]' ).removeAttr( 'disabled');
                    $( 'button[type=submit]' ).removeAttr( 'disabled');
                }
            }
        }
    };

    // On DOM ready
    $(function() {
        Dokan_Editor.init();

        // PRODUCT TYPE SPECIFIC OPTIONS.
        $( 'select#product_type' ).on( 'change', function() {
            // Get value.
            var select_val = $( this ).val();

            if ( 'variable' === select_val ) {
                $( 'input#_manage_stock' ).trigger( 'change' );
                $( 'input#_downloadable' ).prop( 'checked', false );
                $( 'input#_virtual' ).removeAttr( 'checked' );
            }

            show_and_hide_panels();

            $( document.body ).trigger( 'dokan-product-type-change', select_val, $( this ) );

        }).trigger( 'change' );

        $('.product-edit-container').on('change', 'input#_downloadable, input#_virtual', function() {
            show_and_hide_panels();
        }).trigger( 'change' );

        $( 'input#_downloadable' ).trigger( 'change' );
        $( 'input#_virtual' ).trigger( 'change' );

        function show_and_hide_panels() {
            var product_type    = $( '#product_type' ).val();
            var is_virtual      = $( 'input#_virtual:checked' ).length;
            var is_downloadable = $( 'input#_downloadable:checked' ).length;
            let shippingTaxContainer  = $( '.dokan-product-shipping-tax' );

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

                if ( 1 === $( '.dokan-product-shipping-tax .dokan-section-content' ).first().children().length ) {
                    shippingTaxContainer.hide();
                } else {
                    if ( shippingTaxContainer.hasClass('hide_if_virtual') ) {
                        shippingTaxContainer.removeClass('hide_if_virtual');
                    }

                    shippingTaxContainer.show();
                }
            } else {
                shippingTaxContainer.show();
            }

            $( '.hide_if_' + product_type ).hide();

            $( 'input#_manage_stock' ).trigger( 'change' );
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
            buttons.children( '.save' ).on( 'click', function() {
                var new_slug = $el.children( 'input' ).val();

                if ( new_slug == $('#editable-post-name-full').text() ) {
                    buttons.children('.cancel').trigger( 'click' );
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
            buttons.children( '.cancel' ).on( 'click', function() {
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

            $el.html( '<input type="text" id="new-post-slug" value="' + slug_value + '" autocomplete="off" />' ).children( 'input' ).on( 'keydown', function( e ) {
                var key = e.which;
                // On [Enter], just save the new slug, don't save the post.
                if ( 13 === key ) {
                    e.preventDefault();
                    buttons.children( '.save' ).trigger('click');
                }
                // On [Esc] cancel the editing.
                if ( 27 === key ) {
                    buttons.children( '.cancel' ).trigger('click');
                }
            } ).on( 'keyup', function() {
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

        $( window ).on( "load", function (){
            if ( $( 'input#_virtual:checked' ).length ) {
                show_and_hide_panels();
            }
        });
    });
})(jQuery);

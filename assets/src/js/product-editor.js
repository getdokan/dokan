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
            if ( dokan.product_vendors_can_create_tags && 'on' === dokan.product_vendors_can_create_tags ) {
                return;
            }

            $( '#product_tag' ).select2( {
                language: {
                    noResults: function () {
                        return dokan.i18n_no_result_found;
                    }
                }
            } );
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

        $('body').on( 'keyup', '.dokan-product-sales-price, .dokan-product-regular-price', debounce_delay( function(evt) {
            evt.preventDefault();
            var product_price           = $( 'input.dokan-product-regular-price' ).val();
            var sale_price_wrap         = $( 'input.dokan-product-sales-price' );
            var sale_price              = sale_price_wrap.val();
            var sale_price_input_div    = sale_price_wrap.parent( 'div.dokan-input-group' );
            var sale_price_input_msg    = "<span class='error'>" + dokan.i18n_sales_price_error + "</span>";
            var sale_price_parent_div   = sale_price_input_div.parent( 'div.sale-price' ).find( 'span.error' );

            if ( '' == product_price ) {

                sale_price_parent_div.remove();
                sale_price_input_div.after( sale_price_input_msg );

                sale_price_wrap.val('');
                setTimeout(function(){
                    sale_price_parent_div.remove();
                }, 5000);

            } else if( parseFloat( product_price ) <= parseFloat( sale_price ) ) {

                sale_price_parent_div.remove();
                sale_price_input_div.after( sale_price_input_msg );

                sale_price_wrap.val('');
                setTimeout(function(){
                    sale_price_parent_div.remove();
                }, 5000);

            } else {

                sale_price_parent_div.remove();

            }

        } ,600 ) );

    });

    $(document).ready(function () {
        // Ajax search products tags
        $("#product_tag_search").select2({
            allowClear: false,
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
                            more: true
                        }
                    };
                },
                cache: true
            }
        });
    });

})(jQuery);

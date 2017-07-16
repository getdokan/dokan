jQuery(function($) {
    var api = wp.customize;

    $('.datepicker').datepicker({
        dateFormat: 'yy-mm-dd'
    });

    $('.tips').tooltip();

    function showTooltip(x, y, contents) {
        jQuery('<div class="chart-tooltip">' + contents + '</div>').css({
            top: y - 16,
            left: x + 20
        }).appendTo("body").fadeIn(200);
    }

    var prev_data_index = null;
    var prev_series_index = null;

    jQuery(".chart-placeholder").bind("plothover", function(event, pos, item) {
        if (item) {
            if (prev_data_index != item.dataIndex || prev_series_index != item.seriesIndex) {
                prev_data_index = item.dataIndex;
                prev_series_index = item.seriesIndex;

                jQuery(".chart-tooltip").remove();

                if (item.series.points.show || item.series.enable_tooltip) {

                    var y = item.series.data[item.dataIndex][1];

                    tooltip_content = '';

                    if (item.series.prepend_label)
                        tooltip_content = tooltip_content + item.series.label + ": ";

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
            jQuery(".chart-tooltip").remove();
            prev_data_index = null;
        }
    });

});

// Dokan Register
jQuery(function($) {
    $('.user-role input[type=radio]').on('change', function() {
        var value = $(this).val();

        if ( value === 'seller') {
            $('.show_if_seller').slideDown();
            if ( $( '.tc_check_box' ).length > 0 )
                $('input[name=register]').attr('disabled','disabled');
        } else {
            $('.show_if_seller').slideUp();
            if ( $( '.tc_check_box' ).length > 0 )
                $( 'input[name=register]' ).removeAttr( 'disabled' );
        }
    });

   $( '.tc_check_box' ).on( 'click', function () {
        var chk_value = $( this ).val();
        if ( $( this ).prop( "checked" ) ) {
            $( 'input[name=register]' ).removeAttr( 'disabled' );
            $( 'input[name=dokan_migration]' ).removeAttr( 'disabled' );
        } else {
            $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
            $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
        }
    } );

    if ( $( '.tc_check_box' ).length > 0 ){
        $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
    }

    $('#company-name').on('focusout', function() {
        var value = $(this).val().toLowerCase().replace(/-+/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        $('#seller-url').val(value);
        $('#url-alart').text( value );
        $('#seller-url').focus();
    });

    $('#seller-url').keydown(function(e) {
        var text = $(this).val();

        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 109, 110, 173, 189, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                return;
        }

        if ((e.shiftKey || (e.keyCode < 65 || e.keyCode > 90) && (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) ) {
            e.preventDefault();
        }
    });

    $('#seller-url').keyup(function(e) {
        $('#url-alart').text( $(this).val() );
    });

    $('#shop-phone').keydown(function(e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 107, 109, 110, 187, 189, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }

        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $('#seller-url').on('focusout', function() {
        var self = $(this),
        data = {
            action : 'shop_url',
            url_slug : self.val(),
            _nonce : dokan.nonce,
        };

        if ( self.val() === '' ) {
            return;
        }

        var row = self.closest('.form-row');
        row.block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        $.post( dokan.ajaxurl, data, function(resp) {

            if ( resp == 0){
                $('#url-alart').removeClass('text-success').addClass('text-danger');
                $('#url-alart-mgs').removeClass('text-success').addClass('text-danger').text(dokan.seller.notAvailable);
            } else {
                $('#url-alart').removeClass('text-danger').addClass('text-success');
                $('#url-alart-mgs').removeClass('text-danger').addClass('text-success').text(dokan.seller.available);
            }

            row.unblock();

        } );

    });
});

//dokan settings
(function($) {

    $.validator.setDefaults({ ignore: ":hidden" });

    var validatorError = function(error, element) {
        var form_group = $(element).closest('.form-group');
        form_group.addClass('has-error').append(error);
    };

    var validatorSuccess = function(label, element) {
        $(element).closest('.form-group').removeClass('has-error');
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

            this.validateForm(self);

            return false;
        },

        calculateImageSelectOptions: function(attachment, controller) {
            var xInit = parseInt(dokan.store_banner_dimension.width, 10),
                yInit = parseInt(dokan.store_banner_dimension.height, 10),
                flexWidth = !! parseInt(dokan.store_banner_dimension['flex-width'], 10),
                flexHeight = !! parseInt(dokan.store_banner_dimension['flex-height'], 10),
                ratio, xImg, yImg, realHeight, realWidth,
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

            controller.set( 'canSkipCrop', ! this.headerImage.shouldBeCropped() );

            ratio = xInit / yInit;
            xImg = realWidth;
            yImg = realHeight;

            if ( xImg / yImg > ratio ) {
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
            if (flexHeight === false ) {
                imgSelectOptions.maxHeight = yInit;
            }
            if (flexWidth === false ) {
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
            if ( $(this.uploadBtn).hasClass('dokan-banner-drag') ) {
                var wrap = $(this.uploadBtn).closest('.dokan-banner');
                wrap.find('input.dokan-file-field').val(attachmentId);
                wrap.find('img.dokan-banner-img').attr('src', url);
                $(this.uploadBtn).parent().siblings('.image-wrap', wrap).removeClass('dokan-hide');
                $(this.uploadBtn).parent('.button-area').addClass('dokan-hide');
            } else if ( $(this.uploadBtn).hasClass('dokan-pro-gravatar-drag') ) {
                var wrap = $(this.uploadBtn).closest('.dokan-gravatar');
                wrap.find('input.dokan-file-field').val(attachmentId);
                wrap.find('img.dokan-gravatar-img').attr('src', url);
                $(this.uploadBtn).parent().siblings('.gravatar-wrap', wrap).removeClass('dokan-hide');
                $(this.uploadBtn).parent('.gravatar-button-area').addClass('dokan-hide');
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
                        title:     dokan.chooseImage,
                        library:   wp.media.query({ type: 'image' }),
                        multiple:  false,
                        date:      false,
                        priority:  20,
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
                flexWidth = !! parseInt(dokan.store_banner_dimension['flex-width'], 10),
                flexHeight = !! parseInt(dokan.store_banner_dimension['flex-height'], 10),
                ratio, xImg, yImg, realHeight, realWidth,
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

            controller.set( 'canSkipCrop', ! this.headerImage.shouldBeCropped() );

            ratio = xInit / yInit;
            xImg = realWidth;
            yImg = realHeight;

            if ( xImg / yImg > ratio ) {
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
            if (flexHeight === false ) {
                imgSelectOptions.maxHeight = yInit;
            }
            if (flexWidth === false ) {
                imgSelectOptions.maxWidth = xInit;
            }

            return imgSelectOptions;
        },

        simpleImageUpload : function(e) {
            e.preventDefault();
             var file_frame,
                self = $(this);

            // If the media frame already exists, reopen it.
            if ( file_frame ) {
                file_frame.open();
                return;
            }

            // Create the media frame.
            file_frame = wp.media.frames.file_frame = wp.media({
                title: jQuery( this ).data( 'uploader_title' ),
                button: {
                    text: jQuery( this ).data( 'uploader_button_text' )
                },
                multiple: false
            });

            // When an image is selected, run a callback.
            file_frame.on( 'select', function() {
                var attachment = file_frame.state().get('selection').first().toJSON();

                var wrap = self.closest('.dokan-gravatar');
                wrap.find('input.dokan-file-field').val(attachment.id);
                wrap.find('img.dokan-gravatar-img').attr('src', attachment.url);
                self.parent().siblings('.gravatar-wrap', wrap).removeClass('dokan-hide');
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
                        title:     dokan.chooseImage,
                        library:   wp.media.query({ type: 'image' }),
                        multiple:  false,
                        date:      false,
                        priority:  20,
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

            if ( typeof tinyMCE != 'undefined' ) {
                tinyMCE.triggerSave();
            }

            var self = $( "form#" + form_id ),
                form_data = self.serialize() + '&action=dokan_settings&form_id=' + form_id;

            self.find('.ajax_prev').append('<span class="dokan-loading"> </span>');
            $.post(dokan.ajaxurl, form_data, function(resp) {

                self.find('span.dokan-loading').remove();
                $('html,body').animate({scrollTop:100});

               if ( resp.success ) {
                    // Harcoded Customization for template-settings function
                      $('.dokan-ajax-response').html( $('<div/>', {
                        'class': 'dokan-alert dokan-alert-success',
                        'html': '<p>' + resp.data.msg + '</p>',
                    }) );

                    $('.dokan-ajax-response').append(resp.data.progress);

                }else {
                    $('.dokan-ajax-response').html( $('<div/>', {
                        'class': 'dokan-alert dokan-alert-danger',
                        'html': '<p>' + resp.data + '</p>'
                    }) );
                }
            });
        },

        validateForm: function(self) {

            $("form#settings-form, form#profile-form, form#store-form, form#payment-form").validate({
                //errorLabelContainer: '#errors'
                submitHandler: function(form) {
                    self.submitSettings( form.getAttribute('id') );
                },
                errorElement: 'span',
                errorClass: 'error',
                errorPlacement: validatorError,
                success: validatorSuccess
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
        },
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
            })
        }
    };

    var Dokan_Seller = {
        init: function() {
            this.validate(this);
        },

        validate: function(self) {
            // e.preventDefault();

            $('form#dokan-form-contact-seller').validate({
                errorPlacement: validatorError,
                success: validatorSuccess,
                submitHandler: function(form) {

                    $(form).block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });

                    var form_data = $(form).serialize();
                    $.post(dokan.ajaxurl, form_data, function(resp) {
                        $(form).unblock();

                        if ( typeof resp.data !== 'undefined' ) {
                            $(form).find('.ajax-response').html(resp.data);
                        }

                        $(form).find('input[type=text], input[type=email], textarea').val('').removeClass('valid');
                    });
                }
            });
        }
    };

    var Dokan_Add_Seller = {
        init: function() {
            this.validate(this);
        },

        validate: function(self) {

            $('form.register').validate({
                errorPlacement: validatorError,
                success: validatorSuccess,
                submitHandler: function(form) {
                    form.submit();
                }
            });
        }
    };

    $(function() {
        Dokan_Settings.init();
        Dokan_Withdraw.init();
        Dokan_Seller.init();
        Dokan_Add_Seller.init();

        $('.dokan-form-horizontal').on('change', 'input[type=checkbox]#lbl_setting_minimum_quantity', function(){
            var showSWDiscount =  $( '.show_if_needs_sw_discount' );
            if ( $( this ).is(':checked') ) {
                showSWDiscount.find('input[type="number"]').val('');
                showSWDiscount.slideDown('slow');
            } else {
                showSWDiscount.slideUp('slow');
            }
        } );
    });

})(jQuery);

//localize Validation messages
(function($){
    var dokan_messages = DokanValidateMsg;

    dokan_messages.maxlength   = $.validator.format( dokan_messages.maxlength_msg );
    dokan_messages.minlength   = $.validator.format( dokan_messages.minlength_msg );
    dokan_messages.rangelength = $.validator.format( dokan_messages.rangelength_msg );
    dokan_messages.range       = $.validator.format( dokan_messages.range_msg );
    dokan_messages.max         = $.validator.format( dokan_messages.max_msg );
    dokan_messages.min         = $.validator.format( dokan_messages.min_msg );

    $.validator.messages = dokan_messages;

    $(document).on('click','#dokan_store_tnc_enable',function(e) {
        if($(this).is(':checked')) {
            $('#dokan_tnc_text').show();
        }else {
            $('#dokan_tnc_text').hide();
        }
    }).ready(function(e){
        if($('#dokan_store_tnc_enable').is(':checked')) {
            $('#dokan_tnc_text').show();
        }else {
            $('#dokan_tnc_text').hide();
        }
    });

})(jQuery);

;(function($) {
    function resize_dummy_image() {
        var width = dokan.store_banner_dimension.width,
            height = (dokan.store_banner_dimension.height / dokan.store_banner_dimension.width) * $('#dokan-content').width();

        $('.profile-info-img.dummy-image').css({
            height: height
        });
    }

    resize_dummy_image();

    $(window).on('resize', function (e) {
        resize_dummy_image();
    });

})(jQuery);

;( function ( $ ) {

    $( '#cat-drop-stack li.has-children' ).on( 'click', '> a span.caret-icon', function ( e ) {
        e.preventDefault();
        var self = $( this ),
            liHasChildren = self.closest( 'li.has-children' );

        if ( !liHasChildren.find( '> ul.children' ).is( ':visible' ) ) {
            self.find( 'i.fa' ).addClass( 'fa-rotate-90' );
            if ( liHasChildren.find( '> ul.children' ).hasClass( 'level-0' ) ) {
                self.closest( 'a' ).css( { 'borderBottom': 'none' } );
            }
        }

        liHasChildren.find( '> ul.children' ).slideToggle( 'fast', function () {
            if ( !$( this ).is( ':visible' ) ) {
                self.find( 'i.fa' ).removeClass( 'fa-rotate-90' );

                if ( liHasChildren.find( '> ul.children' ).hasClass( 'level-0' ) ) {
                    self.closest( 'a' ).css( { 'borderBottom': '1px solid #eee' } );
                }
            }
        } );
    } );
} )( jQuery );
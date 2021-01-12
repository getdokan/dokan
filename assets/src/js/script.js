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
      } else if ($(this.uploadBtn).hasClass('dokan-pro-gravatar-drag')) {
        var wrap = $(this.uploadBtn).closest('.dokan-gravatar');

        wrap.find('input.dokan-file-field').val(attachmentId);
        wrap.find('img.dokan-gravatar-img').attr('src', url);

        $(this.uploadBtn)
          .parent()
          .siblings('.gravatar-wrap', wrap)
          .removeClass('dokan-hide');

        $(this.uploadBtn)
          .parent('.gravatar-button-area')
          .addClass('dokan-hide');
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
      $.post(dokan.ajaxurl, form_data, function(resp) {
        self.find('span.dokan-loading').remove();
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
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price]',
      function() {
        var sale_price_field = $(this),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
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
      '#_sale_price.wc_input_price[type=text], .wc_input_price[name^=variable_sale_price]',
      function() {
        var sale_price_field = $(this),
          regular_price_field;

        if (sale_price_field.attr('name').indexOf('variable') !== -1) {
          regular_price_field = sale_price_field
            .parents('.variable_pricing')
            .find('.wc_input_price[name^=variable_regular_price]');
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

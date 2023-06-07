dokanWebpack([7],{

/***/ 292:
/***/ (function(module, exports) {

(function ($) {
  var DokanAdminProduct = {
    searchVendors: function searchVendors(element) {
      $(element).each(function () {
        var selector = $(this);
        var attributes = $(selector).data();
        $(selector).selectWoo({
          closeOnSelect: attributes['close_on_select'] ? true : false,
          minimumInputLength: attributes['minimum_input_length'] ? attributes['minimum_input_length'] : '0',
          ajax: {
            url: dokan_admin_product.ajaxurl,
            dataType: 'json',
            delay: 250,
            data: function data(params) {
              return {
                action: attributes['action'],
                _wpnonce: dokan_admin_product.nonce,
                s: params.term
              };
            },
            processResults: function processResults(data, params) {
              params.page = params.page || 1;
              return {
                results: data.data.vendors,
                pagination: {
                  more: false // (params.page * 30) < data.total_count

                }
              };
            },
            cache: false
          },
          language: {
            errorLoading: function errorLoading() {
              return dokan_admin_product.i18n.error_loading;
            },
            searching: function searching() {
              return dokan_admin_product.i18n.searching + '...';
            },
            inputTooShort: function inputTooShort() {
              return dokan_admin_product.i18n.input_too_short + '...';
            }
          },
          escapeMarkup: function escapeMarkup(markup) {
            return markup;
          },
          templateResult: function templateResult(vendor) {
            if (vendor.loading) {
              return vendor.text;
            }

            var markup = "<div class='dokan_product_author_override-results clearfix'>" + "<div class='dokan_product_author_override__avatar'><img src='" + vendor.avatar + "' /></div>" + "<div class='dokan_product_author_override__title'>" + vendor.text + "</div></div>";
            return markup;
          },
          templateSelection: function templateSelection(vendor) {
            return vendor.text;
          }
        });
      });
    },
    init: function init() {
      this.searchVendors('.dokan_product_author_override');
    }
  };
  $(function () {
    // DOM Ready - Let's invoke the init method
    DokanAdminProduct.init();
  });
})(jQuery);

/***/ })

},[292]);
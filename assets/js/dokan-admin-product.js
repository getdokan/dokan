/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/dokan-admin-product.js":
/*!**********************************************!*\
  !*** ./assets/src/js/dokan-admin-product.js ***!
  \**********************************************/
/***/ (() => {

eval("(function ($) {\n  const DokanAdminProduct = {\n    vendorHtmlElement: null,\n    searchVendors(element) {\n      $(element).each(function () {\n        let selector = $(this);\n        let attributes = $(selector).data();\n        DokanAdminProduct.vendorHtmlElement = $(selector).selectWoo({\n          closeOnSelect: attributes['close_on_select'] ? true : false,\n          minimumInputLength: attributes['minimum_input_length'] ? attributes['minimum_input_length'] : '0',\n          ajax: {\n            url: dokan_admin_product.ajaxurl,\n            dataType: 'json',\n            delay: 250,\n            data: function (params) {\n              return {\n                action: attributes['action'],\n                _wpnonce: dokan_admin_product.nonce,\n                s: params.term\n              };\n            },\n            processResults: function (data, params) {\n              params.page = params.page || 1;\n              return {\n                results: data.data.vendors,\n                pagination: {\n                  more: false // (params.page * 30) < data.total_count\n                }\n              };\n            },\n            cache: false\n          },\n          language: {\n            errorLoading: function () {\n              return dokan_admin_product.i18n.error_loading;\n            },\n            searching: function () {\n              return dokan_admin_product.i18n.searching + '...';\n            },\n            inputTooShort: function () {\n              return dokan_admin_product.i18n.input_too_short + '...';\n            }\n          },\n          escapeMarkup: function (markup) {\n            return markup;\n          },\n          templateResult: function (vendor) {\n            if (vendor.loading) {\n              return vendor.text;\n            }\n            var markup = \"<div class='dokan_product_author_override-results clearfix'>\" + \"<div class='dokan_product_author_override__avatar'><img src='\" + vendor.avatar + \"' /></div>\" + \"<div class='dokan_product_author_override__title'>\" + vendor.text + \"</div></div>\";\n            return markup;\n          },\n          templateSelection: function (vendor) {\n            return vendor.text;\n          }\n        });\n      });\n    },\n    hideVendorIfSubscriptionProduct() {\n      let productType = $('#product-type').val();\n      let vendorBox = $('.dokan_product_author_override').closest('div.postbox');\n      if ('product_pack' === productType) {\n        let user = $('.dokan_product_author_override').data('data')[0];\n        vendorBox.slideUp();\n        DokanAdminProduct.vendorHtmlElement.val(user.id ? String(user.id) : '0').trigger('change');\n      } else {\n        vendorBox.slideDown();\n      }\n    },\n    init() {\n      this.searchVendors('.dokan_product_author_override');\n      this.hideVendorIfSubscriptionProduct();\n      $('#product-type').on('change', this.hideVendorIfSubscriptionProduct);\n    }\n  };\n  $(function () {\n    // DOM Ready - Let's invoke the init method\n    DokanAdminProduct.init();\n  });\n})(jQuery);\n\n//# sourceURL=webpack://dokan/./assets/src/js/dokan-admin-product.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/dokan-admin-product.js"]();
/******/ 	
/******/ })()
;
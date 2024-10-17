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

/***/ "./assets/src/js/reverse-withdrawal.js":
/*!*********************************************!*\
  !*** ./assets/src/js/reverse-withdrawal.js ***!
  \*********************************************/
/***/ (() => {

eval(";\n(function ($, document, window) {\n  /**\n   * Filter Reverse withdrawal transactions\n   */\n  const Dokan_Reverse_Withdrawal = {\n    init() {\n      $('.reverse-balance-section').on('click', '#reverse_pay', Dokan_Reverse_Withdrawal.add_to_cart);\n    },\n    add_to_cart() {\n      let th = $(this);\n      let payment_el = $('#reverse_pay_balance');\n      Dokan_Reverse_Withdrawal.disableProps();\n      let data = {\n        price: payment_el.val(),\n        _reverse_withdrawal_nonce: dokan.reverse_withdrawal.nonce\n      };\n\n      // call ajax\n      wp.ajax.post('dokan_reverse_withdrawal_payment_to_cart', data).then(async response => {\n        let alert_data = {\n          action: 'confirm',\n          title: dokan.reverse_withdrawal.on_success_title,\n          icon: 'success',\n          showCloseButton: false,\n          showCancelButton: false,\n          focusConfirm: true\n        };\n        await dokan_sweetalert(response.message, alert_data).then(() => {\n          window.location.replace(dokan.reverse_withdrawal.checkout_url);\n        });\n      }).fail(jqXHR => {\n        Dokan_Reverse_Withdrawal.disableProps(false);\n        let error_message = dokan_handle_ajax_error(jqXHR);\n        if (error_message) {\n          dokan_sweetalert(error_message, {\n            'action': 'error',\n            'title': dokan.reverse_withdrawal.on_error_title,\n            'icon': 'error'\n          });\n        }\n      });\n    },\n    disableProps(args = true) {\n      $('#reverse_pay_balance').prop('disabled', args);\n      $('#reverse_pay').prop('disabled', args);\n    }\n  };\n  $(function () {\n    // DOM Ready - Let's invoke the init method\n    Dokan_Reverse_Withdrawal.init();\n  });\n})(jQuery, document, window);\n\n//# sourceURL=webpack://dokan/./assets/src/js/reverse-withdrawal.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/reverse-withdrawal.js"]();
/******/ 	
/******/ })()
;
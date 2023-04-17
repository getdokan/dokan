dokanWebpack([5],{

/***/ 286:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_defineProperty__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__);




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

;

(function ($, document, window) {
  /**
   * Filter Reverse withdrawal transactions
   */
  var Dokan_Reverse_Withdrawal = {
    init: function init() {
      this.init_datepicker();
      $('.reverse-balance-section').on('click', '#reverse_pay', Dokan_Reverse_Withdrawal.add_to_cart);
    },
    init_datepicker: function init_datepicker() {
      // Set date range data.
      var localeData = _objectSpread({
        format: dokan_get_daterange_picker_format()
      }, dokan_helper.daterange_picker_local); // date range picker handler.


      $("#trn_date_filter").daterangepicker({
        autoUpdateInput: false,
        locale: localeData
      }, function (start, end, label) {
        // Set the value for date range field to show frontend.
        $('#trn_date_filter').on('apply.daterangepicker', function (ev, picker) {
          $(this).val(picker.startDate.format(localeData.format) + ' - ' + picker.endDate.format(localeData.format));
        }); // Set the value for date range fields to send backend

        $("#trn_date_form_filter_alt").val(start.format('YYYY-MM-DD'));
        $("#trn_date_to_filter_alt").val(end.format('YYYY-MM-DD'));
      }); // date range picker clear button handler

      $('#trn_date_filter').on('cancel.daterangepicker', function (ev, picker) {
        // Clear date range input fields value on clicking clear button
        $(this).val('');
        $("#trn_date_form_filter_alt").val('');
        $("#trn_date_to_filter_alt").val('');
      });
    },
    add_to_cart: function add_to_cart() {
      var th = $(this);
      var payment_el = $('#reverse_pay_balance');
      Dokan_Reverse_Withdrawal.disableProps();
      var data = {
        price: payment_el.val(),
        _reverse_withdrawal_nonce: dokan.reverse_withdrawal.nonce
      }; // call ajax

      wp.ajax.post('dokan_reverse_withdrawal_payment_to_cart', data).then( /*#__PURE__*/function () {
        var _ref = __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.mark(function _callee(response) {
          var alert_data;
          return __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  alert_data = {
                    action: 'confirm',
                    title: dokan.reverse_withdrawal.on_success_title,
                    icon: 'success',
                    showCloseButton: false,
                    showCancelButton: false,
                    focusConfirm: true
                  };
                  _context.next = 3;
                  return dokan_sweetalert(response.message, alert_data).then(function () {
                    window.location.replace(dokan.reverse_withdrawal.checkout_url);
                  });

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()).fail(function (jqXHR) {
        Dokan_Reverse_Withdrawal.disableProps(false);
        var error_message = dokan_handle_ajax_error(jqXHR);

        if (error_message) {
          dokan_sweetalert(error_message, {
            'action': 'error',
            'title': dokan.reverse_withdrawal.on_error_title,
            'icon': 'error'
          });
        }
      });
    },
    disableProps: function disableProps() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      $('#reverse_pay_balance').prop('disabled', args);
      $('#reverse_pay').prop('disabled', args);
    }
  };
  $(function () {
    // DOM Ready - Let's invoke the init method
    Dokan_Reverse_Withdrawal.init();
  });
})(jQuery, document, window);

/***/ })

},[286]);
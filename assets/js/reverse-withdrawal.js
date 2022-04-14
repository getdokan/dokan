dokanWebpack([5],{

/***/ 277:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

;

(function ($) {
  /**
   * Filter Reverse withdrawal transactions
   */
  var Dokan_Reverse_Withdrawal = {
    init: function init() {
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
    }
  };
  $(function () {
    // DOM Ready - Let's invoke the init method
    Dokan_Reverse_Withdrawal.init();
  });
})(jQuery);

/***/ })

},[277]);
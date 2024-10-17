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

/***/ "./assets/src/js/vendor-address.js":
/*!*****************************************!*\
  !*** ./assets/src/js/vendor-address.js ***!
  \*****************************************/
/***/ (() => {

eval("(function ($, window) {\n  const dokan_address_wrapper = $('.dokan-address-fields');\n  const dokan_address_select = {\n    init: function () {\n      dokan_address_wrapper.on('change', 'select.country_to_state', this.state_select);\n    },\n    state_select: function () {\n      let states_json = wc_country_select_params.countries.replace(/&quot;/g, '\"'),\n        states = $.parseJSON(states_json),\n        $statebox = $('#dokan_address_state'),\n        input_name = $statebox.attr('name'),\n        input_id = $statebox.attr('id'),\n        input_class = $statebox.attr('class'),\n        value = $statebox.val(),\n        selected_state = $('#dokan_selected_state').val(),\n        input_selected_state = $('#dokan_selected_state').val(),\n        country = $(this).val();\n      if (states[country]) {\n        if ($.isEmptyObject(states[country])) {\n          $('div#dokan-states-box').slideUp(2);\n          if ($statebox.is('select')) {\n            $('select#dokan_address_state').replaceWith('<input type=\"text\" class=\"' + input_class + '\" name=\"' + input_name + '\" id=\"' + input_id + '\" required />');\n          }\n          $('#dokan_address_state').val('N/A');\n        } else {\n          input_selected_state = '';\n          let options = '',\n            state = states[country],\n            selected_value = '';\n          for (let index in state) {\n            if (state.hasOwnProperty(index)) {\n              if (selected_state) {\n                if (selected_state == index) {\n                  selected_value = 'selected=\"selected\"';\n                } else {\n                  selected_value = '';\n                }\n              }\n              options = options + '<option value=\"' + index + '\"' + selected_value + '>' + state[index] + '</option>';\n            }\n          }\n          if ($statebox.is('select')) {\n            $('select#dokan_address_state').html('<option value=\"\">' + wc_country_select_params.i18n_select_state_text + '</option>' + options);\n          }\n          if ($statebox.is('input')) {\n            $('input#dokan_address_state').replaceWith('<select type=\"text\" class=\"' + input_class + '\" name=\"' + input_name + '\" id=\"' + input_id + '\" required ></select>');\n            $('select#dokan_address_state').html('<option value=\"\">' + wc_country_select_params.i18n_select_state_text + '</option>' + options);\n          }\n          $('#dokan_address_state').removeClass('dokan-hide');\n          $('div#dokan-states-box').slideDown();\n        }\n      } else {\n        if ($statebox.is('select')) {\n          input_selected_state = '';\n          $('select#dokan_address_state').replaceWith('<input type=\"text\" class=\"' + input_class + '\" name=\"' + input_name + '\" id=\"' + input_id + '\" required=\"required\"/>');\n        }\n        $('#dokan_address_state').val(input_selected_state);\n        if ($('#dokan_address_state').val() == 'N/A') {\n          $('#dokan_address_state').val('');\n        }\n        $('#dokan_address_state').removeClass('dokan-hide');\n        $('div#dokan-states-box').slideDown();\n      }\n      $(document.body).trigger('dokan_vendor_country_to_state_changing', [country]);\n    }\n  };\n  window.dokan_address_select = dokan_address_select;\n  window.dokan_address_select.init();\n  $(document.body).on('dokan_vendor_country_to_state_changing', function (event, country) {\n    // wc_address_i18n_params is required to continue, ensure the object exists\n    if (typeof wc_address_i18n_params === 'undefined') {\n      return false;\n    }\n    var locale_json = wc_address_i18n_params.locale.replace(/&quot;/g, '\"'),\n      locale = JSON.parse(locale_json),\n      thislocale;\n    if (typeof locale[country] !== 'undefined') {\n      thislocale = locale[country];\n    } else {\n      thislocale = locale['default'];\n    }\n    let required = thislocale?.state?.required || undefined === thislocale?.state?.required;\n    if (thislocale?.state?.label) {\n      let labelElement = `${thislocale?.state?.label} ${required ? '<span class=\"required\"> *</span>' : ''}`;\n      $('.dokan-address-fields #dokan-states-box label').html(labelElement);\n      $('.dokan-address-fields #dokan-states-box #dokan_address_state').attr('data-state', thislocale?.state?.label);\n    }\n    $('.dokan-address-fields #dokan-states-box #dokan_address_state').attr('required', required);\n  });\n})(jQuery, window);\n\n//# sourceURL=webpack://dokan/./assets/src/js/vendor-address.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/vendor-address.js"]();
/******/ 	
/******/ })()
;
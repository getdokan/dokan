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

/***/ "./assets/src/js/login-form-popup.js":
/*!*******************************************!*\
  !*** ./assets/src/js/login-form-popup.js ***!
  \*******************************************/
/***/ (() => {

eval("// Dokan Login Form Popup\n(function ($) {\n  dokan.login_form_popup = {\n    form_html: '',\n    form_title: '',\n    init: function () {\n      $('body').on('dokan:login_form_popup:show', this.get_form);\n      $('body').on('submit', '#dokan-login-form-popup-form', this.submit_form);\n      $('body').on('dokan:login_form_popup:working', this.working);\n      $('body').on('dokan:login_form_popup:done_working', this.done_working);\n    },\n    get_form: function (e, options) {\n      if (dokan.login_form_popup.form_html) {\n        dokan.login_form_popup.show_popup();\n        return;\n      }\n      options = $.extend(true, {\n        nonce: dokan.nonce,\n        action: 'dokan_get_login_form'\n      }, options);\n      $('body').trigger('dokan:login_form_popup:fetching_form');\n      $.ajax({\n        url: dokan.ajaxurl,\n        method: 'get',\n        dataType: 'json',\n        data: {\n          _wpnonce: options.nonce,\n          action: options.action\n        }\n      }).done(function (response) {\n        dokan.login_form_popup.form_html = response.data.html;\n        dokan.login_form_popup.form_title = response.data.title;\n        dokan.login_form_popup.show_popup();\n        $('body').trigger('dokan:login_form_popup:fetched_form');\n      });\n    },\n    show_popup: function () {\n      $('body').append('<div id=\"dokan-modal-login-form-popup\"></div>');\n      const modal = $('#dokan-modal-login-form-popup').iziModal({\n        headerColor: dokan.modal_header_color,\n        overlayColor: 'rgba(0, 0, 0, 0.8)',\n        width: 690,\n        onOpened: () => {\n          $('body').trigger('dokan:login_form_popup:opened');\n        }\n      });\n      modal.iziModal('setTitle', dokan.login_form_popup.form_title);\n      modal.iziModal('setContent', dokan.login_form_popup.form_html);\n      modal.iziModal('open');\n    },\n    submit_form: function (e) {\n      e.preventDefault();\n      var form_data = $(this).serialize();\n      var error_section = $('.dokan-login-form-error', '#dokan-login-form-popup-form');\n      error_section.removeClass('has-error').text('');\n      $('body').trigger('dokan:login_form_popup:working');\n      $.ajax({\n        url: dokan.ajaxurl,\n        method: 'post',\n        dataType: 'json',\n        data: {\n          _wpnonce: dokan.nonce,\n          action: 'dokan_login_user',\n          form_data: form_data\n        }\n      }).done(function (response) {\n        $('body').trigger('dokan:login_form_popup:logged_in', response);\n        $('#dokan-modal-login-form-popup').iziModal('close');\n      }).always(function () {\n        $('body').trigger('dokan:login_form_popup:done_working');\n      }).fail(function (jqXHR) {\n        if (jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message) {\n          error_section.addClass('has-error').text(jqXHR.responseJSON.data.message);\n        }\n      });\n    },\n    working: function () {\n      $('fieldset', '#dokan-login-form-popup-form').prop('disabled', true);\n      $('#dokan-login-form-submit-btn').addClass('dokan-hide');\n      $('#dokan-login-form-working-btn').removeClass('dokan-hide');\n    },\n    done_working: function () {\n      $('fieldset', '#dokan-login-form-popup-form').prop('disabled', false);\n      $('#dokan-login-form-submit-btn').removeClass('dokan-hide');\n      $('#dokan-login-form-working-btn').addClass('dokan-hide');\n    }\n  };\n  dokan.login_form_popup.init();\n})(jQuery);\n\n//# sourceURL=webpack://dokan/./assets/src/js/login-form-popup.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/login-form-popup.js"]();
/******/ 	
/******/ })()
;
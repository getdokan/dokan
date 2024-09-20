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

/***/ "./assets/src/js/pointers.js":
/*!***********************************!*\
  !*** ./assets/src/js/pointers.js ***!
  \***********************************/
/***/ (() => {

eval("jQuery(function ($) {\n  setTimeout(init_wc_pointers, 800);\n  function init_wc_pointers() {\n    $.each(Dokan_Pointers.pointers, function (i) {\n      show_wc_pointer(i);\n      return false;\n    });\n  }\n  function show_wc_pointer(id) {\n    var pointer = Dokan_Pointers.pointers[id];\n    var options = $.extend(pointer.options, {\n      close: function () {\n        $.post(dokan_pointer_data.ajaxurl, {\n          screen: dokan_pointer_data.screen,\n          action: 'dokan-dismiss-wp-pointer'\n        });\n      }\n    });\n    var this_pointer = $(pointer.target).pointer(options);\n    this_pointer.pointer('open');\n    if ('next_button' in pointer) {\n      $('.wp-pointer-buttons').append(pointer.next_button);\n    }\n    $('.wp-pointer-buttons').find('a.close').addClass('dokan button button-secondary');\n    if (pointer.next_trigger) {\n      $(pointer.next_trigger.target).on(pointer.next_trigger.event, function () {\n        setTimeout(function () {\n          this_pointer.pointer('close');\n          show_wc_pointer(pointer.next);\n        }, 200);\n      });\n    }\n  }\n});\n\n//# sourceURL=webpack://dokan/./assets/src/js/pointers.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/pointers.js"]();
/******/ 	
/******/ })()
;
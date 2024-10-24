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

/***/ "./assets/src/js/customize-preview.js":
/*!********************************************!*\
  !*** ./assets/src/js/customize-preview.js ***!
  \********************************************/
/***/ (() => {

eval("(function ($, api) {\n  api('dokan_appearance[store_map]', function (value) {\n    value.bind(function (show) {\n      var div = $('.dokan-store-widget.dokan-store-location');\n      if (show) {\n        div.show();\n      } else {\n        div.hide();\n      }\n    });\n  });\n  api.selectiveRefresh.bind('partial-content-rendered', function (placement) {\n    console.log(placement);\n  });\n})(jQuery, wp.customize);\n\n//# sourceURL=webpack://dokan/./assets/src/js/customize-preview.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/customize-preview.js"]();
/******/ 	
/******/ })()
;
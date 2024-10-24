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

/***/ "./assets/src/js/customize-controls.js":
/*!*********************************************!*\
  !*** ./assets/src/js/customize-controls.js ***!
  \*********************************************/
/***/ (() => {

eval("(function (api) {\n  /**\n   * Run function when customizer is ready.\n   */\n  api.bind('ready', function () {\n    /**\n     * Set if widget controls should show\n     *\n     * @param {bool} isActive\n     */\n    var widgetControlsVisibility = function (isActive) {\n      api.control('sidebar_heading').active.set(isActive);\n      api.control('store_map').active.set(isActive);\n      api.control('contact_seller').active.set(isActive);\n      api.control('store_open_close').active.set(isActive);\n    };\n\n    /**\n     * Navigate to a store page when in \"Store Page\" section\n     */\n    api.section('dokan_store', function (section) {\n      section.expanded.bind(function (isExpanded) {\n        // console.log('dokan store expanded', isExpanded);\n        // var url;\n        // if (isExpanded) {\n        //   url = api.settings.url.home;\n        //   api.previewer.previewUrl.set(url);\n        // }\n      });\n    });\n\n    /**\n     * Show/hide controls when page layout changes\n     */\n    api.control('store_layout', function (control) {\n      control.setting.bind(function (value) {\n        var display = value !== 'full';\n        api.control('enable_theme_sidebar').active.set(display);\n        widgetControlsVisibility(display);\n      });\n    });\n\n    /**\n     * Show hide controls if using theme sidebar\n     */\n    api.control('enable_theme_sidebar', function (control) {\n      control.setting.bind(function (checked) {\n        var display = checked ? false : true;\n        widgetControlsVisibility(display);\n      });\n    });\n  });\n})(wp.customize);\n\n//# sourceURL=webpack://dokan/./assets/src/js/customize-controls.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/customize-controls.js"]();
/******/ 	
/******/ })()
;
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

/***/ "./assets/src/js/page-views.js":
/*!*************************************!*\
  !*** ./assets/src/js/page-views.js ***!
  \*************************************/
/***/ (() => {

eval("/* global dokanPageViewsParams */\n\njQuery(document).ready(function ($) {\n  if (!localStorage) {\n    return;\n  }\n  if (!window.dokanPageViewsParams) {\n    return;\n  }\n\n  // Get today's date in the format of YYYY-MM-DD\n  let newDate = new Date().toISOString().slice(0, 10);\n  let dokanPageViewCount = JSON.parse(localStorage.getItem(\"dokan_pageview_count\"));\n\n  // If there is no data in local storage or today's date is not same as the date in local storage.\n  if (dokanPageViewCount === null || dokanPageViewCount.today && dokanPageViewCount.today !== newDate) {\n    dokanPageViewCount = {\n      \"today\": newDate,\n      \"post_ids\": []\n    };\n  }\n\n  // If the post id is not in the local storage, then send the ajax request.\n  if (!dokanPageViewCount.post_ids.includes(window.dokanPageViewsParams.post_id)) {\n    $.post(window.dokanPageViewsParams.ajax_url, {\n      action: \"dokan_pageview\",\n      _ajax_nonce: window.dokanPageViewsParams.nonce,\n      post_id: window.dokanPageViewsParams.post_id\n    });\n\n    // Add the post id to the local storage.\n    dokanPageViewCount.post_ids.push(window.dokanPageViewsParams.post_id);\n    localStorage.setItem(\"dokan_pageview_count\", JSON.stringify(dokanPageViewCount));\n  }\n});\n\n//# sourceURL=webpack://dokan/./assets/src/js/page-views.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/page-views.js"]();
/******/ 	
/******/ })()
;
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

/***/ "./assets/src/js/dokan-frontend.js":
/*!*****************************************!*\
  !*** ./assets/src/js/dokan-frontend.js ***!
  \*****************************************/
/***/ (() => {

eval(";\n(function ($, document, window) {\n  // this file will load on every pages on frontend\n  const DOKAN_FRONTEND_SCRIPT = {\n    init() {\n      $('.product-cat-stack-dokan li.has-children').on('click', '> a span.caret-icon', this.toggle_product_widget_category_dropdown);\n      $('.store-cat-stack-dokan li.has-children').on('click', '> a span.caret-icon', this.toggle_store_category_widget_dropdown);\n    },\n    toggle_product_widget_category_dropdown(e) {\n      e.preventDefault();\n      let self = $(this),\n        liHasChildren = self.closest('li.has-children');\n      if (!liHasChildren.find('> ul.children').is(':visible')) {\n        self.find('i.fa').addClass('fa-rotate-90');\n        if (liHasChildren.find('> ul.children').hasClass('level-0')) {\n          self.closest('a').css({\n            borderBottom: 'none'\n          });\n        }\n      }\n      liHasChildren.find('> ul.children').slideToggle('fast', function () {\n        if (!$(this).is(':visible')) {\n          self.find('i.fa').removeClass('fa-rotate-90');\n          if (liHasChildren.find('> ul.children').hasClass('level-0')) {\n            self.closest('a').css({\n              borderBottom: '1px solid #eee'\n            });\n          }\n        }\n      });\n    },\n    toggle_store_category_widget_dropdown(e) {\n      e.preventDefault();\n      var self = $(this),\n        liHasChildren = self.closest('li.has-children');\n      if (!liHasChildren.find('> ul.children').is(':visible')) {\n        self.find('i.fa').addClass('fa-rotate-90');\n        if (liHasChildren.find('> ul.children').hasClass('level-0')) {\n          self.closest('a').css({\n            borderBottom: 'none'\n          });\n        }\n      }\n      liHasChildren.find('> ul.children').slideToggle('fast', function () {\n        if (!$(this).is(':visible')) {\n          self.find('i.fa').removeClass('fa-rotate-90');\n          if (liHasChildren.find('> ul.children').hasClass('level-0')) {\n            self.closest('a').css({\n              borderBottom: '1px solid #eee'\n            });\n          }\n        }\n      });\n    },\n    init_category_widget_css() {\n      let withChildren = $('.cat-drop-stack ul li.has-children.parent-cat-wrap').find('ul.children.level-0');\n      withChildren.each(function (i, element) {\n        $(element).parent().find('a span.caret-icon').each(function (i, caret) {\n          caret.click();\n        });\n      });\n      let selectedLi = $('.cat-drop-stack ul').find('a.selected');\n      selectedLi.css({\n        fontWeight: 'bold'\n      });\n      selectedLi.parents('ul.children').each(function (i, val) {\n        $(val).css({\n          display: 'block'\n        });\n      });\n    }\n  };\n  $(function () {\n    // DOM Ready - Let's invoke the init method\n    DOKAN_FRONTEND_SCRIPT.init();\n    DOKAN_FRONTEND_SCRIPT.init_category_widget_css();\n  });\n})(jQuery, document, window);\n\n//# sourceURL=webpack://dokan/./assets/src/js/dokan-frontend.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./assets/src/js/dokan-frontend.js"]();
/******/ 	
/******/ })()
;
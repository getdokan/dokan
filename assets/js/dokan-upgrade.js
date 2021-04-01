dokanWebpack([3],{

/***/ 23:
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),

/***/ 249:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__App_vue__ = __webpack_require__(250);

var Vue = dokan_get_lib('Vue');
new Vue({
  el: '#dokan-upgrade-notice',
  render: function render(h) {
    return h(__WEBPACK_IMPORTED_MODULE_0__App_vue__["a" /* default */]);
  },
  created: function created() {
    this.setLocaleData(dokan.i18n['dokan-lite']);
  }
});

/***/ }),

/***/ 250:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(91);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_46238d45_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(252);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(251)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_46238d45_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/upgrade/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-46238d45", Component.options)
  } else {
    hotAPI.reload("data-v-46238d45", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 251:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 252:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      class: [
        "wp-clearfix notice",
        !_vm.updateCompleted ? "notice-info" : "updated"
      ],
      style: _vm.containerStyle,
      attrs: { id: "dokan-upgrade-notice" }
    },
    [
      _c("div", { attrs: { id: "dokan-upgrade-notice-icon" } }, [
        _c("img", {
          attrs: { src: _vm.dokanLogo, alt: _vm.__("Dokan Logo", "dokan-lite") }
        })
      ]),
      _vm._v(" "),
      _c(
        "div",
        { attrs: { id: "dokan-upgrade-notice-message" } },
        [
          !_vm.updateCompleted
            ? [
                _c("div", { attrs: { id: "dokan-upgrade-notice-title" } }, [
                  _vm._v(
                    "\n                " +
                      _vm._s(
                        _vm.__("Dokan Data Update Required", "dokan-lite")
                      ) +
                      "\n            "
                  )
                ]),
                _vm._v(" "),
                _c("div", { attrs: { id: "dokan-upgrade-notice-content" } }, [
                  !_vm.showConfirmation
                    ? _c("p", [
                        _vm._v(
                          _vm._s(
                            _vm.__(
                              "We need to update your install to the latest version",
                              "dokan-lite"
                            )
                          )
                        )
                      ])
                    : _c("p", { staticClass: "text-danger" }, [
                        _vm._v(
                          _vm._s(
                            _vm.__(
                              "It is strongly recommended that you backup your database before proceeding. Are you sure you wish to run the updater now?",
                              "dokan-lite"
                            )
                          )
                        )
                      ])
                ]),
                _vm._v(" "),
                _c(
                  "div",
                  { attrs: { id: "dokan-upgrade-notice-buttons" } },
                  [
                    !_vm.isUpgrading && !_vm.showConfirmation
                      ? _c("button", {
                          staticClass: "button button-primary",
                          domProps: {
                            textContent: _vm._s(_vm.__("Update", "dokan-lite"))
                          },
                          on: {
                            click: function($event) {
                              _vm.showConfirmation = true
                            }
                          }
                        })
                      : [
                          _c("button", {
                            staticClass: "button button-primary",
                            attrs: { disabled: _vm.isUpgrading },
                            domProps: {
                              textContent: _vm._s(
                                _vm.__("Yes, Update Now", "dokan-lite")
                              )
                            },
                            on: { click: _vm.doUpgrade }
                          }),
                          _vm._v(" "),
                          _c("button", {
                            staticClass: "button",
                            attrs: { disabled: _vm.isUpgrading },
                            domProps: {
                              textContent: _vm._s(
                                _vm.__("No, Cancel", "dokan-lite")
                              )
                            },
                            on: {
                              click: function($event) {
                                _vm.showConfirmation = false
                              }
                            }
                          })
                        ]
                  ],
                  2
                )
              ]
            : [
                _c("div", { attrs: { id: "dokan-upgrade-notice-title" } }, [
                  _vm._v(
                    "\n                " +
                      _vm._s(
                        _vm.__("Dokan Data Updated Successfully!", "dokan-lite")
                      ) +
                      "\n            "
                  )
                ]),
                _vm._v(" "),
                _c("div", { attrs: { id: "dokan-upgrade-notice-content" } }, [
                  _c("p", [
                    _vm._v(
                      _vm._s(
                        _vm.__(
                          "All data updated successfully. Thank you for using Dokan.",
                          "dokan-lite"
                        )
                      )
                    )
                  ])
                ]),
                _vm._v(" "),
                _c("div", { attrs: { id: "dokan-upgrade-notice-buttons" } }, [
                  _c("button", {
                    staticClass: "button",
                    domProps: {
                      textContent: _vm._s(_vm.__("Close", "dokan-lite"))
                    },
                    on: { click: _vm.refreshPage }
                  })
                ])
              ]
        ],
        2
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-46238d45", esExports)
  }
}

/***/ }),

/***/ 40:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = setLocaleData;
/* unused harmony export getI18n */
/* harmony export (immutable) */ __webpack_exports__["a"] = __;
/* unused harmony export _x */
/* unused harmony export _n */
/* harmony export (immutable) */ __webpack_exports__["b"] = _nx;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return sprintf; });
/**
 * External dependencies
 */
var i18n = {};
/**
 * Creates a new Jed instance with specified locale data configuration.
 *
 * @see http://messageformat.github.io/Jed/
 *
 * @param {Object} data Locale data configuration.
 */

function setLocaleData(data) {
  var jed = new Jed(data);
  i18n[jed._textdomain] = jed;
}
/**
 * Returns the current Jed instance, initializing with a default configuration
 * if not already assigned.
 *
 * @return {Jed} Jed instance.
 */

function getI18n() {
  var domain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!i18n[domain]) {
    setLocaleData({
      '': {}
    });
  }

  return i18n[domain];
}
/**
 * Retrieve the translation of text.
 *
 * @see https://developer.wordpress.org/reference/functions/__/
 *
 * @param {string} text Text to translate.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} Translated text.
 */

function __(text, domain) {
  return getI18n(domain) ? getI18n(domain).dgettext(domain, text) : text;
}
/**
 * Retrieve translated string with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_x/
 *
 * @param {string} text    Text to translate.
 * @param {string} context Context information for the translators.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} Translated context string without pipe.
 */

function _x(text, context, domain) {
  return getI18n(domain).dpgettext(domain, context, text);
}
/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number.
 *
 * @see https://developer.wordpress.org/reference/functions/_n/
 *
 * @param {string} single The text to be used if the number is singular.
 * @param {string} plural The text to be used if the number is plural.
 * @param {number} number The number to compare against to use either the
 *                         singular or plural form.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */

function _n(single, plural, number, domain) {
  return getI18n(domain).dngettext(domain, single, plural, number);
}
/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number, with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_nx/
 *
 * @param {string} single  The text to be used if the number is singular.
 * @param {string} plural  The text to be used if the number is plural.
 * @param {number} number  The number to compare against to use either the
 *                          singular or plural form.
 * @param {string} context Context information for the translators.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */

function _nx(single, plural, number, context, domain) {
  return getI18n(domain).dnpgettext(domain, context, single, plural, number);
}
/**
 * Returns a formatted string.
 *
 * @see http://www.diveintojavascript.com/projects/javascript-sprintf
 *
 * @type {string}
 */

var sprintf = Jed.sprintf;

/***/ }),

/***/ 91:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_i18n__ = __webpack_require__(40);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["a"] = ({
  data: function data() {
    return {
      isUpgrading: false,
      showConfirmation: false,
      updateCompleted: false
    };
  },
  computed: {
    dokanLogo: function dokanLogo() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-logo-small.svg");
    },
    containerStyle: function containerStyle() {
      return {
        backgroundImage: "url(".concat(dokan.urls.assetsUrl, "/images/dokan-notification-banner.svg)")
      };
    }
  },
  methods: {
    doUpgrade: function doUpgrade() {
      var _this = this;

      this.isUpgrading = true;
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajax({
        url: dokan.ajaxurl,
        method: 'post',
        dataType: 'json',
        data: {
          action: 'dokan_do_upgrade',
          _wpnonce: dokan.nonce
        }
      }).always(function () {
        _this.isUpgrading = false;
      }).done(function () {
        _this.updateCompleted = true;
      });
    },
    refreshPage: function refreshPage() {
      window.location.reload();
    }
  }
});

/***/ })

},[249]);
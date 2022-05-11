dokanWebpack([4],{

/***/ 1:
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),

/***/ 17:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_AdminNotice_vue__ = __webpack_require__(2);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0f724387_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_AdminNotice_vue__ = __webpack_require__(18);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_AdminNotice_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_0f724387_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_AdminNotice_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/AdminNotice.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0f724387", Component.options)
  } else {
    hotAPI.reload("data-v-0f724387", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 18:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "notice dokan-admin-notices-wrap" }, [
    _vm.notices && _vm.notices.length
      ? _c(
          "div",
          { staticClass: "dokan-admin-notices" },
          [
            _c(
              "transition-group",
              {
                staticClass: "dokan-notice-slides",
                attrs: { name: _vm.transitionName, tag: "div" }
              },
              [
                _vm._l(_vm.notices, function(notice, index) {
                  return [
                    _c(
                      "div",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: index + 1 === _vm.current_notice,
                            expression: "(index + 1) === current_notice"
                          }
                        ],
                        key: index,
                        staticClass: "dokan-admin-notice",
                        class: "dokan-" + notice.type,
                        on: {
                          mouseenter: _vm.stopAutoSlide,
                          mouseleave: _vm.startAutoSlide
                        }
                      },
                      [
                        _c(
                          "div",
                          {
                            staticClass: "notice-content",
                            style:
                              !notice.title ||
                              !notice.actions ||
                              !notice.description
                                ? "align-items: center"
                                : "align-items: start"
                          },
                          [
                            _c("div", { staticClass: "logo-wrap" }, [
                              _c("div", { staticClass: "dokan-logo" }),
                              _vm._v(" "),
                              _c("span", {
                                staticClass: "dokan-icon",
                                class: "dokan-icon-" + notice.type
                              })
                            ]),
                            _vm._v(" "),
                            _c(
                              "div",
                              { staticClass: "dokan-message" },
                              [
                                notice.title
                                  ? _c("h3", [_vm._v(_vm._s(notice.title))])
                                  : _vm._e(),
                                _vm._v(" "),
                                notice.description
                                  ? _c("div", {
                                      domProps: {
                                        innerHTML: _vm._s(notice.description)
                                      }
                                    })
                                  : _vm._e(),
                                _vm._v(" "),
                                notice.actions && notice.actions.length
                                  ? [
                                      _vm._l(notice.actions, function(action) {
                                        return [
                                          action.action
                                            ? _c(
                                                "a",
                                                {
                                                  staticClass: "dokan-btn",
                                                  class: [
                                                    "dokan-btn-" + action.type,
                                                    action.class
                                                  ],
                                                  attrs: {
                                                    target: action.target
                                                      ? action.target
                                                      : "_self",
                                                    href: action.action
                                                  }
                                                },
                                                [_vm._v(_vm._s(action.text))]
                                              )
                                            : _c(
                                                "button",
                                                {
                                                  staticClass:
                                                    "dokan-btn btn-dokan",
                                                  class: [
                                                    "dokan-btn-" + action.type,
                                                    action.class
                                                  ],
                                                  attrs: {
                                                    disabled: _vm.loading
                                                  },
                                                  on: {
                                                    click: function($event) {
                                                      return _vm.handleAction(
                                                        action,
                                                        index
                                                      )
                                                    }
                                                  }
                                                },
                                                [
                                                  _vm._v(
                                                    _vm._s(
                                                      _vm.loading ||
                                                        _vm.task_completed
                                                        ? _vm.button_text
                                                        : action.text
                                                    )
                                                  )
                                                ]
                                              )
                                        ]
                                      })
                                    ]
                                  : _vm._e()
                              ],
                              2
                            ),
                            _vm._v(" "),
                            notice.show_close_button && notice.close_url
                              ? _c(
                                  "a",
                                  {
                                    staticClass: "close-notice",
                                    attrs: { href: notice.close_url }
                                  },
                                  [
                                    _c("span", {
                                      staticClass: "dashicons dashicons-no-alt"
                                    })
                                  ]
                                )
                              : _vm._e(),
                            _vm._v(" "),
                            notice.show_close_button && notice.ajax_data
                              ? _c(
                                  "button",
                                  {
                                    staticClass: "close-notice",
                                    attrs: { disabled: _vm.loading },
                                    on: {
                                      click: function($event) {
                                        return _vm.hideNotice(notice, index)
                                      }
                                    }
                                  },
                                  [
                                    _c("span", {
                                      staticClass: "dashicons dashicons-no-alt"
                                    })
                                  ]
                                )
                              : _vm._e()
                          ]
                        )
                      ]
                    )
                  ]
                })
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.notices.length > 1,
                    expression: "notices.length > 1"
                  }
                ],
                staticClass: "slide-notice"
              },
              [
                _c(
                  "span",
                  {
                    staticClass: "prev",
                    class: { active: _vm.current_notice > 1 },
                    on: {
                      click: function($event) {
                        return _vm.prevNotice()
                      }
                    }
                  },
                  [
                    _c(
                      "svg",
                      {
                        attrs: {
                          width: "8",
                          height: "13",
                          viewBox: "0 0 8 13",
                          fill: "none",
                          xmlns: "http://www.w3.org/2000/svg"
                        }
                      },
                      [
                        _c("path", {
                          attrs: {
                            d:
                              "M0.791129 6.10203L6.4798 0.415254C6.72942 0.166269 7.13383 0.166269 7.38408 0.415254C7.63369 0.664239 7.63369 1.06866 7.38408 1.31764L2.14663 6.5532L7.38345 11.7888C7.63306 12.0377 7.63306 12.4422 7.38345 12.6918C7.13383 12.9408 6.72879 12.9408 6.47917 12.6918L0.790498 7.005C0.544665 6.75859 0.544666 6.34781 0.791129 6.10203Z",
                            fill: "#DADFE4"
                          }
                        })
                      ]
                    )
                  ]
                ),
                _vm._v(" "),
                _c("span", { staticClass: "notice-count" }, [
                  _c(
                    "span",
                    {
                      staticClass: "current-notice",
                      class: { active: _vm.current_notice > 1 }
                    },
                    [_vm._v(_vm._s(_vm.current_notice))]
                  ),
                  _vm._v(" of "),
                  _c(
                    "span",
                    {
                      staticClass: "total-notice",
                      class: { active: _vm.current_notice < _vm.notices.length }
                    },
                    [_vm._v(_vm._s(_vm.notices.length))]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "next",
                    class: { active: _vm.current_notice < _vm.notices.length },
                    on: {
                      click: function($event) {
                        return _vm.nextNotice()
                      }
                    }
                  },
                  [
                    _c(
                      "svg",
                      {
                        attrs: {
                          width: "8",
                          height: "13",
                          viewBox: "0 0 8 13",
                          fill: "none",
                          xmlns: "http://www.w3.org/2000/svg"
                        }
                      },
                      [
                        _c("path", {
                          attrs: {
                            d:
                              "M7.43934 6.10203L1.75067 0.415254C1.50105 0.166269 1.09664 0.166269 0.846391 0.415254C0.596776 0.664239 0.596776 1.06866 0.846391 1.31764L6.08384 6.5532L0.847021 11.7888C0.597406 12.0377 0.597406 12.4422 0.847021 12.6918C1.09664 12.9408 1.50168 12.9408 1.7513 12.6918L7.43997 7.005C7.6858 6.75859 7.6858 6.34781 7.43934 6.10203Z",
                            fill: "#DADFE4"
                          }
                        })
                      ]
                    )
                  ]
                )
              ]
            )
          ],
          1
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-0f724387", esExports)
  }
}

/***/ }),

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
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
  name: "AdminNotice",
  props: {
    endpoint: {
      type: String,
      default: 'admin'
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  data: function data() {
    return {
      timer: null,
      notices: [],
      loading: false,
      button_text: '',
      current_notice: 1,
      task_completed: false,
      transitionName: 'slide-next'
    };
  },
  created: function created() {
    this.fetch();
  },
  methods: {
    fetch: function fetch() {
      var _this = this;

      dokan.api.get("/admin/notices/".concat(this.endpoint)).done(function (response) {
        _this.notices = response.filter(function (notice) {
          return notice.description || notice.title;
        });

        _this.startAutoSlide();
      });
    },
    slideNotice: function slideNotice(n) {
      this.current_notice += n;
      n === 1 ? this.transitionName = "slide-next" : this.transitionName = "slide-prev";
      var len = this.notices.length;

      if (this.current_notice < 1) {
        this.current_notice = len;
      }

      if (this.current_notice > len) {
        this.current_notice = 1;
      }
    },
    nextNotice: function nextNotice() {
      this.stopAutoSlide();
      this.slideNotice(1);
    },
    prevNotice: function prevNotice() {
      this.stopAutoSlide();
      this.slideNotice(-1);
    },
    startAutoSlide: function startAutoSlide() {
      var _this2 = this;

      if (!this.loading && this.notices.length > 1) {
        this.timer = setInterval(function () {
          _this2.slideNotice(1);
        }, this.interval);
      }
    },
    stopAutoSlide: function stopAutoSlide() {
      if (!this.loading && this.notices.length > 1) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    hideNotice: function hideNotice(notice, index) {
      var _this3 = this;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajax({
        url: dokan.ajaxurl,
        method: 'post',
        dataType: 'json',
        data: notice.ajax_data
      }).done(function () {
        _this3.notices.splice(index, 1);

        _this3.slideNotice(1);
      });
    },
    handleAction: function handleAction(action, index) {
      var _this4 = this;

      if (action.confirm_message) {
        this.$swal({
          title: this.__('Are you sure?', 'dokan-lite'),
          type: 'warning',
          html: action.confirm_message,
          showCancelButton: true,
          confirmButtonText: action.text,
          cancelButtonText: this.__('Cancel', 'dokan-lite')
        }).then(function (response) {
          if (response.value) {
            _this4.handleRequest(action, index);
          }
        });
      } else {
        this.handleRequest(action, index);
      }
    },
    handleRequest: function handleRequest(action, index) {
      var _this5 = this;

      this.loading = true;
      this.button_text = action.loading_text ? action.loading_text : this.__('Loading...', 'dokan-lite');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajax({
        url: dokan.ajaxurl,
        method: 'post',
        dataType: 'json',
        data: action.ajax_data
      }).always(function () {
        _this5.loading = false;
      }).done(function () {
        _this5.button_text = action.completed_text ? action.completed_text : action.text;
        _this5.task_completed = true;

        if (action.reload) {
          window.location.reload();
        } else {
          _this5.notices.splice(index, 1);

          _this5.slideNotice(1);
        }
      });
    }
  }
});

/***/ }),

/***/ 263:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__App_vue__ = __webpack_require__(264);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jquery__);


var Vue = dokan_get_lib('Vue');

if (__WEBPACK_IMPORTED_MODULE_1_jquery___default()('#dokan-admin-notices').length) {
  new Vue({
    el: '#dokan-admin-notices',
    render: function render(h) {
      return h(__WEBPACK_IMPORTED_MODULE_0__App_vue__["a" /* default */]);
    },
    created: function created() {
      this.setLocaleData(dokan.i18n['dokan-lite']);
    }
  });
}

/***/ }),

/***/ 264:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(95);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_8a647c3a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(265);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_8a647c3a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/notice/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8a647c3a", Component.options)
  } else {
    hotAPI.reload("data-v-8a647c3a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),

/***/ 265:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("AdminNotice", { attrs: { endpoint: "global" } })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-8a647c3a", esExports)
  }
}

/***/ }),

/***/ 95:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__admin_components_AdminNotice_vue__ = __webpack_require__(17);
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  name: "App",
  components: {
    AdminNotice: __WEBPACK_IMPORTED_MODULE_0__admin_components_AdminNotice_vue__["a" /* default */]
  }
});

/***/ })

},[263]);
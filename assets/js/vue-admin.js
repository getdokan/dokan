pluginWebpack([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'App'
});

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_wp_list_table__ = __webpack_require__(10);
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

    name: 'Home',

    components: {
        ListTable: __WEBPACK_IMPORTED_MODULE_0_vue_wp_list_table__["default"]
    },

    data() {
        return {
            showCb: true,

            sortBy: 'title',
            sortOrder: 'asc',

            totalItems: 15,
            perPage: 3,
            totalPages: 5,
            currentPage: 1,
            loading: false,

            columns: {
                'title': {
                    label: 'Title',
                    sortable: true
                },
                'author': {
                    label: 'Author',
                    sortable: true
                }
            },
            actionColumn: 'title',
            actions: [{
                key: 'edit',
                label: 'Edit'
            }, {
                key: 'trash',
                label: 'Delete'
            }],
            bulkActions: [{
                key: 'trash',
                label: 'Move to Trash'
            }],
            books: [
                // {
                //     id: 1,
                //     title: 'Wings of Fire: An Autobiography',
                //     author: ['A.P.J. Abdul Kalam'],
                //     image: 'https://images.gr-assets.com/books/1295670969l/634583.jpg'
                // },
                // {
                //     id: 2,
                //     title: 'Who Moved My Cheese?',
                //     author: ['Spencer Johnson', 'Kenneth H. Blanchard'],
                //     image: 'https://images.gr-assets.com/books/1388639717l/4894.jpg'
                // },
                // {
                //     id: 3,
                //     title: 'Option B',
                //     author: ['Sheryl Sandberg', 'Adam Grant', 'Adam M. Grant'],
                //     image: 'https://images.gr-assets.com/books/1493998427l/32938155.jpg'
                // }
            ]
        };
    },

    created() {

        this.loadBooks();
    },

    methods: {

        loadBooks(time = 100) {

            let self = this;

            self.loading = true;

            setTimeout(function () {
                self.books = [{
                    id: 1,
                    title: 'Wings of Fire: An Autobiography',
                    author: ['A.P.J. Abdul Kalam'],
                    image: 'https://images.gr-assets.com/books/1295670969l/634583.jpg'
                }, {
                    id: 2,
                    title: 'Who Moved My Cheese?',
                    author: ['Spencer Johnson', 'Kenneth H. Blanchard'],
                    image: 'https://images.gr-assets.com/books/1388639717l/4894.jpg'
                }, {
                    id: 3,
                    title: 'Option B',
                    author: ['Sheryl Sandberg', 'Adam Grant', 'Adam M. Grant'],
                    image: 'https://images.gr-assets.com/books/1493998427l/32938155.jpg'
                }];

                self.loading = false;
            }, time);
        },

        onActionClick(action, row) {
            if ('trash' === action) {
                if (confirm('Are you sure to delete?')) {
                    alert('deleted: ' + row.title);
                }
            }
        },

        goToPage(page) {
            console.log('Going to page: ' + page);
            this.currentPage = page;
            this.loadBooks(1000);
        },

        onBulkAction(action, items) {
            console.log(action, items);
            alert(action + ': ' + items.join(', '));
        },

        sortCallback(column, order) {
            this.sortBy = column;
            this.sortOrder = order;

            this.loadBooks(1000);
        }
    }
});

/***/ }),
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Settings',

    data() {
        return {};
    }
});

/***/ }),
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _App = __webpack_require__(27);

var _App2 = _interopRequireDefault(_App);

var _router = __webpack_require__(30);

var _router2 = _interopRequireDefault(_router);

var _adminMenuFix = __webpack_require__(40);

var _adminMenuFix2 = _interopRequireDefault(_adminMenuFix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.config.productionTip = false;

/* eslint-disable no-new */
new _vue2.default({
    el: '#vue-admin-app',
    router: _router2.default,
    render: function render(h) {
        return h(_App2.default);
    }
});

// fix the admin menu for the slug "vue-app"
(0, _adminMenuFix2.default)('vue-app');

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(8);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(29);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(28)
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
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3a030f38", Component.options)
  } else {
    hotAPI.reload("data-v-3a030f38", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 28 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "vue-backend-app" } }, [_c("router-view")], 1)
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3a030f38", esExports)
  }
}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(4);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _Home = __webpack_require__(31);

var _Home2 = _interopRequireDefault(_Home);

var _Settings = __webpack_require__(37);

var _Settings2 = _interopRequireDefault(_Settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);

exports.default = new _vueRouter2.default({
    routes: [{
        path: '/',
        name: 'Home',
        component: _Home2.default
    }, {
        path: '/settings',
        name: 'Settings',
        component: _Settings2.default
    }]
});

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Home_vue__ = __webpack_require__(9);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d05f0e2_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Home_vue__ = __webpack_require__(36);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(32)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Home_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d05f0e2_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Home_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Home.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d05f0e2", Component.options)
  } else {
    hotAPI.reload("data-v-2d05f0e2", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 32 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "home" },
    [
      _c("h1", { staticClass: "wp-heading-inline" }, [_vm._v("Books")]),
      _vm._v(" "),
      _c("a", { staticClass: "page-title-action", attrs: { href: "#" } }, [
        _vm._v("Add New")
      ]),
      _vm._v(" "),
      _c(
        "list-table",
        {
          attrs: {
            columns: _vm.columns,
            loading: _vm.loading,
            rows: _vm.books,
            actions: _vm.actions,
            "show-cb": _vm.showCb,
            "total-items": _vm.totalItems,
            "bulk-actions": _vm.bulkActions,
            "total-pages": _vm.totalPages,
            "per-page": _vm.perPage,
            "current-page": _vm.currentPage,
            "action-column": _vm.actionColumn,
            "sort-by": _vm.sortBy,
            "sort-order": _vm.sortOrder
          },
          on: {
            sort: _vm.sortCallback,
            pagination: _vm.goToPage,
            "action:click": _vm.onActionClick,
            "bulk:click": _vm.onBulkAction
          },
          scopedSlots: _vm._u([
            {
              key: "title",
              fn: function(data) {
                return [
                  _c("img", {
                    attrs: {
                      src: data.row.image,
                      alt: data.row.title,
                      width: "50"
                    }
                  }),
                  _vm._v(" "),
                  _c("strong", [
                    _c("a", { attrs: { href: "#" } }, [
                      _vm._v(_vm._s(data.row.title))
                    ])
                  ])
                ]
              }
            },
            {
              key: "author",
              fn: function(data) {
                return [
                  _vm._v(
                    "\n            " +
                      _vm._s(data.row.author.join(", ")) +
                      "\n        "
                  )
                ]
              }
            }
          ])
        },
        [
          _c("template", { slot: "filters" }, [
            _c("select", [
              _c("option", { attrs: { value: "All Dates" } }, [
                _vm._v("All Dates")
              ])
            ]),
            _vm._v(" "),
            _c("button", { staticClass: "button" }, [_vm._v("Filter")])
          ])
        ],
        2
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2d05f0e2", esExports)
  }
}

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__ = __webpack_require__(12);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_61e400d3_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__ = __webpack_require__(39);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(38)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-61e400d3"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_61e400d3_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Settings.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-61e400d3", Component.options)
  } else {
    hotAPI.reload("data-v-61e400d3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 38 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "app-settings" }, [
    _vm._v("\n    The Settings Page\n")
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-61e400d3", esExports)
  }
}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * As we are using hash based navigation, hack fix
 * to highlight the current selected menu
 *
 * Requires jQuery
 */
function menuFix(slug) {
    var $ = jQuery;

    var menuRoot = $('#toplevel_page_' + slug);
    var currentUrl = window.location.href;
    var currentPath = currentUrl.substr(currentUrl.indexOf('admin.php'));

    menuRoot.on('click', 'a', function () {
        var self = $(this);

        $('ul.wp-submenu li', menuRoot).removeClass('current');

        if (self.hasClass('wp-has-submenu')) {
            $('li.wp-first-item', menuRoot).addClass('current');
        } else {
            self.parents('li').addClass('current');
        }
    });

    $('ul.wp-submenu a', menuRoot).each(function (index, el) {
        if ($(el).attr('href') === currentPath) {
            $(el).parent().addClass('current');
            return;
        }
    });
}

exports.default = menuFix;

/***/ })
],[26]);
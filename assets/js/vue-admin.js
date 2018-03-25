dokanWebpack([0],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__ = __webpack_require__(4);



/* harmony default export */ __webpack_exports__["a"] = ({
    extends: __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__["Line"],
    props: ['data'],
    data() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                        scaleLabel: {
                            display: false
                        },
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            fontColor: '#aaa',
                            fontSize: 11
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: false
                        },
                        ticks: {
                            fontColor: '#aaa'
                        }
                    }]
                },
                legend: {
                    position: 'top',
                    onClick: false
                },
                elements: {
                    line: {
                        tension: 0,
                        borderWidth: 4
                    },
                    point: {
                        radius: 5,
                        borderWidth: 3,
                        backgroundColor: '#fff',
                        borderColor: '#fff'
                    }
                },
                tooltips: {
                    displayColors: false,
                    callbacks: {
                        label: function (tooltipItems, data) {
                            let label = data.datasets[tooltipItems.datasetIndex].label || '';
                            let customLabel = data.datasets[tooltipItems.datasetIndex].tooltipLabel || '';
                            let prefix = data.datasets[tooltipItems.datasetIndex].tooltipPrefix || '';

                            let tooltipLabel = customLabel ? customLabel + ': ' : label + ': ';

                            tooltipLabel += prefix + tooltipItems.yLabel;

                            return tooltipLabel;
                        }
                    }
                }
            }
        };
    },
    mounted() {
        this.renderChart(this.data, this.options);
    }
});

/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__ = __webpack_require__(2);
/* empty harmony namespace reexport */
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__["a" /* default */],
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Chart.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-28c376de", Component.options)
  } else {
    hotAPI.reload("data-v-28c376de", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
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
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__ = __webpack_require__(7);
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

let Postbox = dokan_get_lib('Postbox');
let Loading = dokan_get_lib('Loading');



/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Dashboard',

    components: {
        Postbox,
        Loading,
        Chart: __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__["default"]
    },

    data() {
        return {
            overview: null,
            feed: null,
            report: null
        };
    },

    created() {
        this.fetchOverview();
        this.fetchFeed();
        this.fetchReport();
    },

    methods: {

        fetchOverview() {
            dokan.api.get('/admin/report/summary').done(response => {
                this.overview = response;
            });
        },

        fetchFeed() {
            dokan.api.get('/admin/dashboard/feed').done(response => {
                this.feed = response;
            });
        },

        fetchReport() {
            dokan.api.get('/admin/report/overview').done(response => {
                this.report = response;
            });
        }
    }
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

let ListTable = dokan_get_lib('ListTable');
let Modal = dokan_get_lib('Modal');

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Withdraw',

    components: {
        ListTable,
        Modal
    },

    data() {
        return {
            showModal: false,
            editing: {
                id: null,
                note: null
            },

            totalPages: 1,
            perPage: 10,
            totalItems: 0,

            counts: {
                pending: 0,
                approved: 0,
                cancelled: 0
            },
            notFound: 'No requests found.',
            showCb: true,
            loading: false,
            columns: {
                'seller': { label: 'Vendor' },
                'amount': { label: 'Amount' },
                'status': { label: 'Status' },
                'method_title': { label: 'Method' },
                'method_details': { label: 'Details' },
                'note': { label: 'Note' },
                'created': { label: 'Date' },
                'actions': { label: 'Actions' }
            },
            requests: [],
            actionColumn: 'seller',
            actions: [{
                key: 'trash',
                label: 'Delete'
            }, {
                key: 'cancel',
                label: 'Cancel'
            }],
            bulkActions: [{
                key: 'approved',
                label: 'Approve'
            }, {
                key: 'cancelled',
                label: 'Cancel'
            }, {
                key: 'delete',
                label: 'Delete'
            }, {
                key: 'paypal',
                label: 'Download PayPal mass payment file'
            }]
        };
    },

    watch: {
        '$route.query.status'() {
            this.fetchRequests();
        },

        '$route.query.page'() {
            this.fetchRequests();
        }
    },

    computed: {

        currentStatus() {
            return this.$route.query.status || 'pending';
        },

        currentPage() {
            let page = this.$route.query.page || 1;

            return parseInt(page);
        }
    },

    created() {
        this.fetchRequests();
    },

    methods: {

        updatedCounts(xhr) {
            this.counts.pending = parseInt(xhr.getResponseHeader('X-Status-Pending'));
            this.counts.approved = parseInt(xhr.getResponseHeader('X-Status-Completed'));
            this.counts.cancelled = parseInt(xhr.getResponseHeader('X-Status-Cancelled'));
        },

        updatePagination(xhr) {
            this.totalPages = parseInt(xhr.getResponseHeader('X-WP-TotalPages'));
            this.totalItems = parseInt(xhr.getResponseHeader('X-WP-Total'));
        },

        fetchRequests() {
            this.loading = true;

            dokan.api.get('/withdraw?per_page=' + this.perPage + '&page=' + this.currentPage + '&status=' + this.currentStatus).done((response, status, xhr) => {
                this.requests = response;
                this.loading = false;

                this.updatedCounts(xhr);
                this.updatePagination(xhr);
            });
        },

        goToPage(page) {
            this.$router.push({
                name: 'Withdraw',
                query: {
                    status: this.currentStatus,
                    page: page
                }
            });
        },

        updateItem(id, value) {
            let index = this.requests.findIndex(x => x.id == id);

            this.$set(this.requests, index, value);
        },

        changeStatus(status, id) {
            this.loading = true;

            dokan.api.put('/withdraw/' + id, { status: status }).done(response => {
                // this.requests = response;
                this.loading = false;
                // this.updateItem(id, response);
                this.fetchRequests();
            });
        },

        onActionClick(action, row) {
            if ('cancel' === action) {
                this.changeStatus('cancelled', row.id);
            }

            if ('trash' === action) {
                if (confirm('Are you sure?')) {
                    this.loading = true;

                    dokan.api.delete('/withdraw/' + row.id).done(response => {
                        this.loading = false;
                        this.fetchRequests();
                    });
                }
            }
        },

        getPaymentDetails(method, data) {
            let details = '—';

            if ('bank' !== method) {
                details = data[method].email || '';
            } else {

                if (data.bank.hasOwnProperty('ac_name')) {
                    details = 'Account Name: ' + data.bank.ac_name;
                }

                if (data.bank.hasOwnProperty('ac_number')) {
                    details += ", Account Number: " + data.bank.ac_number;
                }

                if (data.bank.hasOwnProperty('bank_name')) {
                    details += ", Bank Name: " + data.bank.bank_name;
                }

                if (data.bank.hasOwnProperty('routing_number')) {
                    details += ", Routing Number: " + data.bank.routing_number;
                }
            }

            return details;
        },

        moment(date) {
            return moment(date);
        },

        onBulkAction(action, items) {

            if (_.contains(['delete', 'approved', 'cancelled'], action)) {

                let jsonData = {};
                jsonData[action] = items;

                this.loading = true;

                dokan.api.put('/withdraw/batch', jsonData).done(response => {
                    this.loading = false;
                    this.fetchRequests();
                });
            }

            if ('paypal' === action) {
                let ids = items.join("','");

                $.post(ajaxurl, {
                    'dokan_withdraw_bulk': 'paypal',
                    'id': ids,
                    'action': 'withdraw_ajax_submission'
                }, function (response, status, xhr) {
                    var filename = "";
                    var disposition = xhr.getResponseHeader('Content-Disposition');

                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);

                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }

                    var type = xhr.getResponseHeader('Content-Type');

                    var blob = typeof File === 'function' ? new File([response], filename, { type: type }) : new Blob([response], { type: type });
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) {
                            // use HTML5 a[download] attribute to specify filename
                            var a = document.createElement("a");
                            // safari doesn't support this yet
                            if (typeof a.download === 'undefined') {
                                window.location = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                            }
                        } else {
                            window.location = downloadUrl;
                        }

                        setTimeout(function () {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100); // cleanup
                    }
                });
            }
        },

        openNoteModal(note, id) {
            this.showModal = true;
            this.editing = {
                id: id,
                note: note
            };
        },

        updateNote() {
            this.showModal = false;
            this.loading = true;

            dokan.api.put('/withdraw/' + this.editing.id + '/note', {
                note: this.editing.note
            }).done(response => {
                this.loading = false;

                this.updateItem(this.editing.id, response);
                this.editing = {
                    id: null,
                    note: null
                };
            });
        }
    }
});

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

    name: 'Premium',

    data() {
        return {
            features: [{
                "title": "Vendor Listing",
                "desc": "View vendor listing with vendor details and earnings.",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/seller@2x.png?58e47e",
                "class": "seller-listing",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Commission Per Vendor Report",
                "desc": "View commission per vendor with vendor earnings. You can charge your vendors percentage, giving them an e-commerce solution free of any monthly fees.",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/earn@2x.png?58e47e",
                "class": "commission-per-seller-report",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Birds Eye View With Reports",
                "desc": "Every vendor can see his\/her own sales report and see a bird eye view on the sales they are making. ",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2017\/01\/Store-Insights-with-Reports-and-Statement@2x.png?x21811",
                "class": "report-bird-view",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Coupon Management",
                "desc": "Every vendor manages their own products and discounts they offer. create discount coupons for special sales! ",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/coupon@2x.png?58e47e",
                "class": "coupon-management",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Manage Product Reviews",
                "desc": "Each vendor manages their own product reviews independently. Delete, mark as spam or modify the product reviews on the fly.",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/reviews@2x.png?58e47e",
                "class": "manage-product-reviews",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Vendor Profile Completeness",
                "desc": "Dokan manage vendors profile completeness par on vendors dashboard. Vendor can view his\/her profile completeness percent by the bar. ",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-profile-completion.png?58e47e",
                "class": "profile-completeness",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Vendor Payment Method Setup",
                "desc": "Vendor can manage there payment methods from their dashboard settings. They can set their withdraw method from there.",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-payment.png?58e47e",
                "class": "payment-method",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }, {
                "title": "Admin Announcement System for Vendor",
                "desc": "Admin can set announcement for vendors from back-end. Admin can choose all vendor or select individuals as he\/she wants. the announcement will then show on vendor dashboard which leads to a announcement list template. ",
                "thumbnail": "https:\/\/wedevs-com-wedevs.netdna-ssl.com\/wp-content\/uploads\/2014\/02\/Dashboard-announcement.png?58e47e",
                "class": "announcement",
                "url": "https:\/\/wedevs.com\/products\/plugins\/dokan\/"
            }]
        };
    }
});

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

let Postbox = dokan_get_lib('Postbox');
let Loading = dokan_get_lib('Loading');

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Help',

    components: {
        Postbox,
        Loading
    },

    data() {
        return {
            docs: null
        };
    },

    created() {
        this.fetch();
    },

    methods: {

        fetch() {
            dokan.api.get('/admin/help').done(response => {
                this.docs = response;
            });
        }
    }
});

/***/ }),
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
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _App = __webpack_require__(39);

var _App2 = _interopRequireDefault(_App);

var _router = __webpack_require__(42);

var _router2 = _interopRequireDefault(_router);

var _adminMenuFix = __webpack_require__(58);

var _adminMenuFix2 = _interopRequireDefault(_adminMenuFix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-new */
var Vue = dokan_get_lib('Vue');

new Vue({
    el: '#dokan-vue-admin',
    router: _router2.default,
    render: function render(h) {
        return h(_App2.default);
    }
});

// fix the admin menu for the slug "vue-app"
(0, _adminMenuFix2.default)('dokan');

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(11);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(41);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(40)
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
/* 40 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "vue-backend-app" } },
    [
      _c("router-view"),
      _vm._v(" "),
      _c("notifications", { attrs: { position: "bottom right" } })
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
    require("vue-hot-reload-api")      .rerender("data-v-3a030f38", esExports)
  }
}

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Dashboard = __webpack_require__(43);

var _Dashboard2 = _interopRequireDefault(_Dashboard);

var _Withdraw = __webpack_require__(49);

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _Premium = __webpack_require__(52);

var _Premium2 = _interopRequireDefault(_Premium);

var _Help = __webpack_require__(55);

var _Help2 = _interopRequireDefault(_Help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Vue = dokan_get_lib('Vue');
var Router = dokan_get_lib('Router');

Vue.use(Router);

dokan_add_route(_Dashboard2.default);
dokan_add_route(_Withdraw2.default);
dokan_add_route(_Premium2.default);
dokan_add_route(_Help2.default);

/**
 * Parse the route array and bind required components
 *
 * This changes the dokan.routes array and changes the components
 * so we can use dokan.routeComponents.{compontent} component.
 *
 * @param  {array} routes
 *
 * @return {void}
 */
function parseRouteComponent(routes) {

    for (var i = 0; i < routes.length; i++) {
        if (_typeof(routes[i].children) === 'object') {

            parseRouteComponent(routes[i].children);

            if (typeof routes[i].component !== 'undefined') {
                routes[i].component = dokan.routeComponents[routes[i].component];
            }
        } else {
            routes[i].component = dokan.routeComponents[routes[i].component];
        }
    }
}

// mutate the localized array
parseRouteComponent(dokan.routes);

exports.default = new Router({
    routes: dokan.routes
});

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__ = __webpack_require__(12);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__ = __webpack_require__(48);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(44)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Dashboard.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-219ffca0", Component.options)
  } else {
    hotAPI.reload("data-v-219ffca0", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 44 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-dashboard" }, [
    _c("h1", [_vm._v("Dashboard")]),
    _vm._v(" "),
    _c("div", { staticClass: "widgets-wrapper" }, [
      _c(
        "div",
        { staticClass: "left-side" },
        [
          _c(
            "postbox",
            { attrs: { title: "At a Glance", extraClass: "dokan-status" } },
            [
              _vm.overview !== null
                ? _c("div", { staticClass: "dokan-status" }, [
                    _c("ul", [
                      _c("li", { staticClass: "sale" }, [
                        _c("div", {
                          staticClass: "dashicons dashicons-chart-bar"
                        }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(
                                _vm._f("currency")(
                                  _vm.overview.orders.this_month
                                )
                              )
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v(
                              "\n                                    net sales this month "
                            ),
                            _c("span", { class: _vm.overview.orders.class }, [
                              _vm._v(_vm._s(_vm.overview.orders.parcent))
                            ])
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c("li", { staticClass: "commission" }, [
                        _c("div", {
                          staticClass: "dashicons dashicons-chart-pie"
                        }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(
                                _vm._f("currency")(
                                  _vm.overview.earning.this_month
                                )
                              )
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v(
                              "\n                                    commission earned "
                            ),
                            _c("span", { class: _vm.overview.earning.class }, [
                              _vm._v(_vm._s(_vm.overview.earning.parcent))
                            ])
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c("li", { staticClass: "vendor" }, [
                        _c("div", { staticClass: "dashicons dashicons-id" }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(_vm.overview.vendors.this_month) +
                                " Vendor"
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v(
                              "\n                                    signup this month "
                            ),
                            _c("span", { class: _vm.overview.vendors.class }, [
                              _vm._v(_vm._s(_vm.overview.vendors.parcent))
                            ])
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c("li", { staticClass: "approval" }, [
                        _c("div", {
                          staticClass: "dashicons dashicons-businessman"
                        }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(_vm.overview.vendors.inactive) + " Vendor"
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v("awaiting approval")
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c("li", { staticClass: "product" }, [
                        _c("div", { staticClass: "dashicons dashicons-cart" }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(_vm.overview.products.this_month) +
                                " Products"
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v(
                              "\n                                    created this month "
                            ),
                            _c("span", { class: _vm.overview.products.class }, [
                              _vm._v(_vm._s(_vm.overview.products.parcent))
                            ])
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c("li", { staticClass: "withdraw" }, [
                        _c("div", { staticClass: "dashicons dashicons-money" }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(_vm.overview.withdraw.pending) +
                                " Withdrawals"
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v("awaiting approval")
                          ])
                        ])
                      ])
                    ])
                  ])
                : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
            ]
          ),
          _vm._v(" "),
          _c("postbox", { attrs: { title: "Dokan News Updates" } }, [
            _vm.feed !== null
              ? _c("div", { staticClass: "rss-widget" }, [
                  _c(
                    "ul",
                    _vm._l(_vm.feed, function(news) {
                      return _c("li", [
                        _c(
                          "a",
                          {
                            attrs: {
                              href:
                                news.link +
                                "?utm_source=wp-admin&utm_campaign=dokan-news",
                              target: "_blank"
                            }
                          },
                          [_vm._v(_vm._s(news.title))]
                        )
                      ])
                    })
                  )
                ])
              : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
          ])
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "right-side" },
        [
          _c(
            "postbox",
            { attrs: { title: "Overview" } },
            [
              _vm.report !== null
                ? _c("chart", { attrs: { data: _vm.report } })
                : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
            ],
            1
          )
        ],
        1
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-219ffca0", esExports)
  }
}

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__ = __webpack_require__(13);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__ = __webpack_require__(51);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(50)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Withdraw.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-62373ea4", Component.options)
  } else {
    hotAPI.reload("data-v-62373ea4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 50 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "withdraw-requests" },
    [
      _c("h1", [_vm._v("Withdraw Requests")]),
      _vm._v(" "),
      _vm.showModal
        ? _c(
            "modal",
            {
              attrs: { title: "Update Note" },
              on: {
                close: function($event) {
                  _vm.showModal = false
                }
              }
            },
            [
              _c("template", { slot: "body" }, [
                _c("textarea", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.editing.note,
                      expression: "editing.note"
                    }
                  ],
                  attrs: { rows: "3" },
                  domProps: { value: _vm.editing.note },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.editing, "note", $event.target.value)
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("template", { slot: "footer" }, [
                _c(
                  "button",
                  {
                    staticClass: "button button-primary button-large",
                    on: {
                      click: function($event) {
                        _vm.updateNote()
                      }
                    }
                  },
                  [_vm._v("Update Note")]
                )
              ])
            ],
            2
          )
        : _vm._e(),
      _vm._v(" "),
      _c("ul", { staticClass: "subsubsub" }, [
        _c(
          "li",
          [
            _c(
              "router-link",
              {
                attrs: {
                  to: { name: "Withdraw", query: { status: "pending" } },
                  "active-class": "current",
                  exact: ""
                }
              },
              [
                _vm._v("Pending "),
                _c("span", { staticClass: "count" }, [
                  _vm._v("(" + _vm._s(_vm.counts.pending) + ")")
                ])
              ]
            ),
            _vm._v(" | ")
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "li",
          [
            _c(
              "router-link",
              {
                attrs: {
                  to: { name: "Withdraw", query: { status: "approved" } },
                  "active-class": "current",
                  exact: ""
                }
              },
              [
                _vm._v("Approved "),
                _c("span", { staticClass: "count" }, [
                  _vm._v("(" + _vm._s(_vm.counts.approved) + ")")
                ])
              ]
            ),
            _vm._v(" | ")
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "li",
          [
            _c(
              "router-link",
              {
                attrs: {
                  to: { name: "Withdraw", query: { status: "cancelled" } },
                  "active-class": "current",
                  exact: ""
                }
              },
              [
                _vm._v("Cancelled "),
                _c("span", { staticClass: "count" }, [
                  _vm._v("(" + _vm._s(_vm.counts.cancelled) + ")")
                ])
              ]
            )
          ],
          1
        )
      ]),
      _vm._v(" "),
      _c("list-table", {
        attrs: {
          columns: _vm.columns,
          rows: _vm.requests,
          loading: _vm.loading,
          "action-column": _vm.actionColumn,
          actions: _vm.actions,
          "show-cb": _vm.showCb,
          "bulk-actions": _vm.bulkActions,
          "not-found": _vm.notFound,
          "total-pages": _vm.totalPages,
          "total-items": _vm.totalItems,
          "per-page": _vm.perPage,
          "current-page": _vm.currentPage
        },
        on: {
          pagination: _vm.goToPage,
          "action:click": _vm.onActionClick,
          "bulk:click": _vm.onBulkAction
        },
        scopedSlots: _vm._u([
          {
            key: "seller",
            fn: function(data) {
              return [
                _c("img", {
                  attrs: {
                    src: data.row.user.gravatar,
                    alt: data.row.user.store_name,
                    width: "50"
                  }
                }),
                _vm._v(" "),
                _c("strong", [
                  _c("a", { attrs: { href: "#" } }, [
                    _vm._v(_vm._s(data.row.user.store_name))
                  ])
                ])
              ]
            }
          },
          {
            key: "amount",
            fn: function(data) {
              return [
                _vm._v(
                  "\n            " +
                    _vm._s(_vm._f("currency")(data.row.amount)) +
                    "\n        "
                )
              ]
            }
          },
          {
            key: "status",
            fn: function(data) {
              return [
                _c("span", { class: data.row.status }, [
                  _vm._v(_vm._s(_vm._f("capitalize")(data.row.status)))
                ])
              ]
            }
          },
          {
            key: "created",
            fn: function(data) {
              return [
                _vm._v(
                  "\n            " +
                    _vm._s(_vm.moment(data.row.created).format("MMM D, YYYY")) +
                    "\n        "
                )
              ]
            }
          },
          {
            key: "method_details",
            fn: function(data) {
              return [
                _vm._v(
                  "\n            " +
                    _vm._s(
                      _vm.getPaymentDetails(
                        data.row.method,
                        data.row.user.payment
                      )
                    ) +
                    "\n        "
                )
              ]
            }
          },
          {
            key: "actions",
            fn: function(data) {
              return [
                data.row.status === "pending"
                  ? [
                      _c("div", { staticClass: "button-group" }, [
                        _c(
                          "button",
                          {
                            staticClass: "button button-small",
                            attrs: { title: "Approve Request" },
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                _vm.changeStatus("approved", data.row.id)
                              }
                            }
                          },
                          [
                            _c("span", {
                              staticClass: "dashicons dashicons-yes"
                            })
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "button",
                          {
                            staticClass: "button button-small",
                            attrs: { title: "Add Note" },
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                _vm.openNoteModal(data.row.note, data.row.id)
                              }
                            }
                          },
                          [
                            _c("span", {
                              staticClass: "dashicons dashicons-testimonial"
                            })
                          ]
                        )
                      ])
                    ]
                  : data.row.status === "approved"
                    ? [
                        _c("div", { staticClass: "button-group" }, [
                          _c(
                            "button",
                            {
                              staticClass: "button button-small",
                              attrs: { title: "Mark as Pending" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.changeStatus("pending", data.row.id)
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-backup"
                              })
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "button button-small",
                              attrs: { title: "Add Note" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.openNoteModal(data.row.note, data.row.id)
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-testimonial"
                              })
                            ]
                          )
                        ])
                      ]
                    : [
                        _c("div", { staticClass: "button-group" }, [
                          _c(
                            "button",
                            {
                              staticClass: "button button-small",
                              attrs: { title: "Approve Request" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.changeStatus("approved", data.row.id)
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-yes"
                              })
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "button button-small",
                              attrs: { title: "Mark as Pending" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.changeStatus("pending", data.row.id)
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-backup"
                              })
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "button button-small",
                              attrs: { title: "Add Note" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.openNoteModal(data.row.note, data.row.id)
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-testimonial"
                              })
                            ]
                          )
                        ])
                      ]
              ]
            }
          }
        ])
      })
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
    require("vue-hot-reload-api")      .rerender("data-v-62373ea4", esExports)
  }
}

/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__ = __webpack_require__(14);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__ = __webpack_require__(54);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(53)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Premium.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b38fd83a", Component.options)
  } else {
    hotAPI.reload("data-v-b38fd83a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 53 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-pro-features" }, [
    _c("h1", [_vm._v("Dokan - Pro Features")]),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "pro-feature-wrap" },
      _vm._l(_vm.features, function(feature) {
        return _c("div", { staticClass: "pro-feature" }, [
          _c("div", { staticClass: "pro-feature-thumb" }, [
            _c("a", { attrs: { href: feature.url, target: "_blank" } }, [
              _c("img", {
                attrs: { src: feature.thumbnail, alt: feature.title }
              })
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "pro-detail" }, [
            _c("h3", { staticClass: "title" }, [
              _c("a", { attrs: { href: feature.url, target: "_blank" } }, [
                _vm._v(_vm._s(feature.title))
              ])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "text" }, [_vm._v(_vm._s(feature.desc))])
          ])
        ])
      })
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-b38fd83a", esExports)
  }
}

/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__ = __webpack_require__(15);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__ = __webpack_require__(57);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(56)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Help.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c289d136", Component.options)
  } else {
    hotAPI.reload("data-v-c289d136", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 56 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-help-page" }, [
    _c("h1", [_vm._v("Help")]),
    _vm._v(" "),
    _vm.docs !== null
      ? _c(
          "div",
          { staticClass: "section-wrapper" },
          _vm._l(_vm.docs, function(section) {
            return _c("postbox", { attrs: { title: section.title } }, [
              _c(
                "ul",
                _vm._l(section.questions, function(item) {
                  return _c("li", [
                    _c("span", {
                      staticClass: "dashicons dashicons-media-text"
                    }),
                    _vm._v(" "),
                    _c(
                      "a",
                      {
                        attrs: {
                          href:
                            item.link +
                            "?utm_source=wp-admin&utm_medium=dokan-help-page",
                          target: "_blank"
                        }
                      },
                      [_vm._v(_vm._s(item.title))]
                    )
                  ])
                })
              )
            ])
          })
        )
      : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-c289d136", esExports)
  }
}

/***/ }),
/* 58 */
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
],[38]);
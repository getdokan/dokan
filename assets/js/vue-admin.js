dokanWebpack([1],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__ = __webpack_require__(5);



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
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__ = __webpack_require__(29);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    components: {
        Sketch: __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__["a" /* default */]
    },

    props: {
        value: {
            type: String,
            required: true,
            default: ''
        },

        format: {
            type: String,
            required: false,
            default: 'hex',
            validator(type) {
                return ['hsl', 'hex', 'rgba', 'hsv'].indexOf(type) !== -1;
            }
        },

        presetColors: {
            type: Array,
            required: false,
            default() {
                return ['#000', '#fff', '#d33', '#d93', '#ee2', '#81d742', '#1e73be', '#8224e3'];
            }
        },

        disableAlpha: {
            type: Boolean,
            required: false,
            default: true
        },

        disableFields: {
            type: Boolean,
            required: false,
            default: true
        }
    },

    data() {
        return {
            showColorPicker: false
        };
    },

    methods: {
        updateColor(colors) {
            let color = '';

            if (colors[this.format]) {
                color = colors[this.format];
            }

            this.$emit('input', color);
        },

        toggleColorPicker() {
            this.showColorPicker = !this.showColorPicker;
        },

        setHexColor(color) {
            this.updateColor({
                hex: color
            });
        }
    }
});

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__ = __webpack_require__(3);
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
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__ = __webpack_require__(4);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__ = __webpack_require__(14);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(13)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-01dc0d51"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/ColorPicker.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-01dc0d51", Component.options)
  } else {
    hotAPI.reload("data-v-01dc0d51", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "color-picker-container" },
    [
      _c(
        "button",
        {
          staticClass: "button color-picker-button",
          style: { backgroundColor: _vm.value },
          attrs: { type: "button" },
          on: { click: _vm.toggleColorPicker }
        },
        [_c("span", [_vm._v(_vm._s(_vm.__("Select Color", "dokan-lite")))])]
      ),
      _vm._v(" "),
      _vm.showColorPicker && _vm.format === "hex"
        ? _c("input", {
            staticClass: "hex-input",
            attrs: { type: "text" },
            domProps: { value: _vm.value },
            on: {
              input: function($event) {
                _vm.setHexColor($event.target.value)
              }
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.showColorPicker
        ? _c("div", { staticClass: "button-group" }, [
            _c(
              "button",
              {
                staticClass: "button button-small",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    _vm.updateColor({})
                  }
                }
              },
              [_vm._v(_vm._s(_vm.__("Clear", "dokan-lite")))]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass: "button button-small",
                attrs: { type: "button" },
                on: { click: _vm.toggleColorPicker }
              },
              [_vm._v(_vm._s(_vm.__("Close", "dokan-lite")))]
            )
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.showColorPicker
        ? _c("sketch", {
            attrs: {
              value: _vm.value,
              "preset-colors": _vm.presetColors,
              "disable-alpha": _vm.disableAlpha,
              "disable-fields": _vm.disableFields
            },
            on: { input: _vm.updateColor }
          })
        : _vm._e()
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
    require("vue-hot-reload-api")      .rerender("data-v-01dc0d51", esExports)
  }
}

/***/ }),
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */
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
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__ = __webpack_require__(10);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
let Currency = dokan_get_lib('Currency');



/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Dashboard',

    components: {
        Postbox,
        Loading,
        Chart: __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__["default"],
        Currency
    },

    data() {
        return {
            overview: null,
            feed: null,
            report: null,
            subscribe: {
                success: false,
                loading: false,
                email: ''
            },
            hasPro: dokan.hasPro ? true : false
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
        },

        validEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },

        emailSubscribe() {
            let action = 'https://wedevs.us16.list-manage.com/subscribe/post-json?u=66e606cfe0af264974258f030&id=0d176bb256&c=?';

            if (!this.validEmail(this.subscribe.email)) {
                return;
            }

            this.subscribe.loading = true;

            $.ajax({
                url: action,
                data: {
                    EMAIL: this.subscribe.email,
                    'group[3555][8]': '1'
                },
                type: 'GET',
                dataType: 'json',
                cache: false,
                contentType: "application/json; charset=utf-8"
            }).always(response => {
                this.subscribe.success = true;
                this.subscribe.loading = false;
            });
        }
    }
});

/***/ }),
/* 22 */
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

let ListTable = dokan_get_lib('ListTable');
let Modal = dokan_get_lib('Modal');
let Currency = dokan_get_lib('Currency');

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Withdraw',

    components: {
        ListTable,
        Modal,
        Currency
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
            notFound: this.__('No requests found.', 'dokan-lite'),
            massPayment: this.__('Paypal Mass Payment File is Generated.', 'dokan-lite'),
            showCb: true,
            loading: false,
            columns: {
                'seller': { label: this.__('Vendor', 'dokan-lite') },
                'amount': { label: this.__('Amount', 'dokan-lite') },
                'status': { label: this.__('Status', 'dokan-lite') },
                'method_title': { label: this.__('Method', 'dokan-lite') },
                'method_details': { label: this.__('Details', 'dokan-lite') },
                'note': { label: this.__('Note', 'dokan-lite') },
                'created': { label: this.__('Date', 'dokan-lite') },
                'actions': { label: this.__('Actions', 'dokan-lite') }
            },
            requests: [],
            actionColumn: 'seller'
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
        },

        actions() {
            if ('pending' == this.currentStatus) {
                return [{
                    key: 'trash',
                    label: this.__('Delete', 'dokan-lite')
                }, {
                    key: 'cancel',
                    label: this.__('Cancel', 'dokan-lite')
                }];
            } else if ('cancelled' == this.currentStatus) {
                return [{
                    key: 'trash',
                    label: this.__('Delete', 'dokan-lite')
                }, {
                    key: 'pending',
                    label: this.__('Pending', 'dokan-lite')
                }];
            } else {
                return [];
            }
        },

        bulkActions() {
            if ('pending' == this.currentStatus) {
                return [{
                    key: 'approved',
                    label: this.__('Approve', 'dokan-lite')
                }, {
                    key: 'cancelled',
                    label: this.__('Cancel', 'dokan-lite')
                }, {
                    key: 'delete',
                    label: this.__('Delete', 'dokan-lite')
                }, {
                    key: 'paypal',
                    label: this.__('Download PayPal mass payment file', 'dokan-lite')
                }];
            } else if ('cancelled' == this.currentStatus) {
                return [{
                    key: 'pending',
                    label: this.__('Pending', 'dokan-lite')
                }, {
                    key: 'delete',
                    label: this.__('Delete', 'dokan-lite')
                }, {
                    key: 'paypal',
                    label: this.__('Download PayPal mass payment file', 'dokan-lite')
                }];
            } else {
                return [{
                    key: 'paypal',
                    label: this.__('Download PayPal mass payment file', 'dokan-lite')
                }];
            }
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

        vendorUrl(id) {
            if (window.dokan.hasPro === '1') {
                return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/' + id;
            }

            return dokan.urls.adminRoot + 'user-edit.php?user_id=' + id;
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

            if ('pending' === action) {
                this.changeStatus('pending', row.id);
            }

            if ('trash' === action) {
                if (confirm(this.__('Are you sure?', 'dokan-lite'))) {
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

            if (data[method] !== undefined) {
                if ('paypal' === method || 'skrill' === method) {
                    details = data[method].email || '';
                } else if ('bank' === method) {
                    if (data.bank.hasOwnProperty('ac_name')) {
                        details = this.sprintf(this.__('Account Name: %s', 'dokan-lite'), data.bank.ac_name);
                    }

                    if (data.bank.hasOwnProperty('ac_number')) {
                        details += this.sprintf(this.__(', Account Number: %s', 'dokan-lite'), data.bank.ac_number);
                    }

                    if (data.bank.hasOwnProperty('bank_name')) {
                        details += this.sprintf(this.__(', Bank Name: %s', 'dokan-lite'), data.bank.bank_name);
                    }

                    if (data.bank.hasOwnProperty('routing_number')) {
                        details += this.sprintf(this.__(', Routing Number: %s', 'dokan-lite'), data.bank.routing_number);
                    }
                }
            }

            return dokan.hooks.applyFilters('dokan_get_payment_details', details, method, data);
        },

        moment(date) {
            return moment(date);
        },

        onBulkAction(action, items) {
            let self = this;

            if (_.contains(['delete', 'approved', 'cancelled', 'pending'], action)) {

                let jsonData = {};
                jsonData[action] = items;

                this.loading = true;

                dokan.api.put('/withdraw/batch', jsonData).done(response => {
                    this.loading = false;
                    this.fetchRequests();
                });
            }

            if ('paypal' === action) {
                let ids = items.join(",");

                $.post(ajaxurl, {
                    'dokan_withdraw_bulk': 'paypal',
                    'id': ids,
                    'action': 'withdraw_ajax_submission',
                    'nonce': dokan.nonce
                }, function (response, status, xhr) {
                    if ('html/csv' === xhr.getResponseHeader('Content-type')) {
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
                    }

                    if (response) {
                        alert(self.massPayment);
                        return;
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
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_slick_carousel_slick_slick_css__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_slick_carousel_slick_slick_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_slick_carousel_slick_slick_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_slick__ = __webpack_require__(86);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

    components: { Slick: __WEBPACK_IMPORTED_MODULE_1_vue_slick__["a" /* default */] },

    data() {
        return {
            asstesUrl: dokan.urls.assetsUrl,
            services: [{
                "title": this.__("Premium modules to make everything easier & better", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-01@2x.png'
            }, {
                "title": this.__("Frontend dashboard for vendors with advanced controls", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-02@2x.png'
            }, {
                "title": this.__("Unlimited Product Variations and group product upload", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-03@2x.png'
            }, {
                "title": this.__("Zone wise shipping with multiple method for vendors", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-04@2x.png'
            }, {
                "title": this.__("Store support based on ticket system for your customers", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-05@2x.png'
            }, {
                "title": this.__("Vendors will be able to generate coupon codes", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-06@2x.png'
            }, {
                "title": this.__("Earning, Selling and Commission Reports & Statement", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-07@2x.png'
            }, {
                "title": this.__("24/7 super fast premium customer support for you", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-08@2x.png'
            }, {
                "title": this.__("Add Social profile to your vendor’s store and support for store SEO", "dokan-lite"),
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-09@2x.png'
            }],

            comparisons: [{
                "title": this.__("Frontend order management", "dokan-lite"),
                "compare": {
                    "lite": "available",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Seller Statement Reports", "dokan-lite"),
                "compare": {
                    "lite": "available",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Making Announcements", "dokan-lite"),
                "compare": {
                    "lite": "available",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Customized Product Categories", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Store SEO", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Back Ordering System", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Store Contact Form", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Single Product Multiple Seller", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Seller Verification", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Featured Seller", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Multiple Commission Types", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Frontend Shipping Tracking", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Setup Wizard", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Google Maps", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Manage reviews", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }, {
                "title": this.__("Bookable Product", "dokan-lite"),
                "compare": {
                    "lite": "unavailable",
                    "pro": 'available'
                }
            }],

            modules: [{
                "title": "Domain",
                "url": "https:\/\/wedevs.com\/dokan\/",
                "starter": {
                    "type": "numeric",
                    "value": '01'
                },
                "professional": {
                    "type": "numeric",
                    "value": '03'
                },
                "business": {
                    "type": "numeric",
                    "value": '05'
                },
                "enterprise": {
                    "type": "numeric",
                    "value": '20'
                }
            }, {
                "title": "Modules",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/",
                "starter": {
                    "type": "numeric",
                    "value": '01'
                },
                "professional": {
                    "type": "numeric",
                    "value": '08'
                },
                "business": {
                    "type": "numeric",
                    "value": '14'
                },
                "enterprise": {
                    "type": "numeric",
                    "value": '14'
                }
            }, {
                "title": "Color Scheme",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/color-scheme-customizer\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Vendor Review",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-vendor-review\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Store Support",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/store-support\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Auction",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-simple-auctions\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Ajax Live Search",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/ajax-live-search\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Stripe Connect",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/stripe-connect\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Subscriptions",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/subscription\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Single Product Multivendor",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/single-product-multivendor\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Seller Verification",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/seller-verification\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "WC Booking Integration",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/woocommerce-booking-integration\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Vendor Staff Manager",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-staff-manager\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Export Import",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/export-import\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Product Enquiry",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/product-enquiry\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Vendor Vacation",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-vacation\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Return and Warranty Request",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/rma\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Moip",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/moip\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Follow Store",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/follow-store\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Geolocation",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/geolocation\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Shipstation",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/shipstation\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }, {
                "title": "Wholesale",
                "url": "https:\/\/wedevs.com\/dokan\/modules\/wholesale\/",
                "starter": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "professional": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
                },
                "business": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                },
                "enterprise": {
                    "type": "icon",
                    "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
                }
            }],

            payment: {
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/payment-options.png',
                "guaranteeThumbnail": dokan.urls.assetsUrl + '/images/premium/gaurantee-thumb.png',
                "viewIcon": dokan.urls.assetsUrl + '/images/premium/view-icon@2x.png',
                "termsPolicyUrl": "https:\/\/wedevs.com\/refund-policy\/"
            },

            slickOptions: {
                //options can be used from the plugin documentation
                slidesToShow: 1,
                fade: true,
                speed: 500,
                cssEase: 'linear',
                autoplay: true,
                autoplaySpeed: 2000,
                infinite: true,
                accessibility: true,
                adaptiveHeight: false,
                arrows: false,
                dots: true,
                draggable: true,
                edgeFriction: 0.30,
                swipe: true
            },

            testimonials: [{
                "name": "Melissa McGovern",
                "designation": "Director, Hawk And PeddleProjects",
                "pic": dokan.urls.assetsUrl + '/images/premium/melissa.jpg',
                "content": "We're still a new business and are continuing to build our platform. Dokan has halved the time it would take us to build our ecommerce platform by being feature rich and easy to install and configure."
            }, {
                "name": "Morten J. Christensen",
                "designation": "Owner, Dincatering",
                "pic": dokan.urls.assetsUrl + '/images/premium/Morten-J.-Christensen.jpg',
                "content": "First and foremost it enables the possibility for actually creating the kind of marketplace i wanted. The plugin lets me create a local marketplace for local danish catering suppliers to showcase and sell their offers of the season."
            }, {
                "name": "Cédric Lefrancq",
                "designation": "Webmaster, Unwebmaster.Be",
                "pic": dokan.urls.assetsUrl + '/images/premium/Cédric-Lefrancq.jpeg',
                "content": "The support is very good. The plugin is perfect. Bugs are fixed very quickly. That’s a very good plugin."
            }, {
                "name": "David Gaz",
                "designation": "Founder, The Bureau Of Small Projects",
                "pic": dokan.urls.assetsUrl + '/images/premium/david-gaz.jpeg',
                "content": "It’s hands down an amazing plugin. But their support is even more amazing. They got back to me within hours on the weekend."
            }],

            cta: {
                "styles": {
                    "bgPattern": dokan.urls.assetsUrl + '/images/premium/cta-pattern@2x.png'
                },
                "thumbnail": dokan.urls.assetsUrl + '/images/premium/cta-dokan-logo.png',
                "url": dokan.urls.buynowpro
            }

        };
    },

    methods: {
        next() {
            this.$refs.slick.next();
        },

        prev() {
            this.$refs.slick.prev();
        },

        reInit() {
            // Helpful if you have to deal with v-for to update dynamic lists
            this.$nextTick(() => {
                this.$refs.slick.reSlick();
            });
        }
    },

    computed: {
        buyNowProUrl() {
            return dokan.urls.buynowpro.substr(-1) === '/' ? dokan.urls.buynowpro + '?' : dokan.urls.buynowpro + '&';
        }
    }
});

/***/ }),
/* 24 */,
/* 25 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 26 */
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
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Fields_vue__ = __webpack_require__(95);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

let Loading = dokan_get_lib('Loading');


/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Settings',

    components: {
        Fields: __WEBPACK_IMPORTED_MODULE_0_admin_components_Fields_vue__["a" /* default */],
        Loading
    },

    data() {
        return {
            isSaved: false,
            showLoading: false,
            isUpdated: false,
            isLoaded: false,
            message: '',
            currentTab: null,
            settingSections: [],
            settingFields: {},
            settingValues: {}
        };
    },

    methods: {
        changeTab(section) {
            var activetab = '';
            this.currentTab = section.id;

            if (typeof localStorage != 'undefined') {
                localStorage.setItem("activetab", this.currentTab);
            }
        },

        showSectionTitle(index) {
            return _.findWhere(this.settingSections, { id: index }).title;
        },

        fetchSettingValues() {
            var self = this,
                data = {
                action: 'dokan_get_setting_values',
                nonce: dokan.nonce
            };

            self.showLoading = true;

            jQuery.post(dokan.ajaxurl, data, function (resp) {
                if (resp.success) {

                    Object.keys(self.settingFields).forEach(function (section, index) {
                        Object.keys(self.settingFields[section]).forEach(function (field, i) {

                            if (!self.settingValues[section]) {
                                self.settingValues[section] = {};
                            }

                            if (typeof resp.data[section][field] === 'undefined') {
                                if (typeof self.settingFields[section][field].default === 'undefined') {
                                    self.settingValues[section][field] = '';
                                } else {
                                    self.settingValues[section][field] = self.settingFields[section][field].default;
                                }
                            } else {
                                self.settingValues[section][field] = resp.data[section][field];
                            }
                        });
                    });

                    self.settingValues = jQuery.extend({}, self.settingValues);

                    self.showLoading = false;
                    self.isLoaded = true;
                }
            });
        },

        showMedia(data, $event) {
            var self = this;

            var file_frame = wp.media.frames.file_frame = wp.media({
                title: this.__('Choose your file', 'dokan-lite'),
                button: {
                    text: this.__('Select', 'dokan-lite')
                },
                multiple: false
            });

            file_frame.on('select', function () {
                var attachment = file_frame.state().get('selection').first().toJSON();
                self.settingValues[data.sectionId][data.name] = attachment.url;
            });

            file_frame.open();
        },

        saveSettings(fieldData, section) {
            var self = this,
                data = {
                action: 'dokan_save_settings',
                nonce: dokan.nonce,
                settingsData: fieldData,
                section: section
            };
            self.showLoading = true;

            jQuery.post(dokan.ajaxurl, data).done(function (response) {
                var settings = response.data.settings;

                self.isSaved = true;
                self.isUpdated = true;

                self.message = response.data.message;

                self.settingValues[settings.name] = settings.value;
            }).fail(function (jqXHR) {
                var messages = jqXHR.responseJSON.data.map(function (error) {
                    return error.message;
                });

                alert(messages.join(' '));
            }).always(function () {
                self.showLoading = false;
            });
        }
    },

    created() {
        this.fetchSettingValues();

        this.currentTab = 'dokan_general';
        if (typeof localStorage != 'undefined') {
            this.currentTab = localStorage.getItem("activetab") ? localStorage.getItem("activetab") : 'dokan_general';
        }

        this.settingSections = dokan.settings_sections;
        this.settingFields = dokan.settings_fields;
    }
});

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_ColorPicker_vue__ = __webpack_require__(12);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


let TextEditor = dokan_get_lib('TextEditor');

/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'Fields',

    components: {
        colorPicker: __WEBPACK_IMPORTED_MODULE_0_admin_components_ColorPicker_vue__["default"],
        TextEditor
    },

    data() {
        return {
            repeatableItem: {}
        };
    },

    props: ['id', 'fieldData', 'sectionId', 'fieldValue'],

    methods: {
        containCommonFields(type) {
            return _.contains([undefined, 'text', 'email', 'url', 'phone'], type);
        },

        addItem(type, name) {
            this.fieldValue[name] = this.fieldValue[name] || [];

            if (typeof this.repeatableItem[name] == 'undefined' || !this.repeatableItem[name]) {
                return;
            }

            this.fieldValue[name].push({
                id: this.repeatableItem[name].trim().replace(/\s+/g, '_').toLowerCase(),
                value: this.repeatableItem[name]
            });
            this.repeatableItem[name] = '';
        },

        removeItem(optionVal, name) {
            this.fieldValue[name].splice(optionVal, 1);
        }
    }

});

/***/ }),
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _App = __webpack_require__(68);

var _App2 = _interopRequireDefault(_App);

var _router = __webpack_require__(71);

var _router2 = _interopRequireDefault(_router);

var _adminMenuFix = __webpack_require__(118);

var _adminMenuFix2 = _interopRequireDefault(_adminMenuFix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-new */
var Vue = dokan_get_lib('Vue');

new Vue({
    el: '#dokan-vue-admin',
    router: _router2.default,
    render: function render(h) {
        return h(_App2.default);
    },

    created: function created() {
        this.setLocaleData(dokan.i18n['dokan-lite']);
    }
});

// fix the admin menu for the slug "vue-app"
(0, _adminMenuFix2.default)('dokan');

/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(20);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(70);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(69)
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
/* 69 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 70 */
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
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Dashboard = __webpack_require__(72);

var _Dashboard2 = _interopRequireDefault(_Dashboard);

var _Withdraw = __webpack_require__(78);

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _Premium = __webpack_require__(81);

var _Premium2 = _interopRequireDefault(_Premium);

var _Help = __webpack_require__(90);

var _Help2 = _interopRequireDefault(_Help);

var _Settings = __webpack_require__(93);

var _Settings2 = _interopRequireDefault(_Settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Vue = dokan_get_lib('Vue');
var Router = dokan_get_lib('Router');

Vue.use(Router);

dokan_add_route(_Dashboard2.default);
dokan_add_route(_Withdraw2.default);
dokan_add_route(_Premium2.default);
dokan_add_route(_Help2.default);
dokan_add_route(_Settings2.default);

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
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__ = __webpack_require__(21);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__ = __webpack_require__(77);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(73)
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
/* 73 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-dashboard" }, [
    _c("h1", [_vm._v(_vm._s(_vm.__("Dashboard", "dokan-lite")))]),
    _vm._v(" "),
    _c("div", { staticClass: "widgets-wrapper" }, [
      _c(
        "div",
        { staticClass: "left-side" },
        [
          _c(
            "postbox",
            {
              attrs: {
                title: _vm.__("At a Glance", "dokan-lite"),
                extraClass: "dokan-status"
              }
            },
            [
              _vm.overview !== null
                ? _c("div", { staticClass: "dokan-status" }, [
                    _c("ul", [
                      _c(
                        "li",
                        { staticClass: "sale" },
                        [
                          _c("div", {
                            staticClass: "dashicons dashicons-chart-bar"
                          }),
                          _vm._v(" "),
                          _c(
                            "router-link",
                            {
                              attrs: {
                                to: _vm.hasPro ? { name: "Reports" } : ""
                              }
                            },
                            [
                              _c(
                                "strong",
                                [
                                  _c("currency", {
                                    attrs: {
                                      amount: _vm.overview.sales.this_month
                                    }
                                  })
                                ],
                                1
                              ),
                              _vm._v(" "),
                              _c("div", { staticClass: "details" }, [
                                _vm._v(
                                  "\n                                    " +
                                    _vm._s(
                                      _vm.__(
                                        "net sales this month",
                                        "dokan-lite"
                                      )
                                    ) +
                                    " "
                                ),
                                _c(
                                  "span",
                                  { class: _vm.overview.sales.class },
                                  [_vm._v(_vm._s(_vm.overview.sales.parcent))]
                                )
                              ])
                            ]
                          )
                        ],
                        1
                      ),
                      _vm._v(" "),
                      _c(
                        "li",
                        { staticClass: "commission" },
                        [
                          _c("div", {
                            staticClass: "dashicons dashicons-chart-pie"
                          }),
                          _vm._v(" "),
                          _c(
                            "router-link",
                            {
                              attrs: {
                                to: _vm.hasPro ? { name: "Reports" } : ""
                              }
                            },
                            [
                              _c(
                                "strong",
                                [
                                  _c("currency", {
                                    attrs: {
                                      amount: _vm.overview.earning.this_month
                                    }
                                  })
                                ],
                                1
                              ),
                              _vm._v(" "),
                              _c("div", { staticClass: "details" }, [
                                _vm._v(
                                  "\n                                    " +
                                    _vm._s(
                                      _vm.__("commission earned", "dokan-lite")
                                    ) +
                                    " "
                                ),
                                _c(
                                  "span",
                                  { class: _vm.overview.earning.class },
                                  [_vm._v(_vm._s(_vm.overview.earning.parcent))]
                                )
                              ])
                            ]
                          )
                        ],
                        1
                      ),
                      _vm._v(" "),
                      _c(
                        "li",
                        { staticClass: "vendor" },
                        [
                          _c("div", { staticClass: "dashicons dashicons-id" }),
                          _vm._v(" "),
                          _c(
                            "router-link",
                            {
                              attrs: {
                                to: _vm.hasPro ? { name: "Vendors" } : ""
                              }
                            },
                            [
                              _c("strong", [
                                _vm._v(
                                  _vm._s(
                                    _vm.sprintf(
                                      _vm.__("%s Vendor", "dokan-lite"),
                                      _vm.overview.vendors.this_month
                                    )
                                  )
                                )
                              ]),
                              _vm._v(" "),
                              _c("div", { staticClass: "details" }, [
                                _vm._v(
                                  "\n                                    " +
                                    _vm._s(
                                      _vm.__("signup this month", "dokan-lite")
                                    ) +
                                    " "
                                ),
                                _c(
                                  "span",
                                  { class: _vm.overview.vendors.class },
                                  [_vm._v(_vm._s(_vm.overview.vendors.parcent))]
                                )
                              ])
                            ]
                          )
                        ],
                        1
                      ),
                      _vm._v(" "),
                      _c(
                        "li",
                        { staticClass: "approval" },
                        [
                          _c("div", {
                            staticClass: "dashicons dashicons-businessman"
                          }),
                          _vm._v(" "),
                          _c(
                            "router-link",
                            {
                              attrs: {
                                to: _vm.hasPro
                                  ? {
                                      name: "Vendors",
                                      query: { status: "pending" }
                                    }
                                  : ""
                              }
                            },
                            [
                              _c("strong", [
                                _vm._v(
                                  _vm._s(
                                    _vm.sprintf(
                                      _vm.__("%s Vendor", "dokan-lite"),
                                      _vm.overview.vendors.inactive
                                    )
                                  )
                                )
                              ]),
                              _vm._v(" "),
                              _c("div", { staticClass: "details" }, [
                                _vm._v(
                                  _vm._s(
                                    _vm.__("awaiting approval", "dokan-lite")
                                  )
                                )
                              ])
                            ]
                          )
                        ],
                        1
                      ),
                      _vm._v(" "),
                      _c("li", { staticClass: "product" }, [
                        _c("div", { staticClass: "dashicons dashicons-cart" }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
                          _c("strong", [
                            _vm._v(
                              _vm._s(
                                _vm.sprintf(
                                  _vm.__("%s Products", "dokan-lite"),
                                  _vm.overview.products.this_month
                                )
                              )
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "details" }, [
                            _vm._v(
                              "\n                                    " +
                                _vm._s(
                                  _vm.__("created this month", "dokan-lite")
                                ) +
                                " "
                            ),
                            _c("span", { class: _vm.overview.products.class }, [
                              _vm._v(_vm._s(_vm.overview.products.parcent))
                            ])
                          ])
                        ])
                      ]),
                      _vm._v(" "),
                      _c(
                        "li",
                        { staticClass: "withdraw" },
                        [
                          _c("div", {
                            staticClass: "dashicons dashicons-money"
                          }),
                          _vm._v(" "),
                          _c(
                            "router-link",
                            {
                              attrs: {
                                to: {
                                  name: "Withdraw",
                                  query: { status: "pending" }
                                }
                              }
                            },
                            [
                              _c("strong", [
                                _vm._v(
                                  _vm._s(
                                    _vm.sprintf(
                                      _vm.__("%s Withdrawals", "dokan-lite"),
                                      _vm.overview.withdraw.pending
                                    )
                                  )
                                )
                              ]),
                              _vm._v(" "),
                              _c("div", { staticClass: "details" }, [
                                _vm._v(
                                  _vm._s(
                                    _vm.__("awaiting approval", "dokan-lite")
                                  )
                                )
                              ])
                            ]
                          )
                        ],
                        1
                      )
                    ])
                  ])
                : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
            ]
          ),
          _vm._v(" "),
          _c(
            "postbox",
            { attrs: { title: _vm.__("Dokan News Updates", "dokan-lite") } },
            [
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
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "subscribe-box" },
                      [
                        !_vm.subscribe.success
                          ? [
                              _vm.subscribe.loading
                                ? _c(
                                    "div",
                                    { staticClass: "loading" },
                                    [_c("loading")],
                                    1
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              _c("h3", [
                                _vm._v(
                                  _vm._s(
                                    _vm.__("Stay up-to-date", "dokan-lite")
                                  )
                                )
                              ]),
                              _vm._v(" "),
                              _c("p", [
                                _vm._v(
                                  "\n                                " +
                                    _vm._s(
                                      _vm.__(
                                        "We're constantly developing new features, stay up-to-date by subscribing to our newsletter.",
                                        "dokan-lite"
                                      )
                                    ) +
                                    "\n                            "
                                )
                              ]),
                              _vm._v(" "),
                              _c("div", { staticClass: "form-wrap" }, [
                                _c("input", {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.subscribe.email,
                                      expression: "subscribe.email"
                                    }
                                  ],
                                  attrs: {
                                    type: "email",
                                    required: "",
                                    placeholder: "Your Email Address"
                                  },
                                  domProps: { value: _vm.subscribe.email },
                                  on: {
                                    keyup: function($event) {
                                      if (
                                        !("button" in $event) &&
                                        _vm._k(
                                          $event.keyCode,
                                          "enter",
                                          13,
                                          $event.key
                                        )
                                      ) {
                                        return null
                                      }
                                      _vm.emailSubscribe()
                                    },
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.$set(
                                        _vm.subscribe,
                                        "email",
                                        $event.target.value
                                      )
                                    }
                                  }
                                }),
                                _vm._v(" "),
                                _c(
                                  "button",
                                  {
                                    staticClass: "button",
                                    on: {
                                      click: function($event) {
                                        _vm.emailSubscribe()
                                      }
                                    }
                                  },
                                  [
                                    _vm._v(
                                      _vm._s(_vm.__("Subscribe", "dokan-lite"))
                                    )
                                  ]
                                )
                              ])
                            ]
                          : _c("div", { staticClass: "thank-you" }, [
                              _vm._v(
                                _vm._s(
                                  _vm.__(
                                    "Thank you for subscribing!",
                                    "dokan-lite"
                                  )
                                )
                              )
                            ])
                      ],
                      2
                    )
                  ])
                : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
            ]
          )
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
            {
              staticClass: "overview-chart",
              attrs: { title: _vm.__("Overview", "dokan-lite") }
            },
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
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__ = __webpack_require__(22);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__ = __webpack_require__(80);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(79)
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
/* 79 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 80 */
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
      _c("h1", [_vm._v(_vm._s(_vm.__("Withdraw Requests", "dokan-lite")))]),
      _vm._v(" "),
      _vm.showModal
        ? _c(
            "modal",
            {
              attrs: { title: _vm.__("Update Note", "dokan-lite") },
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
                  [_vm._v(_vm._s(_vm.__("Update Note", "dokan-lite")))]
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
            _c("router-link", {
              attrs: {
                to: { name: "Withdraw", query: { status: "pending" } },
                "active-class": "current",
                exact: ""
              },
              domProps: {
                innerHTML: _vm._s(
                  _vm.sprintf(
                    _vm.__(
                      "Pending <span class='count'>(%s)</span>",
                      "dokan-lite"
                    ),
                    _vm.counts.pending
                  )
                )
              }
            }),
            _vm._v(" | ")
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "li",
          [
            _c("router-link", {
              attrs: {
                to: { name: "Withdraw", query: { status: "approved" } },
                "active-class": "current",
                exact: ""
              },
              domProps: {
                innerHTML: _vm._s(
                  _vm.sprintf(
                    _vm.__(
                      "Approved <span class='count'>(%s)</span>",
                      "dokan-lite"
                    ),
                    _vm.counts.approved
                  )
                )
              }
            }),
            _vm._v(" | ")
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "li",
          [
            _c("router-link", {
              attrs: {
                to: { name: "Withdraw", query: { status: "cancelled" } },
                "active-class": "current",
                exact: ""
              },
              domProps: {
                innerHTML: _vm._s(
                  _vm.sprintf(
                    _vm.__(
                      "Cancelled <span class='count'>(%s)</span>",
                      "dokan-lite"
                    ),
                    _vm.counts.cancelled
                  )
                )
              }
            })
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
                  _c(
                    "a",
                    { attrs: { href: _vm.vendorUrl(data.row.user.id) } },
                    [
                      _vm._v(
                        _vm._s(
                          data.row.user.store_name
                            ? data.row.user.store_name
                            : _vm.__("(no name)", "dokan-lite")
                        )
                      )
                    ]
                  )
                ])
              ]
            }
          },
          {
            key: "amount",
            fn: function(data) {
              return [_c("currency", { attrs: { amount: data.row.amount } })]
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
                            attrs: {
                              title: _vm.__("Approve Request", "dokan-lite")
                            },
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
                            attrs: { title: _vm.__("Add Note", "dokan-lite") },
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
                              attrs: {
                                title: _vm.__("Add Note", "dokan-lite")
                              },
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
                              attrs: {
                                title: _vm.__("Mark as Pending", "dokan-lite")
                              },
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
                              attrs: {
                                title: _vm.__("Add Note", "dokan-lite")
                              },
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
/* 81 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__ = __webpack_require__(23);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__ = __webpack_require__(89);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(82)
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
/* 82 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-pro-features" }, [
    _c("div", { staticClass: "header-section" }, [
      _c("div", { staticClass: "feature-thumb" }, [
        _c("img", {
          attrs: {
            src: _vm.asstesUrl + "/images/premium/header-feature-thumb@2x.png",
            alt: _vm.__("Upgrade to Dokan Pro!", "dokan-lite"),
            title: _vm.__("Upgrade to Dokan Pro!", "dokan-lite")
          }
        })
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "content-area" }, [
        _c("h1", [
          _vm._v(_vm._s(_vm.__("Upgrade to Dokan Pro!", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c("p", [
          _vm._v(
            _vm._s(
              _vm.__(
                "Seems To Be Convinced, You Need More Out Of Your Marketplace",
                "dokan-lite"
              )
            )
          )
        ])
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "service-section" }, [
      _c("h2", { staticClass: "section-title" }, [
        _vm._v(_vm._s(_vm.__("Why Upgrade", "dokan-lite")))
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "service-list" },
        _vm._l(_vm.services, function(service) {
          return _c("div", { staticClass: "service-box" }, [
            _c("div", { staticClass: "service-thumb" }, [
              _c("img", {
                attrs: {
                  src: service.thumbnail,
                  alt: service.title,
                  title: service.title
                }
              })
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "service-detail" }, [
              _c("h3", { staticClass: "title" }, [
                _vm._v(_vm._s(service.title))
              ])
            ])
          ])
        })
      ),
      _vm._v(" "),
      _c(
        "a",
        {
          staticClass: "btn",
          attrs: {
            href: "https://wedevs.com/dokan/features/",
            target: "_blank"
          }
        },
        [
          _vm._v(
            "\n            " +
              _vm._s(_vm.__("And Many More", "dokan-lite")) +
              "\n            "
          ),
          _c(
            "svg",
            {
              staticStyle: { "enable-background": "new 0 0 17.5 12.5" },
              attrs: {
                version: "1.1",
                id: "Layer_1",
                xmlns: "http://www.w3.org/2000/svg",
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                x: "0px",
                y: "0px",
                viewBox: "0 0 17.5 12.5",
                "xml:space": "preserve"
              }
            },
            [
              _c("path", {
                staticClass: "st0",
                attrs: {
                  d:
                    "M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7\n                    l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z\n                     M10.6,1.5"
                }
              })
            ]
          )
        ]
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "comparison-section" }, [
      _c("h2", { staticClass: "section-title" }, [
        _vm._v(_vm._s(_vm.__("Comparison With Dokan PRO", "dokan-lite")))
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "comparison-area" }, [
        _c("div", { staticClass: "compare-box dokan-lite" }, [
          _c("div", { staticClass: "logo-section" }, [
            _c("img", {
              attrs: {
                src: _vm.asstesUrl + "/images/premium/dokan-lite-logo@2x.png",
                alt: "Dokan Lite"
              }
            })
          ]),
          _vm._v(" "),
          _c(
            "ul",
            { staticClass: "compare-list" },
            _vm._l(_vm.comparisons, function(comparison) {
              return _c("li", { class: comparison.compare.lite }, [
                comparison.compare.lite === "available"
                  ? _c("img", {
                      attrs: {
                        src: _vm.asstesUrl + "/images/premium/available@2x.png",
                        alt: ""
                      }
                    })
                  : _c("img", {
                      attrs: {
                        src:
                          _vm.asstesUrl + "/images/premium/unavailable@2x.png",
                        alt: ""
                      }
                    }),
                _vm._v(" "),
                _c("span", [_vm._v(_vm._s(comparison.title))])
              ])
            })
          )
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "compare-box dokan-pro" }, [
          _c("div", { staticClass: "logo-section" }, [
            _c("img", {
              attrs: {
                src: _vm.asstesUrl + "/images/premium/dokan-pro-logo@2x.png",
                alt: "Dokan Pro"
              }
            })
          ]),
          _vm._v(" "),
          _c(
            "ul",
            { staticClass: "compare-list" },
            _vm._l(_vm.comparisons, function(comparison) {
              return _c("li", { class: comparison.compare.pro }, [
                comparison.compare.pro === "available"
                  ? _c("img", {
                      attrs: {
                        src: _vm.asstesUrl + "/images/premium/available@2x.png",
                        alt: ""
                      }
                    })
                  : _c("img", {
                      attrs: {
                        src:
                          _vm.asstesUrl + "/images/premium/unavailable@2x.png",
                        alt: ""
                      }
                    }),
                _vm._v(" "),
                _c("span", [_vm._v(_vm._s(comparison.title))])
              ])
            })
          )
        ])
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "pricing-section" }, [
      _c("h2", { staticClass: "section-title" }, [
        _vm._v(_vm._s(_vm.__("The Packages We Provide", "dokan-lite")))
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "pricing-wrapper" },
        [
          _vm._m(0),
          _vm._v(" "),
          _vm._l(_vm.modules, function(module) {
            return _c("div", { staticClass: "table-row" }, [
              _c("div", { staticClass: "table-col" }, [
                _c(
                  "a",
                  {
                    staticClass: "module-name",
                    attrs: { href: module.url, target: "_blank" }
                  },
                  [_vm._v(_vm._s(module.title))]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                module.starter.type === "numeric"
                  ? _c("div", { staticClass: "plan-data" }, [
                      _vm._v(_vm._s(module.starter.value))
                    ])
                  : _c("div", { staticClass: "plan-data" }, [
                      _c("img", {
                        attrs: { src: module.starter.value, alt: "" }
                      })
                    ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col popular" }, [
                module.professional.type === "numeric"
                  ? _c("div", { staticClass: "plan-data" }, [
                      _vm._v(_vm._s(module.professional.value))
                    ])
                  : _c("div", { staticClass: "plan-data" }, [
                      _c("img", {
                        attrs: { src: module.professional.value, alt: "" }
                      })
                    ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                module.business.type === "numeric"
                  ? _c("div", { staticClass: "plan-data" }, [
                      _vm._v(_vm._s(module.business.value))
                    ])
                  : _c("div", { staticClass: "plan-data" }, [
                      _c("img", {
                        attrs: { src: module.business.value, alt: "" }
                      })
                    ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                module.enterprise.type === "numeric"
                  ? _c("div", { staticClass: "plan-data" }, [
                      _vm._v(_vm._s(module.enterprise.value))
                    ])
                  : _c("div", { staticClass: "plan-data" }, [
                      _c("img", {
                        attrs: { src: module.enterprise.value, alt: "" }
                      })
                    ])
              ])
            ])
          }),
          _vm._v(" "),
          _c("div", { staticClass: "table-row" }, [
            _c("div", { staticClass: "table-col" }),
            _vm._v(" "),
            _c("div", { staticClass: "table-col" }, [
              _c(
                "a",
                {
                  staticClass: "buy-btn starter",
                  attrs: {
                    href:
                      _vm.buyNowProUrl +
                      "add-to-cart=15310&variation_id=15316&attribute_pa_license=starter",
                    target: "_blank"
                  }
                },
                [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "table-col popular" }, [
              _c(
                "a",
                {
                  staticClass: "buy-btn professional",
                  attrs: {
                    href:
                      _vm.buyNowProUrl +
                      "add-to-cart=15310&variation_id=15314&attribute_pa_license=professional",
                    target: "_blank"
                  }
                },
                [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "table-col" }, [
              _c(
                "a",
                {
                  staticClass: "buy-btn business",
                  attrs: {
                    href:
                      _vm.buyNowProUrl +
                      "add-to-cart=15310&variation_id=15315&attribute_pa_license=business",
                    target: "_blank"
                  }
                },
                [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "table-col" }, [
              _c(
                "a",
                {
                  staticClass: "buy-btn enterprise",
                  attrs: {
                    href:
                      _vm.buyNowProUrl +
                      "add-to-cart=15310&variation_id=103829&attribute_pa_license=enterprise",
                    target: "_blank"
                  }
                },
                [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
              )
            ])
          ])
        ],
        2
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "payment-section" }, [
      _c("div", { staticClass: "guarantee-section" }, [
        _c("div", { staticClass: "feature-thumb" }, [
          _c("img", {
            attrs: { src: _vm.payment.guaranteeThumbnail, alt: "Dokan" }
          })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "guarantee-detail" }, [
          _c("h2", [
            _vm._v(_vm._s(_vm.__("14 Days Money Back Guarantee", "dokan-lite")))
          ]),
          _vm._v(" "),
          _c("p", [
            _vm._v(
              _vm._s(
                _vm.__(
                  "After successful purchase, you will be eligible for conditional refund",
                  "dokan-lite"
                )
              )
            )
          ]),
          _vm._v(" "),
          _c(
            "a",
            { attrs: { href: _vm.payment.termsPolicyUrl, target: "_blank" } },
            [
              _c("img", { attrs: { src: _vm.payment.viewIcon, alt: "Dokan" } }),
              _vm._v(
                " " + _vm._s(_vm.__("Terms & Condition Applied", "dokan-lite"))
              )
            ]
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "payment-area" }, [
        _c("h3", [_vm._v(_vm._s(_vm.__("Payment Options:", "dokan-lite")))]),
        _vm._v(" "),
        _c("div", { staticClass: "option" }, [
          _c("img", {
            attrs: { src: _vm.payment.thumbnail, alt: "Credit Card" }
          })
        ])
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "testimonial-section" }, [
      _c("h2", { staticClass: "section-title" }, [
        _vm._v(_vm._s(_vm.__("People We Have Helped", "dokan-lite")))
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "testimonial-wrapper" },
        [
          _c(
            "slick",
            { ref: "slick", attrs: { options: _vm.slickOptions } },
            _vm._l(_vm.testimonials, function(testimonial) {
              return _c("div", { staticClass: "testimonial-box" }, [
                _c("div", { staticClass: "profile-pic" }, [
                  _c("img", { attrs: { src: testimonial.pic, alt: "" } })
                ]),
                _vm._v(" "),
                _c(
                  "div",
                  {
                    staticClass: "content-detail",
                    style: {
                      "background-image":
                        "url(" +
                        _vm.asstesUrl +
                        "/images/premium/quote-icon.png" +
                        ")"
                    }
                  },
                  [
                    _c("h4", [_vm._v(_vm._s(testimonial.name))]),
                    _vm._v(" "),
                    _c("span", [_vm._v(_vm._s(testimonial.designation))]),
                    _vm._v(" "),
                    _c("p", [_vm._v(_vm._s(testimonial.content))])
                  ]
                )
              ])
            })
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("p", {
        domProps: {
          innerHTML: _vm._s(
            _vm.sprintf(
              "%s <a href='%s' target='_blank'>%s</a> %s",
              _vm.__("We are proud to say the official", "dokan-lite"),
              "https://themes.getbootstrap.com/",
              "Bootstrap theme marketplace",
              _vm.__("is built using Dokan", "dokan-lite")
            )
          )
        }
      })
    ]),
    _vm._v(" "),
    _c(
      "div",
      {
        staticClass: "cta-section",
        style: {
          "background-image":
            "url(" +
            _vm.cta.styles.bgPattern +
            "), linear-gradient( 45deg, rgb(255,125,144) 33%, rgb(255,173,111) 100%)"
        }
      },
      [
        _c("div", { staticClass: "feature-thumb" }, [
          _c("img", { attrs: { src: _vm.cta.thumbnail, alt: "Dokan Lite" } })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "content-area" }, [
          _c("h2", [_vm._v(_vm._s(_vm.__("Convinced?", "dokan-lite")))]),
          _vm._v(" "),
          _c("p", [
            _vm._v(
              _vm._s(
                _vm.__(
                  "With all the advance features you get it’s hard to resist buying Dokan Pro.",
                  "dokan-lite"
                )
              )
            )
          ]),
          _vm._v(" "),
          _c("a", { staticClass: "btn", attrs: { href: _vm.cta.url } }, [
            _vm._v(
              "\n                " +
                _vm._s(_vm.__("I Want To Buy Now", "dokan-lite")) +
                "\n                "
            ),
            _c(
              "svg",
              {
                staticStyle: { "enable-background": "new 0 0 17.5 12.5" },
                attrs: {
                  version: "1.1",
                  id: "Layer_1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  x: "0px",
                  y: "0px",
                  viewBox: "0 0 17.5 12.5",
                  "xml:space": "preserve"
                }
              },
              [
                _c("path", {
                  staticClass: "st0",
                  attrs: {
                    d:
                      "M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7\n                    l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z\n                     M10.6,1.5"
                  }
                })
              ]
            )
          ])
        ])
      ]
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "table-row" }, [
      _c("div", { staticClass: "table-col" }),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name starter" }, [_vm._v("Starter")]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("149")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col popular" }, [
        _c("div", { staticClass: "plan-name professional" }, [
          _vm._v("Professional")
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("249")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name business" }, [_vm._v("Business")]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("499")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name enterprise" }, [
          _vm._v("Enterprise")
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("999")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ])
    ])
  }
]
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
/* 90 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__ = __webpack_require__(26);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__ = __webpack_require__(92);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(91)
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
/* 91 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 92 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-help-page" }, [
    _c("h1", [_vm._v(_vm._s(_vm.__("Help", "dokan-lite")))]),
    _vm._v(" "),
    _vm.docs !== null
      ? _c(
          "div",
          { staticClass: "section-wrapper" },
          _vm._l(_vm.docs, function(section, index) {
            return _c(
              "postbox",
              { key: index, attrs: { title: section.title } },
              [
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
              ]
            )
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
/* 93 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__ = __webpack_require__(27);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__ = __webpack_require__(117);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(94)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Settings.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e4dc4572", Component.options)
  } else {
    hotAPI.reload("data-v-e4dc4572", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 94 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 95 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__ = __webpack_require__(28);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__ = __webpack_require__(116);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(96)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Fields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a96ce32e", Component.options)
  } else {
    hotAPI.reload("data-v-a96ce32e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 96 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _vm.containCommonFields(_vm.fieldData.type)
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.fieldValue[_vm.fieldData.name],
                  expression: "fieldValue[fieldData.name]"
                }
              ],
              staticClass: "regular-text",
              attrs: {
                type: "text",
                id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
              },
              domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.fieldValue,
                    _vm.fieldData.name,
                    $event.target.value
                  )
                }
              }
            }),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "number" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.fieldValue[_vm.fieldData.name],
                  expression: "fieldValue[fieldData.name]"
                }
              ],
              staticClass: "regular-text",
              attrs: {
                type: "number",
                min: _vm.fieldData.min,
                max: _vm.fieldData.max,
                step: _vm.fieldData.step,
                id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
              },
              domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.fieldValue,
                    _vm.fieldData.name,
                    $event.target.value
                  )
                }
              }
            }),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "textarea" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("textarea", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.fieldValue[_vm.fieldData.name],
                  expression: "fieldValue[fieldData.name]"
                }
              ],
              staticClass: "regular-text",
              attrs: {
                type: "textarea",
                rows: _vm.fieldData.rows,
                cols: _vm.fieldData.cols,
                id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
              },
              domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.fieldValue,
                    _vm.fieldData.name,
                    $event.target.value
                  )
                }
              }
            }),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "checkbox" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("fieldset", [
              _c(
                "label",
                {
                  attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
                },
                [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "checkbox",
                    attrs: {
                      type: "checkbox",
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      "true-value": "on",
                      "false-value": "off"
                    },
                    domProps: {
                      checked: Array.isArray(_vm.fieldValue[_vm.fieldData.name])
                        ? _vm._i(_vm.fieldValue[_vm.fieldData.name], null) > -1
                        : _vm._q(_vm.fieldValue[_vm.fieldData.name], "on")
                    },
                    on: {
                      change: function($event) {
                        var $$a = _vm.fieldValue[_vm.fieldData.name],
                          $$el = $event.target,
                          $$c = $$el.checked ? "on" : "off"
                        if (Array.isArray($$a)) {
                          var $$v = null,
                            $$i = _vm._i($$a, $$v)
                          if ($$el.checked) {
                            $$i < 0 &&
                              (_vm.fieldValue[_vm.fieldData.name] = $$a.concat([
                                $$v
                              ]))
                          } else {
                            $$i > -1 &&
                              (_vm.fieldValue[_vm.fieldData.name] = $$a
                                .slice(0, $$i)
                                .concat($$a.slice($$i + 1)))
                          }
                        } else {
                          _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$c)
                        }
                      }
                    }
                  }),
                  _vm._v(
                    "\n                    " +
                      _vm._s(_vm.fieldData.desc) +
                      "\n                "
                  )
                ]
              )
            ])
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "multicheck" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c(
              "fieldset",
              [
                _vm._l(_vm.fieldData.options, function(optionVal, optionKey) {
                  return [
                    _c(
                      "label",
                      {
                        attrs: {
                          for:
                            _vm.sectionId +
                            "[" +
                            _vm.fieldData.name +
                            "][" +
                            optionKey +
                            "]"
                        }
                      },
                      [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value:
                                _vm.fieldValue[_vm.fieldData.name][optionKey],
                              expression:
                                "fieldValue[fieldData.name][optionKey]"
                            }
                          ],
                          staticClass: "checkbox",
                          attrs: {
                            type: "checkbox",
                            id:
                              _vm.sectionId +
                              "[" +
                              _vm.fieldData.name +
                              "][" +
                              optionKey +
                              "]",
                            name:
                              _vm.sectionId +
                              "[" +
                              _vm.fieldData.name +
                              "][" +
                              optionKey +
                              "]",
                            "true-value": optionKey,
                            "false-value": ""
                          },
                          domProps: {
                            checked: Array.isArray(
                              _vm.fieldValue[_vm.fieldData.name][optionKey]
                            )
                              ? _vm._i(
                                  _vm.fieldValue[_vm.fieldData.name][optionKey],
                                  null
                                ) > -1
                              : _vm._q(
                                  _vm.fieldValue[_vm.fieldData.name][optionKey],
                                  optionKey
                                )
                          },
                          on: {
                            change: function($event) {
                              var $$a =
                                  _vm.fieldValue[_vm.fieldData.name][optionKey],
                                $$el = $event.target,
                                $$c = $$el.checked ? optionKey : ""
                              if (Array.isArray($$a)) {
                                var $$v = null,
                                  $$i = _vm._i($$a, $$v)
                                if ($$el.checked) {
                                  $$i < 0 &&
                                    (_vm.fieldValue[_vm.fieldData.name][
                                      optionKey
                                    ] = $$a.concat([$$v]))
                                } else {
                                  $$i > -1 &&
                                    (_vm.fieldValue[_vm.fieldData.name][
                                      optionKey
                                    ] = $$a
                                      .slice(0, $$i)
                                      .concat($$a.slice($$i + 1)))
                                }
                              } else {
                                _vm.$set(
                                  _vm.fieldValue[_vm.fieldData.name],
                                  optionKey,
                                  $$c
                                )
                              }
                            }
                          }
                        }),
                        _vm._v(
                          "\n                        " +
                            _vm._s(optionVal) +
                            "\n                    "
                        )
                      ]
                    ),
                    _vm._v(" "),
                    _c("br")
                  ]
                })
              ],
              2
            )
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "select" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            !_vm.fieldData.grouped
              ? _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular",
                    attrs: {
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value
                            return val
                          })
                        _vm.$set(
                          _vm.fieldValue,
                          _vm.fieldData.name,
                          $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        )
                      }
                    }
                  },
                  [
                    _vm.fieldData.placeholder
                      ? _c("option", {
                          attrs: { value: "" },
                          domProps: {
                            innerHTML: _vm._s(_vm.fieldData.placeholder)
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _vm._l(_vm.fieldData.options, function(
                      optionVal,
                      optionKey
                    ) {
                      return _c("option", {
                        domProps: {
                          value: optionKey,
                          innerHTML: _vm._s(optionVal)
                        }
                      })
                    })
                  ],
                  2
                )
              : _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular",
                    attrs: {
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value
                            return val
                          })
                        _vm.$set(
                          _vm.fieldValue,
                          _vm.fieldData.name,
                          $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        )
                      }
                    }
                  },
                  [
                    _vm.fieldData.placeholder
                      ? _c("option", {
                          attrs: { value: "" },
                          domProps: {
                            innerHTML: _vm._s(_vm.fieldData.placeholder)
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _vm._l(_vm.fieldData.options, function(optionGroup) {
                      return _c(
                        "optgroup",
                        { attrs: { label: optionGroup.group_label } },
                        _vm._l(optionGroup.group_values, function(option) {
                          return _c("option", {
                            domProps: {
                              value: option.value,
                              innerHTML: _vm._s(option.label)
                            }
                          })
                        })
                      )
                    })
                  ],
                  2
                ),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "file" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.fieldValue[_vm.fieldData.name],
                  expression: "fieldValue[fieldData.name]"
                }
              ],
              staticClass: "regular-text wpsa-url",
              attrs: {
                type: "text",
                id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
              },
              domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.fieldValue,
                    _vm.fieldData.name,
                    $event.target.value
                  )
                }
              }
            }),
            _vm._v(" "),
            _c("input", {
              staticClass: "button wpsa-browse",
              attrs: { type: "button", value: "Choose File" },
              on: {
                click: function($event) {
                  $event.preventDefault()
                  _vm.$emit(
                    "openMedia",
                    { sectionId: _vm.sectionId, name: _vm.fieldData.name },
                    $event
                  )
                }
              }
            }),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "color" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c(
            "td",
            [
              _c("color-picker", {
                model: {
                  value: _vm.fieldValue[_vm.fieldData.name],
                  callback: function($$v) {
                    _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$v)
                  },
                  expression: "fieldValue[fieldData.name]"
                }
              }),
              _vm._v(" "),
              _c("p", {
                staticClass: "description",
                domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
              })
            ],
            1
          )
        ])
      : _vm._e(),
    _vm._v(" "),
    "html" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "radio" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c(
              "fieldset",
              [
                _vm._l(_vm.fieldData.options, function(optionVal, optionKey) {
                  return [
                    _c(
                      "label",
                      {
                        attrs: {
                          for:
                            _vm.sectionId +
                            "[" +
                            _vm.fieldData.name +
                            "][" +
                            optionKey +
                            "]"
                        }
                      },
                      [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.fieldValue[_vm.fieldData.name],
                              expression: "fieldValue[fieldData.name]"
                            }
                          ],
                          staticClass: "radio",
                          attrs: {
                            type: "radio",
                            id:
                              _vm.sectionId +
                              "[" +
                              _vm.fieldData.name +
                              "][" +
                              optionKey +
                              "]",
                            name: optionKey
                          },
                          domProps: {
                            value: optionKey,
                            checked: _vm._q(
                              _vm.fieldValue[_vm.fieldData.name],
                              optionKey
                            )
                          },
                          on: {
                            change: function($event) {
                              _vm.$set(
                                _vm.fieldValue,
                                _vm.fieldData.name,
                                optionKey
                              )
                            }
                          }
                        }),
                        _vm._v(
                          " " + _vm._s(optionVal) + "\n                    "
                        )
                      ]
                    )
                  ]
                })
              ],
              2
            ),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "wpeditor" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c(
            "td",
            { attrs: { width: "72%" } },
            [
              _c("text-editor", {
                model: {
                  value: _vm.fieldValue[_vm.fieldData.name],
                  callback: function($$v) {
                    _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$v)
                  },
                  expression: "fieldValue[fieldData.name]"
                }
              }),
              _vm._v(" "),
              _c("p", {
                staticClass: "description",
                domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
              })
            ],
            1
          )
        ])
      : _vm._e(),
    _vm._v(" "),
    "repeatable" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", { attrs: { width: "72%" } }, [
            _c(
              "ul",
              { staticClass: "dokan-settings-repeatable-list" },
              _vm._l(_vm.fieldValue[_vm.fieldData.name], function(
                optionVal,
                optionKey
              ) {
                return _vm.fieldValue[_vm.fieldData.name]
                  ? _c("li", [
                      _vm._v(
                        "\n                    " + _vm._s(optionVal.value) + " "
                      ),
                      _c("span", {
                        staticClass: "dashicons dashicons-no-alt remove-item",
                        on: {
                          click: function($event) {
                            $event.preventDefault()
                            _vm.removeItem(optionKey, _vm.fieldData.name)
                          }
                        }
                      })
                    ])
                  : _vm._e()
              })
            ),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.repeatableItem[_vm.fieldData.name],
                  expression: "repeatableItem[fieldData.name]"
                }
              ],
              staticClass: "regular-text",
              attrs: { type: "text" },
              domProps: { value: _vm.repeatableItem[_vm.fieldData.name] },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.repeatableItem,
                    _vm.fieldData.name,
                    $event.target.value
                  )
                }
              }
            }),
            _vm._v(" "),
            _c(
              "a",
              {
                staticClass: "button dokan-repetable-add-item-btn",
                attrs: { href: "#" },
                on: {
                  click: function($event) {
                    $event.preventDefault()
                    _vm.addItem(_vm.fieldData.type, _vm.fieldData.name)
                  }
                }
              },
              [_vm._v("+")]
            ),
            _vm._v(" "),
            _c("p", {
              staticClass: "description",
              domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
            })
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    "radio_image" == _vm.fieldData.type
      ? _c("tr", { class: _vm.id }, [
          _c("th", { attrs: { scope: "row" } }, [
            _c(
              "label",
              {
                attrs: { for: _vm.sectionId + "[" + _vm.fieldData.name + "]" }
              },
              [_vm._v(_vm._s(_vm.fieldData.label))]
            )
          ]),
          _vm._v(" "),
          _c("td", [
            _c(
              "div",
              { staticClass: "radio-image-container" },
              [
                _vm._l(_vm.fieldData.options, function(image, name) {
                  return [
                    _c(
                      "label",
                      {
                        staticClass: "radio-image",
                        class: {
                          active: _vm.fieldValue[_vm.fieldData.name] === name,
                          "not-active":
                            _vm.fieldValue[_vm.fieldData.name] !== name
                        }
                      },
                      [
                        _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.fieldValue[_vm.fieldData.name],
                              expression: "fieldValue[fieldData.name]"
                            }
                          ],
                          staticClass: "radio",
                          attrs: { type: "radio", name: _vm.fieldData.name },
                          domProps: {
                            value: name,
                            checked: _vm._q(
                              _vm.fieldValue[_vm.fieldData.name],
                              name
                            )
                          },
                          on: {
                            change: function($event) {
                              _vm.$set(_vm.fieldValue, _vm.fieldData.name, name)
                            }
                          }
                        }),
                        _vm._v(" "),
                        _c(
                          "span",
                          { staticClass: "current-option-indicator" },
                          [
                            _c("span", {
                              staticClass: "dashicons dashicons-yes"
                            }),
                            _vm._v(" " + _vm._s(_vm.__("Active", "dokan-lite")))
                          ]
                        ),
                        _vm._v(" "),
                        _c("img", { attrs: { src: image } }),
                        _vm._v(" "),
                        _c("span", { staticClass: "active-option" }, [
                          _c(
                            "button",
                            {
                              staticClass: "button button-primary button-hero",
                              attrs: { type: "button" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.fieldValue[_vm.fieldData.name] = name
                                }
                              }
                            },
                            [
                              _vm._v(
                                "\n                                " +
                                  _vm._s(_vm.__("Select", "dokan-lite")) +
                                  "\n                            "
                              )
                            ]
                          )
                        ])
                      ]
                    )
                  ]
                })
              ],
              2
            )
          ])
        ])
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
    require("vue-hot-reload-api")      .rerender("data-v-a96ce32e", esExports)
  }
}

/***/ }),
/* 117 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-settings" }, [
    _c("h2", { staticStyle: { "margin-bottom": "15px" } }, [
      _vm._v(_vm._s(_vm.__("Settings", "dokan-lite")))
    ]),
    _vm._v(" "),
    _vm.isSaved
      ? _c(
          "div",
          {
            staticClass: "settings-error notice is-dismissible",
            class: { updated: _vm.isUpdated, error: !_vm.isUpdated },
            attrs: { id: "setting-message_updated" }
          },
          [
            _c("p", [
              _c("strong", { domProps: { innerHTML: _vm._s(_vm.message) } })
            ]),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass: "notice-dismiss",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    $event.preventDefault()
                    _vm.isSaved = false
                  }
                }
              },
              [
                _c("span", { staticClass: "screen-reader-text" }, [
                  _vm._v(_vm._s(_vm.__("Dismiss this notice.", "dokan-lite")))
                ])
              ]
            )
          ]
        )
      : _vm._e(),
    _vm._v(" "),
    _c("div", { staticClass: "dokan-settings-wrap" }, [
      _c(
        "h2",
        { staticClass: "nav-tab-wrapper" },
        [
          _vm._l(_vm.settingSections, function(section) {
            return [
              _c(
                "a",
                {
                  staticClass: "nav-tab",
                  class: { "nav-tab-active": _vm.currentTab === section.id },
                  attrs: { href: "#", id: "dokan_general-tab" },
                  on: {
                    click: function($event) {
                      $event.preventDefault()
                      _vm.changeTab(section)
                    }
                  }
                },
                [
                  _c("span", { staticClass: "dashicons", class: section.icon }),
                  _vm._v(" " + _vm._s(section.title))
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
        { staticClass: "metabox-holder" },
        [
          _vm._l(_vm.settingFields, function(fields, index) {
            return _vm.isLoaded
              ? [
                  _c(
                    "div",
                    {
                      directives: [
                        {
                          name: "show",
                          rawName: "v-show",
                          value: _vm.currentTab === index,
                          expression: "currentTab===index"
                        }
                      ],
                      staticClass: "group",
                      attrs: { id: index }
                    },
                    [
                      _c(
                        "form",
                        { attrs: { method: "post", action: "options.php" } },
                        [
                          _c("input", {
                            attrs: { type: "hidden", name: "option_page" },
                            domProps: { value: index }
                          }),
                          _vm._v(" "),
                          _c("input", {
                            attrs: {
                              type: "hidden",
                              name: "action",
                              value: "update"
                            }
                          }),
                          _vm._v(" "),
                          _c("h2", [
                            _vm._v(_vm._s(_vm.showSectionTitle(index)))
                          ]),
                          _vm._v(" "),
                          _c("table", { staticClass: "form-table" }, [
                            _c(
                              "tbody",
                              _vm._l(fields, function(field, fieldId) {
                                return _c("fields", {
                                  key: fieldId,
                                  attrs: {
                                    "section-id": index,
                                    id: fieldId,
                                    "field-data": field,
                                    "field-value": _vm.settingValues[index]
                                  },
                                  on: { openMedia: _vm.showMedia }
                                })
                              })
                            )
                          ]),
                          _vm._v(" "),
                          _c("p", { staticClass: "submit" }, [
                            _c("input", {
                              staticClass: "button button-primary",
                              attrs: {
                                type: "submit",
                                name: "submit",
                                id: "submit",
                                value: "Save Changes"
                              },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  _vm.saveSettings(
                                    _vm.settingValues[index],
                                    index
                                  )
                                }
                              }
                            })
                          ])
                        ]
                      )
                    ]
                  )
                ]
              : _vm._e()
          })
        ],
        2
      ),
      _vm._v(" "),
      _vm.showLoading
        ? _c("div", { staticClass: "loading" }, [_c("loading")], 1)
        : _vm._e()
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
    require("vue-hot-reload-api")      .rerender("data-v-e4dc4572", esExports)
  }
}

/***/ }),
/* 118 */
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
],[67]);
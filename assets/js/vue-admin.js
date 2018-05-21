dokanWebpack([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
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
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
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
//
//
//
//
//
//
//
//
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
            report: null,
            subscribe: {
                success: false,
                loading: false,
                email: ''
            }
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
            notFound: this.__('No requests found.', 'dokan-lite'),
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
            actionColumn: 'seller',
            actions: [{
                key: 'trash',
                label: this.__('Delete', 'dokan-lite')
            }, {
                key: 'cancel',
                label: this.__('Cancel', 'dokan-lite')
            }],
            bulkActions: [{
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
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Fields_vue__ = __webpack_require__(71);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            jQuery.post(dokan.ajaxurl, data, function (resp) {
                if (resp.success) {
                    self.isSaved = true;
                    self.isUpdated = true;
                    self.message = resp.data;
                } else {
                    self.isSaved = true;
                    self.isUpdated = false;
                    self.message = resp.data;
                }
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
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_ColorPicker_vue__ = __webpack_require__(72);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'Fields',

    components: {
        colorPicker: __WEBPACK_IMPORTED_MODULE_0_admin_components_ColorPicker_vue__["a" /* default */]
    },

    props: ['id', 'fieldData', 'sectionId', 'fieldValue'],

    methods: {
        containCommonFields(type) {
            return _.contains(['text', 'email', 'url', 'phone'], type);
        }
    }

});

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__ = __webpack_require__(74);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _App = __webpack_require__(50);

var _App2 = _interopRequireDefault(_App);

var _router = __webpack_require__(53);

var _router2 = _interopRequireDefault(_router);

var _adminMenuFix = __webpack_require__(97);

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
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(11);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(52);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(51)
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
/* 51 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 52 */
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
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Dashboard = __webpack_require__(54);

var _Dashboard2 = _interopRequireDefault(_Dashboard);

var _Withdraw = __webpack_require__(60);

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _Premium = __webpack_require__(63);

var _Premium2 = _interopRequireDefault(_Premium);

var _Help = __webpack_require__(66);

var _Help2 = _interopRequireDefault(_Help);

var _Settings = __webpack_require__(69);

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
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__ = __webpack_require__(12);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__ = __webpack_require__(59);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(55)
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
/* 55 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */
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
                              "\n                                    " +
                                _vm._s(
                                  _vm.__("net sales this month", "dokan-lite")
                                ) +
                                " "
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
                              "\n                                    " +
                                _vm._s(
                                  _vm.__("commission earned", "dokan-lite")
                                ) +
                                " "
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
                              _vm._s(_vm.__("awaiting approval", "dokan-lite"))
                            )
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
                      _c("li", { staticClass: "withdraw" }, [
                        _c("div", { staticClass: "dashicons dashicons-money" }),
                        _vm._v(" "),
                        _c("a", { attrs: { href: "#" } }, [
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
                              _vm._s(_vm.__("awaiting approval", "dokan-lite"))
                            )
                          ])
                        ])
                      ])
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
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__ = __webpack_require__(13);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__ = __webpack_require__(62);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(61)
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
/* 61 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 62 */
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
                    : [
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
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__ = __webpack_require__(14);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__ = __webpack_require__(65);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(64)
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
/* 64 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-pro-features" }, [
    _c("h1", [_vm._v(_vm._s(_vm.__("Dokan - Pro Features", "dokan-lite")))]),
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
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__ = __webpack_require__(15);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__ = __webpack_require__(68);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(67)
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
/* 67 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 68 */
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
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__ = __webpack_require__(16);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__ = __webpack_require__(96);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(70)
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
/* 70 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__ = __webpack_require__(17);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__ = __webpack_require__(95);
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
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__ = __webpack_require__(18);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__ = __webpack_require__(94);
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

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 73 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */
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
/* 95 */
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
            _c(
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
                      $event.target.multiple ? $$selectedVal : $$selectedVal[0]
                    )
                  }
                }
              },
              _vm._l(_vm.fieldData.options, function(optionVal, optionKey) {
                return _c("option", {
                  domProps: { value: optionKey, innerHTML: _vm._s(optionVal) }
                })
              })
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
/* 96 */
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
/* 97 */
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
],[49]);
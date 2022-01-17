<template>
    <div>
        <div class="vendor-list">
            <h1 class="wp-heading-inline">{{ __( 'Vendors', 'dokan-lite') }}</h1>
            <button @click="addNew()" class="page-title-action">{{ __( 'Add New', 'dokan-lite' ) }}</button>

            <!-- Add other component here here -->
            <component v-for="(vendorHeaderArea, index) in dokanVendorHeaderArea"
                       :key="index"
                       :is="vendorHeaderArea"
            />

            <AdminNotice></AdminNotice>

            <UpgradeBanner v-if="! hasPro"></UpgradeBanner>

            <hr class="wp-header-end">

            <ul class="subsubsub">
                <li><router-link :to="{ name: 'Vendors', query: { status: 'all' }}" active-class="current" exact >{{ __( 'All', 'dokan-lite' ) }} <span class="count">{{ counts.all }}</span></router-link> | </li>
                <li><router-link :to="{ name: 'Vendors', query: { status: 'approved' }}" active-class="current" exact >{{ __( 'Approved', 'dokan-lite' ) }} <span class="count">{{ counts.approved }}</span></router-link> | </li>
                <li><router-link :to="{ name: 'Vendors', query: { status: 'pending' }}" active-class="current" exact >{{ __( 'Pending', 'dokan-lite' ) }} <span class="count">{{ counts.pending }}</span></router-link> | </li>
            </ul>

            <search :title="__( 'Search Vendors', 'dokan-lite')" @searched="doSearch"></search>

            <list-table
                :columns="columns"
                :loading="loading"
                :rows="vendors"
                :actions="actions"
                actionColumn="store_name"
                :show-cb="showCb"
                :total-items="totalItems"
                :bulk-actions="bulkActions"
                :total-pages="totalPages"
                :per-page="perPage"
                :current-page="currentPage"
                :action-column="actionColumn"

                not-found="No vendors found."

                :sort-by="sortBy"
                :sort-order="sortOrder"
                :text="$root.listTableTexts()"
                @sort="sortCallback"

                @pagination="goToPage"
                @action:click="onActionClick"
                @bulk:click="onBulkAction"
                @searched="doSearch"
            >
                <template slot="store_name" slot-scope="data">
                    <img :src="data.row.gravatar" :alt="data.row.store_name" width="50">
                    <strong>
                        <router-link v-if="hasPro" :to="'/vendors/' + data.row.id">{{ data.row.store_name ? data.row.store_name : __( '(no name)', 'dokan-lite' ) }}</router-link>
                        <a v-else :href="editUrl(data.row.id)">{{ data.row.store_name ? data.row.store_name : __( '(no name)', 'dokan-lite' ) }}</a>
                    </strong>
                </template>

                <template slot="email" slot-scope="data">
                    <a :href="'mailto:' + data.row.email">{{ data.row.email }}</a>
                </template>

                <template slot="categories" slot-scope="{ row }">
                    {{ row.categories.map( category => category.name ).join( ', ' ) }}
                </template>

                <template slot="registered" slot-scope="data">
                    {{ moment(data.row.registered).format('MMM D, YYYY') }}
                </template>

                <template slot="enabled" slot-scope="data">
                    <switches :enabled="data.row.enabled" :value="data.row.id" @input="onSwitch"></switches>
                </template>

                <template slot="row-actions" slot-scope="data">
                <span v-for="(action, index) in actions" :class="action.key">
                    <router-link v-if="hasPro && action.key == 'edit'" :to="{ path: 'vendors/' + data.row.id, query:{edit:'true'} }">{{ action.label }}</router-link>
                    <a v-else-if="! hasPro && action.key == 'edit'" :href="editUrl(data.row.id)">{{ action.label }}</a>
                    <a v-else-if="action.key == 'products'" :href="productUrl(data.row.id)">{{ action.label }}</a>
                    <a v-else-if="action.key == 'orders'" :href="ordersUrl(data.row.id)">{{ action.label }}</a>
                    <a v-else-if="action.key == 'switch_to'" :href="switchToUrl(data.row)">{{ action.label }}</a>
                    <a v-else href="#">{{ action.label }}</a>
                    <template v-if="index !== (actions.length - 1)"> | </template>
                </span>
                </template>
                <template slot="filters">
                    <span class="form-group" :class="'none' === storeCategoryType ? 'dokan-hide' : ''">
                        <select class="dokan-input" id="vendor-search-category" v-model="filterVendorCategory">
                            <option value="">{{ __( 'Select category', 'dokan-lite' ) }}</option>
                        </select>
                    </span>
                    <span class="form-group" v-if="hasPro">
                        <select class="dokan-input" id="vendor-search-verified" v-model="filterVendorVerified">
                            <option value="both">{{ __( 'Both', 'dokan-lite' ) }}</option>
                            <option value="verified">{{ __( 'Verified', 'dokan-lite' ) }}</option>
                            <option value="not_verified">{{ __( 'Not verified', 'dokan-lite' ) }}</option>
                        </select>
                    </span>
                    <span class="form-group">
                        <date-range-picker
                            ref="picker"
                            :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }"
                            :singleDatePicker="false"
                            :timePicker="false"
                            :timePicker24Hour="false"
                            :showWeekNumbers="false"
                            :showDropdowns="true"
                            :autoApply="false"
                            v-model="filterDateRange"
                            :linkedCalendars="true"
                            @update="dateRangeFilterUpdated"
                        >
                            <template v-slot:input="picker">
                                <span v-if="filterDateRange.startDate">{{ filterDateRange.startDate | date }} - {{ filterDateRange.endDate | date }}</span>
                                <span class="date-range-placeholder" v-if="! filterDateRange.startDate">{{ __( 'Filter by date', 'dokan' ) }}</span>
                            </template>

                            <!--    footer slot-->
                            <div slot="footer" slot-scope="data" class="drp-buttons">
                                <span class="drp-selected">{{ data.rangeText }}</span>
                                <button @click="data.clickApply" v-if="!data.in_selection" type="button" class="applyBtn btn btn-sm btn-success">{{ __( 'Apply', 'dokan' ) }}</button>
                            </div>
                        </date-range-picker>
                    </span>
                    <button @click="filterVendorList();" class="button">{{ __( 'Filter', 'dokan-lite' ) }}</button>
                    <button @click="clearVendorFilterDatas();" class="button">{{ __( 'Clear', 'dokan-lite' ) }}</button>
                </template>
            </list-table>

            <add-vendor :vendor-id="vendorId" v-if="loadAddVendor" />

        </div>
    </div>
</template>

<script>
import AddVendor from './AddVendor.vue'
import UpgradeBanner from "admin/components/UpgradeBanner.vue";

let ListTable   = dokan_get_lib('ListTable');
let Switches    = dokan_get_lib('Switches');
let Search      = dokan_get_lib('Search');
let AdminNotice = dokan_get_lib('AdminNotice');
let DateRangePicker = dokan_get_lib('DateRangePicker');

export default {

    name: 'Vendors',

    components: {
        ListTable,
        Switches,
        Search,
        AddVendor,
        UpgradeBanner,
        AdminNotice,
        DateRangePicker,
    },

    data () {
        const startDate = '';
        const endDate = '';

        return {
            showCb: true,
            hasPro: dokan.hasPro,
            counts: {
                pending: 0,
                approved: 0,
                all: 0
            },
            vendorId:0,
            totalItems: 0,
            perPage: 20,
            totalPages: 1,
            loading: false,

            columns: {
                'store_name': {
                    label: this.__( 'Store', 'dokan-lite' ),
                    sortable: true
                },
                'email': {
                    label: this.__( 'E-mail', 'dokan-lite' )
                },
                'phone': {
                    label: this.__( 'Phone', 'dokan-lite' )
                },
                'registered': {
                    label: this.__( 'Registered', 'dokan-lite' ),
                    sortable: true
                },
                'enabled': {
                    label: this.__( 'Active', 'dokan-lite' )
                }
            },
            actionColumn: 'title',
            actions: [
                {
                    key: 'edit',
                    label: this.__( 'Edit', 'dokan-lite' )
                },
                {
                    key: 'products',
                    label: this.__( 'Products', 'dokan-lite' )
                },
                {
                    key: 'orders',
                    label: this.__( 'Orders', 'dokan-lite' )
                },
            ],
            bulkActions: [
                {
                    key: 'approved',
                    label: this.__( 'Approve Vendors', 'dokan-lite' )
                },
                {
                    key: 'pending',
                    label: this.__( 'Disable Selling', 'dokan-lite' )
                }
            ],
            vendors: [],
            loadAddVendor: false,
            dokanVendorHeaderArea: dokan.hooks.applyFilters( 'getDokanVendorHeaderArea', [] ),
            isVendorSwitchingEnabled: false,
            filterDateRange: {
                startDate,
                endDate,
            },
            filterVendorCategory:'',
            filterVendorVerified:'both',
            allStoreCategories: [],
            storeCategoryType: 'none',
        }
    },

    filters: {
        dateCell (value) {
        let dt = new Date(value)

        return dt.getDate()
        },
        date (val) {
        return val ? moment(val.toLocaleString()).format('MMM D, YYYY') : ''
        }
    },

    mounted() {
        const self = this;

        jQuery('#vendor-search-category').selectWoo({
            ajax: {
                url: "".concat(dokan.rest.root, "dokan/v1/store-categories"),
                dataType: 'json',
                headers: {
                    "X-WP-Nonce" : dokan.rest.nonce
                },
                data(params) {
                    return {
                        search: params.term,
                        per_page: 20,
                        orderby: 'name',
                        order: 'asc'
                    };
                },
                processResults(data) {
                    return {
                        results: data.map((category) => {
                            return {
                                id: category.id,
                                text: category.name
                            };
                        })
                    };
                }
            }
        });

        jQuery('#vendor-search-category').on('select2:select', (e) => {
            self.filterVendorCategory = e.params.data.id;
        });
    },

    watch: {
        '$route.query.status'() {
            this.fetchVendors();
        },

        '$route.query.page'() {
            this.fetchVendors();
        },

        '$route.query.orderby'() {
            this.fetchVendors();
        },

        '$route.query.order'() {
            this.fetchVendors();
        },

        'filterVendorCategory'(data) {
            if ( '' === data ) {
                jQuery('#vendor-search-category').val('').trigger('change');
            }
        },
    },

    computed: {
        currentStatus() {
            return this.$route.query.status || 'all';
        },

        currentPage() {
            let page = this.$route.query.page || 1;

            return parseInt( page );
        },

        sortBy() {
            return this.$route.query.orderby || 'registered';
        },

        sortOrder() {
            return this.$route.query.order || 'desc';
        },

        storeCategory() {
            return this.$route.query.store_category || null;
        }
    },

    created() {
        this.$root.$on('modalClosed', () => {
            this.loadAddVendor = false;
            this.vendorId = 0;
        });

        this.fetchVendors();

        this.$root.$on( 'vendorAdded', ( payload ) => {
            this.vendors.unshift( payload );
        } );

        this.$root.$on( 'addAnotherVendor', () => {
            this.loadAddVendor = true;
        } );

        this.$root.$on( 'categoryFetched', ( payload ) => {
            this.categories = payload.categories;
            this.isCategoryMultiple = payload.isCategoryMultiple;
            this.columns = payload.columns;
            this.storeCategoryType = payload.storeCategoryType;
        });

        this.isVendorSwitchingEnabled = dokan.is_vendor_switching_enabled ? true : false;

        if ( this.isVendorSwitchingEnabled ) {
            this.actions.push({
                key: 'switch_to',
                label: this.__( 'Switch To', 'dokan-lite' )
            });
        }
    },

    methods: {
        addNew() {
            this.loadAddVendor = true;
        },

        doSearch(payload) {
            const searchableArgs = {
                search: payload,
                page: this.currentPage,
                orderby: this.sortBy,
                order: this.sortOrder
            }

            this.searchOrFilterVendors( searchableArgs );
        },

        searchOrFilterVendors(args = {}) {
             let self     = this;
            self.loading = true;

            dokan.api.get(`/stores`, args)
            .done((response, status, xhr) => {
                self.vendors = response;
                self.loading = false;

                this.updatedCounts(xhr);
                this.updatePagination(xhr);
            });
        },

        updatedCounts(xhr) {
            this.counts.pending  = parseInt( xhr.getResponseHeader('X-Status-Pending') );
            this.counts.approved = parseInt( xhr.getResponseHeader('X-Status-Approved') );
            this.counts.all      = parseInt( xhr.getResponseHeader('X-Status-All') );

            this.updateVendorMenuPendingBadge();
        },

        updateVendorMenuPendingBadge() {
            const badge      = jQuery( '.pending-vendors-count-in-list' );
            const badgeCount = jQuery( '.pending-vendors-count-badge-in-list' );

            badgeCount.html(this.counts.pending);
            this.counts.pending > 0 ? badge.removeClass('dokan-hide') : badge.addClass('dokan-hide');
        },

        updatePagination(xhr) {
            this.totalPages = parseInt( xhr.getResponseHeader('X-WP-TotalPages') );
            this.totalItems = parseInt( xhr.getResponseHeader('X-WP-Total') );
        },

        fetchVendors() {

            let self = this;

            self.loading = true;

            const data = {
                per_page: self.perPage,
                page: self.currentPage,
                status: self.currentStatus,
                orderby: self.sortBy,
                order: self.sortOrder,
                store_category: self.storeCategory
            };

            dokan.api.get('/stores', data)
                .done((response, status, xhr) => {
                    self.vendors = response;
                    self.loading = false;

                    self.updatedCounts(xhr);
                    self.updatePagination(xhr);
                });
        },

        onActionClick(action, row) {
            if ( 'trash' === action ) {
                if ( confirm('Are you sure to delete?') ) {
                    alert('deleted: ' + row.title);
                }
            }
        },

        onSwitch(status, vendor_id) {

            let message = ( status === false ) ? this.__( 'The vendor has been disabled.', 'dokan-lite' ) : this.__( 'Selling has been enabled', 'dokan-lite' );

            dokan.api.put('/stores/' + vendor_id + '/status', {
                status: ( status === false ) ? 'inactive' : 'active'
            })
            .done(response => {
                this.$notify({
                    title: this.__( 'Success!', 'dokan-lite' ),
                    type: 'success',
                    text: message,
                });

                if ( 'all' === this.currentStatus || 'pending' === this.currentStatus || 'approved' === this.currentStatus ) {
                    this.fetchVendors();
                }
            });
        },

        moment(date) {
            return moment(date);
        },

        goToPage(page) {
            this.$router.push({
                name: 'Vendors',
                query: {
                    status: this.currentStatus,
                    page: page
                }
            });
        },

        onBulkAction(action, items) {
            let jsonData = {};
            jsonData[action] = items;

            this.loading = true;

            dokan.api.put('/stores/batch', jsonData)
            .done(response => {
                this.loading = false;
                this.fetchVendors();
            });
        },

        sortCallback(column, order) {
            this.$router.push({
                name: 'Vendors',
                query: {
                    status: this.currentStatus,
                    page: 1,
                    orderby: column,
                    order: order
                }
            });
        },

        productUrl(id) {
            return dokan.urls.adminRoot + 'edit.php?post_type=product&author=' + id;
        },

        ordersUrl(id) {
            return dokan.urls.adminRoot + 'edit.php?post_type=shop_order&vendor_id=' + id;
        },

        editUrl(id) {
            return dokan.urls.adminRoot + 'user-edit.php?user_id=' + id;
        },

        switchToUrl(row) {
            return row.switch_url;
        },

        dateRangeFilterUpdated() {
            let start_date = jQuery.datepicker.formatDate('yy-mm-dd', new Date(this.filterDateRange.startDate));
            let end_date   = jQuery.datepicker.formatDate('yy-mm-dd', new Date(this.filterDateRange.endDate));

            console.log(start_date,end_date);
        },

        clearVendorFilterDatas() {
            this.filterDateRange.startDate = '';
            this.filterDateRange.endDate   = '';

            this.filterVendorCategory = '';
            this.filterVendorVerified = 'both';

            this.fetchVendors();
        },

        filterVendorList() {
            const searchableArgs = {
                page: this.currentPage,
                orderby: this.sortBy,
                order: this.sortOrder
            }

            '' !== this.filterDateRange.startDate ? searchableArgs.startDate = moment(this.filterDateRange.startDate).format('MMM D, YYYY') : '';
            '' !== this.filterDateRange.endDate ? searchableArgs.endDate = moment(this.filterDateRange.endDate).format('MMM D, YYYY') : '';
            '' !== this.filterVendorCategory ? searchableArgs.category = this.filterVendorCategory : '';
            '' !== this.filterVendorVerified ? searchableArgs.verified = this.filterVendorVerified : '';

            this.searchOrFilterVendors( searchableArgs );
        },
    }
};
</script>

<style lang="less">
.vendor-list {
    .dokan-btn {
        padding: 5px 10px;
        font-size: 15px;
        border-radius: 3px;
        color: #2873aa;
    }

    .image {
        width: 10%;
    }

    .store_name {
        width: 30%;
    }

    td.store_name img {
        float: left;
        margin-right: 10px;
        margin-top: 1px;
        width: 24px;
        height: auto;
    }

    td.store_name strong {
        display: block;
        margin-bottom: .2em;
        font-size: 14px;
    }
}

@media only screen and (max-width: 600px) {
    .vendor-list {
        table {
            td.store_name, td.enabled {
                display: table-cell !important;
            }

            th:not(.check-column):not(.store_name):not(.enabled) {
                display: none;
            }

            td:not(.check-column):not(.store_name):not(.enabled) {
                display: none;
            }

            th.column, table td.column {
                width: auto;
            }

            td.manage-column.column-cb.check-column {
                padding-right: 15px;
            }

            th.column.enabled {
                width: 25% !important;
            }
        }
    }
}

@media only screen and (max-width:320px) {
    .vendor-list {
        table {
            .row-actions span {
                font-size: 11px;
            }
        }
    }
}
</style>

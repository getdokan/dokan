<template>
    <div class="vendor-list">
        <h1 class="wp-heading-inline">{{ __( 'Vendors', 'dokan') }}</h1>
        <button @click="addNew()" class="page-title-action">{{ __( 'Add New', 'dokan' ) }}</button>
        <router-link v-if="categories.length" class="page-title-action" :to="{name: 'StoreCategoriesIndex'}">{{ __( 'Store Categories', 'dokan' ) }}</router-link>
        <hr class="wp-header-end">

        <ul class="subsubsub">
            <li><router-link :to="{ name: 'Vendors', query: { status: 'all' }}" active-class="current" exact v-html="sprintf( __( 'All <span class=\'count\'>(%s)</span>', 'dokan' ), counts.all )"></router-link> | </li>
            <li><router-link :to="{ name: 'Vendors', query: { status: 'approved' }}" active-class="current" exact v-html="sprintf( __( 'Approved <span class=\'count\'>(%s)</span>', 'dokan' ), counts.approved )"></router-link> | </li>
            <li><router-link :to="{ name: 'Vendors', query: { status: 'pending' }}" active-class="current" exact v-html="sprintf( __( 'Pending <span class=\'count\'>(%s)</span>', 'dokan' ), counts.pending )"></router-link></li>
        </ul>

        <search title="Search Vendors" @searched="doSearch"></search>

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
            @sort="sortCallback"

            @pagination="goToPage"
            @action:click="onActionClick"
            @bulk:click="onBulkAction"
            @searched="doSearch"
        >
            <template slot="store_name" slot-scope="data">
                <img :src="data.row.gravatar" :alt="data.row.store_name" width="50">
                <strong>
                    <router-link v-if="hasPro" :to="'/vendors/' + data.row.id">{{ data.row.store_name ? data.row.store_name : __( '(no name)', 'dokan' ) }}</router-link>
                    <a v-else :href="editUrl(data.row.id)">{{ data.row.store_name ? data.row.store_name : __( '(no name)', 'dokan' ) }}</a>
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
                    <a v-else href="#">{{ action.label }}</a>

                    <template v-if="index !== (actions.length - 1)"> | </template>
                </span>
            </template>
        </list-table>

        <add-vendor :vendor-id="vendorId" v-if="loadAddVendor" />

    </div>
</template>

<script>
import AddVendor from './AddVendor.vue'
let ListTable = dokan_get_lib('ListTable');
let Switches  = dokan_get_lib('Switches');
let Search    = dokan_get_lib('Search');

export default {

    name: 'Vendors',

    components: {
        ListTable,
        Switches,
        Search,
        AddVendor
    },

    data () {
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
                    label: this.__( 'Store', 'dokan' ),
                    sortable: true
                },
                'email': {
                    label: this.__( 'E-mail', 'dokan' )
                },
                'phone': {
                    label: this.__( 'Phone', 'dokan' )
                },
                'registered': {
                    label: this.__( 'Registered', 'dokan' ),
                    sortable: true
                },
                'enabled': {
                    label: this.__( 'Status', 'dokan' )
                }
            },
            actionColumn: 'title',
            actions: [
                {
                    key: 'edit',
                    label: this.__( 'Edit', 'dokan' )
                },
                {
                    key: 'products',
                    label: this.__( 'Products', 'dokan' )
                },
                {
                    key: 'orders',
                    label: this.__( 'Orders', 'dokan' )
                },
            ],
            bulkActions: [
                {
                    key: 'approved',
                    label: this.__( 'Approve Vendors', 'dokan' )
                },
                {
                    key: 'pending',
                    label: this.__( 'Disable Selling', 'dokan' )
                }
            ],
            vendors: [],
            loadAddVendor: false,
            categories: [],
            isCategoryMultiple: false,
            storeCategoryType: dokan.store_category_type
        }
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

        if (this.storeCategoryType !== 'none') {
            this.fetchCategories();
        }

        this.$root.$on( 'vendorAdded', ( payload ) => {
            this.vendors.unshift( payload );
        } );

        this.$root.$on( 'addAnotherVendor', () => {
            this.loadAddVendor = true;
        } );
    },

    methods: {
        addNew() {
            this.loadAddVendor = true;
        },

        doSearch(payload) {
            let self     = this;
            self.loading = true;

            dokan.api.get(`/stores?search=${payload}`, {
                page: this.currentPage,
                orderby: this.sortBy,
                order: this.sortOrder
            })
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

        fetchCategories() {
            const self = this;

            dokan.api.get( '/store-categories' )
                .done( ( response, status, xhr ) => {
                    self.categories = response;
                    self.isCategoryMultiple = ( 'multiple' === xhr.getResponseHeader( 'X-WP-Store-Category-Type' ) );

                    self.columns = {
                        'store_name': {
                            label: this.__( 'Store', 'dokan' ),
                            sortable: true
                        },
                        'email': {
                            label: this.__( 'E-mail', 'dokan' )
                        },
                        'categories': {
                            label: self.isCategoryMultiple ? this.__( 'Categories', 'dokan' ) : this.__( 'Category', 'dokan' )
                        },
                        'phone': {
                            label: this.__( 'Phone', 'dokan' )
                        },
                        'registered': {
                            label: this.__( 'Registered', 'dokan' ),
                            sortable: true
                        },
                        'enabled': {
                            label: this.__( 'Status', 'dokan' )
                        }
                    };
                } );
        },

        onActionClick(action, row) {
            if ( 'trash' === action ) {
                if ( confirm('Are you sure to delete?') ) {
                    alert('deleted: ' + row.title);
                }
            }
        },

        onSwitch(status, vendor_id) {

            let message = ( status === false ) ? this.__( 'The vendor has been disabled.', 'dokan' ) : this.__( 'Selling has been enabled', 'dokan' );

            dokan.api.put('/stores/' + vendor_id + '/status', {
                status: ( status === false ) ? 'inactive' : 'active'
            })
            .done(response => {
                this.$notify({
                    title: this.__( 'Success!', 'dokan' ),
                    type: 'success',
                    text: message,
                });

                if (this.currentStatus !== 'all' ) {
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
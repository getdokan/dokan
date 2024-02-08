<template>
    <div class="p-3">
        <div class="mb-5">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">Admin Commission type</p>
            <div class="flex flex-col">
                <select v-model="selectedCommission" id="_subscription_product_admin_commission_type" name="_subscription_product_admin_commission_type" class="select short">
                    <option v-for="(commissionData, key) in commissionTypes" :value="key">{{commissionData}}</option>
                </select>
                <span class="description">Set the commission type admin will get under this subscription</span>
            </div>
        </div>
        <div v-if="'category_based' === selectedCommission">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">Admin Commission</p>
            <category-based-commission
                :value="commission"
                @change="onCategoryUpdate"
            />
        </div>
        <div v-else-if="'fixed' === selectedCommission">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">Admin Commission</p>
            <combine-input
                :value="fixedCommission"
                v-on:change="fixedCOmmissionhandler"
            />
        </div>
    </div>
</template>

<script>
    import CategoryBasedCommission from "admin/components/Commission/CategoryBasedCommission.vue";
    import CombineInput from "admin/components/CombineInput.vue";

    export default {
        name: 'AdminCommission',

        components: { CategoryBasedCommission, CombineInput },

        data() {
            return {
                selectedCommission: 'fixed',
                commission: {},
                commissionTypes: {},
                fixedCommission: {},
                productId: 0,
                wcProduct: {},
            }
        },

        created() {
            let $ = window.jQuery;
            let self = this;

            if ( window.dokanCommission && window.dokanCommission.commissionTypes ) {
                this.commissionTypes = window.dokanCommission.commissionTypes;
            }

            if ( $('#post_ID').val() ) {
                self.productId = $('#post_ID').val();
            }

            $("form").submit( this.saveommission );

            this.fetchCommission();
        },

        methods: {
            fetchCommission() {
                // dokan.api.get(`/products/${this.productId}`)
                //     .done((response, status, xhr) => {
                //         this.wcProduct = response
                //
                //         this.selectedCommission = this.getMetaData('_subscription_product_admin_commission_type', 'fixed');
                //         this.fixedCommission = {
                //             fixed: this.getMetaData( '_subscription_product_admin_commission', 0 ),
                //             percentage: this.getMetaData( '_subscription_product_admin_additional_fee', 0 ),
                //         }
                //
                //         this.commission = this.getMetaData( '_subscription_product_admin_category_based_commission', 0 );
                //     });
            },

            saveommission() {
                let data = {
                    product_id: this.productId,
                    commission_type: this.selectedCommission,
                    commission: this.processItemsForDatabase()
                }

                console.log(data);

                // dokan.api.post(`/subscription/save-commission`, data);
            },

            onCategoryUpdate(data) {
                this.commission = data;
            },

            fixedCOmmissionhandler(data, de) {
                this.fixedCommission = data;
            },

            processItemsForDatabase() {
                if ( ! this.commission.hasOwnProperty( 'items' ) ) {
                    return [];
                }

                let items = [];
                let all = this.commission.hasOwnProperty('all') ? this.commission.all : {};
                let commissionItems = this.commission.items;

                Object.keys( commissionItems ).forEach( item => {
                    items.push({
                        category_id: item,
                        ...commissionItems[item]
                    });
                } );

                return {
                    fixed: {
                        flat: this.fixedCommission.hasOwnProperty('fixed') ? this.fixedCommission.fixed : 0,
                        percentage: this.fixedCommission.hasOwnProperty('percentage') ? this.fixedCommission.percentage : 0,
                    },
                    category_based: {
                        all,
                        items
                    }
                };
            },

            getMetaData( key, defaultData = '' ) {
                if ( ! Object.values( this.wcProduct ).length || ! this.wcProduct.hasOwnProperty('meta_data') || 'object' !== typeof this.wcProduct.meta_data ) {
                    return defaultData;
                }

                let metaData = this.wcProduct.meta_data;

                metaData.forEach(item => {
                    if ( item.hasOwnProperty( 'key' ) && item.key === key ) {
                        defaultData = item.value;
                    }
                });

                return defaultData;
            }
        }
    }
</script>


<style scoped lang="less">

</style>

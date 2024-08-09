<template>
    <div class="p-3">
        <div class="mb-5">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission type', 'dokan' )}}</p>
            <div class="flex flex-col">
                <select v-model="selectedCommission" id="_subscription_product_admin_commission_type" name="_subscription_product_admin_commission_type" class="select short">
                    <option v-for="(commissionData, key) in commissionTypes" :value="key">{{commissionData}}</option>
                </select>
            </div>
        </div>
        <div v-if="'category_based' === selectedCommission">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission', 'dokan' )}}</p>
            <category-based-commission
                :value="commission"
                @change="onCategoryUpdate"
            />
        </div>
        <div v-else-if="'fixed' === selectedCommission">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission', 'dokan' )}}</p>
            <combine-input
                :value="fixedCommission"
                v-on:change="fixedCOmmissionhandler"
            />
        </div>

        <input type="hidden" :value="selectedCommission" name="dokan_commission_type"/>
        <input type="hidden" :value="fixedCommission.fixed ?? 0" name="dokan_commission_flat">
        <input type="hidden" :value="fixedCommission.percentage ?? 0" name="dokan_commission_percentage">
        <input type="hidden" :value="JSON.stringify(commission)" name="dokan_commission_category_based">
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
            }
        },

        created() {
            let element = document.getElementById( 'dokan-setup-wizard-commission-data' );

            if ( ! element || ! element.dataset || ! element.dataset.commission ) {
                return;
            }

            let commission = JSON.parse( element.dataset.commission );

            this.commissionTypes = commission.dokanCommission;
            this.fixedCommission.fixed = commission.additional_fee ? Number( commission.additional_fee ) : 0;
            this.fixedCommission.percentage = commission.admin_percentage ? Number( commission.admin_percentage ) : 0;
            this.selectedCommission = commission.commission_type ? String(commission.commission_type) : 'fixed';
            this.commission = commission.commission_category_based_values;
        },

        methods: {
            onCategoryUpdate(data) {
                this.commission = data;
            },

            fixedCOmmissionhandler(data) {
                if (isNaN( data.fixed )) {
                    data.fixed = this.fixedCommission.fixed ?? '';
                }
                if (isNaN( data.percentage )) {
                    data.percentage = this.fixedCommission.percentage ?? '';
                }
                this.fixedCommission = data;
            },
        }
    }
</script>


<style scoped lang="less">

</style>

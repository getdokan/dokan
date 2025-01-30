<template>
    <div class="p-3">
        <div class="mb-5">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission type', 'dokan-lite' )}}</p>
            <div class="flex flex-col">
                <select v-model="selectedCommission" id="_subscription_product_admin_commission_type" name="_subscription_product_admin_commission_type" class="select short">
                    <option v-for="(commissionData, key) in commissionTypes" :value="key">{{commissionData}}</option>
                </select>
            </div>
        </div>
        <div v-if="'category_based' === selectedCommission">
            <div class="flex justify-between mb-4 !p-0 m-0">
                <label class="!p-0 m-0 !mb-[6px] block" for="_subscription_product_admin_commission_type">
                    {{__( 'Apply Parent Category Commission to All Subcategories ', 'dokan-lite' )}}
                </label>
                <Switches @input="handleResetToggle" :enabled="resetSubCategory"/>
            </div>
            <div class="!p-0 !m-0">
                <p class="!font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission', 'dokan-lite' )}}</p>
                <category-based-commission
                    :value="commission"
                    @change="onCategoryUpdate"
                    :resetSubCategory="resetSubCategory"
                />
            </div>
        </div>
        <div v-else-if="'fixed' === selectedCommission">
            <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission', 'dokan-lite' )}}</p>
            <combine-input
                :value="fixedCommission"
                v-on:change="fixedCOmmissionhandler"
            />
        </div>

        <input type="hidden" :value="selectedCommission" name="dokan_commission_type"/>
        <input type="hidden" :value="fixedCommission.fixed ?? 0" name="dokan_commission_flat">
        <input type="hidden" :value="fixedCommission.percentage ?? 0" name="dokan_commission_percentage">
        <input type="hidden" :value="JSON.stringify(commission)" name="dokan_commission_category_based">
        <input type="hidden" :value="resetSubCategory" name="reset_sub_category">
    </div>
</template>

<script>
    import CategoryBasedCommission from "admin/components/Commission/CategoryBasedCommission.vue";
    import CombineInput from "admin/components/CombineInput.vue";
    import Switches from "../../../../../src/admin/components/Switches.vue";

    export default {
        name: 'AdminCommission',

        components: { Switches, CategoryBasedCommission, CombineInput },

        data() {
            return {
                selectedCommission: 'fixed',
                commission: {},
                commissionTypes: {},
                fixedCommission: {},
                resetSubCategory: true
            }
        },

        mounted() {
            let element = document.getElementById( 'dokan-setup-wizard-commission-data' );

            if ( ! element || ! element.dataset || ! element.dataset.commission ) {
                return;
            }

            let commission = JSON.parse( element.dataset.commission );

            this.commissionTypes = commission.dokanCommission;
            this.fixedCommission.fixed = commission.additional_fee ? Number( commission.additional_fee ) : 0;
            this.fixedCommission.percentage = commission.admin_percentage ? Number( commission.admin_percentage ) : 0;
            this.selectedCommission = commission.commission_type ? String(commission.commission_type) : 'fixed';
            let commission_category_based_values = commission.commission_category_based_values;

            commission_category_based_values.all = ! commission_category_based_values.all || Array.isArray( commission_category_based_values.all ) ? {} : commission_category_based_values.all;
            commission_category_based_values.items = ! commission_category_based_values.items || Array.isArray( commission_category_based_values.items ) ? {} : commission_category_based_values.items;

            this.commission = commission_category_based_values;
            this.resetSubCategory = commission.reset_sub_category ?? true;
        },

        methods: {
            handleResetToggle(value) {
                const confirmTitle = value ? this.__("Enable Commission Inheritance Setting?", "dokan-lite") : this.__("Disable Commission Inheritance Setting?", "dokan-lite");
                const htmlText = value ? this.__("Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.", "dokan-lite") : this.__("Subcategories will maintain their independent commission rates when parent category rates are changed.", "dokan-lite");
                const confirmBtnText = value ? this.__("Enable", "dokan-lite") : this.__("Disable", "dokan-lite");
                const updatableValue = !value;
                const self = this;

                Swal.fire({
                    icon: "warning",
                    html: htmlText,
                    title: confirmTitle,
                    showCancelButton: true,
                    cancelButtonText: this.__("Cancel", "dokan-lite"),
                    confirmButtonText: confirmBtnText
                }).then((response) => {
                    const status = response.isConfirmed ? value : updatableValue;
                    self.resetSubCategory = status;

                    self.vendorInfo.reset_sub_category = status;
                });
            },

            onCategoryUpdate(data) {
                this.commission = data;
            },

            fixedCOmmissionhandler(data) {
                if (data.fixed === '') {
                    data.fixed = this.fixedCommission.fixed ?? 0;
                }
                if (data.percentage === '') {
                    data.percentage = this.fixedCommission.percentage ?? 0;
                }

                this.fixedCommission = data;
            },
        }
    }
</script>


<style scoped lang="less">

</style>

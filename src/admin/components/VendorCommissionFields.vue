<template>
  <div>
    <div class="content-header">
      {{ __("Commission Options", "dokan-lite") }}
    </div>

    <div class="content-body">
        <div class="p-3">
            <div class="mb-5">
                <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">Admin Commission type</p>
                <div class="flex flex-col">
                    <select v-model="selectedCommission" @change="commissionUpdated" id="_subscription_product_admin_commission_type" name="_subscription_product_admin_commission_type" class="select short">
                        <option v-for="(commissionData, key) in commissionTypes" :value="key">{{commissionData}}</option>
                    </select>
                    <span class="description">Set the commission type admin will get under this subscription</span>
                </div>
            </div>
            <div v-if="'category_based' === selectedCommission">
                <p class="!p-0 !m-0 !font-semibold" for="_subscription_product_admin_commission_type">Admin Commission</p>
                <category-based-commission
                    :value="categoryCommission"
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
    </div>
  </div>
</template>

<script>

import CombineInput from "admin/components/CombineInput.vue";
import CategoryBasedCommission from "admin/components/Commission/CategoryBasedCommission.vue";

export default {
  name: "VendorCommissionFields",

  components: { CategoryBasedCommission, CombineInput },

  props: {
      vendorInfo: {
          type: Object
      },
  },

  data() {
    return {
      selectedCommission: 'fixed',
      categoryCommission: {},
      commissionTypes: {},
      fixedCommission: {},
    };
  },

  created() {
      this.commissionTypes = window.dokanAdmin.commission_types ?? {};
      if ( this.vendorInfo.admin_commission_type && Object.keys(this.commissionTypes).includes( this.vendorInfo.admin_commission_type ) ) {
          this.selectedCommission = this.vendorInfo.admin_commission_type;
      }

      let fixedCommission = {
          fixed: '',
          percentage: ''
      };

      if ( this.vendorInfo.admin_commission ) {
          fixedCommission.percentage = this.vendorInfo.admin_commission;
      }

      if ( this.vendorInfo.admin_additional_fee ) {
          fixedCommission.fixed = this.vendorInfo.admin_additional_fee;
      }

      if ( this.vendorInfo.admin_category_commission ) {
          this.categoryCommission = this.vendorInfo.admin_category_commission;
      }

      this.fixedCommission = fixedCommission;
  },

  methods: {
      fixedCOmmissionhandler(data) {
          this.fixedCommission = data;

          this.commissionUpdated();
      },

      onCategoryUpdate(data) {
          this.categoryCommission = data;

          this.commissionUpdated();
      },

      commissionUpdated() {
          this.vendorInfo.admin_additional_fee = this.fixedCommission.fixed ?? '';
          this.vendorInfo.admin_commission = this.fixedCommission.percentage ?? '';
          this.vendorInfo.admin_commission_type = this.selectedCommission;
          this.vendorInfo.admin_category_commission = JSON.parse( JSON.stringify( this.categoryCommission ) );
      }
  }
};
</script>

<style lang="less">
</style>

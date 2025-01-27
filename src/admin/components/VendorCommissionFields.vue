<template>
  <div>
    <div class="content-header">
      {{ __("Commission Options", "dokan-lite") }}
    </div>

    <div class="content-body">
        <div class="p-3">
            <div class="mb-5">
                <label class="!p-0 m-0 !mb-[6px] block" for="_subscription_product_admin_commission_type">{{__( 'Admin Commission type', 'dokan-lite' )}}</label>
                <div class="flex flex-col">
                    <select v-model="selectedCommission" @change="commissionUpdated" id="_subscription_product_admin_commission_type" name="_subscription_product_admin_commission_type" class="select short">
                        <option v-for="(commissionData, key) in commissionTypes" :value="key">{{commissionData}}</option>
                    </select>
                    <span class="description !mt-[6px] block">{{__( 'Set the commission type that admin will get', 'dokan-lite' )}}</span>
                </div>
            </div>
            <div v-if="'category_based' === selectedCommission" class="flex justify-between mb-4">
                <label class="!p-0 m-0 !mb-[6px] block" for="_subscription_product_admin_commission_type">
                    {{__( 'Apply Parent Category Commission to All Subcategories ', 'dokan-lite' )}}

                    <span class="dokan-tooltips-help tips" v-tooltip :title="__( 'When enabled, changing a parent category\'s commission rate will automatically update all its subscription. Disable this option to maintain independent commission rates for subcategories', 'dokan-lite' )">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
                <Switches @input="handleResetToggle" :enabled="resetSubCategory"/>
            </div>
            <div v-if="'category_based' === selectedCommission">
                <label class="!p-0 m-0 !mb-[6px] block" for="_subscription_product_admin_commission_type">
                    {{__( 'Admin Commission', 'dokan-lite' )}}

                    <span class="dokan-tooltips-help tips" v-tooltip :title="__( 'When the value is 0, no commissions will be deducted from this vendor.', 'dokan-lite' )">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
                <category-based-commission
                    :value="categoryCommission"
                    @change="onCategoryUpdate"
                    :resetSubCategory="resetSubCategory"
                />
            </div>
            <div v-else-if="'fixed' === selectedCommission">
                <label class="!p-0 m-0 !mb-[6px] block" for="_subscription_product_admin_commission_type">
                    {{__( 'Admin Commission', 'dokan-lite' )}}

                    <span class="dokan-tooltips-help tips" v-tooltip :title="__( 'When the value is 0, no commissions will be deducted from this vendor.', 'dokan-lite' )">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
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
import Switches from "./Switches.vue";

export default {
  name: "VendorCommissionFields",

  components: { Switches, CategoryBasedCommission, CombineInput },

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
      resetSubCategory: true
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
              self.resetSubCategory = response.isConfirmed ? value : updatableValue;
          });
      },
      fixedCOmmissionhandler(data) {
          if (isNaN( data.fixed )) {
              data.fixed = this.fixedCommission.fixed ?? '';
          }
          if (isNaN( data.percentage )) {
              data.percentage = this.fixedCommission.percentage ?? '';
          }
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

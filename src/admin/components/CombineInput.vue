<template>
  <div
    class="xs:text-[8px] sm:text-[14px] xs:w-[100px] sm:w-[235px] md:w-auto h-[32px] flex xs:shadow-md md:shadow-none rounded-[5px]">
    <div
      class="md:shadow-md  border-[0.957434px] xs:!border-r-0 md:!border-r-[0.957434px] rounded-[5px] xs:!rounded-r-none md:!rounded-r-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
      <input
        type="text"
        class="wc_input_decimal focus:!border-none focus:!shadow-none !border-0 !p-0 !w-[100%] !min-h-full !pl-2"
        ref="percentage"
        :id="percentageId"
        :name="percentageName"
        v-model="percentage"
        v-on:input="onInput"
      />
      <div
        class="xs:border-l-0 md:border-l-[0.957434px] flex justify-center items-center xs:!bg-transparent md:!bg-gray-100 !min-h-full">
        <span class="xs:pl-1 xs:pr-1 md:pl-2 md:pr-2">{{ "%" }}</span></div>
    </div>
    <div class="xs:border-[0.957434px] md:border-0 xs:bg-gray-100 md:bg-transparent  flex justify-center items-center">
      <span class="xs:p-1 md:p-2">{{ "+" }}</span>
    </div>
    <div
      class="md:shadow-md border-[0.957434px] xs:!border-l-0 md:!border-l-[0.957434px] rounded-[5px] xs:!rounded-l-none md:!rounded-l-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
      <div
        class="xs:border-r-0 md:border-r-[0.957434px] flex justify-center items-center xs:!bg-transparent md:!bg-gray-100 !min-h-full">
        <span class="xs:pl-1 xs:pr-1 md:pl-2 md:pr-2">{{ getCurrencySymbol }}</span></div>
      <input
        type="text"
        class="wc_input_price focus:!border-none focus:!shadow-none !border-0 !p-0 !w-[100%] !min-h-full !pl-2"
        ref="fixed"
        :id="fixedId"
        :name="fixexName"
        v-model="fixed"
        v-on:input="onInput"
      />
    </div>
  </div>
</template>

<script>
import { fixed } from "lodash/fp/_falseOptions";
import Debounce from "debounce";

export default {
  name: "CombineInput",
  props: {
    fixedId: {
      type: String,
      default: "fixed-val-id"
    },
    percentageId: {
      type: String,
      default: "percentage-val-id"
    },
    fixexName: {
      type: String,
      default: "fixed-val-name"
    },
    percentageName: {
      type: String,
      default: "percentage-val-name"
    },
    value: {
      type: Object,
      default: {
        fixed: '',
        percentage: ''
      }
    }
  },
  data() {
    return {
      fixed: this.value.fixed ?? '',
      percentage: this.value.percentage ?? ''
    };
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.fixed = newVal.fixed;
        this.percentage = newVal.percentage;
      },
      deep: true
    }
  },
  methods: {
    onInput: Debounce(function() {
      let self = this,
        data = {
          fixed: self.fixed,
          percentage: self.percentage
        };

      this.$emit("change", data);
    }, 1600)
  },
  computed: {
    getCurrencySymbol() {
      return window.dokan.currency.symbol;
    }
  }
};
</script>

<style scoped lang="less">
</style>

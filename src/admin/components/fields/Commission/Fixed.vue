<template>
    <div class="flex">
        <div class="border-[0.957434px] rounded-[5px] shadow-md !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
            <input type="text" class="wc_input_decimal regular-text !border-0 !shadow-none !p-0 !w-[100%] !pl-2" id="percentage_commission" name="percentage_commission" ref='fixed' :value="data.percentage" @input="inputHandler">
            <div class='h-full flex justify-center items-center !bg-gray-100'><span class='pl-2 pr-2'>{{ '%' }}</span></div>
        </div>
        <div class='flex justify-center items-center'>
            <span class='p-2'>{{ '+' }}</span>
        </div>
        <div class="border-[0.957434px] rounded-[5px] shadow-md !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
            <div class='h-full flex justify-center items-center !bg-gray-100'><span class='pl-2 pr-2'>{{ getCurrencySymbol }}</span></div>
            <input type="text" class="wc_input_price regular-text !border-0 !shadow-none !p-0 !w-[100%] !pl-2" id="fixed_commission" name="fixed_commission" ref='percentage' :value="data.fixed" @input="inputHandler">
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Fixed',
        props: [ 'value' ],
        data(){
            return {
                data:{
                    percentage: _.isEmpty( this.value ) ? '' : this.value.percentage,
                    fixed: _.isEmpty( this.value ) ? '' : this.value.fixed
                },
            }
        },

        methods:{
            inputHandler() {
                let data = {
                    fixed: this.$refs.fixed.value,
                    percentage: this.$refs.percentage.value
                };

                this.$emit('input', data );
                this.$emit('update', data );
            }
        },

        computed: {
            getCurrencySymbol() {
                return window.dokan.currency.symbol ? window.dokan.currency.symbol : '';
            }
        }
    }
</script>

<style scoped lang='less'>

</style>

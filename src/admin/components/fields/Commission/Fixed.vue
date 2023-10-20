<template>
    <div class="xs:text-[8px] sm:text-[14px] xs:w-[100px] sm:w-[235px] md:w-full h-[32px] flex xs:shadow-md md:shadow-none rounded-[5px]">
        <div class="md:shadow-md  border-[0.957434px] xs:!border-r-0 md:!border-r-[0.957434px] rounded-[5px] xs:!rounded-r-none md:!rounded-r-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
            <input type="text" class="wc_input_decimal !border-0  !p-0 !w-[100%] !min-h-full !pl-2" id="percentage_commission" name="percentage_commission" ref='percentage' :value="data.percentage" @input="inputHandler">
            <div class='xs:border-l-0 md:border-l-[0.957434px] flex justify-center items-center xs:!bg-transparent md:!bg-gray-100 !min-h-full'><span class='xs:pl-1 xs:pr-1 md:pl-2 md:pr-2'>{{ '%' }}</span></div>
        </div>
        <div class='xs:border-[0.957434px] md:border-0 xs:bg-gray-100 md:bg-transparent  flex justify-center items-center'>
            <span class='xs:p-1 md:p-2'>{{ '+' }}</span>
        </div>
        <div class="md:shadow-md border-[0.957434px] xs:!border-l-0 md:!border-l-[0.957434px] rounded-[5px] xs:!rounded-l-none md:!rounded-l-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border">
            <div class='xs:border-r-0 md:border-r-[0.957434px] flex justify-center items-center xs:!bg-transparent md:!bg-gray-100 !min-h-full'><span class='xs:pl-1 xs:pr-1 md:pl-2 md:pr-2'>{{ getCurrencySymbol }}</span></div>
            <input type="text" class="wc_input_price !border-0 !p-0 !w-[100%] !min-h-full !pl-2" id="fixed_commission" name="fixed_commission" ref='fixed' :value="data.fixed" @input="inputHandler">
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

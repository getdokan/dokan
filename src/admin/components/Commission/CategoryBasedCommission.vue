<template>
    <div class="dokan-category-commission">
        <div class='relative '>
        <div class='d-xs:hidden md:flex bg-gray-100 min-h-[3rem] text-gray-500 border-[0.957434px] border-b-0 items-center'>
            <div class='w-1/2 pl-3 flex h-[3rem] items-center border-r-[0.957434px]'>
                <p class='text-xs'>{{ __( 'Category', 'dokan-lite' ) }}</p>
            </div>

            <div class='flex w-1/2'>
                <div class='w-1/2 mr-20'>
                    <p class='text-xs text-center'>{{ __( 'Percentage', 'dokan-lite' ) }}</p>
                </div>
                <div class='w-1/2'>
                    <p class='text-xs text-center'>{{ __( 'Flat', 'dokan-lite' ) }}</p>
                </div>
            </div>
        </div>

        <div class='flex flex-col max-h-[500px] overflow-y-auto border-[1px] d-xs:text-[8px] sm:text-[14px] border-[#e9e9ea] border-solid' :class="! allCategroyEnabled ? 'border-b-[1px]': 'border-b-0'">
            <div class='flex flex-row'>
                <div class='flex flex-row w-1/2 items-center min-h-[3rem] border-0 !border-r-[1px] !border-b-[1px] border-[#e9e9ea] border-solid pl-[5px]'>
                    <button type='button' class='p-1 d-xs:pl-1 md:pl-4 bg-transparent bg-co border-none cursor-pointer' @click='()=>allCategroyEnabled = !allCategroyEnabled'>
                        <i class="far" :class='! allCategroyEnabled ? "fa-minus-square text-black" : "fa-plus-square text-[#4C19E6]"'></i>
                    </button>
                    <p class='d-xs:text-[8px] sm:text-[14px] !m-0'>{{__( 'All Categories', 'dokan-lite' )}}</p>
                </div>

                <div class='flex flex-row w-1/2 border-0 !border-b-[1px] border-[#e9e9ea] border-solid'>
                    <div class='w-1/2 flex justify-start items-center box-border'>
                            <input
                                type="text"
                                class="wc_input_decimal !min-h-full focus:!shadow-none focus:border-transparent !border-0 !w-[100%] !pl-[5px] !pr-0 !pt-0 !pb-0"
                                id="percentage_commission"
                                name="percentage_commission"
                                ref='percentage'
                                :value="formatValue( commission.all.percentage )"
                                v-on:input="e => handleAllCategoryInput(e.target.value, 'percentage', commission.all.percentage )"
                                style="border: none !important;"
                            />
                            <div class='h-full d-xs:border-l-0 d-xs:border-r-0 md:border-l-[1px] md:!border-r-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100'><span class='d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2'>{{ __( '%', 'dokan-lite' ) }}</span></div>
                        </div>
                    <div class='h-full border-l-[1px] !border-r-[1px] md:border-0 d-xs:bg-gray-100 md:bg-transparent  flex justify-center items-center'>
                            <span class='d-xs:p-1 md:p-2'>{{ __( '+', 'dokan-lite' ) }}</span>
                        </div>
                    <div class='w-1/2 flex justify-start items-center box-border'>
                            <div class='h-full d-xs:border-r-0 d-xs:border-l-0 md:!border-r-[1px] md:border-l-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100'><span class='d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2'>{{ getCurrencySymbol }}</span></div>
                            <input
                                type="text"
                                class="wc_input_price !min-h-full focus:!shadow-none !border-0 !w-[100%] d-xs:!pl-0 d-xs:!pr-[5px] d-xs:text-right md:text-left md:!pl-[5px] !pr-0 !pt-0 !pb-0"
                                id="fixed_commission"
                                name="fixed_commission"
                                ref='fixed'
                                :value="formatValue( commission.all.flat )"
                                v-on:input="e => handleAllCategoryInput(e.target.value, 'flat', commission.all.flat )"
                                style="border: none !important;"
                            />
                        </div>
                </div>
            </div>

            <div v-if='! allCategroyEnabled' class='flex flex-row border-0 !border-b-[1px] last:border-b-0 border-[#e9e9ea] border-solid' :class='showCatRow(item) ? "flex" : "hidden"' v-for='(item, index) in renderCategories' :key='item.term_id'>
                <div class='w-1/2 flex flex-row items-center min-h-[3rem] border-0 !border-r-[1px] border-[#e9e9ea] border-solid pl-[5px]'>
                    <div class='d-xs:flex h-1/2'>
                        <span v-for='parent_id in item.parents' :key='parent_id' class='d-xs:bg-[#e5e7eb] md:bg-transparent block h-full w-[1px] d-xs:ml-1'></span>
                    </div>
                    <button type='button' class='p-1 d-xs:pl-1 md:pl-6 bg-transparent border-none cursor-pointer' :disabled='!item.children.length' :class='!item.children.length ? "disabled:cursor-not-allowed text-gray-300" : "cursor-pointer text-[#7047EB]"' @click='()=> catRowClick( item, index )'>
                        <i class="far" :class='openRows.includes( Number( item.term_id ) ) ? "fa-minus-square text-black" : "fa-plus-square"'></i>
                    </button>
                    <p class='d-xs:text-[8px] sm:text-[14px] text-black !m-0'>
                        <span :title='item.name' v-html="item.name"></span>
                        <span class='d-xs:text-[6px] sm:text-[12px] text-gray-500' :title='__( "Category ID", "dokan" )'>#{{ item.term_id }}</span>
                    </p>
                </div>

                <div class='w-1/2 flex min-h-[3rem] border-0 border-solid border-[#e9e9ea]'>
                    <div class='w-1/2 flex justify-start items-center box-border'>
                        <input
                            type="text"
                            class="wc_input_decimal !min-h-full focus:!shadow-none focus:border-transparent !border-0 !pl-[5px] !pr-0 !pt-0 !pb-0 !w-[100%]"
                            id="percentage_commission"
                            name="percentage_commission"
                            ref='percentage'
                            :value="formatValue( getCommissionValue( 'percentage', item.term_id ) )"
                            v-on:input="e => commissinItemHandler( e.target.value, 'percentage', item.term_id, getCommissionValue( 'percentage', item.term_id ) )"
                            style="border: none !important;"
                        />
                        <div class='h-full d-xs:border-l-0 d-xs:border-r-0 md:border-l-[1px] md:!border-r-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100'><span class='d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2'>{{ __( '%', 'dokan-lite' ) }}</span></div>
                    </div>
                    <div class='h-full border-l-[1px] !border-r-[1px] md:border-0 d-xs:bg-gray-100 md:bg-transparent  flex justify-center items-center'>
                        <span class='d-xs:p-1 md:p-2'>{{ __( '+', 'dokan-lite' ) }}</span>
                    </div>
                    <div class='w-1/2 flex justify-start items-center box-border'>
                        <div class='h-full d-xs:border-r-0 d-xs:border-l-0 md:!border-r-[1px] md:border-l-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100'><span class='d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2'>{{ getCurrencySymbol }}</span></div>
                        <input
                            type="text"
                            class="wc_input_price !min-h-full focus:!shadow-none !border-0 d-xs:!pl-0 d-xs:!pr-[5px] d-xs:text-right md:text-left md:!pl-[5px] !pr-0 !pt-0 !pb-0 !w-[100%]"
                            id="fixed_commission"
                            name="fixed_commission"
                            ref='flat'
                            :value="formatValue( getCommissionValue( 'flat', item.term_id ) )"
                            v-on:input="e => commissinItemHandler( e.target.value, 'flat', item.term_id, getCommissionValue( 'flat', item.term_id ) )"
                            style="border: none !important;"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import Debounce from "debounce";

export default {
        name: 'CategoryBasedCommission',
        props: {
            value: {
                type: Object,
                default: {
                    all: {
                        flat: '',
                        percentage: ''
                    },
                    items:{}
                }
            },
            resetSubCategory: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            getCurrencySymbol() {
                return window.dokan.currency.symbol ? window.dokan.currency.symbol : '';
            },
        },
        data() {
            return {
                categories: [],
                renderCategories: [],
                openRows: [],
                allCategroyEnabled: true,
                commission: {
                    all: {
                        flat: '',
                        percentage: ''
                    },
                    items:{}
                }
            }
        },
        watch: {
            value( newValue ) {
                if ( typeof newValue === 'object' && newValue.hasOwnProperty('all') && typeof newValue.all === 'object' ) {
                    this.commission.all = newValue.all;
                }

                if ( typeof newValue === 'object' && newValue.hasOwnProperty( 'items' ) &&  typeof newValue.items === 'object') {
                    this.commission.items = newValue.items;
                }
            }
        },

        created() {
            if ( typeof this.value === 'object' && this.value.hasOwnProperty('all') && typeof this.value.all === 'object' ) {
                this.commission.all = this.value.all;
            }

            if ( typeof this.value === 'object' && this.value.hasOwnProperty( 'items' ) && ! Array.isArray( this.value.items ) ) {
                this.commission.items = this.value.items;
            } else {
                this.commission.items = {};
            }

            dokan.api.get('/products/multistep-categories').then( data => {
                if ( 'object' === typeof data) {
                    this.categories = data

                    this.renderCategories = Object.values( this.getCatgroies() );

                    if (this.commission.items && Object.values( this.commission.items ).length) {
                        this.allCategroyEnabled = false;
                    }
                }
            } );
        },
        methods: {
            getCatgroies() {
                const result = [];
                const categoryMap = {};

                // First, create a map of categories using term_id as the key
                for (const term_id in this.categories) {
                    categoryMap[term_id] = this.categories[term_id];
                }

                // Iterate through the categories to rearrange them
                for (const term_id in categoryMap) {
                    const category = categoryMap[term_id];

                    // If the category has a parent (parent_id is not 0), find its parent and insert it after the parent
                    if (category.parent_id !== '0') {
                        const parent = categoryMap[category.parent_id];
                        const parentIndex = result.indexOf(parent);

                        // Insert the child category right after its parent
                        result.splice(parentIndex + 1, 0, category);
                    } else {
                        // If it's a top-level category (parent_id is 0), add it to the result
                        result.push(category);
                    }
                }

                return result;
            },

            catRowClick( item, index, ) {
                if ( this.openRows.includes( Number( item.term_id ) ) ) {
                    // Remove the parent.
                    let index = this.openRows.indexOf(Number( item.term_id ));
                    this.openRows.splice(index, 1);

                    this.getChildren( item.term_id ).forEach( child => {
                        let index = this.openRows.indexOf(Number( child ));
                        -1 !== index ? this.openRows.splice(index, 1) : "";
                    } );
                } else {
                    this.openRows.push( Number( item.term_id ) );
                }
            },

            getChildren( parent_id ) {
                let categories = Object.values( this.categories );

                let children = categories.filter( item => {
                    return item.parents.includes( Number( parent_id ) );
                } );


                return children.map( item => {
                    return item.term_id;
                } );
            },

            showCatRow( item ) {
                if ( 0 === Number( item.parent_id ) ) {
                    return true;
                }

                return this.openRows.includes( Number( item.parent_id ) );
            },

            isOpen( id ) {
                this.openRows.push( Number( id ) )
            },

            getCommissionValue( comission_type, term_id ) {
                if ( this.commission.items.hasOwnProperty( term_id ) ) {
                    return this.commission.items[term_id][comission_type];
                }

                return this.commission.all[comission_type];
            },

            commissinItemHandler: Debounce( function( value, commission_type, term_id, oldValue = '' ) {
                if ( 'percentage' === commission_type ) {
                    value = this.validatePercentage( this.unFormatValue( value ) );
                } else {
                    value = this.unFormatValue( value );
                }

                let commissions = JSON.parse( JSON.stringify( this.commission.items ) );

                let data = this.resetSubCategory ? JSON.parse( JSON.stringify( this.commission.all ) ) : {
                    flat: '',
                    percentage: ''
                };

                if ( commissions.hasOwnProperty( term_id ) ) {
                    data = commissions[term_id];
                    data[commission_type] = value;

                    this.$set(this.commission.items, term_id, data);
                    this.updateChildCommissionValues( term_id, data );
                    this.deleteDuplicateCategories( this.commission.items );
                } else {
                    data[commission_type] = value;

                    this.$set(this.commission.items, term_id, data);
                    this.updateChildCommissionValues( term_id, data );
                    this.deleteDuplicateCategories( this.commission.items );
                }

                this.emitComponentChange( JSON.parse( JSON.stringify( this.commission ) ) )
            }, 700 ),

            handleAllCategoryInput: Debounce( function( value, commission_type, oldValue = '' ) {
                if ( 'percentage' === commission_type ) {
                    value = this.validatePercentage( this.unFormatValue( value ) );
                } else {
                    value = this.unFormatValue( value );
                }
                this.$set( this.commission.all, commission_type, value );

                let items = JSON.parse( JSON.stringify( this.commission.items ?? {} ) );
                items = this.resetSubCategory ? {} : items;
                this.$set(this.commission, 'items', items);

                this.emitComponentChange( JSON.parse( JSON.stringify( this.commission ) ) )
            }, 700 ),

            deleteDuplicateCategories( items ) {
                let self = this;
                Object.keys( items ).forEach( key => {
                    if ( self.isEqual( items[key], this.commission.all ) ) {
                        this.$delete(this.commission.items, key);
                    }
                } );
            },

            emitComponentChange( data ) {
                this.$emit( 'change', data );
            },

            isEqual(value1, value2) {
                let self = this;
                // Check if the values are strictly equal
                if (value1 === value2) return true;

                // Check if either value is null or undefined
                if (value1 == null || value2 == null) return false;

                // Check if the types are different
                if (typeof value1 !== typeof value2) return false;

                // Handle Date objects
                if (value1 instanceof Date && value2 instanceof Date) {
                    return value1.getTime() === value2.getTime();
                }

                // Handle Array objects
                if (Array.isArray(value1) && Array.isArray(value2)) {
                    if (value1.length !== value2.length) return false;
                    for (let i = 0; i < value1.length; i++) {
                        if (!self.isEqual(value1[i], value2[i])) return false;
                    }
                    return true;
                }

                // Handle plain objects
                if (typeof value1 === 'object' && typeof value2 === 'object') {
                    const keys1 = Object.keys(value1);
                    const keys2 = Object.keys(value2);

                    if (keys1.length !== keys2.length) return false;

                    for (let key of keys1) {
                        if (!keys2.includes(key)) return false;
                        if (!self.isEqual(value1[key], value2[key])) return false;
                    }

                    return true;
                }

                // For all other types, return false
                return false;
            },

            updateChildCommissionValues(parent_cat_id, commission_data) {
                if ( ! this.resetSubCategory ) {
                    return;
                }

                let all_nested_children_ids = this.getChildren( parent_cat_id );
                let children = JSON.parse( JSON.stringify( this.commission.items ) );

                all_nested_children_ids.map( id => {
                    children[id] = commission_data;
                } );

                this.$set( this.commission, 'items', children );
            },

            unFormatValue: ( value ) => {
                if ( value === '' ) {
                    return value;
                }

                return String( accounting.unformat(value, dokan.currency.decimal) );
            },

            formatValue: ( value ) => {
                if ( value === '' ) {
                    return value;
                }

                return accounting.formatNumber( value, dokan.currency.precision, dokan.currency.thousand, dokan.currency.decimal );
            },

            validatePercentage( percentage ) {
                if ( percentage === '' ) {
                    return percentage;
                }

                if ( Number( percentage ) < 0 || Number( percentage ) > 100 ) {
                    percentage = '';
                }

                return percentage;
            },
        }
    }
</script>

<style scoped lang='less'>

</style>

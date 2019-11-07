<template>
    <div class="account-info">
        <div class="content-header">
            {{__( 'Address', 'dokan-lite' )}}
        </div>

        <div class="content-body">
            <div class="dokan-form-group">

                <div class="column">
                    <label for="street-1">{{ __( 'Street 1', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.address.street_1" :placeholder="__( 'Street 1', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="street-2">{{ __( 'Street 2', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.address.street_2" :placeholder="__( 'Street 2', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="city">{{ __( 'City', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.address.city" :placeholder="__( 'City', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="zip">{{ __( 'Zip', 'dokan-lite') }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.address.zip" :placeholder="__( 'Zip', 'dokan-lite')">
                </div>

                <div class="column">
                    <label for="country">{{ __( 'Country', 'dokan-lite') }}</label>
                    <Multiselect @input="saveCountry" v-model="selectedCountry" :options="countries" :multiselect="false" label="name" track-by="name" :showLabels="false" :placeholder="__( 'Select Country', 'dokan-lite' )" />
                </div>

                <div class="column">
                    <label for="state">{{ __( 'State', 'dokan-lite') }}</label>
                    <template v-if="getStatesFromCountryCode(selectedCode).length < 1">
                        <input class="dokan-form-input" type="text" v-model="vendorInfo.address.state" :placeholder="__( 'State', 'dokan-lite' )">
                    </template>
                    <template v-else>
                        <Multiselect @input="saveState" v-model="selectedState" :options="getStatesFromCountryCode( selectedCode )" :multiselect="false" :showLabels="false" label="name" track-by="name" :placeholder="__( 'Select State', 'dokan-lite' )" />
                    </template>
                </div>

                <!-- Add other address fields here -->
                <component v-for="(component, index) in getAddressFields"
                    :key="index"
                    :is="component"
                    :vendorInfo="vendorInfo"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { Multiselect } from "vue-multiselect";

export default {
    name: 'VendorAddressFields',

    components: {
        Multiselect
    },

    props: {
        vendorInfo: {
            type: Object
        },
    },

    data() {
        return {
            countries: [],
            states: [],
            selectedCountry: {},
            selectedState: {},
            getAddressFields: dokan.hooks.applyFilters( 'getVendorAddressFields', [] ),
        }
    },

    computed: {
        selectedCode() {
            // let selected = this.selectedCountry;
            let selected = this.vendorInfo.address.country;

            if ( '' !== selected ) {
                return selected;
            }

            return [];
        },
    },

    created() {
        this.countries = this.transformCountries( dokan.countries )
        this.states = dokan.states;

        let savedCountry = this.vendorInfo.address.country;
        let savedState = this.vendorInfo.address.state;

        if ( '' !== savedCountry ) {
            this.selectedCountry = {
                name: this.getCountryFromCountryCode( savedCountry ),
                code: savedCountry
            }

            this.selectedState = {
                name: this.getStateFromStateCode( savedState, savedCountry ),
                code: savedState
            }
        }
    },

    methods: {
        transformCountries( countryObject ) {
            let countries = [];

            for ( let key in countryObject ) {
                countries.push( {
                    name: countryObject[key],
                    code: key
                } );
            }

            return countries;
        },

        getCountryFromCountryCode( countryCode ) {
            if ( '' === countryCode ) {
                return;
            }

            return dokan.countries[countryCode];
        },

        getStateFromStateCode( stateCode, countryCode ) {
            if ( '' === stateCode ) {
                return;
            }

            let states = dokan.states[countryCode];
            let state  = states && states[stateCode];

            return typeof state !== 'undefined' ? state : [];
        },

        getStatesFromCountryCode( countryCode ) {
            if ( '' === countryCode ) {
                return;
            }

            let states       = [];
            let statesObject = this.states;

            for ( let state in statesObject ) {
                if ( state !== countryCode ) {
                    continue;
                }

                if ( statesObject[state] && statesObject[state].length < 1 ) {
                    continue;
                }

                for ( let name in statesObject[state] ) {
                    states.push( {
                        name: statesObject[state][name],
                        code: name
                    } );
                }
            }

            return states;
        },

        saveCountry( value ) {
            if ( ! value ) return;

            // if reset default state values
            this.vendorInfo.address.state = null;
            this.selectedState = {};

            this.vendorInfo.address.country = value.code;
        },

        saveState( value ) {
            if ( ! value ) return;

            this.vendorInfo.address.state = value.code;
        }
    }
};
</script>
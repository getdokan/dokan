import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';

type AddressValue = {
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    country: string;
    state: string;
};

type CountryData = {
    code: string;
    name: string;
    states?: Array< { code: string; name: string } >;
};

const EMPTY_ADDRESS: AddressValue = {
    street_1: '',
    street_2: '',
    city: '',
    zip: '',
    country: '',
    state: '',
};

const TEXT_PARTS: Array< {
    part: keyof AddressValue;
    label: string;
    placeholder: string;
} > = [
    {
        part: 'street_1',
        label: __( 'Street', 'dokan-lite' ),
        placeholder: __( 'Street address', 'dokan-lite' ),
    },
    {
        part: 'street_2',
        label: __( 'Street 2', 'dokan-lite' ),
        placeholder: __(
            'Apartment, suite, unit etc. (optional)',
            'dokan-lite'
        ),
    },
    {
        part: 'city',
        label: __( 'City', 'dokan-lite' ),
        placeholder: __( 'Town / City', 'dokan-lite' ),
    },
    {
        part: 'zip',
        label: __( 'Post/ZIP Code', 'dokan-lite' ),
        placeholder: __( 'Postcode / Zip', 'dokan-lite' ),
    },
];

const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-dokan-btn focus:outline-none';

// `vendor_address` variant — the six legacy address subkeys with a WC-backed
// country → state cascade (falls back to free text when the country list is
// unavailable or the selected country has no registered states).
const AddressFields = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const value: AddressValue = {
        ...EMPTY_ADDRESS,
        ...( ( element.value as Partial< AddressValue > ) || {} ),
    };
    const [ countries, setCountries ] = useState< CountryData[] >( [] );

    useEffect( () => {
        apiFetch< CountryData[] >( { path: '/dokan/v1/data/countries' } )
            .then( ( response ) =>
                setCountries( Array.isArray( response ) ? response : [] )
            )
            .catch( () => setCountries( [] ) );
    }, [] );

    const update = ( part: keyof AddressValue, partValue: string ) => {
        const next: AddressValue = { ...value, [ part ]: partValue };

        // A country change invalidates the previously selected state.
        if ( 'country' === part ) {
            next.state = '';
        }

        updateValue( fieldKey, next );
    };

    const selectedCountry = countries.find(
        ( country ) => country.code === value.country
    );
    const states = selectedCountry?.states || [];

    return (
        <div className="dokan-vendor-address-field flex w-full flex-col gap-3 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                { TEXT_PARTS.map( ( { part, label, placeholder } ) => (
                    <label
                        key={ part }
                        htmlFor={ `${ fieldKey }-${ part }` }
                        className="flex flex-col gap-1 text-xs text-gray-600"
                    >
                        { label }
                        <input
                            id={ `${ fieldKey }-${ part }` }
                            type="text"
                            className={ inputClass }
                            placeholder={ placeholder }
                            value={ value[ part ] }
                            onChange={ ( event ) =>
                                update( part, event.target.value )
                            }
                        />
                    </label>
                ) ) }

                <label
                    htmlFor={ `${ fieldKey }-country` }
                    className="flex flex-col gap-1 text-xs text-gray-600"
                >
                    { __( 'Country', 'dokan-lite' ) }
                    { countries.length ? (
                        <select
                            id={ `${ fieldKey }-country` }
                            className={ inputClass }
                            value={ value.country }
                            onChange={ ( event ) =>
                                update( 'country', event.target.value )
                            }
                        >
                            <option value="">
                                { __( 'Select a country…', 'dokan-lite' ) }
                            </option>
                            { countries.map( ( country ) => (
                                <option
                                    key={ country.code }
                                    value={ country.code }
                                >
                                    { country.name }
                                </option>
                            ) ) }
                        </select>
                    ) : (
                        <input
                            id={ `${ fieldKey }-country` }
                            type="text"
                            className={ inputClass }
                            placeholder={ __( 'Country code', 'dokan-lite' ) }
                            value={ value.country }
                            onChange={ ( event ) =>
                                update( 'country', event.target.value )
                            }
                        />
                    ) }
                </label>

                <label
                    htmlFor={ `${ fieldKey }-state` }
                    className="flex flex-col gap-1 text-xs text-gray-600"
                >
                    { __( 'State', 'dokan-lite' ) }
                    { states.length ? (
                        <select
                            id={ `${ fieldKey }-state` }
                            className={ inputClass }
                            value={ value.state }
                            onChange={ ( event ) =>
                                update( 'state', event.target.value )
                            }
                        >
                            <option value="">
                                { __( 'Select a state…', 'dokan-lite' ) }
                            </option>
                            { states.map( ( state ) => (
                                <option key={ state.code } value={ state.code }>
                                    { state.name }
                                </option>
                            ) ) }
                        </select>
                    ) : (
                        <input
                            id={ `${ fieldKey }-state` }
                            type="text"
                            className={ inputClass }
                            placeholder={ __( 'State', 'dokan-lite' ) }
                            value={ value.state }
                            onChange={ ( event ) =>
                                update( 'state', event.target.value )
                            }
                        />
                    ) }
                </label>
            </div>
        </div>
    );
};

export default AddressFields;

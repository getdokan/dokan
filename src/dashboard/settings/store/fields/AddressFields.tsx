import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    useSettings,
    Input,
    SmartSelect,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { fieldKeyOf, useCountries } from './shared';

type AddressValue = {
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    country: string;
    state: string;
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

// Country/State render through plugin-ui's SmartSelect (searchable combobox,
// same component as the store-locations editor) so the cascade matches the
// rest of the design system; text subfields use the shared <Input>.
const smartSelectClass = 'w-full bg-white font-normal text-gray-900';

const DEFAULT_PART_ORDER: Array< keyof AddressValue > = [
    'street_1',
    'street_2',
    'city',
    'zip',
    'country',
    'state',
];

// `vendor_address` variant — the six legacy address subkeys with a WC-backed
// country → state cascade (falls back to free text when the country list is
// unavailable or the selected country has no registered states).
const AddressFields = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = fieldKeyOf( element );
    const value: AddressValue = {
        ...EMPTY_ADDRESS,
        ...( ( element.value as Partial< AddressValue > ) || {} ),
    };
    const countries = useCountries();

    const update = ( part: keyof AddressValue, partValue: string ) => {
        const next: AddressValue = { ...value, [ part ]: partValue };

        // A country change invalidates the previously selected state.
        if ( 'country' === part ) {
            next.state = '';
        }

        updateValue( fieldKey, next );
    };

    // The component re-renders on every engine keystroke — don't rebuild the
    // ~250-entry option arrays (and defeat SmartSelect's memoization) each time.
    const countryOptions = useMemo(
        () =>
            countries.map( ( country ) => ( {
                value: country.code,
                label: country.name,
            } ) ),
        [ countries ]
    );
    const selectedCountry = useMemo(
        () => countries.find( ( country ) => country.code === value.country ),
        [ countries, value.country ]
    );
    const stateOptions = useMemo(
        () =>
            ( selectedCountry?.states || [] ).map( ( state ) => ( {
                value: state.code,
                label: state.name,
            } ) ),
        [ selectedCountry ]
    );

    // Schema-driven subfield sequence (the wizard leads with the country cascade).
    const declaredOrder = Array.isArray( element.part_order )
        ? ( element.part_order as Array< keyof AddressValue > ).filter(
              ( part ) => DEFAULT_PART_ORDER.includes( part )
          )
        : [];
    const partOrder = declaredOrder.length ? declaredOrder : DEFAULT_PART_ORDER;

    const renderTextPart = ( part: keyof AddressValue ) => {
        const config = TEXT_PARTS.find( ( entry ) => entry.part === part );

        if ( ! config ) {
            return null;
        }

        return (
            <label
                key={ part }
                htmlFor={ `${ fieldKey }-${ part }` }
                className="flex flex-col gap-1.5 text-sm font-medium text-gray-700"
            >
                { config.label }
                <Input
                    id={ `${ fieldKey }-${ part }` }
                    placeholder={ config.placeholder }
                    value={ value[ part ] }
                    onChange={ ( event ) => update( part, event.target.value ) }
                />
            </label>
        );
    };

    // Country and state share one anatomy: searchable combobox with a free-text
    // fallback when the option list is unavailable.
    const renderSelectPart = (
        part: 'country' | 'state',
        options: Array< { value: string; label: string } >,
        labels: {
            title: string;
            placeholder: string;
            searchPlaceholder: string;
            emptyMessage: string;
            fallbackPlaceholder: string;
        }
    ) => (
        <div
            key={ part }
            data-testid={ `dokan-address-${ part }` }
            className="flex flex-col gap-1.5 text-sm font-medium text-gray-700"
        >
            { labels.title }
            { options.length ? (
                <SmartSelect
                    options={ options }
                    value={ value[ part ] }
                    onValueChange={ ( selected: string ) =>
                        update( part, selected )
                    }
                    placeholder={ labels.placeholder }
                    searchPlaceholder={ labels.searchPlaceholder }
                    emptyMessage={ labels.emptyMessage }
                    showClear
                    className={ smartSelectClass }
                />
            ) : (
                <Input
                    id={ `${ fieldKey }-${ part }` }
                    placeholder={ labels.fallbackPlaceholder }
                    value={ value[ part ] }
                    onChange={ ( event ) => update( part, event.target.value ) }
                />
            ) }
        </div>
    );

    const renderCountry = () =>
        renderSelectPart( 'country', countryOptions, {
            title: __( 'Country', 'dokan-lite' ),
            placeholder: __( 'Select a country', 'dokan-lite' ),
            searchPlaceholder: __( 'Search country', 'dokan-lite' ),
            emptyMessage: __( 'No countries found.', 'dokan-lite' ),
            fallbackPlaceholder: __( 'Country code', 'dokan-lite' ),
        } );

    const renderState = () =>
        renderSelectPart( 'state', stateOptions, {
            title: __( 'State', 'dokan-lite' ),
            placeholder: __( 'Select a state', 'dokan-lite' ),
            searchPlaceholder: __( 'Search state', 'dokan-lite' ),
            emptyMessage: __( 'No states found.', 'dokan-lite' ),
            fallbackPlaceholder: __( 'State', 'dokan-lite' ),
        } );

    // The wizard stacks one field per row per its mock; the settings page keeps two columns.
    const gridClass =
        1 === element.part_columns
            ? 'grid grid-cols-1 gap-4'
            : 'grid grid-cols-1 gap-3 sm:grid-cols-2';

    return (
        <div className="dokan-vendor-address-field flex w-full flex-col gap-3 p-4">
            <div className={ gridClass }>
                { partOrder.map( ( part ) => {
                    if ( 'country' === part ) {
                        return renderCountry();
                    }
                    if ( 'state' === part ) {
                        return renderState();
                    }
                    return renderTextPart( part );
                } ) }
            </div>

            { element.validationError && (
                <p className="m-0 text-sm text-red-500" role="alert">
                    { element.validationError }
                </p>
            ) }
        </div>
    );
};

export default AddressFields;

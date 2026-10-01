import { useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    useSettings,
    SmartSelect,
    Input,
    type SettingsElement,
} from '@wedevs/plugin-ui';
import { DataViews, DokanModal } from '@dokan/components';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
    RequiredMark,
    fieldKeyOf,
    useCountries,
    actionButtonBase,
    editButtonClass,
    deleteButtonClass,
    type CountryData,
} from './shared';

type LocationRow = {
    id: string;
    is_default: boolean;
    location_name: string;
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    state: string;
    country: string;
};

const blankRow = (): LocationRow => ( {
    id: '',
    is_default: false,
    location_name: '',
    street_1: '',
    street_2: '',
    city: '',
    zip: '',
    state: '',
    country: '',
} );

// The plain-text address rows, mapped so the modal stays compact.
const TEXT_FIELDS: Array< {
    part: keyof LocationRow;
    label: string;
    placeholder: string;
} > = [
    {
        part: 'street_1',
        label: __( 'Street 1', 'dokan-lite' ),
        placeholder: __( 'Street Address', 'dokan-lite' ),
    },
    {
        part: 'street_2',
        label: __( 'Street 2', 'dokan-lite' ),
        placeholder: __( 'Apartment, suite, unit etc.', 'dokan-lite' ),
    },
    {
        part: 'city',
        label: __( 'City', 'dokan-lite' ),
        placeholder: __( 'Town/City name', 'dokan-lite' ),
    },
    {
        part: 'zip',
        label: __( 'Post/Zip Code', 'dokan-lite' ),
        placeholder: __( 'Write here', 'dokan-lite' ),
    },
];

const labelClass = 'flex flex-col gap-1 text-sm text-gray-700';

// Match the SmartSelect trigger height; the light border + soft focus are pinned in style.scss (.dokan-location-form) since the modal renders outside plugin-ui's theme provider.
const inputClass = 'min-h-[42px]';

// Row → one readable line, resolving country/state codes to names like the legacy WC-formatted address.
const formatAddress = (
    row: LocationRow,
    countries: CountryData[]
): string => {
    const country = countries.find( ( item ) => item.code === row.country );
    const stateName =
        country?.states?.find( ( item ) => item.code === row.state )?.name ||
        ( 'N/A' === row.state ? '' : row.state );

    return [
        row.street_1,
        row.street_2,
        row.city,
        stateName,
        row.zip,
        country?.name || row.country,
    ]
        .filter( ( part ) => '' !== ( part || '' ).trim() )
        .join( ', ' );
};

// `vendor_store_locations` variant — the store-pickup locations DataViews table with add/edit + delete modals; row 0 is the non-deletable Default, and extra rows plus "Add New Address" show only when the sibling multiple-locations switch is on.
const StoreLocationsField = ( { element }: { element: SettingsElement } ) => {
    const { values, updateValue } = useSettings();
    const fieldKey = fieldKeyOf( element );
    const fid = ( part: string ) => `${ fieldKey }-modal-${ part }`;

    // Read the sibling multiple-locations switch live so the table syncs the moment the vendor flips it.
    const multipleKey = ( element.multiple_key as string ) || '';
    const multipleOn =
        'yes' ===
        String( values?.[ multipleKey ] ?? element.multiple_default ?? 'no' );

    const rows = useMemo< LocationRow[] >( () => {
        const value = Array.isArray( element.value )
            ? ( element.value as LocationRow[] )
            : [];

        // Always keep a Default row so the core store address stays editable even before one is entered.
        if ( ! value.length ) {
            return [ { ...blankRow(), id: 'default', is_default: true } ];
        }

        return value;
    }, [ element.value ] );

    const countries = useCountries();
    // Figma column rhythm via the DataViews layout API — percentages hold proportions at any width.
    const [ view, setView ] = useState( {
        type: 'table',
        perPage: 100,
        page: 1,
        fields: [ 'location_name', 'address', 'actions' ],
        layout: {
            styles: {
                location_name: { width: '35%' },
                address: { width: '55%' },
                actions: { width: '10%' },
            },
        },
    } );
    const [ draft, setDraft ] = useState< LocationRow | null >( null );
    const [ pendingDelete, setPendingDelete ] = useState< LocationRow | null >(
        null
    );
    const newIdCounter = useRef( 0 );

    const commit = ( next: LocationRow[] ) => updateValue( fieldKey, next );

    const saveDraft = () => {
        if ( ! draft ) {
            return;
        }

        // A new row gets a transient client id; the server re-keys it on reload.
        const row: LocationRow = draft.id
            ? draft
            : { ...draft, id: `new-${ ++newIdCounter.current }` };

        const exists = rows.some( ( item ) => item.id === row.id );
        commit(
            exists
                ? rows.map( ( item ) => ( item.id === row.id ? row : item ) )
                : [ ...rows, row ]
        );
        setDraft( null );
    };

    const confirmDelete = () => {
        if ( ! pendingDelete ) {
            return;
        }
        commit( rows.filter( ( item ) => item.id !== pendingDelete.id ) );
        setPendingDelete( null );
    };

    const updateDraft = ( part: keyof LocationRow, partValue: string ) => {
        setDraft( ( current ) => {
            if ( ! current ) {
                return current;
            }
            const next = { ...current, [ part ]: partValue };
            // A country change invalidates the previously selected state.
            if ( 'country' === part ) {
                next.state = '';
            }
            return next;
        } );
    };

    // Additional locations stay stored but hidden while the toggle is off, like the legacy checkout selector.
    const displayRows = multipleOn
        ? rows
        : rows.filter( ( row ) => row.is_default );

    const fields = [
        {
            id: 'location_name',
            label: __( 'Location Name', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: LocationRow } ) => (
                <span className="text-sm font-semibold text-gray-900">
                    { item.location_name || '—' }
                </span>
            ),
        },
        {
            id: 'address',
            label: __( 'Address', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: LocationRow } ) => (
                <span className="text-sm text-gray-600">
                    { formatAddress( item, countries ) || '—' }
                </span>
            ),
        },
        {
            id: 'actions',
            label: __( 'Actions', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: LocationRow } ) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className={ editButtonClass }
                        onClick={ () => setDraft( { ...item } ) }
                    >
                        <Pencil size={ 14 } />
                        { __( 'Edit', 'dokan-lite' ) }
                    </button>
                    <button
                        type="button"
                        className={
                            item.is_default
                                ? actionButtonBase
                                : deleteButtonClass
                        }
                        disabled={ item.is_default }
                        onClick={ () => setPendingDelete( item ) }
                    >
                        <Trash2 size={ 14 } />
                        { __( 'Delete', 'dokan-lite' ) }
                    </button>
                </div>
            ),
        },
    ];

    const isEditing = Boolean( draft?.id );
    const draftValid = Boolean(
        draft && '' !== draft.location_name.trim() && '' !== draft.country
    );

    const countryOptions = useMemo(
        () =>
            countries.map( ( country ) => ( {
                value: country.code,
                label: country.name,
            } ) ),
        [ countries ]
    );
    const stateOptions = useMemo( () => {
        const selectedCountry = countries.find(
            ( country ) => country.code === draft?.country
        );
        return ( selectedCountry?.states || [] ).map( ( state ) => ( {
            value: state.code,
            label: state.name,
        } ) );
    }, [ countries, draft?.country ] );

    // A searchable trigger that matches the modal's text inputs.
    const smartSelectClass =
        'w-full min-h-[42px] rounded-md border-gray-300 bg-white font-normal text-gray-900';

    return (
        <div className="dokan-vendor-store-locations w-full">
            <DataViews
                namespace="dokan-store-locations"
                data={ displayRows }
                fields={ fields }
                view={ view }
                onChangeView={ setView }
                getItemId={ ( item: LocationRow ) => item.id }
                paginationInfo={ {
                    totalItems: displayRows.length,
                    totalPages: 1,
                } }
                search={ false }
                responsive={ false }
            />

            { multipleOn && (
                <div className="border-t border-gray-200">
                    <button
                        type="button"
                        className="text-dokan-link hover:text-dokan-link-hover flex cursor-pointer items-center gap-2 border-0 bg-transparent py-4 pl-4 text-sm font-medium transition-colors focus:outline-none!"
                        onClick={ () => setDraft( blankRow() ) }
                    >
                        <Plus size={ 16 } />
                        { __( 'Add New Address', 'dokan-lite' ) }
                    </button>
                </div>
            ) }

            { draft && (
                <DokanModal
                    isOpen
                    namespace="dokan-store-location"
                    className="w-87.5! sm:w-155! sm:max-w-155!"
                    // The SmartSelect dropdowns portal outside the modal DOM, so an option click would otherwise read as an outside-click and close the form.
                    shouldCloseOnClickOutside={ false }
                    onClose={ () => setDraft( null ) }
                    onConfirm={ saveDraft }
                    dialogTitle={
                        isEditing
                            ? __( 'Edit Location Details', 'dokan-lite' )
                            : __( 'Adding Location Details', 'dokan-lite' )
                    }
                    confirmButtonText={ __( 'Save', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmButtonDisabled={ ! draftValid }
                    dialogContent={
                        <div className="dokan-location-form flex flex-col gap-4">
                            <label
                                htmlFor={ fid( 'location_name' ) }
                                className={ labelClass }
                            >
                                <span>
                                    { __( 'Location Name', 'dokan-lite' ) }{ ' ' }
                                    <RequiredMark />
                                </span>
                                <Input
                                    id={ fid( 'location_name' ) }
                                    type="text"
                                    className={ inputClass }
                                    placeholder={ __(
                                        'Write here',
                                        'dokan-lite'
                                    ) }
                                    value={ draft.location_name }
                                    onChange={ ( event ) =>
                                        updateDraft(
                                            'location_name',
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            { TEXT_FIELDS.map(
                                ( { part, label, placeholder } ) => (
                                    <label
                                        key={ part }
                                        htmlFor={ fid( part ) }
                                        className={ labelClass }
                                    >
                                        { label }
                                        <Input
                                            id={ fid( part ) }
                                            type="text"
                                            className={ inputClass }
                                            placeholder={ placeholder }
                                            value={ draft[ part ] as string }
                                            onChange={ ( event ) =>
                                                updateDraft(
                                                    part,
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>
                                )
                            ) }

                            { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                            <label className={ labelClass }>
                                <span>
                                    { __( 'Country', 'dokan-lite' ) }{ ' ' }
                                    <RequiredMark />
                                </span>
                                <SmartSelect
                                    options={ countryOptions }
                                    value={ draft.country }
                                    onValueChange={ ( value ) =>
                                        updateDraft( 'country', value )
                                    }
                                    placeholder={ __(
                                        'Select a country',
                                        'dokan-lite'
                                    ) }
                                    searchPlaceholder={ __(
                                        'Search country',
                                        'dokan-lite'
                                    ) }
                                    emptyMessage={ __(
                                        'No countries found.',
                                        'dokan-lite'
                                    ) }
                                    showClear
                                    className={ smartSelectClass }
                                    contentClassName="dokan-location-popover"
                                />
                            </label>

                            { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                            <label className={ labelClass }>
                                { __( 'State', 'dokan-lite' ) }
                                <SmartSelect
                                    options={ stateOptions }
                                    value={ draft.state }
                                    onValueChange={ ( value ) =>
                                        updateDraft( 'state', value )
                                    }
                                    placeholder={ __(
                                        'Select a state',
                                        'dokan-lite'
                                    ) }
                                    searchPlaceholder={ __(
                                        'Search state',
                                        'dokan-lite'
                                    ) }
                                    emptyMessage={ __(
                                        'No states found.',
                                        'dokan-lite'
                                    ) }
                                    disabled={ ! stateOptions.length }
                                    showClear
                                    className={ smartSelectClass }
                                    contentClassName="dokan-location-popover"
                                />
                            </label>
                        </div>
                    }
                />
            ) }

            { pendingDelete && (
                <DokanModal
                    isOpen
                    namespace="dokan-store-location-delete"
                    className="!w-[350px] sm:!w-[480px]"
                    onClose={ () => setPendingDelete( null ) }
                    onConfirm={ confirmDelete }
                    dialogTitle={ __( 'Delete Location', 'dokan-lite' ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Delete', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Delete this location?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'This store location will be removed. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }
        </div>
    );
};

export default StoreLocationsField;

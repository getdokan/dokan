import { useMemo, useRef, useState, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, Textarea, type SettingsElement } from '@wedevs/plugin-ui';
import { DataViews, DokanModal } from '@dokan/components';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { RangeInput, formatRangeDate, type RangeValue } from './RangeInput';
import {
    RequiredMark,
    fieldKeyOf,
    editButtonClass,
    deleteButtonClass,
} from './shared';

type ScheduleRow = {
    id: string;
    from: string;
    to: string;
    message: string;
    editable: boolean;
};

// `vendor_vacation_history` variant — the date-wise vacation schedules as a DataViews table (locations-table pattern): upcoming rows edit in a modal, past rows open read-only, any row can be deleted; rows persist through the page Save.
const VacationHistoryField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = fieldKeyOf( element );

    const rows = useMemo< ScheduleRow[] >(
        () =>
            Array.isArray( element.value )
                ? ( element.value as ScheduleRow[] )
                : [],
        [ element.value ]
    );

    // Storage keeps the legacy ascending order; History reads newest-first.
    const displayRows = useMemo(
        () => [ ...rows ].sort( ( a, b ) => ( a.from < b.from ? 1 : -1 ) ),
        [ rows ]
    );

    const [ view, setView ] = useState( {
        type: 'table',
        perPage: 100,
        page: 1,
        fields: [ 'date', 'message', 'actions' ],
        // Same column rhythm as the store-locations table; the narrow actions column shrink-wraps its buttons flush to the right inset.
        layout: {
            styles: {
                date: { width: '30%' },
                message: { width: '60%' },
                actions: { width: '10%' },
            },
        },
    } );
    const [ draft, setDraft ] = useState< ScheduleRow | null >( null );
    const [ viewing, setViewing ] = useState< ScheduleRow | null >( null );
    const [ pendingDelete, setPendingDelete ] = useState< ScheduleRow | null >(
        null
    );
    const newIdCounter = useRef( 0 );

    const error = element.validationError as string | undefined;

    const commit = ( next: ScheduleRow[] ) => updateValue( fieldKey, next );

    const saveDraft = () => {
        if ( ! draft ) {
            return;
        }

        // A new schedule gets a transient client id; the server re-keys it on save.
        const row: ScheduleRow = draft.id
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

    const fields = [
        {
            id: 'date',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: ScheduleRow } ) => (
                <span className="text-sm font-semibold whitespace-nowrap text-gray-900">
                    { `${ formatRangeDate( item.from ) } - ${ formatRangeDate(
                        item.to
                    ) }` }
                </span>
            ),
        },
        {
            id: 'message',
            label: __( 'Message', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: ScheduleRow } ) => (
                <span className="line-clamp-2 text-sm text-gray-600">
                    { item.message || '—' }
                </span>
            ),
        },
        {
            id: 'actions',
            label: __( 'Actions', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: ScheduleRow } ) => (
                <div className="flex w-full items-center justify-end gap-2">
                    { item.editable ? (
                        <button
                            type="button"
                            className={ editButtonClass }
                            onClick={ () => setDraft( { ...item } ) }
                        >
                            <Pencil size={ 14 } />
                            { __( 'Edit', 'dokan-lite' ) }
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={ editButtonClass }
                            onClick={ () => setViewing( item ) }
                        >
                            <Eye size={ 14 } />
                            { __( 'View', 'dokan-lite' ) }
                        </button>
                    ) }
                    <button
                        type="button"
                        className={ deleteButtonClass }
                        onClick={ () => setPendingDelete( item ) }
                    >
                        <Trash2 size={ 14 } />
                        { __( 'Delete', 'dokan-lite' ) }
                    </button>
                </div>
            ),
        },
    ];

    const draftValid = Boolean(
        draft && draft.from && draft.to && '' !== draft.message.trim()
    );

    // Every other schedule's days are off-limits to the row being edited, so the picker can't produce an overlap.
    const takenRanges = useMemo(
        () =>
            rows
                .filter( ( row ) => row.id !== draft?.id )
                .map( ( { from, to } ) => ( { from, to } ) ),
        [ rows, draft?.id ]
    );

    return (
        // Same anatomy as the store-locations table: padded header block, then the DataViews grid running flush inside the card (pb keeps the card's rounded bottom corners content-free, like locations' trailing Add row).
        <div className="dokan-vendor-vacation-history w-full pb-2">
            <div className="flex w-full flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                        { element.title }
                    </span>
                    { element.description && (
                        <span className="text-xs text-gray-500">
                            { element.description }
                        </span>
                    ) }
                </div>
                <button
                    type="button"
                    className={ editButtonClass }
                    onClick={ () =>
                        setDraft( {
                            id: '',
                            from: '',
                            to: '',
                            message: '',
                            editable: true,
                        } )
                    }
                >
                    <Plus size={ 14 } />
                    { ( element.add_label as string ) ||
                        __( 'Add New Vacation', 'dokan-lite' ) }
                </button>
            </div>

            { displayRows.length > 0 ? (
                <DataViews
                    namespace="dokan-vacation-history"
                    data={ displayRows }
                    fields={ fields }
                    view={ view }
                    onChangeView={ setView }
                    getItemId={ ( item: ScheduleRow ) => item.id }
                    paginationInfo={ {
                        totalItems: displayRows.length,
                        totalPages: 1,
                    } }
                    search={ false }
                    responsive={ false }
                />
            ) : (
                <div className="px-4 pb-4">
                    <span className="block rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                        { __( 'No vacation is set', 'dokan-lite' ) }
                    </span>
                </div>
            ) }

            { error && (
                <div className="px-4 pb-3 text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }

            { draft && (
                <DokanModal
                    isOpen
                    namespace="dokan-vacation-schedule"
                    className="w-87.5! sm:w-155! sm:max-w-155!"
                    // The range popover portals outside the modal DOM; an inside click must not read as outside.
                    shouldCloseOnClickOutside={ false }
                    onClose={ () => setDraft( null ) }
                    onConfirm={ saveDraft }
                    dialogTitle={
                        draft.id
                            ? __( 'Edit Vacation Schedule', 'dokan-lite' )
                            : __( 'Add Vacation Schedule', 'dokan-lite' )
                    }
                    confirmButtonText={ __( 'Save', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmButtonDisabled={ ! draftValid }
                    dialogContent={
                        <div className="dokan-location-form flex flex-col gap-4">
                            <div className="flex flex-col gap-1 text-sm text-gray-700">
                                <span>
                                    { __( 'Date Range', 'dokan-lite' ) }{ ' ' }
                                    <RequiredMark />
                                </span>
                                <RangeInput
                                    value={ {
                                        from: draft.from,
                                        to: draft.to,
                                    } }
                                    disabledRanges={ takenRanges }
                                    onChange={ ( next: RangeValue ) =>
                                        setDraft( ( current ) =>
                                            current
                                                ? {
                                                      ...current,
                                                      from: next.from,
                                                      to: next.to,
                                                  }
                                                : current
                                        )
                                    }
                                />
                            </div>
                            { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                            <label className="flex flex-col gap-1 text-sm text-gray-700">
                                <span>
                                    { __( 'Vacation Message', 'dokan-lite' ) }{ ' ' }
                                    <RequiredMark />
                                </span>
                                <Textarea
                                    rows={ 4 }
                                    placeholder={ __(
                                        'Write here',
                                        'dokan-lite'
                                    ) }
                                    value={ draft.message }
                                    onChange={ ( event ) =>
                                        setDraft( ( current ) =>
                                            current
                                                ? {
                                                      ...current,
                                                      message:
                                                          event.target.value,
                                                  }
                                                : current
                                        )
                                    }
                                />
                            </label>
                        </div>
                    }
                />
            ) }

            { viewing && (
                <DokanModal
                    isOpen
                    namespace="dokan-vacation-schedule-view"
                    className="w-87.5! sm:w-155! sm:max-w-155!"
                    onClose={ () => setViewing( null ) }
                    onConfirm={ () => setViewing( null ) }
                    dialogTitle={ __( 'Vacation Schedule', 'dokan-lite' ) }
                    confirmButtonText={ __( 'Close', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    dialogContent={
                        <div className="flex flex-col gap-4 text-sm text-gray-700">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900">
                                    { __( 'Date Range', 'dokan-lite' ) }
                                </span>
                                <span>
                                    { `${ formatRangeDate(
                                        viewing.from
                                    ) } - ${ formatRangeDate( viewing.to ) }` }
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900">
                                    { __( 'Vacation Message', 'dokan-lite' ) }
                                </span>
                                <span className="whitespace-pre-wrap">
                                    { viewing.message || '—' }
                                </span>
                            </div>
                        </div>
                    }
                />
            ) }

            { pendingDelete && (
                <DokanModal
                    isOpen
                    namespace="dokan-vacation-schedule-delete"
                    className="!w-[350px] sm:!w-[480px]"
                    onClose={ () => setPendingDelete( null ) }
                    onConfirm={ confirmDelete }
                    dialogTitle={ __( 'Delete Vacation', 'dokan-lite' ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Delete', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Delete this vacation schedule?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'This scheduled vacation will be removed. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }
        </div>
    );
};

export default VacationHistoryField;

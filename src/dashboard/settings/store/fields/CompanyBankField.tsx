import { useMemo, useState, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, Input, type SettingsElement } from '@wedevs/plugin-ui';
import { DokanModal } from '@dokan/components';
import { Pencil, Settings, Trash2 } from 'lucide-react';
import { fieldKeyOf, editButtonClass, deleteButtonClass } from './shared';

type SubField = {
    key: string;
    label: string;
};

type DetailsValue = Record< string, string >;

// `vendor_company_bank` variant — a modal-edited detail group: empty state shows a "Set Details" chip (CSS-lifted into the section header), filled state a label-over-value grid with Edit/Delete top-right, level with its first row. Sub-fields, labels and copy come from the injecting module's schema.
const CompanyBankField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = fieldKeyOf( element );

    const subFields = useMemo< SubField[] >(
        () =>
            Array.isArray( element.fields )
                ? ( element.fields as SubField[] )
                : [],
        [ element.fields ]
    );

    const value = useMemo< DetailsValue >( () => {
        const raw = ( element.value ?? {} ) as DetailsValue;
        return subFields.reduce( ( acc, sub ) => {
            acc[ sub.key ] = String( raw[ sub.key ] ?? '' );
            return acc;
        }, {} as DetailsValue );
    }, [ element.value, subFields ] );

    const readonly = Boolean( element.readonly );
    const isEmpty = subFields.every(
        ( sub ) => '' === value[ sub.key ].trim()
    );

    const [ draft, setDraft ] = useState< DetailsValue | null >( null );
    const [ confirmingDelete, setConfirmingDelete ] = useState( false );

    const error = element.validationError as string | undefined;

    const emptyLabel =
        ( element.empty_label as string ) || __( 'Set Details', 'dokan-lite' );
    const modalTitle = isEmpty
        ? ( element.modal_add_title as string ) ||
          __( 'Adding Details', 'dokan-lite' )
        : ( element.modal_edit_title as string ) ||
          __( 'Edit Details', 'dokan-lite' );

    const clearAll = () => {
        updateValue(
            fieldKey,
            subFields.reduce( ( acc, sub ) => {
                acc[ sub.key ] = '';
                return acc;
            }, {} as DetailsValue )
        );
        setConfirmingDelete( false );
    };

    return (
        <div
            className={ `dokan-vendor-company-bank w-full ${
                isEmpty && ! readonly ? 'is-empty' : 'p-4'
            }` }
        >
            { isEmpty && ! readonly && (
                <button
                    type="button"
                    className={ editButtonClass }
                    onClick={ () => setDraft( { ...value } ) }
                >
                    <Settings size={ 14 } />
                    { emptyLabel }
                </button>
            ) }

            { ! isEmpty && (
                <div className="flex w-full flex-wrap items-start justify-between gap-4">
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                        { subFields
                            .filter( ( sub ) => '' !== value[ sub.key ].trim() )
                            .map( ( sub ) => (
                                <div
                                    key={ sub.key }
                                    className="flex flex-col gap-0.5"
                                >
                                    <span className="text-xs text-gray-500">
                                        { sub.label }
                                    </span>
                                    <span className="text-sm font-medium break-words text-gray-900">
                                        { value[ sub.key ] }
                                    </span>
                                </div>
                            ) ) }
                    </div>
                    { ! readonly && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className={ editButtonClass }
                                onClick={ () => setDraft( { ...value } ) }
                            >
                                <Pencil size={ 14 } />
                                { __( 'Edit', 'dokan-lite' ) }
                            </button>
                            <button
                                type="button"
                                className={ deleteButtonClass }
                                onClick={ () => setConfirmingDelete( true ) }
                            >
                                <Trash2 size={ 14 } />
                                { __( 'Delete', 'dokan-lite' ) }
                            </button>
                        </div>
                    ) }
                </div>
            ) }

            { error && (
                <div className="mt-2 text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }

            { draft && (
                <DokanModal
                    isOpen
                    namespace="dokan-company-bank-details"
                    className="w-87.5! sm:w-155! sm:max-w-155!"
                    onClose={ () => setDraft( null ) }
                    onConfirm={ () => {
                        updateValue( fieldKey, draft );
                        setDraft( null );
                    } }
                    dialogTitle={ modalTitle }
                    confirmButtonText={ __( 'Save', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    dialogContent={
                        <div className="dokan-location-form flex flex-col gap-4">
                            { subFields.map( ( sub ) => (
                                <label
                                    key={ sub.key }
                                    htmlFor={ `${ fieldKey }-${ sub.key }` }
                                    className="flex flex-col gap-1 text-sm text-gray-700"
                                >
                                    { sub.label }
                                    <Input
                                        id={ `${ fieldKey }-${ sub.key }` }
                                        type="text"
                                        className="min-h-[42px]"
                                        placeholder={ __(
                                            'Write here',
                                            'dokan-lite'
                                        ) }
                                        value={ draft[ sub.key ] ?? '' }
                                        onChange={ ( event ) =>
                                            setDraft( ( current ) =>
                                                current
                                                    ? {
                                                          ...current,
                                                          [ sub.key ]:
                                                              event.target
                                                                  .value,
                                                      }
                                                    : current
                                            )
                                        }
                                    />
                                </label>
                            ) ) }
                        </div>
                    }
                />
            ) }

            { confirmingDelete && (
                <DokanModal
                    isOpen
                    namespace="dokan-company-bank-details-delete"
                    className="!w-[350px] sm:!w-[480px]"
                    onClose={ () => setConfirmingDelete( false ) }
                    onConfirm={ clearAll }
                    dialogTitle={ __( 'Delete Details', 'dokan-lite' ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Delete', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Delete these details?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'All the saved details will be cleared after you save the settings.',
                        'dokan-lite'
                    ) }
                />
            ) }
        </div>
    );
};

export default CompanyBankField;

import { DokanButton } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import { MediaUploader } from '@src/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { Plus, Upload, X } from 'lucide-react';
import CustomField, { getValidationError } from './CustomField';

const DOWNLOADABLE_UPLOADER_PARAMS = { type: 'downloadable_product' };

const blankRow = () => ( { id: '', name: '', file: '' } );

const FileUploadEdit = ( { data, field, onChange, validity }: any ) => {
    // Seed from what the form holds now, not the schema snapshot: unticking Downloadable unmounts these rows
    // while the form keeps them, so showing the field again must not read as "no files".
    const [ files, setFiles ] = useState( () => {
        const current = data?.[ field.id ] ?? field.value;

        return current?.length > 0 ? current : [ blankRow() ];
    } );

    // Re-sync rows when field.value loads/changes after mount (e.g. the create → edit SPA transition); the initial useState alone misses the late-arriving value.
    const synced = useRef( field.value );
    useEffect( () => {
        // Only a genuinely new schema value wins; replaying the one already seeded would drop unsaved edits.
        if ( field.value === synced.current ) {
            return;
        }
        synced.current = field.value;

        if ( field.value?.length > 0 ) {
            setFiles( field.value );
        }
    }, [ field.value ] );

    // Read-only by default (vendors attach via "Choose"); only the core Downloadable Files field is free-typeable — filter-overridable per field.
    const readOnly = Boolean(
        applyFilters(
            'dokan_product_editor_file_field_read_only',
            field?.id !== 'downloads',
            field
        )
    );

    // Downloadable files carry the `downloadable_product` upload type so WooCommerce stores them in woocommerce_uploads.
    const uploaderParams = applyFilters(
        'dokan_product_editor_file_field_uploader_params',
        field?.id === 'downloads' ? DOWNLOADABLE_UPLOADER_PARAMS : undefined,
        field
    ) as Record< string, string > | undefined;

    /**
     * Keep every row on screen, but hand the form only the rows that carry a file.
     *
     * A row the vendor has started but not attached a file to is scaffolding, not a value —
     * naming it must not satisfy a "required" rule, and WooCommerce discards it on save anyway
     * (`save_downloadable_files()`), so the form data now matches what actually gets stored.
     *
     * @param newFiles Rows to render.
     */
    const publish = ( newFiles: any[] ) => {
        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles.filter(
                ( file: any ) => String( file.file ?? '' ).trim() !== ''
            ),
        } );
    };

    const onAddRow = () => {
        publish( [ ...files, blankRow() ] );
    };

    const onRemoveRow = ( index: number ) => {
        publish( files.filter( ( _: any, i: number ) => i !== index ) );
    };

    const updateRow = ( index: number, key: string, value: any ) => {
        publish(
            files.map( ( file: any, i: number ) =>
                i === index ? { ...file, [ key ]: value } : file
            )
        );
    };

    const onSelectFile = ( value: any, index: number ) => {
        const selectedValue = Array.isArray( value ) ? value[ 0 ] : value;
        const newFiles = [ ...files ];

        newFiles[ index ] = {
            ...newFiles[ index ],
            id: String( selectedValue.id ),
            file: selectedValue.url,
            name: selectedValue.title || selectedValue.name,
        };

        publish( newFiles );
    };

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <div className="flex flex-col gap-3">
                { files.map( ( file: any, index: number ) => (
                    <div
                        key={ index }
                        className="flex flex-col gap-2 p-3 border border-gray-200 rounded relative bg-white"
                    >
                        <div className="flex flex-wrap items-end gap-2">
                            <div className="min-w-0 flex-1 basis-0">
                                <SimpleInput
                                    value={ file.name || '' }
                                    onChange={ ( e ) =>
                                        updateRow(
                                            index,
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    input={ {
                                        placeholder: __(
                                            'Enter name',
                                            'dokan-lite'
                                        ),
                                        readOnly,
                                        disabled: readOnly,
                                    } }
                                />
                            </div>

                            <div className="min-w-0 flex-2 basis-0">
                                <SimpleInput
                                    value={ file.file || '' }
                                    onChange={ ( e ) =>
                                        updateRow(
                                            index,
                                            'file',
                                            e.target.value
                                        )
                                    }
                                    input={ {
                                        placeholder: __(
                                            'Enter URL or select file',
                                            'dokan-lite'
                                        ),
                                        readOnly,
                                        disabled: readOnly,
                                    } }
                                />
                            </div>
                            <div className="flex gap-2 shrink-0 items-center">
                                <MediaUploader
                                    uploaderParams={ uploaderParams }
                                    onSelect={ ( val: any ) =>
                                        onSelectFile( val, index )
                                    }
                                >
                                    <DokanButton
                                        icon={ Upload }
                                        variant="secondary"
                                        label={ __( 'Choose', 'dokan-lite' ) }
                                        className="whitespace-nowrap"
                                    />
                                </MediaUploader>

                                <DokanButton
                                    type="button"
                                    variant="secondary"
                                    onClick={ () => onRemoveRow( index ) }
                                >
                                    <X size={ 16 } />
                                </DokanButton>
                            </div>
                        </div>
                    </div>
                ) ) }

                <DokanButton
                    icon={ Plus }
                    variant="secondary"
                    label={ __( 'Add New', 'dokan-lite' ) }
                    onClick={ onAddRow }
                    className="self-start"
                />
            </div>
        </CustomField>
    );
};

export default FileUploadEdit;

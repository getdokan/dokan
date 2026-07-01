import { DokanButton } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import { MediaUploader } from '@src/components';
import { useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { Plus, Upload, X } from 'lucide-react';
import CustomField, { getValidationError } from './CustomField';

const FileUploadEdit = ( { field, onChange, validity }: any ) => {
    const [ files, setFiles ] = useState(
        field.value?.length > 0
            ? field.value
            : [
                  {
                      id: '',
                      name: '',
                      file: '',
                  },
              ]
    );

    // Re-sync rows when field.value loads/changes after mount (e.g. the create → edit SPA transition); the initial useState alone misses the late-arriving value.
    useEffect( () => {
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

    const onAddRow = () => {
        const newFiles = [
            ...files,
            {
                id: '',
                name: '',
                file: '',
            },
        ];
        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles,
        } );
    };

    const onRemoveRow = ( index: number ) => {
        const newFiles = files.filter( ( _: any, i: number ) => i !== index );
        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles,
        } );
    };

    const updateRow = ( index: number, key: string, value: any ) => {
        const newFiles = files.map( ( file: any, i: number ) =>
            i === index ? { ...file, [ key ]: value } : file
        );
        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles,
        } );
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

        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles,
        } );
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

import { DokanButton } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import { MediaUploader } from '@src/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Plus, Upload, X } from 'lucide-react';
import CustomField from './CustomField';

const FileUploadEdit = ( { field, onChange }: any ) => {
    const [ files, setFiles ] = useState( field.value || [] );

    const onAddRow = () => {
        const newFiles = [
            ...files,
            {
                id: '',
                title: '',
                url: '',
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
        const newFiles = [ ...files ];
        newFiles[ index ][ key ] = value;
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
            id: selectedValue.id,
            url: selectedValue.url,
            name: selectedValue.title || selectedValue.name,
            title:
                newFiles[ index ].title ||
                selectedValue.title ||
                selectedValue.name,
        };

        setFiles( newFiles );
        onChange( {
            [ field.id ]: newFiles,
        } );
    };

    return (
        <CustomField label={ field.label } error={ field.error }>
            <div className="flex flex-col gap-3">
                { files.map( ( file: any, index: number ) => (
                    <div
                        key={ index }
                        className="flex flex-col gap-2 p-3 border border-gray-200 rounded relative bg-white"
                    >
                        <div className="grid grid-cols-5 gap-2 flex-wrap items-end">
                            <div className="col-span-2">
                                <SimpleInput
                                    value={ file.title || '' }
                                    onChange={ ( e ) =>
                                        updateRow(
                                            index,
                                            'title',
                                            e.target.value
                                        )
                                    }
                                    input={ {
                                        placeholder: __(
                                            'Enter title',
                                            'dokan-lite'
                                        ),
                                    } }
                                />
                            </div>

                            <div className="col-span-2">
                                <SimpleInput
                                    value={ file.url || '' }
                                    onChange={ ( e ) =>
                                        updateRow(
                                            index,
                                            'url',
                                            e.target.value
                                        )
                                    }
                                    input={ {
                                        placeholder: __(
                                            'Enter URL or select file',
                                            'dokan-lite'
                                        ),
                                    } }
                                />
                            </div>
                            <div className="flex gap-2 flex-1">
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

import { DokanButton, Select } from '@src/components';
import { DataForm } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useFormContext } from '../../context/FormContext';
import useVariationLayout from '../../hooks/useVariationLayout';
import { VariationType } from './VariationCard';

type VariationInternalFormProps = {
    variation: VariationType;
};

const VariationInternalForm = ( { variation }: VariationInternalFormProps ) => {
    const { product, fields, onChange, submitHandler, isLoading } =
        useFormContext();
    const { formLayouts } = useVariationLayout();

    const [ attributes, setAttributes ] = useState( variation.attributes );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
                { attributes.map( ( attr, idx: number ) => {
                    return (
                        <div key={ idx }>
                            <Select
                                options={ attr.options }
                                placeholder={ attr.label }
                                value={ attr.selected_value }
                                onChange={ ( value: any ) => {
                                    const newAttributes = [ ...attributes ];
                                    newAttributes[ idx ] = {
                                        ...newAttributes[ idx ],
                                        selected_value: value,
                                    };
                                    setAttributes( newAttributes );
                                    onChange( { attributes: newAttributes } );
                                } }
                            />
                        </div>
                    );
                } ) }
            </div>
            <DataForm
                data={ product }
                fields={ fields }
                form={ formLayouts }
                onChange={ onChange }
            />

            <div className="flex justify-end">
                <DokanButton
                    type="button"
                    variant="primary"
                    disabled={ isLoading }
                    loading={ isLoading }
                    onClick={ ( e: any ) => submitHandler( e ) }
                >
                    { __( 'Save Variation', 'dokan-lite' ) }
                </DokanButton>
            </div>
        </div>
    );
};

export default VariationInternalForm;

import { DokanButton, Select } from '@src/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useFormContext } from '../../context/FormContext';
import { useVariationContext } from '../../context/VariationContext';
import useVariationLayouts from '../../hooks/useVariationLayouts';
import { VariationType } from '../../types';

type VariationInternalFormProps = {
    variation: VariationType;
};

const VariationInternalForm = ( { variation }: VariationInternalFormProps ) => {
    const {
        product,
        formItems,
        fields,
        onChange: dataFormChange,
    } = useFormContext();

    const { updateVariation, saveVariation, isLoading } = useVariationContext();
    const { formLayouts } = useVariationLayouts( formItems, product );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
                { variation.attributes.map( ( attr, idx: number ) => {
                    return (
                        <div key={ idx }>
                            <Select
                                options={ attr.options }
                                placeholder={ attr.label }
                                value={ attr.selected_value }
                                onChange={ ( value: any ) => {
                                    const newAttributes = [
                                        ...variation.attributes,
                                    ];
                                    newAttributes[ idx ] = {
                                        ...newAttributes[ idx ],
                                        selected_value: value,
                                    };
                                    updateVariation( {
                                        ...variation,
                                        attributes: newAttributes,
                                    } );
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
                onChange={ dataFormChange }
            />

            <div className="flex justify-end">
                <DokanButton
                    type="button"
                    variant="primary"
                    disabled={ isLoading }
                    loading={ isLoading }
                    onClick={ async () => await saveVariation( variation, product ) }
                >
                    { __( 'Save Variation', 'dokan-lite' ) }
                </DokanButton>
            </div>
        </div>
    );
};

export default VariationInternalForm;

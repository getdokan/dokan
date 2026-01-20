import { DokanButton } from '@src/components';
import { __ } from '@wordpress/i18n';
import { useVariationContext } from '../../context/VariationContext';
import { Attribute } from '../../types';
import VariationCard from './VariationCard';

const VariationForm = ( { attributes }: { attributes: Attribute[] } ) => {
    const { generateVariations, addVariation, variations } =
        useVariationContext();
    if (
        ! attributes.some( ( attr ) => attr.variation ) &&
        variations.length === 0
    ) {
        return null;
    }

    return (
        <div className="border-t pt-4 flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <DokanButton
                    type="button"
                    variant="secondary"
                    onClick={ generateVariations }
                >
                    { __( 'Generate variations', 'dokan-lite' ) }
                </DokanButton>
                <DokanButton
                    type="button"
                    variant="secondary"
                    onClick={ addVariation }
                >
                    { __( 'Add Manually', 'dokan-lite' ) }
                </DokanButton>
            </div>

            { variations.map( ( variation, index: number ) => (
                <VariationCard key={ index } variation={ variation } />
            ) ) }
        </div>
    );
};

export default VariationForm;

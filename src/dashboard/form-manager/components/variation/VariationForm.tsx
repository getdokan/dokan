import { DokanButton } from '@src/components';
import { __ } from '@wordpress/i18n';
import { useVariationContext } from '../../context/VariationContext';
import { Attribute, VariationType } from '../../types';
import VariationCard from './VariationCard';

const VariationForm = ( {
    attributes,
    product,
}: {
    attributes: Attribute[];
    product: Record< string, any >;
} ) => {
    const variations = ( product.variations || [] ) as VariationType[];
    if (
        ! attributes.some( ( attr ) => attr.variation ) &&
        variations.length === 0
    ) {
        return null;
    }

    const { generateVariations, addVariation } = useVariationContext();

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

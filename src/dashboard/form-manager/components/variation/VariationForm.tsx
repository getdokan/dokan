import { DokanButton } from '@src/components';
import { __ } from '@wordpress/i18n';
import { Attribute } from '../variation/AttributeCard';
import VariationCard, { VariationType } from './VariationCard';

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

    return (
        <div className="border-t pt-4 flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <DokanButton type="button" variant="secondary">
                    { __( 'Generate variations', 'dokan-lite' ) }
                </DokanButton>
                <DokanButton type="button" variant="secondary">
                    { __( 'Add Manually', 'dokan-lite' ) }
                </DokanButton>
            </div>

            { variations.map( ( variation, index: number ) => (
                <VariationCard
                    key={ index }
                    variation={ variation }
                    defaultAttributes={ attributes }
                />
            ) ) }
        </div>
    );
};

export default VariationForm;

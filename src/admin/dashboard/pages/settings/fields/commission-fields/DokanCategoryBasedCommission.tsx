import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import {
    CategoryBasedCommission,
    type Category,
    type CommissionValues,
} from '../../../../../../components/commission';
import { getDokanCurrency } from '../../../../../../utilities';
import CommissionFieldHeading from './CommissionFieldHeading';
import { categoryCommissionError } from './validation';

type Props = {
    element: SettingsElement;
};

/**
 * Settings adapter for the `category_based_commission` variant.
 *
 * Renders the per-category commission table. Categories come from the same
 * `multistep-categories` endpoint the vendor editor uses, so the tree shape
 * stays identical to the proven UI. The parent→subcategory inheritance flag is
 * read live from the sibling toggle so edits propagate exactly as configured
 * without a reload.
 * @param root0
 * @param root0.element
 */
export default function DokanCategoryBasedCommission( { element }: Props ) {
    const { updateValue, values } = useSettings();
    const [ categories, setCategories ] = useState<
        Record< string, Category >
    >( {} );

    useEffect( () => {
        apiFetch( { path: 'dokan/v2/products/multistep-categories' } ).then(
            ( response: Record< string, Category > ) => {
                if ( response && typeof response === 'object' ) {
                    setCategories( response );
                }
            }
        );
    }, [] );

    // Live-read the inheritance toggle so propagation matches the saved setting.
    const resetSubCategory =
        values?.reset_sub_category_when_edit_all_category === 'on';

    const commissionValues = ( element.value as CommissionValues ) || {};

    return (
        <div
            className="flex flex-col gap-3 w-full"
            id={ element.id }
            data-testid={ `settings-field-${ element.id }` }
        >
            <CommissionFieldHeading element={ element } className="px-4 pt-4" />
            <CategoryBasedCommission
                categories={ categories }
                commissionValues={ commissionValues }
                currency={ getDokanCurrency() }
                resetSubCategoryValue={ resetSubCategory }
                // plugin-ui can't validate the object value, so flag an empty rate here.
                validationError={
                    categoryCommissionError( commissionValues ) ||
                    element.validationError
                }
                onCommissionChange={ ( updated ) =>
                    updateValue( element.id, updated )
                }
                // Settings-only look: bordered table that auto-opens when a category has a custom amount.
                headerClassName="border-t border-[#e9e9ea]"
                rowClassName="last:border-b-0"
                autoExpandCustomized
            />
        </div>
    );
}

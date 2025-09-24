import { dispatch, useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';

import { SETTINGS_STORE } from '../../../../../../../stores/adminSettings';
import {
    CategoryBasedCommissionProps,
    CategoryBasedCommissionPure,
} from '../../../../../../../components';
import { SettingsProps } from '../../../types';

// Declare adminWithdrawData as a global variable
declare const adminWithdrawData: {
    currency: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };
};

const CategoryBasedCommission = ( { element }: SettingsProps ) => {
    const onValueChange = useCallback( ( updatedElement: unknown ) => {
        // Dispatch the value change to the settings store
        dispatch( SETTINGS_STORE ).updateSettingsValue( updatedElement );
    }, [] );

    // Get reset sub-category value from store
    const resetSubCategoryValue = useSelect( ( select: unknown ) => {
        const store = ( select as any )( SETTINGS_STORE );
        if ( store && store.getSettingById ) {
            const setting = store.getSettingById(
                'dokan_settings_transaction_commission_commission_reset_sub_category_when_edit_all_category'
            );
            return setting?.value === 'on';
        }
        return false;
    }, [] );

    // Memoize categories to avoid dependency issues
    const categories = useMemo(
        () => element?.categories || {},
        [ element?.categories ]
    );

    // Memoize commission values
    const commissionValues = useMemo(
        () => element?.value || {},
        [ element?.value ]
    );

    // Handle commission changes
    const handleCommissionChange = useCallback(
        ( updatedCommission: unknown ) => {
            onValueChange( {
                ...element,
                value: updatedCommission,
            } );
        },
        [ onValueChange, element ]
    );

    // Prepare props for the pure component
    const pureComponentProps: CategoryBasedCommissionProps = {
        categories,
        commissionValues,
        currency: adminWithdrawData.currency,
        resetSubCategoryValue,
        onCommissionChange: handleCommissionChange,
        display: element.display,
    };

    return <CategoryBasedCommissionPure { ...pureComponentProps } />;
};

export default CategoryBasedCommission;

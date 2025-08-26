import { dispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import {
    CombineInputProps,
    FixedCommissionInput,
    FixedCommissionInputValues,
} from '../../../../../../../components/commission';
import settingsStore from '../../../../../../../stores/adminSettings';
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

const CombineInput = ( { element }: SettingsProps ) => {
    const onValueChange = useCallback( ( updatedElement: any ) => {
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    }, [] );

    // Handle value changes
    const handleValueChange = useCallback(
        ( updatedValues: FixedCommissionInputValues ) => {
            onValueChange( {
                ...element,
                value: updatedValues,
            } );
        },
        [ onValueChange, element ]
    );

    // Prepare props for the pure component
    const pureComponentProps: CombineInputProps = {
        values: ( element.value as unknown as FixedCommissionInputValues ) || {
            admin_percentage: 0,
            additional_fee: 0,
        },
        currency: adminWithdrawData.currency,
        title: element.title,
        description: element.description,
        hookKey: element.hook_key,
        onValueChange: handleValueChange,
        display: element.display,
    };

    return <FixedCommissionInput { ...pureComponentProps } />;
};

export default CombineInput;

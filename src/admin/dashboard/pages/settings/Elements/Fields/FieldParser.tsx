import { SettingsProps } from '../../types';
import { applyFilters } from '@wordpress/hooks';
import RadioBox from './RadioBox';
import CategoryBasedCommission from './Commission/CategoryBasedCommission';
import CombineInput from './Commission/CombineInput';
import DokanSwitch from './DokanSwitch';
import DokanMultiCheck from './DokanMultiCheck';
import DokanInfoField from './DokanInfoField';
import DokanPassword from './DokanPassword';
import DokanEmail from './DokanEmail';
import DokanNumber from './DokanNumber';
import DokanTextArea from './DokanTextArea';
import DokanCurrency from './DokanCurrency';
import DokanTel from './DokanTel';
import DokanApiConnectionField from './DokanApiConnectionField';
import DokanDoubleTextField from './DokanDoubleTextField';
import DokanTextField from './DokanTextField';
import DokanRadioCapsule from './DokanRadioCapsule';
import DokanSelect from './DokanSelect';

const FieldParser = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ) => {
    if ( ! element.display ) {
        return null;
    }

    switch ( element.variant ) {
        case 'text':
            return (
                <DokanTextField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'select':
            return (
                <DokanSelect
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'switch':
            return (
                <DokanSwitch
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'password':
            return (
                <DokanPassword
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'email':
            return (
                <DokanEmail
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'number':
            return (
                <DokanNumber
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'checkbox_group':
            return (
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'textarea':
            return (
                <DokanTextArea
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'radio_capsule':
            return (
                <DokanRadioCapsule
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'radio_box':
            return (
                <RadioBox
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'currency':
            return (
                <DokanCurrency
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'multicheck':
            return (
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'category_based_commission':
            return (
                <CategoryBasedCommission
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'combine_input':
            return (
                <CombineInput
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'api_connection':
            return (
                <DokanApiConnectionField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'info':
            return (
                <DokanInfoField
                    key={ element.hook_key }
                    element={ element }
                    getSetting={ getSetting }
                />
            );

        case 'tel':
            return (
                <DokanTel
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'double_text':
            return (
                <DokanDoubleTextField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'checkbox':
        case 'color':
        case 'date':
        case 'datetime-local':
        case 'file':
        case 'hidden':
        case 'image':
        case 'month':
        case 'range':
        case 'search':
        case 'time':
        case 'url':
        case 'week':
        default:
            return applyFilters(
                'dokan_admin_settings_default_field_parser',
                <DokanInfoField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />,
                element,
                getSetting,
                onValueChange
            );
    }
};

export default FieldParser;

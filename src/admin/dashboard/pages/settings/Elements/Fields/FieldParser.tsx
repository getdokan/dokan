import { applyFilters } from '@wordpress/hooks';
import { SettingsProps } from '../../types';
import CategoryBasedCommission from './Commission/CategoryBasedCommission';
import CombineInput from './Commission/CombineInput';
import CustomizeRadio from './CustomizeRadio';
import DokanCurrency from './DokanCurrency';
import DokanDoubleTextField from './DokanDoubleTextField';
import DokanEmail from './DokanEmail';
import DokanFieldLabel from './DokanFieldLabel';
import DokanHtmlField from './DokanHtmlField';
import DokanInfoField from './DokanInfoField';
import DokanMultiCheck from './DokanMultiCheck';
import DokanNumber from './DokanNumber';
import DokanPassword from './DokanPassword';
import DokanRadioCapsule from './DokanRadioCapsule';
import DokanRefreshSelectField from './DokanRefreshSelectField';
import DokanSelect from './DokanSelect';
import DokanSwitch from './DokanSwitch';
import DokanTel from './DokanTel';
import DokanTextArea from './DokanTextArea';
import DokanTextField from './DokanTextField';
import RadioBox from './RadioBox';
import DokanShowHideField from './DokanShowHideField';

const FieldParser = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ) => {
    switch ( element.variant ) {
        case 'text':
            return (
                <DokanTextField
                    key={ element.hook_key }
                    element={ element }
                    getSetting={ getSetting }
                />
            );

        case 'select':
            return <DokanSelect key={ element.hook_key } element={ element } />;

        case 'switch':
            return <DokanSwitch key={ element.hook_key } element={ element } />;

        case 'password':
            return (
                <DokanPassword key={ element.hook_key } element={ element } />
            );

        case 'email':
            return <DokanEmail key={ element.hook_key } element={ element } />;

        case 'number':
            return <DokanNumber key={ element.hook_key } element={ element } />;

        case 'checkbox_group':
            return (
                <DokanMultiCheck key={ element.hook_key } element={ element } />
            );

        case 'textarea':
            return (
                <DokanTextArea key={ element.hook_key } element={ element } />
            );

        case 'radio_capsule':
            return (
                <DokanRadioCapsule
                    key={ element.hook_key }
                    element={ element }
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

        case 'customize_radio':
            return (
                <CustomizeRadio
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );

        case 'currency':
            return (
                <DokanCurrency key={ element.hook_key } element={ element } />
            );

        case 'multicheck':
            return (
                <DokanMultiCheck key={ element.hook_key } element={ element } />
            );

        case 'category_based_commission':
            return (
                <CategoryBasedCommission
                    key={ element.hook_key }
                    element={ element }
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
        case 'refresh_select':
            return (
                <DokanRefreshSelectField
                    key={ element.hook_key }
                    element={ element }
                />
            );

        case 'info':
            return (
                <DokanInfoField key={ element.hook_key } element={ element } />
            );

        case 'tel':
            return <DokanTel key={ element.hook_key } element={ element } />;

        case 'double_text':
            return (
                <DokanDoubleTextField
                    key={ element.hook_key }
                    element={ element }
                />
            );
        case 'base_field_label':
            return <DokanFieldLabel element={ element } />;

        case 'html':
            return (
                <DokanHtmlField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        case 'show_hide':
            return <DokanShowHideField element={ element } />;

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
                <DokanInfoField key={ element.hook_key } element={ element } />,
                element,
                getSetting,
                onValueChange
            );
    }
};

export default FieldParser;

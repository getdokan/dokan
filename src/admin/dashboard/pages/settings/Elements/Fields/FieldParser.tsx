import { applyFilters } from '@wordpress/hooks';
import { SettingsProps } from '../../types';
import CategoryBasedCommission from './Commission/CategoryBasedCommission';
import CombineInput from './Commission/CombineInput';
import CustomizeRadio from './CustomizeRadio';
import DokanColorPicker from './DokanColorPicker';
import DokanCopyButtonField from './DokanCopyButtonField';
import DokanCurrency from './DokanCurrency';
import DokanDoubleInput from './DokanDoubleInput';
import DokanEmail from './DokanEmail';
import DokanFieldLabel from './DokanFieldLabel';
import DokanFileUploadField from './DokanFileUpload';
import DokanHtmlField from './DokanHtmlField';
import DokanInfoField from './DokanInfoField';
import DokanMultiCheck from './DokanMultiCheck';
import DokanNumber from './DokanNumber';
import DokanPassword from './DokanPassword';
import DokanRadioCapsule from './DokanRadioCapsule';
import DokanRefreshSelectField from './DokanRefreshSelectField';
import DokanSelect from './DokanSelect';
import DokanSingleProductPreview from './DokanSingleProductPreview';
import DokanShowHideField from './DokanShowHideField';
import DokanSwitch from './DokanSwitch';
import DokanTel from './DokanTel';
import DokanTextArea from './DokanTextArea';
import DokanTextField from './DokanTextField';
import DokanVendorInfoPreview from './DokanVendorInfoPreview';
import DokanRichText from './DokanRichText';
import RadioBox from './RadioBox';
import DokanRepeater from './DokanRepeater';
import WithdrawSchedule from './WithdrawSchedule';

const FieldParser = ( { element }: SettingsProps ) => {
    switch ( element.variant ) {
        case 'text':
            return applyFilters(
                'dokan_admin_settings_text_field_parser',
                <DokanTextField key={ element.hook_key } element={ element } />,
                element
            );

        case 'select':
            return applyFilters(
                'dokan_admin_settings_select_field_parser',
                <DokanSelect key={ element.hook_key } element={ element } />,
                element
            );

        case 'switch':
            return applyFilters(
                'dokan_admin_settings_switch_field_parser',
                <DokanSwitch key={ element.hook_key } element={ element } />,
                element
            );

        case 'password':
            return applyFilters(
                'dokan_admin_settings_password_field_parser',
                <DokanPassword key={ element.hook_key } element={ element } />,
                element
            );

        case 'email':
            return applyFilters(
                'dokan_admin_settings_email_field_parser',
                <DokanEmail key={ element.hook_key } element={ element } />,
                element
            );

        case 'number':
            return applyFilters(
                'dokan_admin_settings_number_field_parser',
                <DokanNumber key={ element.hook_key } element={ element } />,
                element
            );

        case 'checkbox_group':
            return applyFilters(
                'dokan_admin_settings_checkbox_group_field_parser',
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                />,
                element
            );

        case 'textarea':
            return applyFilters(
                'dokan_admin_settings_textarea_field_parser',
                <DokanTextArea key={ element.hook_key } element={ element } />,
                element
            );

        case 'rich_text':
            return applyFilters(
                'dokan_admin_settings_rich_text_field_parser',
                <DokanRichText element={ element } key={ element.hook_key } />,
                element
            );

        case 'radio_capsule':
            return applyFilters(
                'dokan_admin_settings_radio_capsule_field_parser',
                <DokanRadioCapsule
                    key={ element.hook_key }
                    element={ element }
                />,
                element
            );

        case 'radio_box':
            return applyFilters(
                'dokan_admin_settings_radio_box_field_parser',
                <RadioBox key={ element.hook_key } element={ element } />,
                element
            );

        case 'customize_radio':
            return applyFilters(
                'dokan_admin_settings_customize_radio_field_parser',
                <CustomizeRadio key={ element.hook_key } element={ element } />,
                element
            );

        case 'currency':
            return applyFilters(
                'dokan_admin_settings_currency_field_parser',
                <DokanCurrency key={ element.hook_key } element={ element } />,
                element
            );

        case 'multicheck':
            return applyFilters(
                'dokan_admin_settings_multicheck_field_parser',
                <DokanMultiCheck
                    key={ element.hook_key }
                    element={ element }
                />,
                element
            );

        case 'category_based_commission':
            return applyFilters(
                'dokan_admin_settings_category_based_commission_field_parser',
                <CategoryBasedCommission
                    key={ element.hook_key }
                    element={ element }
                />,
                element
            );

        case 'combine_input':
            return applyFilters(
                'dokan_admin_settings_combine_input_field_parser',
                <CombineInput key={ element.hook_key } element={ element } />,
                element
            );

        case 'refresh_select':
            return applyFilters(
                'dokan_admin_settings_refresh_select_field_parser',
                <DokanRefreshSelectField
                    key={ element.hook_key }
                    element={ element }
                />,
                element
            );

        case 'info':
            return applyFilters(
                'dokan_admin_settings_info_field_parser',
                <DokanInfoField key={ element.hook_key } element={ element } />,
                element
            );

        case 'tel':
            return applyFilters(
                'dokan_admin_settings_tel_field_parser',
                <DokanTel key={ element.hook_key } element={ element } />,
                element
            );
        case 'double_input':
            return (
                (
                    <DokanDoubleInput
                        key={ element.hook_key }
                        element={ element }
                    />
                 ),
                element
            );

        case 'vendor_info_preview':
            return (
                <DokanVendorInfoPreview
                    key={ element.hook_key }
                    element={ element }
                />
            );

        case 'single_product_preview':
            return (
                <DokanSingleProductPreview
                    key={ element.hook_key }
                    element={ element }
                />
            );

        case 'base_field_label':
            return applyFilters(
                'dokan_admin_settings_base_field_label_parser',
                <DokanFieldLabel element={ element } />,
                element
            );

        case 'html':
            return applyFilters(
                'dokan_admin_settings_html_field_parser',
                <DokanHtmlField key={ element.hook_key } element={ element } />,
                element
            );

        case 'show_hide':
            return applyFilters(
                'dokan_admin_settings_show_hide_field_parser',
                <DokanShowHideField element={ element } />,
                element
            );

        case 'select_color_picker':
            return applyFilters(
                'dokan_admin_settings_select_color_picker_field_parser',
                <DokanColorPicker element={ element } />,
                element
            );

        case 'copy_field':
            return applyFilters(
                'dokan_admin_settings_copy_field_parser',
                <DokanCopyButtonField element={ element } />,
                element
            );

        case 'file_upload':
            return applyFilters(
                'dokan_admin_settings_file_upload_field_parser',
                <DokanFileUploadField element={ element } />,
                element
            );

        case 'repeater':
            return applyFilters(
                'dokan_admin_settings_repeater_field_parser',
                <DokanRepeater key={ element.hook_key } element={ element } />,
                element
            );

        case 'withdraw_schedule':
            return applyFilters(
                'dokan_admin_settings_withdraw_schedule_field_parser',
                <WithdrawSchedule
                    key={ element.hook_key }
                    element={ element }
                />,
                element
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
                <DokanInfoField key={ element.hook_key } element={ element } />,
                element
            );
    }
};

export default FieldParser;

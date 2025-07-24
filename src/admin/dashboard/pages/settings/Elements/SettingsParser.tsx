import Section from './Section';
import SubSection from './SubSection';
import FieldParser from './Fields/FieldParser';

import { applyFilters } from '@wordpress/hooks';
import { SettingsProps } from '../types';
import FieldGroup from './FieldGroup';

const SettingsParser = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ) => {
    switch ( element.type ) {
        case 'section':
            return (
                <Section
                    key={ element.hook_key }
                    element={ element }
                    getSetting={ getSetting }
                    onValueChange={ onValueChange }
                />
            );
        case 'subsection':
            return (
                <SubSection
                    key={ element.hook_key }
                    element={ element }
                    getSetting={ getSetting }
                    onValueChange={ onValueChange }
                />
            );
        case 'field':
            return (
                <FieldParser
                    key={ element.hook_key + '-parser' }
                    element={ element }
                    getSetting={ getSetting }
                    onValueChange={ onValueChange }
                />
            );
        case 'fieldgroup':
            return (
                <FieldGroup
                    key={ element.hook_key }
                    element={ element }
                    getSetting={ getSetting }
                    onValueChange={ onValueChange }
                />
            );
        default:
            return applyFilters(
                'dokan_admin_setup_guide_default_settings_parser',
                <></>,
                element,
                getSetting,
                onValueChange
            );
    }
};

export default SettingsParser;

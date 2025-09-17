import Section from './Section';
import SubSection from './SubSection';
import FieldParser from './Fields/FieldParser';

import { applyFilters } from '@wordpress/hooks';
import { SettingsProps } from '../types';
import FieldGroup from './FieldGroup';

const SettingsParser = ( { element }: SettingsProps ) => {
    switch ( element.type ) {
        case 'section':
            return <Section key={ element.hook_key } element={ element } />;
        case 'subsection':
            return <SubSection key={ element.hook_key } element={ element } />;
        case 'field':
            return (
                <FieldParser
                    key={ element.hook_key + '-parser' }
                    element={ element }
                />
            );
        case 'fieldgroup':
            return <FieldGroup key={ element.hook_key } element={ element } />;
        default:
            return applyFilters(
                'dokan_admin_setup_guide_default_settings_parser',
                <></>,
                element
            );
    }
};

export default SettingsParser;

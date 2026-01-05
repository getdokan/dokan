import { applyFilters } from '@wordpress/hooks';
import type { SettingsParserProps } from '../types';
import Section from './Section';
import SubSection from './SubSection';
import FieldGroup from './FieldGroup';
import { FieldParser } from './fields';

/**
 * Settings Parser Component
 *
 * Parses and renders the appropriate component based on element type.
 */
const SettingsParser = ( { element, onValueChange }: SettingsParserProps ) => {
    if ( ! element.display ) {
        return null;
    }

    switch ( element.type ) {
        case 'section':
            return (
                <Section
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'subsection':
            return (
                <SubSection
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'field':
            return (
                <FieldParser
                    key={ `${ element.hook_key }-parser` }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        case 'fieldgroup':
            return (
                <FieldGroup
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );

        default:
            return applyFilters(
                'plugin_settings_default_parser',
                null,
                element,
                onValueChange
            ) as JSX.Element | null;
    }
};

export default SettingsParser;


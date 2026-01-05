import { applyFilters } from '@wordpress/hooks';
import type { SettingsParserProps, SettingsElement } from '../types';
import DefaultSection from './Section';
import DefaultSubSection from './SubSection';
import DefaultFieldGroup from './FieldGroup';
import { FieldParser } from './fields';
import type { ComponentType } from 'react';

interface CustomComponents {
    Section?: ComponentType< {
        element: SettingsElement;
        onValueChange?: ( element: SettingsElement ) => void;
    } >;
    SubSection?: ComponentType< {
        element: SettingsElement;
        onValueChange?: ( element: SettingsElement ) => void;
    } >;
    FieldGroup?: ComponentType< {
        element: SettingsElement;
        onValueChange?: ( element: SettingsElement ) => void;
    } >;
}

interface ExtendedSettingsParserProps extends SettingsParserProps {
    /**
     * Custom components to override default components.
     */
    components?: CustomComponents;
    /**
     * Filter prefix for WordPress hooks.
     */
    filterPrefix?: string;
}

/**
 * Settings Parser Component
 *
 * Parses and renders the appropriate component based on element type.
 */
const SettingsParser = ( {
    element,
    onValueChange,
    components,
    filterPrefix = 'plugin_settings',
}: ExtendedSettingsParserProps ) => {
    if ( ! element.display ) {
        return null;
    }

    // Use custom components or defaults
    const Section = components?.Section || DefaultSection;
    const SubSection = components?.SubSection || DefaultSubSection;
    const FieldGroup = components?.FieldGroup || DefaultFieldGroup;

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
                    filterPrefix={ filterPrefix }
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
                `${ filterPrefix }_default_parser`,
                null,
                element,
                onValueChange
            ) as JSX.Element | null;
    }
};

export default SettingsParser;


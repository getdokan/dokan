import type { SettingsParserProps } from '../types';
import SettingsParser from './SettingsParser';

/**
 * Section Component
 *
 * Renders a settings section with optional title, description, and children.
 */
const Section = ( { element, onValueChange }: SettingsParserProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const hasHeader = element.title || element.description;

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            { hasHeader && (
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                    { element.title && (
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            { element.title }
                        </h3>
                    ) }
                    { element.description && (
                        <p className="mt-1 text-sm text-gray-500">
                            { element.description }
                        </p>
                    ) }
                </div>
            ) }

            <div className="divide-y divide-gray-200">
                { element.children?.map( ( child ) => (
                    <SettingsParser
                        key={ child.hook_key || child.id }
                        element={ child }
                        onValueChange={ onValueChange }
                    />
                ) ) }
            </div>
        </div>
    );
};

export default Section;


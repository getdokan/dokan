import type { SettingsParserProps } from '../types';
import SettingsParser from './SettingsParser';

/**
 * SubSection Component
 *
 * Renders a settings subsection with optional title and children.
 */
const SubSection = ( { element, onValueChange }: SettingsParserProps ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="py-4">
            { element.title && (
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                    { element.title }
                </h4>
            ) }
            { element.description && (
                <p className="text-sm text-gray-500 mb-4">
                    { element.description }
                </p>
            ) }

            <div className="space-y-4">
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

export default SubSection;


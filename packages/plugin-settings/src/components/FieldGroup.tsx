import type { SettingsParserProps } from '../types';
import SettingsParser from './SettingsParser';

/**
 * FieldGroup Component
 *
 * Groups multiple fields together in a row or column layout.
 */
const FieldGroup = ( { element, onValueChange }: SettingsParserProps ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className={ `p-4 ${ element.css_class || '' }` }>
            { element.title && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    { element.title }
                </label>
            ) }
            { element.description && (
                <p className="text-sm text-gray-500 mb-3">
                    { element.description }
                </p>
            ) }

            <div className="flex flex-wrap gap-4 items-start">
                { element.children?.map( ( child ) => (
                    <div key={ child.hook_key || child.id } className="flex-1 min-w-0">
                        <SettingsParser
                            element={ child }
                            onValueChange={ onValueChange }
                        />
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default FieldGroup;


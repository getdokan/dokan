import type { FieldProps } from '../../types';

/**
 * InfoField Component
 *
 * A read-only informational field for displaying text or HTML content.
 */
const InfoField = ( { element }: FieldProps ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div
            className={ `flex flex-col gap-2 w-full p-4 ${
                element.css_class || ''
            }` }
        >
            { element.title && (
                <h4 className="text-sm font-bold text-gray-900">
                    { element.title }
                </h4>
            ) }
            { element.description && (
                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                    { element.description }
                </div>
            ) }
            { element.value && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                    { String( element.value ) }
                </div>
            ) }
        </div>
    );
};

export default InfoField;


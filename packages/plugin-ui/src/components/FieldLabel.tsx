import { useState } from '@wordpress/element';
import type { FieldLabelProps } from '../types';

/**
 * FieldLabel Component
 *
 * A label with optional description and tooltip.
 */
const FieldLabel = ( {
    title,
    description,
    tooltip,
    imageUrl,
    htmlFor,
    isBold = true,
    className = '',
}: FieldLabelProps ) => {
    const [ showTooltip, setShowTooltip ] = useState( false );

    if ( ! title && ! description ) {
        return null;
    }

    return (
        <div className={ `flex flex-col gap-1 ${ className }` }>
            <div className="flex items-center gap-2">
                { title && (
                    <label
                        htmlFor={ htmlFor }
                        className={ `text-sm text-gray-900 ${
                            isBold ? 'font-semibold' : 'font-normal'
                        }` }
                    >
                        { title }
                    </label>
                ) }
                { tooltip && (
                    <div
                        className="relative inline-flex"
                        onMouseEnter={ () => setShowTooltip( true ) }
                        onMouseLeave={ () => setShowTooltip( false ) }
                    >
                        <span className="text-gray-400 cursor-help">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        { showTooltip && (
                            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
                                { tooltip }
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                        ) }
                    </div>
                ) }
            </div>
            { description && (
                <p className="text-xs text-gray-500">{ description }</p>
            ) }
            { imageUrl && (
                <img
                    src={ imageUrl }
                    alt=""
                    className="mt-2 max-w-xs rounded-md border border-gray-200"
                />
            ) }
        </div>
    );
};

export default FieldLabel;


interface FieldLabelProps {
    title?: string;
    description?: string;
    tooltip?: string;
    imageUrl?: string;
    htmlFor?: string;
    required?: boolean;
    titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    wrapperClassName?: string;
}

/**
 * FieldLabel Component
 *
 * A reusable label component for form fields with optional description,
 * tooltip, and image support.
 */
const FieldLabel = ( {
    title,
    description,
    tooltip,
    imageUrl,
    htmlFor,
    required,
    titleFontWeight = 'bold',
    wrapperClassName = '',
}: FieldLabelProps ) => {
    const fontWeightClass = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    }[ titleFontWeight ];

    return (
        <div className={ `flex flex-col gap-1 ${ wrapperClassName }` }>
            { title && (
                <div className="flex items-center gap-2">
                    <label
                        htmlFor={ htmlFor }
                        className={ `text-sm text-gray-900 ${ fontWeightClass }` }
                    >
                        { title }
                        { required && (
                            <span className="text-red-500 ml-1">*</span>
                        ) }
                    </label>
                    { tooltip && (
                        <span
                            className="text-gray-400 cursor-help"
                            title={ tooltip }
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={ 2 }
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </span>
                    ) }
                </div>
            ) }
            { description && (
                <p className="text-sm text-gray-500">{ description }</p>
            ) }
            { imageUrl && (
                <div className="mt-2">
                    <img
                        src={ imageUrl }
                        alt={ title || 'Field preview' }
                        className="max-w-full h-auto rounded-md border border-gray-200"
                    />
                </div>
            ) }
        </div>
    );
};

export default FieldLabel;

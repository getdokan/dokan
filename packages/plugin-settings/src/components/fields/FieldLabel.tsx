interface FieldLabelProps {
    title?: string;
    description?: string;
    tooltip?: string;
    htmlFor?: string;
    required?: boolean;
}

/**
 * FieldLabel Component
 *
 * Renders a label with optional description and tooltip.
 */
const FieldLabel = ( {
    title,
    description,
    tooltip,
    htmlFor,
    required = false,
}: FieldLabelProps ) => {
    if ( ! title ) {
        return null;
    }

    return (
        <div className="mb-1">
            <label
                htmlFor={ htmlFor }
                className="block text-sm font-medium text-gray-700"
            >
                { title }
                { required && (
                    <span className="text-red-500 ml-1">*</span>
                ) }
                { tooltip && (
                    <span
                        className="ml-1 text-gray-400 cursor-help"
                        title={ tooltip }
                    >
                        <svg
                            className="inline-block w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
            </label>
            { description && (
                <p className="text-sm text-gray-500">{ description }</p>
            ) }
        </div>
    );
};

export default FieldLabel;


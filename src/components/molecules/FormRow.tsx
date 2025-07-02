interface FormRowProps {
    label?: string;
    htmlFor?: string;
    helperText?: string;
    error?: string;
    children: React.ReactNode;
}

const FormRow: React.FC< FormRowProps > = ( {
    label,
    htmlFor,
    helperText,
    error,
    children,
} ) => (
    <div className="flex flex-col gap-1 w-full mb-4">
        { label && (
            <label
                htmlFor={ htmlFor }
                className="text-sm font-medium text-gray-900 mb-1"
            >
                { label }
            </label>
        ) }
        <div className="flex items-center w-full">{ children }</div>
        { helperText && (
            <span className="text-xs text-gray-500 mt-1">{ helperText }</span>
        ) }
        { error && (
            <span className="text-xs text-red-500 mt-1">{ error }</span>
        ) }
    </div>
);

export default FormRow;

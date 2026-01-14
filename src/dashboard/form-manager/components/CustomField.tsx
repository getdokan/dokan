const CustomField = ( {
    label,
    children,
    className = '',
}: {
    label?: string | React.ReactNode;
    children: React.ReactNode;
    className?: string;
} ) => {
    return (
        <div className={ `flex flex-col gap-1 ${ className }` }>
            { label && label }
            { children }
        </div>
    );
};

export default CustomField;

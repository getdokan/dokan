// Reusable selector card component
const SelectorCard = ( { type, value, selected, onChange, icon } ) => {
    return (
        <button
            className={ `relative border rounded-md p-4 flex flex-col items-center justify-center w-32 h-24 ${
                selected ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
            }` }
            onClick={ () => onChange( type, value ) }
        >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                { icon }
            </div>
            <span className="text-sm">
                { value === 'admin' ? 'Admin' : 'Vendor' }
            </span>
            { selected && (
                <div className="absolute top-1 right-1 text-purple-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            ) }
        </button>
    );
};

export default SelectorCard;

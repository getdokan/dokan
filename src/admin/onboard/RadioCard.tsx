const RadioCard = ( { label, description, checked, onChange, width } ) => {
    return (
        <div
            className={ `border rounded-lg p-3 ${ width } h-[7rem] justify-between flex-col cursor-pointer transition-colors flex gap-2 items-start ${
                checked ? 'border-[#7047EB]' : 'border-gray-300'
            }` }
            onClick={ onChange }
        >
            <div
                className={ `w-6 h-6 rounded-full flex  items-center justify-center ${
                    checked ? 'bg-[#7047EB]' : 'border-2 border-gray-300'
                }` }
            >
                { checked ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                ) }
            </div>
            <div className="">
                <div className="text-sm text-gray-500">{ label }</div>
                { description && (
                    <div className="text-sm text-gray-500 mt-1">
                        { description }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default RadioCard;

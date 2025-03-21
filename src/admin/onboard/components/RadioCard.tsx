const RadioCard = ( { label, description, checked, onChange, width } ) => {
    return (
        <div
            className={ `border rounded-lg p-3 ${ width } h-[85px] justify-between flex-col cursor-pointer transition-colors flex gap-2 items-start ${
                checked ? 'border-[#7047EB]' : 'border-gray-300'
            }` }
            onClick={ onChange }
        >
            <div
                className={ `w-5 h-5 rounded-full flex  items-center justify-center` }
            >
                { checked ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="19"
                        viewBox="0 0 19 19"
                        fill="none"
                    >
                        <circle
                            cx="9.64526"
                            cy="9.05762"
                            r="8.5"
                            fill="#7047EB"
                            stroke="#7047EB"
                        />
                        <path
                            d="M9.20594 13.0576C9.0505 13.0572 8.90075 12.9955 8.78575 12.8845L5.81933 9.9756C5.57983 9.70997 5.58856 9.28862 5.83883 9.03441C6.06655 8.80305 6.42063 8.78712 6.66598 8.99708L9.12441 11.4134L13.5144 5.32262C13.724 5.02847 14.1185 4.97036 14.3956 5.19282C14.6727 5.41528 14.7275 5.83392 14.5179 6.12807L9.73901 12.7847C9.63418 12.9391 9.47205 13.0384 9.29374 13.0576H9.20594Z"
                            fill="white"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="19"
                        viewBox="0 0 19 19"
                        fill="none"
                    >
                        <circle
                            cx="9.64526"
                            cy="9.05762"
                            r="8.5"
                            stroke="#E9E9E9"
                        />
                    </svg>
                ) }
            </div>
            <div className="">
                <div className="text-xs text-[#25252D]">{ label }</div>
                { description && (
                    <div className="text-xs text-[#25252D] mt-1">
                        { description }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default RadioCard;

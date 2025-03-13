const RadioButton = ( {
    title,
    description,
    selectedValue = 'hide',
    onChange,
} ) => {
    return (
        <div className="border bor-[#E9E9E9] flex justify-between items-center p-4 w-full">
            <div className="">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282]">{ description }</p>
            </div>
            <div className="flex">
                { /* Hide button */ }
                <button
                    className={ `px-6 py-2 text-sm font-semibold rounded-l-md border border-gray-200 ${
                        selectedValue === 'hide'
                            ? 'bg-[#7047EB] text-white'
                            : 'bg-white text-gray-800'
                    }` }
                    onClick={ () => onChange( 'hide' ) }
                >
                    Hide
                </button>

                { /* Show button */ }
                <button
                    className={ `px-6 py-2 text-sm font-semibold rounded-r-md border border-gray-200 ${
                        selectedValue === 'show'
                            ? 'bg-[#7047EB] text-white'
                            : 'bg-white text-gray-800'
                    }` }
                    onClick={ () => onChange( 'show' ) }
                >
                    Show
                </button>
            </div>
        </div>
    );
};

export default RadioButton;

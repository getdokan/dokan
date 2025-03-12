import React, { useState } from 'react';

const RadioButton = ( { title, description } ) => {
    const [ selected, setSelected ] = useState( 'show' ); // Default to 'show'

    return (
        <div className="bg-white border border-gray-200 rounded p-4 w-full flex justify-between items-center">
            <div className="flex flex-col gap-1">
                { /* Button Title */ }
                <h4 className="text-sm font-medium text-gray-800">{ title }</h4>
                { /* Button Description */ }
                <p className="text-xs text-gray-500">{ description }</p>
            </div>

            { /* Radio Button Section */ }
            <div className="flex">
                { /* Hide button */ }
                <button
                    className={ `px-6 py-2 text-sm font-medium rounded-l-md border border-gray-200 ${
                        selected === 'hide'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-800'
                    }` }
                    onClick={ () => setSelected( 'hide' ) }
                >
                    Hide
                </button>

                { /* Show button */ }
                <button
                    className={ `px-6 py-2 text-sm font-medium rounded-r-md border border-gray-200 ${
                        selected === 'show'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-800'
                    }` }
                    onClick={ () => setSelected( 'show' ) }
                >
                    Show
                </button>
            </div>
        </div>
    );
};

export default RadioButton;

// Usage example:
// <RadioButton
//   title="Contact Form on Store Page"
//   description="Display a contact form on vendor store pages for customer inquiries"
// />

import React, { useState } from 'react';

const RadioButton = () => {
    const [ selected, setSelected ] = useState( 'show' ); // Default to 'show'

    return (
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
    );
};

export default RadioButton;

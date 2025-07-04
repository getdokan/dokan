import { twMerge } from 'tailwind-merge';
import { useState } from '@wordpress/element';

export interface DokanRadioCapsuleProps {
    options: Array< {
        value: string;
        title: string;
        icon?: React.ReactNode;
    } >;
    selected: string;
    onChange: ( value: string ) => void;
    wrapperClassName?: string;
    className?: string;
}

const DokanRadioCapsule = ( {
    options = [],
    wrapperClassName = '',
    selected,
    onChange,
    className = '',
}: DokanRadioCapsuleProps ) => {
    const [ selectedValue, setSelectedValue ] = useState< string >( selected );
    const handleChange = ( value: string ) => {
        setSelectedValue( value );
        onChange( value );
    };

    return (
        <div
            className={ twMerge(
                'inline-flex items-center',
                wrapperClassName
            ) }
        >
            { options?.map( ( option, index ) => (
                <button
                    key={ option?.value }
                    type="button"
                    className={ twMerge(
                        `px-5 py-3  text-sm font-semibold flex gap-3 items-center  border
                         ${ index === 0 ? 'rounded-l-md' : 'rounded-r-md' }
                         ${
                             selectedValue === option?.value
                                 ? 'bg-dokan-btn border-dokan-btn text-white'
                                 : 'bg-white text-gray-800 border-gray-200'
                         }`,
                        className
                    ) }
                    onClick={ () => handleChange( option?.value ) }
                    aria-pressed={ selectedValue === option?.value }
                >
                    { option?.icon && (
                        <span className="w-4 h-4 flex items-center justify-center">
                            { option.icon }
                        </span>
                    ) }
                    { option?.title }
                </button>
            ) ) }
        </div>
    );
};

export default DokanRadioCapsule;

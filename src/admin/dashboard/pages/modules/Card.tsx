import { twMerge } from 'tailwind-merge';
import { __ } from '@wordpress/i18n';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { DokanModule } from './index';
import { useEffect, useState } from '@wordpress/element';

const Card = ( {
    module,
    onChange,
    colors,
}: {
    module: DokanModule;
    onChange: ( value: boolean ) => void;
    colors: Record< string, string >;
} ) => {
    const [ toggle, setToggle ] = useState( false );

    const toggleHandler = ( doToggle: boolean ) => {
        setToggle( doToggle );
        onChange( doToggle );
    };

    useEffect( () => {
        if ( ! toggle ) {
            return;
        }

        const timeoutId = setTimeout( () => {
            setToggle( false );
        }, 1000 );

        return () => clearTimeout( timeoutId );
    }, [ toggle ] );

    return (
        <div className="module-card border border-gray-300 rounded-md p-4 bg-white shadow">
            <img
                src={ module.image }
                alt={ module.title }
                className="module-image w-24 object-cover rounded-sm mb-4 aspect-3/2"
            />

            <h3 className="mt-0 mb-2 text-lg font-semibold">
                { module.title }
            </h3>
            <p className="text-sm text-gray-600 mb-4">{ module.description }</p>
            <div className="module-tags flex gap-2 mb-3">
                { module.tags.map( ( tag, tagIndex ) => (
                    <span
                        key={ tagIndex }
                        className={ twMerge(
                            'module-tag px-2.5 py-1 rounded-full text-xs font-semibold',
                            `bg-${ colors[ tag ] }-100 text-${ colors[ tag ] }-800`
                        ) }
                    >
                        { tag }
                    </span>
                ) ) }
            </div>
            <div className="module-actions flex gap-4 items-center mt-4">
                { module.actions &&
                    Object.entries( module.actions ).map(
                        ( [ action, value ], actionIndex ) => (
                            <a
                                key={ actionIndex }
                                href={ value }
                                className="text-gray-500 text-sm no-underline"
                            >
                                { 'docs' === action
                                    ? __( 'Docs', 'dokan-lite' )
                                    : __( 'Video', 'dokan-lite' ) }
                            </a>
                        )
                    ) }
                <div className="toggle-container ml-auto">
                    <ToggleSwitch
                        checked={ toggle }
                        onChange={ () => toggleHandler( true ) }
                    />
                </div>
            </div>
        </div>
    );
};

export default Card;

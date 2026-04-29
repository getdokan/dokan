import { Popover } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
// eslint-disable-next-line import/named
import { RefObject, useEffect, useState } from '@wordpress/element';
import { getActiveSubmenuKey } from './Sidebar';

const SubmenuPopover = ( {
    submenu,
    anchorRef,
    onMouseEnter,
    onMouseLeave,
    onClose,
}: {
    submenu: any;
    anchorRef: RefObject< HTMLElement >;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClose: () => void;
} ) => {
    const currentUrl = window.location?.href || '';
    const activeSubkey = getActiveSubmenuKey( submenu, currentUrl );
    const [ entered, setEntered ] = useState( false );

    // Trigger enter animation on mount
    useEffect( () => {
        const id = requestAnimationFrame( () => setEntered( true ) );
        return () => cancelAnimationFrame( id );
    }, [] );

    return (
        <Popover
            offset={ 8 }
            flip={ true }
            shift={ true }
            resize={ false }
            onClose={ onClose }
            placement="right-start"
            onFocusOutside={ onClose }
            anchor={ anchorRef.current }
            className="dokan-submenu-popover dokan-layout"
        >
            <div
                onMouseEnter={ onMouseEnter }
                onMouseLeave={ onMouseLeave }
                className={ twMerge(
                    'sidebar-popover bg-white rounded shadow-lg min-w-[240px] max-h-96 overflow-y-auto py-2 transform-gpu transition-all duration-200 ease-out',
                    entered
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-1'
                ) }
            >
                <ul className="flex flex-col">
                    { Object.entries( submenu || {} ).map(
                        ( [ subkey, subitem ]: any ) => {
                            const isSubActive = subkey === activeSubkey;

                            return (
                                <li key={ subkey }>
                                    <a
                                        href={ subitem.url }
                                        className={ twMerge(
                                            'skip-color-module group flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#828282] focus:!outline-none transition-colors duration-150',
                                            isSubActive && 'active'
                                        ) }
                                    >
                                        <span className="ml-1">
                                            { subitem.title }
                                        </span>
                                        { subitem.counts > 0 && (
                                            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md text-white sidebar-submenu-bubble">
                                                { subitem.counts }
                                            </span>
                                        ) }
                                    </a>
                                </li>
                            );
                        }
                    ) }
                </ul>
            </div>
        </Popover>
    );
};

export default SubmenuPopover;

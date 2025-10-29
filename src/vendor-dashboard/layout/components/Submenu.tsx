import { Popover } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
// eslint-disable-next-line import/named
import { RefObject } from '@wordpress/element';

const Submenu = ( {
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
                className="bg-white rounded-md shadow-lg min-w-[220px] max-h-96 overflow-y-auto py-2"
            >
                <ul className="flex flex-col">
                    { Object.entries( submenu || {} ).map(
                        ( [ subkey, subitem ]: any ) => {
                            const isSubActive =
                                subitem?.url &&
                                currentUrl.startsWith( subitem.url );

                            return (
                                <li key={ subkey }>
                                    <a
                                        href={ subitem.url }
                                        className={ twMerge(
                                            'skip-color-module group flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#828282] hover:text-[#7047EB] hover:bg-[#EFEAFF] rounded-md focus:!outline-none transition-colors',
                                            isSubActive && 'active'
                                        ) }
                                    >
                                        <span className="ml-1">
                                            { subitem.title }
                                        </span>
                                        { subitem.counts > 0 && (
                                            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md text-white sidebar-menu-bubble">
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

export default Submenu;

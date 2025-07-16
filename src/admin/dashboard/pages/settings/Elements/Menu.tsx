import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import { ChevronRightIcon } from 'lucide-react';
import { SettingsElement } from '../../../../../stores/adminSettings/types';

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

const Menu = ( {
    pages,
    loading,
    activePage,
    onMenuClick,
}: {
    pages: SettingsElement[];
    parentPages?: SettingsElement[];
    loading: boolean;
    activePage: string;
    onMenuClick: ( page: string ) => void;
} ): JSX.Element => {
    return (
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="bg-white rounded-md">
                <ul className="-mx-2 space-y-1">
                    { ! loading &&
                        pages.map( ( item ) => {
                            if ( ! item.display ) {
                                return <></>;
                            }
                            return (
                                <li key={ item.id }>
                                    { ! item.children ? (
                                        <a
                                            href={ item.id }
                                            className={ classNames(
                                                item.id === activePage ||
                                                    item.children.some(
                                                        ( child ) =>
                                                            child.id ===
                                                            activePage
                                                    )
                                                    ? 'bg-gray-50'
                                                    : 'hover:bg-gray-50',
                                                'block rounded-md py-2 pl-10 pr-2 text-sm/6 font-semibold text-gray-700'
                                            ) }
                                        >
                                            { item.title }
                                        </a>
                                    ) : (
                                        <Disclosure as="div">
                                            <DisclosureButton
                                                className={ classNames(
                                                    item.id === activePage ||
                                                        item?.children?.some(
                                                            ( child ) =>
                                                                child.id ===
                                                                activePage
                                                        )
                                                        ? 'bg-gray-50'
                                                        : 'hover:bg-gray-50',
                                                    'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700'
                                                ) }
                                            >
                                                <ChevronRightIcon
                                                    aria-hidden="true"
                                                    className="size-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
                                                />
                                                { item.title }
                                            </DisclosureButton>
                                            <DisclosurePanel
                                                as="ul"
                                                className="mt-1 px-2"
                                            >
                                                { item?.children?.map(
                                                    ( subItem ) => (
                                                        <li
                                                            key={
                                                                subItem.title
                                                            }
                                                        >
                                                            <DisclosureButton
                                                                as="a"
                                                                href={
                                                                    subItem.id
                                                                }
                                                                onClick={ (
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    onMenuClick(
                                                                        subItem.id
                                                                    );
                                                                } }
                                                                className={ classNames(
                                                                    subItem.id ===
                                                                        activePage
                                                                        ? 'bg-gray-50'
                                                                        : 'hover:bg-gray-50',
                                                                    'block rounded-md py-2 pl-9 pr-2 text-sm/6 text-gray-700'
                                                                ) }
                                                            >
                                                                {
                                                                    subItem.title
                                                                }
                                                            </DisclosureButton>
                                                        </li>
                                                    )
                                                ) }
                                            </DisclosurePanel>
                                        </Disclosure>
                                    ) }
                                </li>
                            );
                        } ) }
                </ul>
            </nav>
        </aside>
    );
};

export default Menu;

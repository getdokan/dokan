import { useCallback } from '@wordpress/element';
import type { SettingsElement } from '../types';

interface MenuProps {
    pages: SettingsElement[];
    loading: boolean;
    activePage: string;
    onMenuClick: ( pageId: string ) => void;
}

/**
 * Menu Component
 *
 * Renders the settings navigation menu.
 */
const Menu = ( { pages, loading, activePage, onMenuClick }: MenuProps ) => {
    const handleClick = useCallback(
        ( pageId: string ) => () => {
            onMenuClick( pageId );
        },
        [ onMenuClick ]
    );

    if ( loading ) {
        return (
            <aside className="lg:col-span-3 py-6 px-2 sm:px-6 lg:py-10 lg:px-4">
                <nav className="space-y-2">
                    { [ 1, 2, 3, 4 ].map( ( i ) => (
                        <div
                            key={ i }
                            className="h-10 bg-gray-200 rounded animate-pulse"
                        />
                    ) ) }
                </nav>
            </aside>
        );
    }

    return (
        <aside className="lg:col-span-3 py-6 px-2 sm:px-6 lg:py-10 lg:px-4">
            <nav className="space-y-1">
                { pages.map( ( page ) => {
                    const subPages = page.children?.filter(
                        ( child ) => child.type === 'subpage'
                    ) || [];

                    return (
                        <div key={ page.id } className="mb-4">
                            { page.title && (
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                                    { page.title }
                                </h3>
                            ) }

                            { subPages.map( ( subPage ) => {
                                const isActive = activePage === subPage.id;

                                return (
                                    <button
                                        key={ subPage.id }
                                        type="button"
                                        onClick={ handleClick( subPage.id ) }
                                        className={ `w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }` }
                                    >
                                        { subPage.icon && (
                                            <span
                                                className={ `mr-3 h-5 w-5 ${
                                                    isActive
                                                        ? 'text-indigo-500'
                                                        : 'text-gray-400 group-hover:text-gray-500'
                                                }` }
                                                dangerouslySetInnerHTML={ { __html: subPage.icon } }
                                            />
                                        ) }
                                        { subPage.title }
                                    </button>
                                );
                            } ) }
                        </div>
                    );
                } ) }
            </nav>
        </aside>
    );
};

export default Menu;


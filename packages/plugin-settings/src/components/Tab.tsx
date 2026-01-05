import { useCallback } from '@wordpress/element';
import type { SettingsElement } from '../types';

interface TabProps {
    tabs: SettingsElement[];
    loading: boolean;
    selectedTab: string;
    onTabClick: ( tabId: string ) => void;
}

/**
 * Tab Component
 *
 * Renders tab navigation within a settings page.
 */
const Tab = ( { tabs, loading, selectedTab, onTabClick }: TabProps ) => {
    const handleClick = useCallback(
        ( tabId: string ) => () => {
            onTabClick( tabId );
        },
        [ onTabClick ]
    );

    if ( loading ) {
        return (
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    { [ 1, 2, 3 ].map( ( i ) => (
                        <div
                            key={ i }
                            className="h-10 w-24 bg-gray-200 rounded animate-pulse"
                        />
                    ) ) }
                </nav>
            </div>
        );
    }

    if ( ! tabs.length ) {
        return null;
    }

    return (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
                { tabs.map( ( tab ) => {
                    const isActive = selectedTab === tab.id;

                    return (
                        <button
                            key={ tab.id }
                            type="button"
                            onClick={ handleClick( tab.id ) }
                            className={ `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                isActive
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }` }
                            aria-current={ isActive ? 'page' : undefined }
                        >
                            { tab.icon && (
                                <span
                                    className="mr-2 inline-block"
                                    dangerouslySetInnerHTML={ { __html: tab.icon } }
                                />
                            ) }
                            { tab.title }
                        </button>
                    );
                } ) }
            </nav>
        </div>
    );
};

export default Tab;


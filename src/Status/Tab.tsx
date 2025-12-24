import { StatusElement } from './Status';
import { __ } from '@wordpress/i18n';

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

const Tab = ( {
    tabs,
    loading,
    selectedTab,
    onTabClick,
}: {
    tabs: StatusElement[];
    loading: boolean;
    selectedTab: string;
    onTabClick: ( tabs ) => void;
} ) => {
    return (
        ! loading &&
        ( tabs || [] ).length > 0 && (
            <div>
                <div className="sm:hidden">
                    <label htmlFor="tabs" className="sr-only">
                        { __( 'Select a tab', 'dokan-lite' ) }
                    </label>
                    { /* Use an "onChange" listener to redirect the user to the selected tab URL. */ }
                    <select
                        id="tabs"
                        name="tabs"
                        className="block w-full focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"
                        defaultValue={ selectedTab }
                    >
                        { tabs.map( ( tab ) => {
                            return (
                                <option
                                    data-hook={ tab.hook_key }
                                    key={ tab.id }
                                >
                                    { tab.title }
                                </option>
                            );
                        } ) }
                    </select>
                </div>
                <div className="hidden sm:block">
                    <div className="border-b border-gray-200">
                        <nav
                            className="-mb-px flex space-x-8"
                            aria-label="Tabs"
                        >
                            { tabs.map( ( tab ) => {
                                return (
                                    <a
                                        data-hook={ tab.hook_key }
                                        key={ tab.id }
                                        href={ tab.id }
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            onTabClick( tab.id );
                                        } }
                                        className={ classNames(
                                            tab.id === selectedTab
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                            'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                                        ) }
                                        aria-current={
                                            tab.id === selectedTab
                                                ? 'page'
                                                : undefined
                                        }
                                    >
                                        <span>{ tab.title }</span>
                                    </a>
                                );
                            } ) }
                        </nav>
                    </div>
                </div>
            </div>
        )
    );
};

export default Tab;

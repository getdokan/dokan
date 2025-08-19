import { __ } from "@wordpress/i18n";
import { DokanTab } from "../../../../../components";
import { SettingsElement } from "../../setup-guide/StepSettings";

const Tab = ({
    tabs,
    loading,
    selectedTab,
    onTabClick,
    children,
}: {
    tabs: SettingsElement[];
    loading: boolean;
    selectedTab: string;
    onTabClick: ( tabs: string ) => void;
    children?: ( tab: SettingsElement ) => JSX.Element;
}) => {
    // Filter displayable tabs
    const displayableTabs = tabs.filter( tab => tab.display );

    if ( loading || displayableTabs.length === 0 ) {
        return null;
    }

    return (
        <div>
            {/* Mobile Select Dropdown */}
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    { __( 'Select a tab', 'dokan-lite' ) }
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full focus:ring-[#7047EB] focus:border-[#7047EB] border-gray-300 rounded-md"
                    value={ selectedTab }
                    onChange={ ( e ) => onTabClick( e.target.value ) }
                >
                    { displayableTabs.map( ( tab ) => (
                        <option key={ tab.id } value={ tab.id }>
                            { tab.title }
                        </option>
                    ) ) }
                </select>
            </div>

            {/* Desktop Tab Navigation using DokanTab */}
            <div className="hidden sm:block">
                { /* @ts-ignore */ }
                <DokanTab
                    className="dokan-menu-manager-tabs m-0"
                    tabs={ displayableTabs.map( tab => ( {
                        name: tab.id,
                        title: tab.title,
                        className: 'px-4 text-[#626262] hover:border-[#7047EB]',
                    } ) ) }
                    initialTabName={ selectedTab }
                    namespace="settings"
                    onSelect={ onTabClick }
                    activeClass="!text-[#7047EB] !border-[#7047EB] dokan-active-tab"
                >
                    { /* @ts-ignore */ }
                    { children || ( () => null ) }
                </DokanTab>
            </div>
        </div>
    );
};

export default Tab;

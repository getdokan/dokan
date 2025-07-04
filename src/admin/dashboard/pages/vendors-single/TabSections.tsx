import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import GeneralTab from './InformationTabs/GeneralTab';
import OverviewTab from './InformationTabs/OverviewTab';
import WithdrawTab from './InformationTabs/WithdrawTab';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { Slot } from '@wordpress/components';

export interface TabSectionProps {
    vendor: Vendor;
    onDataUpdate?: ( tabName: string, data: any ) => void;
}

interface TabConfig {
    name: string;
    title: string;
    component: JSX.Element;
    position?: number;
}

const TabSections = ( { vendor, onDataUpdate }: TabSectionProps ) => {
    // @ts-ignore
    const tabs: TabConfig[] = window.wp.hooks.applyFilters(
        'dokan-admin-vendor-tabs',
        // @ts-ignore
        [
            {
                name: 'overview',
                title: __( 'Overview', 'dokan-lite' ),
                component: OverviewTab,
                position: 0,
            },
            {
                name: 'general',
                title: __( 'General', 'dokan-lite' ),
                component: GeneralTab,
                position: 1,
            },
            {
                name: 'withdraw',
                title: __( 'Withdraw', 'dokan-lite' ),
                component: WithdrawTab,
                position: 5,
            },
        ],
        vendor
    );

    const [ activeTab, setActiveTab ] = useState( 'overview' );

    const handleTabChange = ( tabName: string ) => {
        setActiveTab( tabName );
        if ( onDataUpdate ) {
            onDataUpdate( tabName, { vendor } );
        }
    };

    const getSortedTabs = () => {
        // @ts-ignore - Apply any additional hooks to modify the tabs.
        wp.hooks.doAction( 'dokan-admin-vendor-tabs-sort', tabs );

        // @ts-ignore - Sort the tabs based on the position prop.
        return wp.hooks.applyFilters(
            'dokan-admin-vendor-sorted-tabs',
            [ ...tabs ].sort(
                ( a, b ) => ( a.position || 0 ) - ( b.position || 0 )
            )
        );
    };

    const getCurrentTabComponent = () => {
        // Find the current tab based on the activeTab state
        const sortedTabs = getSortedTabs(),
            currentTab = sortedTabs.find( ( tab ) => tab.name === activeTab );

        if ( ! currentTab ) {
            return currentTab;
        }

        const TabComponent = currentTab.component;

        // Pass appropriate props based on tab type
        const commonProps = { vendor };

        // Add specific props for certain tabs
        const specificProps = {
            onUpdate: onDataUpdate
                ? ( data: any ) => onDataUpdate( activeTab, data )
                : undefined,
            onStatusChange: onDataUpdate
                ? ( status: boolean ) =>
                    onDataUpdate( 'verification', { enabled: status } )
                : undefined,
            onPlanChange: onDataUpdate
                ? ( planId: string ) =>
                    onDataUpdate( 'subscription', { planId } )
                : undefined,
            onWithdrawRequest: onDataUpdate
                ? ( amount: number, method: string ) =>
                    onDataUpdate( 'withdraw', { amount, method } )
                : undefined,
            onBadgeToggle: onDataUpdate
                ? ( badgeId: string, award: boolean ) =>
                    onDataUpdate( 'badges', { badgeId, award } )
                : undefined,
        };

        // @ts-ignore
        return <TabComponent { ...commonProps } { ...specificProps } />;
    };

    return (
        <div className="@container flex flex-col w-full">
            <Slot
                name={ `dokan-admin-vendor-before-tabs` }
                fillProps={ { vendor, getSortedTabs } }
            />

            { /* @ts-ignore - Tab Navigation - Matching the exact style from your design */ }
            <div className="flex border-gray-200 mb-6 overflow-x-auto @md:space-x-8 space-x-4">
                { getSortedTabs().map( ( tab ) => (
                    <button
                        key={ tab.name }
                        className={
                            'px-4 py-4 text-base border-b border-b-2 border-transparent font-semibold whitespace-nowrap transition-colors ' +
                            ( activeTab === tab.name
                                ? '!border-[#7047EB] text-[#7047EB]'
                                : 'border-transparent text-gray-500 hover:text-[#7047EB] hover:!border-[#7047EB]' )
                        }
                        onClick={ () => handleTabChange( tab.name ) }
                    >
                        { tab.title }
                    </button>
                ) ) }
            </div>

            { /* Tab Content */ }
            { getCurrentTabComponent() }
        </div>
    );
};

export default TabSections;

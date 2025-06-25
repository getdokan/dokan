import { useState } from '@wordpress/element';
import { Vendor } from '@dokan/definitions/dokan-vendors';

import OverviewTab from './InformationTabs/OverviewTab';
import GeneralTab from './InformationTabs/GeneralTab';
import WithdrawTab from './InformationTabs/WithdrawTab';
import BadgesTab from './InformationTabs/BadgesTab';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import vendorsStore from '@dokan/stores/vendors';

export interface TabSectionProps {
    vendor: Vendor;
    onDataUpdate?: ( tabName: string, data: any ) => void;
}

interface TabConfig {
    name: string;
    title: string;
    component: JSX.Element;
}

const TabSections = ( { vendor, onDataUpdate }: TabSectionProps ) => {
    const tabs: TabConfig[] = window.wp.hooks.applyFilters(
        'dokan-admin-vendor-tabs',
        // @ts-ignore
        [
            {
                name: 'overview',
                title: __( 'Overview', 'dokan-lite' ),
                component: OverviewTab,
            },
            {
                name: 'general',
                title: __( 'General', 'dokan' ),
                component: GeneralTab,
            },
            {
                name: 'withdraw',
                title: __( 'Withdraw', 'dokan-lite' ),
                component: WithdrawTab,
            },
            {
                name: 'badges',
                title: __( 'Badges', 'dokan' ),
                component: BadgesTab,
            },
        ]
    );

    const vendorStats = useSelect(
        ( select ) => {
            if ( ! vendor?.id ) {
                return;
            }

            return select( vendorsStore ).getVendorStats(
                // @ts-ignore
                parseInt( vendor?.id )
            );
        },
        [ vendor?.id ]
    );

    const [ activeTab, setActiveTab ] = useState( 'overview' );

    const handleTabChange = ( tabName: string ) => {
        setActiveTab( tabName );
        if ( onDataUpdate ) {
            onDataUpdate( tabName, { vendor, vendorStats } );
        }
    };

    const getCurrentTabComponent = () => {
        const currentTab = tabs.find( ( tab ) => tab.name === activeTab );
        if ( ! currentTab ) {
            return currentTab;
        }

        const TabComponent = currentTab.component;

        // Show loading state if vendorStats is null (like in Vue where stats !== null check)
        if ( ! vendorStats && activeTab === 'overview' ) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
                    <span className="ml-2 text-gray-600">
                        Loading vendor statistics...
                    </span>
                </div>
            );
        }

        // Pass appropriate props based on tab type
        const commonProps = {
            vendor,
            vendorStats,
        };

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

        return <TabComponent { ...commonProps } { ...specificProps } />;
    };

    return (
        <div className="@container flex flex-col w-full">
            { /* Tab Navigation - Matching the exact style from your design */ }
            <div className="flex border-gray-200 mb-6 overflow-x-auto @md:space-x-8 space-x-4">
                { tabs.map( ( tab ) => (
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

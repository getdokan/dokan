import { __ } from '@wordpress/i18n';
import Section from './Elements/Section';
import MiniCard from './Elements/MiniCard';
import AdminNotices from './components/AdminNotices';
import { Coins, BadgeDollarSign, User } from 'lucide-react';
import { DokanButton } from '../../../../components';
import Card from './Elements/Card';
import MonthPicker from './Elements/MonthPicker';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

function Dashboard() {
    const [ monthData, setMonthData ] = useState( {
        month: '',
        year: '',
    } );

    const noticeScopes = applyFilters( 'dokan_admin_dashboard_notices_scopes', [
        { scope: 'global', endpoint: 'admin' },
        { scope: '', endpoint: 'admin' },
        { scope: 'promo', endpoint: 'promo' },
    ] );

    return (
        <div>
            <h1 className="wp-heading-inline">
                { __( 'Dashboard', 'dokan-lite' ) }
            </h1>
            <hr className="wp-header-end" />

            { noticeScopes?.map( ( noticeConfig ) => (
                <AdminNotices
                    key={ `${ noticeConfig.endpoint }-${
                        noticeConfig.scope || 'local'
                    }` }
                    endpoint={ noticeConfig.endpoint }
                    scope={ noticeConfig.scope }
                />
            ) ) }

            <Section title={ __( 'To-Do', 'dokan-lite' ) }>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                    />
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                        countType="secondary"
                    />
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                    />
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                    />
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                        countType="secondary"
                    />
                    <MiniCard
                        icon={ <User /> }
                        text={ 'Vendor Approvals' }
                        count={ 20 }
                    />
                </div>
            </Section>

            <Section title={ __( 'Analytics', 'dokan-lite' ) }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MiniCard
                        icon={ <Coins /> }
                        iconType="secondary"
                        text={ 'Sales Overview' }
                        countType="component"
                        countComponent={
                            <DokanButton>View Report</DokanButton>
                        }
                    />
                    <MiniCard
                        icon={ <BadgeDollarSign /> }
                        iconType="secondary"
                        text={ 'Revenue Insight' }
                        countType="component"
                        countComponent={
                            <DokanButton>View Report</DokanButton>
                        }
                    />
                </div>
            </Section>

            <Section
                title={ __( 'Month Overview', 'dokan-lite' ) }
                sectionHeader={
                    <MonthPicker
                        value={ monthData }
                        minDate={ { month: 2, year: 2025 } }
                        maxDate={ { month: 8, year: 2025 } }
                        onChange={ ( value ) => {
                            setMonthData( value );
                        } }
                    />
                }
                tooltip={ 'This is a simple tooltip' }
            >
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Card
                        icon={ <User /> }
                        text="New Products"
                        content="$120"
                        count={ 2.7 }
                        tooltip={ 'This is a simple tooltip' }
                    />
                    <Card
                        icon={ <User /> }
                        text="Active vendors"
                        content="4"
                        count={ 2.7 }
                        countDirection="down"
                        tooltip={ 'This is a simple tooltip' }
                    />
                    <Card
                        icon={ <User /> }
                        text="New Customers"
                        content="$120"
                        count={ 2.7 }
                        tooltip={ 'This is a simple tooltip' }
                    />
                    <Card
                        icon={ <User /> }
                        text="Supprt Tickets"
                        content="$120"
                        count={ 2.7 }
                        tooltip={ 'This is a simple tooltip' }
                    />
                    <Card
                        icon={ <User /> }
                        text="Refunds"
                        content="$120"
                        count={ 2.7 }
                        countDirection="down"
                        tooltip={ 'This is a simple tooltip' }
                    />
                    <Card
                        icon={ <User /> }
                        text="Reviews"
                        content="$120"
                        count={ 2.7 }
                    />
                </div>
            </Section>

            <div className={ `legacy-dashboard-url text-sm font-medium pt-10` }>
                { __(
                    'If you want to go back to old dashboard,',
                    'dokan-lite'
                ) }{ ' ' }
                <a
                    className={ `skip-color-module underline font-bold text-sm !text-[#2271b1]` }
                    href={
                        dokanAdminDashboardSettings?.legacy_dashboard_url || '#'
                    }
                >
                    { __( 'Click Here', 'dokan-lite' ) }
                </a>
            </div>
        </div>
    );
}

export default Dashboard;

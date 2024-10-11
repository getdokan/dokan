/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { getPersistedQuery } from '@woocommerce/navigation';
import { withSelect } from '@wordpress/data';
import {
    EllipsisMenu,
    MenuItem,
    MenuTitle,
    SectionHeader,
    SummaryList,
    SummaryListPlaceholder,
    SummaryNumber,
} from '@woocommerce/components';
import { getDateParamsFromQuery } from '@woocommerce/date';
import { recordEvent } from '@woocommerce/tracks';
import { CurrencyContext } from '@woocommerce/currency';

/**
 * Internal dependencies
 */
// import './style.scss';
import { getIndicatorData, getIndicatorValues } from './utils';
import { getAdminSetting } from 'reports/utils/admin-settings';

const { performanceIndicators: indicators } = getAdminSetting(
    'dataEndpoints',
    {
        performanceIndicators: [
            {
                stat: 'revenue/total_sales',
                chart: 'total_sales',
                label: 'Total sales',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/revenue/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/revenue',
                        },
                    ],
                },
            },
            {
                stat: 'revenue/net_revenue',
                chart: 'net_revenue',
                label: 'Net sales',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/revenue/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/revenue',
                        },
                    ],
                },
            },
            {
                stat: 'orders/orders_count',
                chart: 'orders_count',
                label: 'Orders',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/orders/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/orders',
                        },
                    ],
                },
            },
            {
                stat: 'orders/avg_order_value',
                chart: 'avg_order_value',
                label: 'Average order value',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/orders/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/orders',
                        },
                    ],
                },
            },
            {
                stat: 'products/items_sold',
                chart: 'items_sold',
                label: 'Products sold',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/products/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/products',
                        },
                    ],
                },
            },
            {
                stat: 'revenue/refunds',
                chart: 'refunds',
                label: 'Returns',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/revenue/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/revenue',
                        },
                    ],
                },
            },
            {
                stat: 'coupons/orders_count',
                chart: 'orders_count',
                label: 'Discounted orders',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/coupons/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/coupons',
                        },
                    ],
                },
            },
            {
                stat: 'coupons/amount',
                chart: 'amount',
                label: 'Net discount amount',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/coupons/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/coupons',
                        },
                    ],
                },
            },
            {
                stat: 'taxes/total_tax',
                chart: 'total_tax',
                label: 'Total tax',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/taxes/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/taxes',
                        },
                    ],
                },
            },
            {
                stat: 'taxes/order_tax',
                chart: 'order_tax',
                label: 'Order tax',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/taxes/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/taxes',
                        },
                    ],
                },
            },
            {
                stat: 'taxes/shipping_tax',
                chart: 'shipping_tax',
                label: 'Shipping tax',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/taxes/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/taxes',
                        },
                    ],
                },
            },
            {
                stat: 'revenue/shipping',
                chart: 'shipping',
                label: 'Shipping',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/revenue/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/revenue',
                        },
                    ],
                },
            },
            {
                stat: 'downloads/download_count',
                chart: 'download_count',
                label: 'Downloads',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/downloads/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/downloads',
                        },
                    ],
                },
            },
            {
                stat: 'revenue/gross_sales',
                chart: 'gross_sales',
                label: 'Gross sales',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/revenue/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/revenue',
                        },
                    ],
                },
            },
            {
                stat: 'variations/items_sold',
                chart: 'items_sold',
                label: 'Variations Sold',
                _links: {
                    api: [
                        {
                            href: 'https://core-dokan.test/wp-json/wc-analytics/reports/variations/stats',
                        },
                    ],
                    report: [
                        {
                            href: '/analytics/variations',
                        },
                    ],
                },
            },
        ],
    }
);

class StorePerformance extends Component {
    renderMenu() {
        const {
            hiddenBlocks,
            isFirst,
            isLast,
            onMove,
            onRemove,
            onTitleBlur,
            onTitleChange,
            onToggleHiddenBlock,
            titleInput,
            controls: Controls,
        } = this.props;

        return (
            <EllipsisMenu
                label={ __(
                    'Choose which analytics to display and the section name',
                    'woocommerce'
                ) }
                renderContent={ ( { onToggle } ) => (
                    <Fragment>
                        <MenuTitle>
                            { __( 'Display stats:', 'dokan-lite' ) }
                        </MenuTitle>
                        { indicators.map( ( indicator, i ) => {
                            const checked = ! hiddenBlocks.includes(
                                indicator.stat
                            );
                            return (
                                <MenuItem
                                    checked={ checked }
                                    isCheckbox
                                    isClickable
                                    key={ i }
                                    onInvoke={ () => {
                                        onToggleHiddenBlock( indicator.stat )();
                                        recordEvent( 'dash_indicators_toggle', {
                                            status: checked ? 'off' : 'on',
                                            key: indicator.stat,
                                        } );
                                    } }
                                >
                                    { indicator.label }
                                </MenuItem>
                            );
                        } ) }
                        <Controls
                            onToggle={ onToggle }
                            onMove={ onMove }
                            onRemove={ onRemove }
                            isFirst={ isFirst }
                            isLast={ isLast }
                            onTitleBlur={ onTitleBlur }
                            onTitleChange={ onTitleChange }
                            titleInput={ titleInput }
                        />
                    </Fragment>
                ) }
            />
        );
    }

    renderList() {
        const {
            query,
            primaryRequesting,
            secondaryRequesting,
            primaryError,
            secondaryError,
            primaryData,
            secondaryData,
            userIndicators,
            defaultDateRange,
        } = this.props;
        if ( primaryRequesting || secondaryRequesting ) {
            return (
                <SummaryListPlaceholder
                    numberOfItems={ userIndicators.length }
                />
            );
        }

        if ( primaryError || secondaryError ) {
            return null;
        }

        const persistedQuery = getPersistedQuery( query );

        const { compare } = getDateParamsFromQuery( query, defaultDateRange );
        const prevLabel =
            compare === 'previous_period'
                ? __( 'Previous period:', 'dokan-lite' )
                : __( 'Previous year:', 'dokan-lite' );
        const { formatAmount, getCurrencyConfig } = this.context;
        const currency = getCurrencyConfig();
        return (
            <SummaryList>
                { () =>
                    userIndicators.map( ( indicator, i ) => {
                        const {
                            primaryValue,
                            secondaryValue,
                            delta,
                            reportUrl,
                            reportUrlType,
                        } = getIndicatorValues( {
                            indicator,
                            primaryData,
                            secondaryData,
                            currency,
                            formatAmount,
                            persistedQuery,
                        } );

                        return (
                            <SummaryNumber
                                key={ i }
                                href={ reportUrl }
                                hrefType={ reportUrlType }
                                label={ indicator.label }
                                value={ primaryValue }
                                prevLabel={ prevLabel }
                                prevValue={ secondaryValue }
                                delta={ delta }
                                onLinkClickCallback={ () => {
                                    recordEvent( 'dash_indicators_click', {
                                        key: indicator.stat,
                                    } );
                                } }
                            />
                        );
                    } )
                }
            </SummaryList>
        );
    }

    render() {
        const { userIndicators, title } = this.props;
        return (
            <Fragment>
                <SectionHeader
                    title={ title || __( 'Store Performance', 'dokan-lite' ) }
                    menu={ this.renderMenu() }
                />
                { userIndicators.length > 0 && (
                    <div className="woocommerce-dashboard__store-performance">
                        { this.renderList() }
                    </div>
                ) }
            </Fragment>
        );
    }
}

StorePerformance.contextType = CurrencyContext;

export default compose(
    withSelect( ( select, props ) => {
        const { hiddenBlocks, query, filters } = props;
        const userIndicators = indicators.filter(
            ( indicator ) => ! hiddenBlocks.includes( indicator.stat )
        );

        const data = {
            hiddenBlocks,
            userIndicators,
            indicators,
        };
        if ( userIndicators.length === 0 ) {
            return data;
        }
        const indicatorData = getIndicatorData(
            select,
            userIndicators,
            query,
            filters
        );

        return {
            ...data,
            ...indicatorData,
        };
    } )
)( StorePerformance );

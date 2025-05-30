/**
 * External dependencies
 */
import { __, _n } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { format as formatDate } from '@wordpress/date';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { get, memoize } from 'lodash';
import { Date, Link } from '@woocommerce/components';
import { formatValue } from '@woocommerce/number';
import {
    getReportTableQuery,
    REPORTS_STORE_NAME,
    SETTINGS_STORE_NAME,
    QUERY_DEFAULTS,
    OPTIONS_STORE_NAME,
} from '@woocommerce/data';
import {
    appendTimestamp,
    defaultTableDateFormat,
    getCurrentDates,
} from '@woocommerce/date';
import { stringify } from 'qs';
import { CurrencyContext } from '@woocommerce/currency';

/**
 * Internal dependencies
 */
import ReportTable from '../../components/report-table';
import { getAdminSetting } from './../../../utils/admin-settings';
import { dokanConfig } from '../../../dokan-config';

const EMPTY_ARRAY = [];

const summaryFields = [
    'orders_count',
    'gross_sales',
    'total_sales',
    'refunds',
    'coupons',
    'taxes',
    'shipping',
    'net_revenue',
];

class RevenueReportTable extends Component {
    constructor() {
        super();

        this.getHeadersContent = this.getHeadersContent.bind( this );
        this.getRowsContent = this.getRowsContent.bind( this );
        this.getSummary = this.getSummary.bind( this );
    }

    getHeadersContent() {
        return [
            {
                label: __( 'Date', 'dokan-lite' ),
                key: 'date',
                required: true,
                defaultSort: true,
                isLeftAligned: true,
                isSortable: true,
            },
            {
                label: __( 'Orders', 'dokan-lite' ),
                key: 'orders_count',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Gross sales', 'dokan-lite' ),
                key: 'gross_sales',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Returns', 'dokan-lite' ),
                key: 'refunds',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Coupons', 'dokan-lite' ),
                key: 'coupons',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Net sales', 'dokan-lite' ),
                key: 'net_revenue',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Taxes', 'dokan-lite' ),
                key: 'taxes',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Shipping', 'dokan-lite' ),
                key: 'shipping',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
            {
                label: __( 'Total sales', 'dokan-lite' ),
                key: 'total_sales',
                required: false,
                isSortable: true,
                isNumeric: true,
            },
        ];
    }

    getRowsContent( data = [] ) {
        const dateFormat = getAdminSetting(
            'dateFormat',
            defaultTableDateFormat
        );
        const {
            formatAmount,
            render: renderCurrency,
            formatDecimal: getCurrencyFormatDecimal,
            getCurrencyConfig,
        } = this.context;

        return data.map( ( row ) => {
            const {
                coupons,
                gross_sales: grossSales,
                total_sales: totalSales,
                net_revenue: netRevenue,
                orders_count: ordersCount,
                refunds,
                shipping,
                taxes,
            } = row.subtotals;

            // @todo How to create this per-report? Can use `w`, `year`, `m` to build time-specific order links
            // we need to know which kind of report this is, and parse the `label` to get this row's date
            const orderLink = (
                <Link
                    href={
                        dokanConfig.orderListPageUlr +
                        `?order_date_start=` +
                        formatDate( 'Y-m-d', row.date_start ) +
                        `&order_date_end=` +
                        formatDate( 'Y-m-d', row.date_start )
                    }
                    type="custom"
                >
                    { formatValue(
                        getCurrencyConfig(),
                        'number',
                        ordersCount
                    ) }
                </Link>
            );
            return [
                {
                    display: (
                        <Date
                            date={ row.date_start }
                            visibleFormat={ dateFormat }
                        />
                    ),
                    value: row.date_start,
                },
                {
                    display: orderLink,
                    value: Number( ordersCount ),
                },
                {
                    display: renderCurrency( grossSales ),
                    value: getCurrencyFormatDecimal( grossSales ),
                },
                {
                    display: formatAmount( refunds ),
                    value: getCurrencyFormatDecimal( refunds ),
                },
                {
                    display: formatAmount( coupons ),
                    value: getCurrencyFormatDecimal( coupons ),
                },
                {
                    display: renderCurrency( netRevenue ),
                    value: getCurrencyFormatDecimal( netRevenue ),
                },
                {
                    display: renderCurrency( taxes ),
                    value: getCurrencyFormatDecimal( taxes ),
                },
                {
                    display: renderCurrency( shipping ),
                    value: getCurrencyFormatDecimal( shipping ),
                },
                {
                    display: renderCurrency( totalSales ),
                    value: getCurrencyFormatDecimal( totalSales ),
                },
            ];
        } );
    }

    getSummary( totals, totalResults = 0 ) {
        const {
            orders_count: ordersCount = 0,
            gross_sales: grossSales = 0,
            total_sales: totalSales = 0,
            refunds = 0,
            coupons = 0,
            taxes = 0,
            shipping = 0,
            net_revenue: netRevenue = 0,
        } = totals;
        const { formatAmount, getCurrencyConfig } = this.context;
        const currency = getCurrencyConfig();
        return [
            {
                label: _n( 'day', 'days', totalResults, 'dokan-lite' ),
                value: formatValue( currency, 'number', totalResults ),
            },
            {
                label: _n( 'order', 'orders', ordersCount, 'dokan-lite' ),
                value: formatValue( currency, 'number', ordersCount ),
            },
            {
                label: __( 'Gross sales', 'dokan-lite' ),
                value: formatAmount( grossSales ),
            },
            {
                label: __( 'Returns', 'dokan-lite' ),
                value: formatAmount( refunds ),
            },
            {
                label: __( 'Coupons', 'dokan-lite' ),
                value: formatAmount( coupons ),
            },
            {
                label: __( 'Net sales', 'dokan-lite' ),
                value: formatAmount( netRevenue ),
            },
            {
                label: __( 'Taxes', 'dokan-lite' ),
                value: formatAmount( taxes ),
            },
            {
                label: __( 'Shipping', 'dokan-lite' ),
                value: formatAmount( shipping ),
            },
            {
                label: __( 'Total sales', 'dokan-lite' ),
                value: formatAmount( totalSales ),
            },
        ];
    }

    render() {
        const { advancedFilters, filters, tableData, query } = this.props;

        return (
            <ReportTable
                endpoint="revenue"
                getHeadersContent={ this.getHeadersContent }
                getRowsContent={ this.getRowsContent }
                getSummary={ this.getSummary }
                summaryFields={ summaryFields }
                query={ query }
                tableData={ tableData }
                title={ __( 'Revenue', 'dokan-lite' ) }
                columnPrefsKey="revenue_report_columns"
                filters={ filters }
                advancedFilters={ advancedFilters }
            />
        );
    }
}

RevenueReportTable.contextType = CurrencyContext;

/**
 * Memoized props object formatting function.
 *
 * @param {boolean} isError
 * @param {boolean} isRequesting
 * @param {Object}  tableQuery
 * @param {Object}  revenueData
 * @return {Object} formatted tableData prop
 */
const formatProps = memoize(
    ( isError, isRequesting, tableQuery, revenueData, dateType ) => ( {
        tableData: {
            items: {
                data: get( revenueData, [ 'data', 'intervals' ], EMPTY_ARRAY ),
                totalResults: get( revenueData, [ 'totalResults' ], 0 ),
            },
            isError,
            isRequesting,
            query: tableQuery,
        },
        dateType,
    } ),
    ( isError, isRequesting, tableQuery, revenueData, dateType ) =>
        [
            isError,
            isRequesting,
            stringify( tableQuery ),
            get( revenueData, [ 'totalResults' ], 0 ),
            get( revenueData, [ 'data', 'intervals' ], EMPTY_ARRAY ).length,
            dateType,
        ].join( ':' )
);

/**
 * Memoized table query formatting function.
 *
 * @param {string} order
 * @param {string} orderBy
 * @param {number} page
 * @param {number} pageSize
 * @param {Object} datesFromQuery
 * @return {Object} formatted tableQuery object
 */
const formatTableQuery = memoize(
    // @todo Support hour here when viewing a single day
    ( order, orderBy, page, pageSize, datesFromQuery ) => ( {
        interval: 'day',
        orderby: orderBy,
        order,
        page,
        per_page: pageSize,
        after: appendTimestamp( datesFromQuery.primary.after, 'start' ),
        before: appendTimestamp( datesFromQuery.primary.before, 'end' ),
    } ),
    ( order, orderBy, page, pageSize, datesFromQuery ) =>
        [
            order,
            orderBy,
            page,
            pageSize,
            datesFromQuery.primary.after,
            datesFromQuery.primary.before,
        ].join( ':' )
);

export default compose(
    withSelect( ( select, props ) => {
        const { query, filters, advancedFilters } = props;
        const { woocommerce_default_date_range: defaultDateRange } = select(
            SETTINGS_STORE_NAME
        ).getSetting( 'wc_admin', 'wcAdminSettings' );
        const { getOption } = select( OPTIONS_STORE_NAME );
        const dateType = getOption( 'woocommerce_date_type' ) || 'date_paid';
        const datesFromQuery = getCurrentDates( query, defaultDateRange );
        const { getReportStats, getReportStatsError, isResolving } =
            select( REPORTS_STORE_NAME );

        const tableQuery = formatTableQuery(
            query.order || 'desc',
            query.orderby || 'date',
            query.paged || 1,
            query.per_page || QUERY_DEFAULTS.pageSize,
            datesFromQuery
        );
        const filteredTableQuery = getReportTableQuery( {
            endpoint: 'revenue',
            query,
            select,
            tableQuery,
            filters,
            advancedFilters,
        } );
        const revenueData = getReportStats( 'revenue', filteredTableQuery );
        const isError = Boolean(
            getReportStatsError( 'revenue', filteredTableQuery )
        );
        const isRequesting = isResolving( 'getReportStats', [
            'revenue',
            filteredTableQuery,
        ] );

        return formatProps(
            isError,
            isRequesting,
            tableQuery,
            revenueData,
            dateType
        );
    } )
)( RevenueReportTable );

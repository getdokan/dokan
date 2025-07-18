import * as d3 from 'd3';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { useDashboardApiData } from '../../hooks/useDashboardApiData';
import { fetchSalesChart, formatDateForApi } from '../../utils/api';
import {
    SalesChartData,
    SalesChartDataPoint,
    MonthPickerValue,
} from '../../types';
import MonthPicker from '../../Elements/MonthPicker';
import Section from '../../Elements/Section';
import SalesChartSkeleton from './Skeleton';

// Chart configuration constants
const CHART_CONFIG = {
    width: 1500,
    height: 500,
    margins: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 60,
    },
    colors: {
        total_sales: '#7047EB',
        net_sales: '#4CA772',
        commissions: '#4EB9FA',
    },
    animation: {
        tooltipShow: 200,
        tooltipHide: 500,
    },
};

const metrics = [
    {
        key: 'total_sales',
        label: 'Total Sales',
        color: CHART_CONFIG.colors.total_sales,
    },
    {
        key: 'net_sales',
        label: 'Net Sales',
        color: CHART_CONFIG.colors.net_sales,
    },
    {
        key: 'commissions',
        label: 'Commissions',
        color: CHART_CONFIG.colors.commissions,
    },
];

// D3 Chart Component
const D3Chart = ( { data }: { data: SalesChartDataPoint[] } ) => {
    const svgRef = useRef< SVGSVGElement >( null );

    useEffect( () => {
        if ( ! data || data.length === 0 || ! svgRef.current ) {
            return;
        }

        // Clear previous chart
        d3.select( svgRef.current ).selectAll( '*' ).remove();

        // Chart dimensions
        const { width, height, margins } = CHART_CONFIG;

        // Parse dates and prepare data for all metrics
        const parseDate = d3.timeParse( '%Y-%m-%d' );

        const chartData = data
            .map( ( d ) => ( {
                date: parseDate( d.date ),
                total_sales: d.total_sales || 0,
                net_sales: d.net_sales || 0,
                commissions: d.commissions || 0,
                originalData: d,
            } ) )
            .filter( ( d ) => d.date !== null );

        if ( chartData.length === 0 ) {
            return;
        }

        // Create scales
        const x = d3
            .scaleTime()
            .domain( d3.extent( chartData, ( d ) => d.date ) as [ Date, Date ] )
            .range( [ margins.left, width - margins.right ] );

        // Find max value across all metrics
        const maxValue =
            d3.max( chartData, ( d ) =>
                Math.max( d.total_sales, d.net_sales, d.commissions )
            ) || 0;
        const y = d3
            .scaleLinear()
            .domain( [ 0, maxValue ] )
            .nice()
            .range( [ height - margins.bottom, margins.top ] );

        // Create SVG
        const svg = d3
            .select( svgRef.current )
            .attr( 'width', '100%' )
            .attr( 'height', height )
            .attr( 'viewBox', [ 0, 0, width, height ] )
            .attr(
                'style',
                'max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;'
            );

        // Add horizontal axis
        svg.append( 'g' )
            .attr( 'transform', `translate(0,${ height - margins.bottom })` )
            .call(
                d3
                    .axisBottom( x )
                    .ticks( width / 80 )
                    .tickSizeOuter( 0 )
            );

        // Add vertical axis
        svg.append( 'g' )
            .attr( 'transform', `translate(${ margins.left },0)` )
            .call( d3.axisLeft( y ) )
            .call( ( g ) => g.select( '.domain' ).remove() )
            .call( ( g ) =>
                g
                    .selectAll( '.tick line' )
                    .clone()
                    .attr( 'x2', width - margins.left - margins.right )
                    .attr( 'stroke-opacity', 0.1 )
            )
            .call( ( g ) =>
                g
                    .append( 'text' )
                    .attr( 'x', -margins.left )
                    .attr( 'y', 10 )
                    .attr( 'fill', 'currentColor' )
                    .attr( 'text-anchor', 'start' )
            );

        // Create line generator
        const line = d3
            .line< any >()
            .x( ( d ) => x( d.date ) )
            .y( ( d ) => y( d.value ) )
            .curve( d3.curveMonotoneX );

        // Draw lines for each metric
        metrics.forEach( ( metric ) => {
            const metricData = chartData.map( ( d ) => ( {
                date: d.date,
                value: d[ metric.key as keyof typeof d ] as number,
                originalData: d,
            } ) );

            // Draw the line
            svg.append( 'path' )
                .datum( metricData )
                .attr( 'fill', 'none' )
                .attr( 'stroke', metric.color )
                .attr( 'stroke-width', 2 )
                .attr( 'stroke-linejoin', 'round' )
                .attr( 'stroke-linecap', 'round' )
                .attr( 'd', line );

            // Add dots for data points
            svg.selectAll( `.dot-${ metric.key }` )
                .data( metricData )
                .enter()
                .append( 'circle' )
                .attr( 'class', `dot dot-${ metric.key }` )
                .attr( 'cx', ( d ) => x( d.date ) )
                .attr( 'cy', ( d ) => y( d.value ) )
                .attr( 'r', 3 )
                .attr( 'fill', metric.color );
        } );

        // Add tooltip functionality
        const tooltip = d3
            .select( 'body' )
            .append( 'div' )
            .attr( 'class', 'tooltip' )
            .style( 'position', 'absolute' )
            .style( 'padding', '10px' )
            .style( 'background', 'rgba(0, 0, 0, 0.8)' )
            .style( 'color', 'white' )
            .style( 'border-radius', '5px' )
            .style( 'pointer-events', 'none' )
            .style( 'opacity', 0 );

        // Add invisible overlay for mouse events
        svg.append( 'rect' )
            .attr( 'width', width )
            .attr( 'height', height )
            .attr( 'fill', 'none' )
            .attr( 'pointer-events', 'all' )
            .on( 'mousemove', function ( event ) {
                const [ mouseX ] = d3.pointer( event );
                const date = x.invert( mouseX );

                // Find closest data point
                const bisect = d3.bisector( ( d: any ) => d.date ).left;
                const index = bisect( chartData, date, 1 );
                const a = chartData[ index - 1 ];
                const b = chartData[ index ];
                const d =
                    b &&
                    date.getTime() - a.date.getTime() >
                        b.date.getTime() - date.getTime()
                        ? b
                        : a;

                if ( d ) {
                    // Highlight all points for this date
                    svg.selectAll( '.dot' ).attr( 'r', 3 );

                    metrics.forEach( ( metric ) => {
                        svg.selectAll( `.dot-${ metric.key }` )
                            .filter(
                                ( dot: any ) =>
                                    dot.date.getTime() === d.date.getTime()
                            )
                            .attr( 'r', 5 );
                    } );

                    // Show tooltip with all metrics
                    tooltip
                        .transition()
                        .duration( CHART_CONFIG.animation.tooltipShow )
                        .style( 'opacity', 0.9 );

                    const formatValue = ( val: number ) =>
                        `$${ val.toFixed( 2 ) }`;

                    tooltip
                        .html(
                            `
                            <strong>${ __(
                                'Date:',
                                'dokan-lite'
                            ) }</strong> ${ d3.timeFormat( '%Y-%m-%d' )(
                                d.date
                            ) }<br/>
                            <strong>${ __(
                                'Total Sales:',
                                'dokan-lite'
                            ) }</strong> ${ formatValue( d.total_sales ) }<br/>
                            <strong>${ __(
                                'Net Sales:',
                                'dokan-lite'
                            ) }</strong> ${ formatValue( d.net_sales ) }<br/>
                            <strong>${ __(
                                'Commissions:',
                                'dokan-lite'
                            ) }</strong> ${ formatValue( d.commissions ) }
                        `
                        )
                        .style( 'left', event.pageX + 10 + 'px' )
                        .style( 'top', event.pageY - 28 + 'px' );
                }
            } )
            .on( 'mouseout', function () {
                svg.selectAll( '.dot' ).attr( 'r', 3 );

                tooltip
                    .transition()
                    .duration( CHART_CONFIG.animation.tooltipHide )
                    .style( 'opacity', 0 );
            } );

        // Cleanup function
        return () => {
            tooltip.remove();
        };
    }, [ data ] );

    return <svg ref={ svgRef }></svg>;
};

const SalesChartSection = () => {
    const [ selectedMonth, setSelectedMonth ] = useState< MonthPickerValue >( {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    } );

    const {
        data: salesData,
        loading: salesLoading,
        error: salesError,
        refetch,
    } = useDashboardApiData< SalesChartData >( {
        fetchFunction: fetchSalesChart,
        dependencies: [ selectedMonth ],
        initialParams: formatDateForApi(
            selectedMonth.month,
            selectedMonth.year
        ),
    } );

    const handleMonthChange = ( value: { month: number; year: number } ) => {
        setSelectedMonth( value );
        const dateParam = formatDateForApi( value.month, value.year );
        refetch( dateParam );
    };

    if ( salesLoading ) {
        return <SalesChartSkeleton />;
    }

    // Only use current month data
    const currentMonthData = salesData?.intervals || [];

    return (
        <Section title={ __( 'Daily Sales Chart', 'dokan-lite' ) }>
            <div className="woocommerce-dashboard__dashboard-charts">
                <div className="woocommerce-dashboard__chart-block-wrapper">
                    <Card className="woocommerce-dashboard__chart-block">
                        <CardHeader>
                            <div className="flex justify-between items-center w-full">
                                <div className={ `sales-chart-monthly-picker` }>
                                    <MonthPicker
                                        value={ {
                                            month: selectedMonth.month.toString(),
                                            year: selectedMonth.year.toString(),
                                        } }
                                        onChange={ handleMonthChange }
                                        placeholder={ __(
                                            'Select Month',
                                            'dokan-lite'
                                        ) }
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    { metrics.map( ( metric ) => (
                                        <div
                                            key={ metric.key }
                                            className="flex items-center gap-2"
                                        >
                                            <div
                                                className="w-4 h-4 rounded-sm"
                                                style={ {
                                                    backgroundColor:
                                                        metric.color,
                                                } }
                                            ></div>
                                            <span
                                                className="text-sm font-medium"
                                                style={ {
                                                    color: metric.color,
                                                } }
                                            >
                                                { metric.label }
                                            </span>
                                        </div>
                                    ) ) }
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody size={ null }>
                            { salesError && (
                                <div className="p-5 text-red-600 bg-red-50 rounded">
                                    { __(
                                        'Error loading chart data:',
                                        'dokan-lite'
                                    ) +
                                        ' ' +
                                        salesError }
                                </div>
                            ) }

                            { ! salesError && (
                                <div className="w-full overflow-x-auto">
                                    <D3Chart data={ currentMonthData } />
                                </div>
                            ) }
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Section>
    );
};

export default SalesChartSection;

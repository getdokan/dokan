import * as d3 from 'd3';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useRef } from '@wordpress/element';
import { formatPrice } from '../utilities';
import { applyFilters } from '@wordpress/hooks';

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

export interface D3ChartDataPoint {
    date: string;
    total_sales?: number;
    net_sales?: number;
    commissions?: number;
    [ key: string ]: any;
}

export interface D3ChartMetric {
    key: string;
    label: string;
    color: string;
}

export interface D3ChartProps {
    data: D3ChartDataPoint[];
    metrics?: D3ChartMetric[];
    config?: Partial< typeof CHART_CONFIG >;
}

interface ParsedChartDataPoint {
    date: Date;
    originalData: D3ChartDataPoint;
    [ key: string ]: number | Date | D3ChartDataPoint;
}

const defaultMetrics: D3ChartMetric[] = [
    {
        key: 'total_sales',
        label: __( 'Total Sales', 'dokan-lite' ),
        color: CHART_CONFIG.colors.total_sales,
    },
    {
        key: 'net_sales',
        label: __( 'Net Sales', 'dokan-lite' ),
        color: CHART_CONFIG.colors.net_sales,
    },
    {
        key: 'commissions',
        label: __( 'Commissions', 'dokan-lite' ),
        color: CHART_CONFIG.colors.commissions,
    },
];

const D3Chart = ( {
    data,
    metrics = defaultMetrics,
    config = {},
}: D3ChartProps ) => {
    const svgRef = useRef< SVGSVGElement >( null );
    const tooltipRef = useRef< d3.Selection<
        HTMLDivElement,
        unknown,
        HTMLElement,
        any
    > | null >( null );
    const chartConfig = useMemo(
        () => ( { ...CHART_CONFIG, ...config } ),
        [ config ]
    );

    useEffect( () => {
        if ( ! data || data.length === 0 || ! svgRef.current ) {
            return;
        }

        // Clear previous chart
        d3.select( svgRef.current ).selectAll( '*' ).remove();

        // Chart dimensions
        const { width, height, margins } = chartConfig;

        // Parse dates and prepare data for all metrics
        const parseDate = d3.timeParse( '%Y-%m-%d' );

        const chartData: ParsedChartDataPoint[] = data
            .map( ( d ) => {
                const parsed: Record< string, number | Date | null | D3ChartDataPoint > = {
                    date: parseDate( d.date ),
                    originalData: d,
                };
                metrics.forEach( ( metric ) => {
                    parsed[ metric.key ] = d[ metric.key ] || 0;
                } );
                return parsed as unknown as ParsedChartDataPoint;
            } )
            .filter( ( d ): d is ParsedChartDataPoint => d.date !== null );

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
                Math.max( ...metrics.map( ( m ) => d[ m.key ] || 0 ) )
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
                value: d[ metric.key ] as number,
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

        // Add tooltip functionality — reuse a single DOM node across renders
        if ( ! tooltipRef.current ) {
            tooltipRef.current = d3
                .select( 'body' )
                .append( 'div' )
                .attr( 'class', 'dokan-d3-chart-tooltip' )
                .style( 'position', 'absolute' )
                .style( 'background', 'rgba(0, 0, 0, 0.8)' )
                .style( 'color', 'white' )
                .style( 'border-radius', '5px' )
                .style( 'pointer-events', 'none' )
                .style( 'opacity', 0 );
        }

        const tooltip = tooltipRef.current;

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
                        .duration( chartConfig.animation.tooltipShow )
                        .style( 'padding', '10px' )
                        .style( 'opacity', 0.9 );

                    const formatValue = ( val: number ) => formatPrice( val );

                    let tooltipContent = `<strong>${ __(
                        'Date:',
                        'dokan-lite'
                    ) }</strong> ${ d3.timeFormat( '%Y-%m-%d' )(
                        d.date
                    ) }<br/>`;

                    metrics.forEach( ( metric ) => {
                        tooltipContent += `<strong>${
                            metric.label
                        }:</strong> ${ applyFilters(
                            `dokan_admin_chart_tooltip_${ metric.key }_data`,
                            formatValue( d[ metric.key ] ),
                            d,
                            metric.key
                        ) }<br/>`;
                    } );

                    tooltip
                        .html( tooltipContent )
                        .style( 'left', event.pageX + 10 + 'px' )
                        .style( 'top', event.pageY - 28 + 'px' );
                }
            } )
            .on( 'mouseout', function () {
                svg.selectAll( '.dot' ).attr( 'r', 3 );

                tooltip
                    .transition()
                    .duration( chartConfig.animation.tooltipHide )
                    .style( 'opacity', 0 );
            } );

        // Cleanup function — remove tooltip when component unmounts
        return () => {
            if ( tooltipRef.current ) {
                tooltipRef.current.remove();
                tooltipRef.current = null;
            }
        };
    }, [ data, metrics, chartConfig ] );

    return <svg ref={ svgRef }></svg>;
};

export {
    CHART_CONFIG as D3ChartConfig,
    defaultMetrics as D3ChartDefaultMetrics,
};
export default D3Chart;

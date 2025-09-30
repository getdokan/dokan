import { Card, CardHeader, CardBody } from '@wordpress/components';
import Section from '../../Elements/Section';
import { __ } from '@wordpress/i18n';

const SalesChartSkeleton = () => {
    return (
        <Section title={ __( 'Daily Sales Chart', 'dokan-lite' ) }>
            <div className="woocommerce-dashboard__dashboard-charts">
                <div className="woocommerce-dashboard__chart-block-wrapper">
                    <Card className="woocommerce-dashboard__chart-block shadow rounded animate-pulse">
                        <CardHeader>
                            <div
                                style={ {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                } }
                            >
                                <div
                                    style={ {
                                        height: '20px',
                                        width: '150px',
                                        backgroundColor: '#f0f0f0',
                                    } }
                                />
                                <div style={ { display: 'flex', gap: '20px' } }>
                                    <div className={`flex space-x-4 animate-pulse`}>
                                        { [
                                            { color: 'bg-[#7047EB]', label: __( 'Total Sales', 'dokan-lite' ) },
                                            { color: 'bg-[#4CA772]', label: __( 'Net Sales', 'dokan-lite' ) },
                                            { color: 'bg-[#4EB9FA]', label: __( 'Commissions', 'dokan-lite' ) }
                                        ].map( ( item, i ) => (
                                            <div key={i} className="flex items-center space-x-2 group">
                                                <div className={`w-3 h-3 ${ item.color } rounded transition-transform duration-300 group-hover:scale-125`}></div>
                                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{ item.label }</span>
                                            </div>
                                        ) ) }
                                    </div>
                                    <div
                                        style={ {
                                            height: '32px',
                                            width: '150px',
                                            backgroundColor: '#f0f0f0',
                                        } }
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className={ `rounded p-6` } size={ null }>
                            <div className="relative h-[500px] w-full border-gray-200">
                                <div className="animate-pulse h-full">
                                    { /* Y-axis skeleton */ }
                                    <div className="absolute left-0 top-0 h-full w-12 flex flex-col justify-between py-4">
                                        { [ 0, 1, 2, 3, 4 ].map( ( i ) => (
                                            <div key={ i } className="h-3 bg-gray-200 rounded w-6"></div>
                                        ) ) }
                                    </div>

                                    {/* X-axis skeleton */}
                                    <div className="absolute bottom-0 left-12 right-4 h-8 flex justify-between items-end">
                                        { [ 0, 1, 2, 3, 4, 5 ].map( ( i ) => (
                                            <div key={ i } className="h-3 bg-gray-200 rounded w-6"></div>
                                        ) ) }
                                    </div>

                                    {/* Chart Elements */}
                                    <div className={ `absolute inset-0 w-full flex items-center justify-between px-8 z-10` }>
                                        { [ 0, 1, 2, 3, 4, 5, 6 ].map( ( ( _, i ) => (
                                            <div
                                                key={ i }
                                                className="w-2 h-2 bg-purple-700 rounded-full transition-all duration-300"
                                            ></div>
                                        ) ) ) }
                                    </div>

                                    {/* Chart area skeleton */}
                                    <div className={`h-full relative`}>
                                        {/* Grid skeleton */}
                                        <div className="absolute inset-0">
                                            { [ 0, 1, 2, 3, 4, 5 ].map( ( i ) => (
                                                <div
                                                    key={`h-${ i }`}
                                                    className="absolute w-full h-px bg-gray-200"
                                                    style={ { top: `${ i * 25 }%` } }
                                                ></div>
                                            ) ) }
                                            { [ 0, 1, 2, 3, 4, 5, 6 ].map( ( i ) => (
                                                <div
                                                    key={`v-${ i }`}
                                                    className="absolute h-full w-px bg-gray-200"
                                                    style={ { left: `${ i * 20 }%` } }
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Section>
    );
};

export default SalesChartSkeleton;

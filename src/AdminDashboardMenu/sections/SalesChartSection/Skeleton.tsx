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
                                <div style={ { display: 'flex', gap: '12px' } }>
                                    <div
                                        style={ {
                                            height: '32px',
                                            width: '120px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '4px',
                                        } }
                                    />
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
                        <CardBody className={ `rounded p-4` } size={ null }>
                            <div className="h-96 w-full border-gray-200 relative">
                                { /* Skeleton grid lines */ }
                                <div className="absolute inset-0 p-6">
                                    { /* Horizontal grid lines */ }
                                    <div className="h-full flex flex-col justify-between">
                                        { [ ...Array( 6 ) ].map( ( _, i ) => (
                                            <div
                                                key={ i }
                                                className="w-full h-px bg-gray-200"
                                            ></div>
                                        ) ) }
                                    </div>

                                    { /* Vertical grid lines */ }
                                    <div className="absolute inset-0 p-6 flex justify-between">
                                        { [ ...Array( 10 ) ].map( ( _, i ) => (
                                            <div
                                                key={ i }
                                                className="w-px h-full bg-gray-200"
                                            ></div>
                                        ) ) }
                                    </div>
                                </div>

                                { /* Skeleton axis labels */ }
                                <div className="absolute bottom-2 left-6 right-6 flex justify-between">
                                    { [ ...Array( 8 ) ].map( ( _, i ) => (
                                        <div
                                            key={ i }
                                            className="w-8 h-3 bg-gray-200 animate-pulse"
                                        ></div>
                                    ) ) }
                                </div>

                                { /* Y-axis labels */ }
                                <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between">
                                    { [ ...Array( 6 ) ].map( ( _, i ) => (
                                        <div
                                            key={ i }
                                            className="w-6 h-3 bg-gray-200 rounded animate-pulse"
                                        ></div>
                                    ) ) }
                                </div>

                                { /* Skeleton curve path */ }
                                { /*{ [ ...Array( 2 ) ].map( ( _, i ) => (*/ }
                                <div className="absolute inset-0 p-6">
                                    <svg
                                        className="w-full h-full"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M 0 80 Q 20 80 40 60 Q 60 20 80 10 Q 90 20 100 80"
                                            stroke="#8b5cf6"
                                            strokeWidth="1"
                                            fill="none"
                                            className="animate-pulse"
                                            vectorEffect="non-scaling-stroke"
                                            opacity="0.4"
                                        />
                                        <path
                                            d="M 0 75 Q 20 75 40 55 Q 60 15 80 5 Q 90 15 100 75"
                                            stroke="#10b981"
                                            strokeWidth="1"
                                            fill="none"
                                            className="animate-pulse"
                                            vectorEffect="non-scaling-stroke"
                                            style={ { animationDelay: '0.2s' } }
                                            opacity="0.4"
                                        />
                                        <path
                                            d="M 0 85 Q 20 85 40 65 Q 60 25 80 15 Q 90 25 100 85"
                                            stroke="#60a5fa"
                                            strokeWidth="1"
                                            fill="none"
                                            className="animate-pulse"
                                            vectorEffect="non-scaling-stroke"
                                            style={ { animationDelay: '0.4s' } }
                                            opacity="0.4"
                                        />
                                    </svg>
                                </div>
                                { /*) ) }*/ }
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Section>
    );
};

export default SalesChartSkeleton;

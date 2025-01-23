import './tailwind.scss';
import { __, sprintf } from '@wordpress/i18n';
import { Fill } from '@wordpress/components';
import { useParams } from 'react-router-dom';
import { Card } from '@getdokan/dokan-ui';
import OrderLineItems from './components/OrderLineItems';
import GeneralDetails from './components/GeneralDetails';
import { useSelect } from '@wordpress/data';
import orderStore from './store';

export const BackButton = () => (
    <Fill name="dokan-header-actions">
        {
            // @ts-ignore
            ( { navigate } ) => (
                <button
                    type="button"
                    className="dokan-btn dokan-btn-default"
                    onClick={ () => navigate( '/orders' ) }
                >
                    { __( 'Back to List', 'dokan' ) }
                </button>
            )
        }
    </Fill>
);

const OrderDetails = () => {
    const { id } = useParams();

    const order = useSelect(
        ( select ) => {
            if ( ! id ) {
                return {};
            }
            return select( orderStore ).getOrderDetails( id );
        },
        [ id ]
    );

    const errorMessage = useSelect( ( select ) => {
        return select( orderStore ).getError();
    }, [] );

    const isLoading = useSelect( ( select ) => {
        return select( orderStore ).isLoading();
    }, [] );

    if ( errorMessage && ! order.id ) {
        return (
            <div className="dokan-alert dokan-alert-danger font-bold">
                { errorMessage }
            </div>
        );
    }

    if ( isLoading ) {
        return (
            <div>
                <p>{ __( 'Please wait…', 'dokan-lite' ) }</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-8">
                <Card.Header>
                    <Card.Title>
                        { sprintf(
                            // eslint-disable-next-line @wordpress/i18n-translator-comments
                            __( 'Order #%s → Order Items', 'dokan-lite' ),
                            id
                        ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <OrderLineItems order={ order } />
                </Card.Body>
            </Card>
            <Card className="md:col-span-4">
                <Card.Header>
                    <Card.Title>
                        { __( 'General Details', 'dokan-lite' ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <GeneralDetails />
                </Card.Body>
            </Card>
        </div>
    );
};

export default OrderDetails;

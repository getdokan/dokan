import { createContext, useContext } from '@wordpress/element';
import type { DetailsOrder } from './types';

export interface OrderDetailsContextValue {
    order: DetailsOrder | null;
    orderId: number;
    sections: Record< string, boolean >;
    isLoading: boolean;
    refetch: () => void;
    navigate: ( path: string ) => void;
}

const OrderDetailsContext = createContext< OrderDetailsContextValue >( {
    order: null,
    orderId: 0,
    sections: {},
    isLoading: false,
    refetch: () => {},
    navigate: () => {},
} );

export const OrderDetailsProvider = OrderDetailsContext.Provider;

export const useOrderDetailsContext = () => useContext( OrderDetailsContext );

export default OrderDetailsContext;

import { __ } from '@wordpress/i18n';
import { DokanBadge, DokanModal } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import type { ProductItem } from './types';

const getStatusBadgeVariant = ( status: string ) => {
    switch ( status ) {
        case 'publish':
            return 'success';
        case 'draft':
            return 'secondary';
        case 'pending':
            return 'warning';
        case 'future':
            return 'info';
        default:
            return 'info';
    }
};

const getStatusLabel = ( status: string ) => {
    switch ( status ) {
        case 'publish':
            return __( 'Published', 'dokan-lite' );
        case 'draft':
            return __( 'Draft', 'dokan-lite' );
        case 'pending':
            return __( 'Pending Review', 'dokan-lite' );
        case 'future':
            return __( 'Scheduled', 'dokan-lite' );
        default:
            return status;
    }
};

const getProductTypeLabel = ( item: ProductItem ) => {
    if ( item.type === 'grouped' ) return __( 'Grouped', 'dokan-lite' );
    if ( item.type === 'external' )
        return __( 'External/Affiliate', 'dokan-lite' );
    if ( item.type === 'variable' ) return __( 'Variable', 'dokan-lite' );
    return __( 'Simple', 'dokan-lite' );
};

export const QuickViewModal = ( {
    product,
    onClose,
}: {
    product: ProductItem | null;
    onClose: () => void;
} ) => {
    if ( ! product ) return null;

    const stockDisplay = () => {
        if ( product.manage_stock && product.stock_quantity !== null ) {
            return product.stock_quantity;
        }
        return product.in_stock
            ? __( 'In stock', 'dokan-lite' )
            : __( 'Out of stock', 'dokan-lite' );
    };

    return (
        <DokanModal
            isOpen={ true }
            namespace="product-quick-view"
            className="!w-[350px] sm:!w-[500px]"
            onClose={ onClose }
            onConfirm={ onClose }
            confirmButtonText={ __( 'Close', 'dokan-lite' ) }
            confirmButtonVariant="primary"
            hideCancelButton={ true }
            dialogHeader={
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        { product.images?.[ 0 ]?.src ? (
                            <img
                                src={ product.images[ 0 ].src }
                                alt={ product.images[ 0 ].alt || product.name }
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100" />
                        ) }
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                        <h2 className="text-lg font-semibold text-dokan-link truncate">
                            { product.name }
                        </h2>
                        <p className="text-sm text-gray-500">
                            { __( 'SKU:', 'dokan-lite' ) }{ ' ' }
                            { product.sku || __( 'N/A', 'dokan-lite' ) }
                        </p>
                    </div>
                </div>
            }
            dialogContent={
                <div>
                    <p className="font-semibold text-gray-900 mb-3">
                        { __( 'Product info:', 'dokan-lite' ) }
                    </p>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Type', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { getProductTypeLabel( product ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Stock', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { stockDisplay() }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Status', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right">
                                    <DokanBadge
                                        variant={ getStatusBadgeVariant(
                                            product.status
                                        ) }
                                        label={ getStatusLabel(
                                            product.status
                                        ) }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Price', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.price ? (
                                        <PriceHtml price={ product.price } />
                                    ) : (
                                        '—'
                                    ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Earning', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.earning !== null &&
                                    product.earning !== undefined ? (
                                        <PriceHtml
                                            price={ String( product.earning ) }
                                        />
                                    ) : (
                                        '—'
                                    ) }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Date created', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    <DateTimeHtml.Date
                                        date={ product.date_created }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Last Modified', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    <DateTimeHtml.Date
                                        date={ product.date_modified }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 text-gray-500">
                                    { __( 'Views', 'dokan-lite' ) }
                                </td>
                                <td className="py-2 text-right text-gray-900">
                                    { product.page_view ?? 0 }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            }
        />
    );
};

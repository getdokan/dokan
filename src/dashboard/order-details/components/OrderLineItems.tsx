import { decodeEntities } from '@wordpress/html-entities';

const OrderLineItems = ( { order } ) => {
    return (
        <div>
            { /*    Order line item table*/ }
            <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block align-middle">
                        <div className="overflow-hidden">
                            <table className="dataviews-view-table min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            colSpan={ 2 }
                                            className="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                                        >
                                            Item
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                                        >
                                            Qty
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                                        >
                                            Cost
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-2 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                                        >
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { order.line_items?.map( ( item ) => (
                                        <tr
                                            key={ item.id }
                                            className="odd:bg-white even:bg-gray-100 dark:odd:bg-neutral-900 dark:even:bg-neutral-800"
                                        >
                                            <td
                                                style={ { width: '10%' } }
                                                className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200"
                                            >
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        className="h-12 w-12 rounded-md"
                                                        src={ item.image }
                                                        alt={ item.name }
                                                    />
                                                </div>
                                            </td>
                                            <td
                                                style={ { width: '65%' } }
                                                className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200"
                                            >
                                                <a
                                                    href={ item.permalink }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    { item.name }
                                                </a>
                                                { item.sku ? (
                                                    <p>
                                                        <small>
                                                            { item.sku }
                                                        </small>
                                                    </p>
                                                ) : (
                                                    ''
                                                ) }
                                            </td>
                                            <td
                                                style={ { width: '1%' } }
                                                className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200"
                                            >
                                                { item.quantity }
                                            </td>
                                            <td
                                                style={ { width: '1%' } }
                                                className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200"
                                            >
                                                { item.price }
                                            </td>
                                            <td
                                                style={ { width: '1%' } }
                                                className="px-4 py-2 whitespace-nowrap text-end text-sm font-medium"
                                            >
                                                { item.total }
                                                { decodeEntities(
                                                    order.currency_symbol
                                                ) }
                                            </td>
                                        </tr>
                                    ) ) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderLineItems;

import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { DokanBadge } from '@dokan/components';

// "Ordered on CJ" or "Order on CJ" under the order number in the vendor order list.
addFilter(
    'dokan_order_list_table_fields',
    'dokan-lite/cj-dropshipping',
    ( fields: any[] ) =>
        fields.map( ( field ) => {
            if ( 'order' !== field.id || typeof field.render !== 'function' ) {
                return field;
            }

            return {
                ...field,
                render: ( props: {
                    item: { dokan_cj?: { ordered: boolean } };
                } ) => {
                    const flags = props.item?.dokan_cj;

                    return (
                        <div className="flex flex-col gap-1">
                            { field.render( props ) }
                            { flags && (
                                <span data-testid="cj-order-badge">
                                    <DokanBadge
                                        variant={
                                            flags.ordered
                                                ? 'success'
                                                : 'warning'
                                        }
                                        label={
                                            flags.ordered
                                                ? __(
                                                      'Ordered on CJ',
                                                      'dokan-lite'
                                                  )
                                                : __(
                                                      'Order on CJ',
                                                      'dokan-lite'
                                                  )
                                        }
                                    />
                                </span>
                            ) }
                        </div>
                    );
                },
            };
        } )
);

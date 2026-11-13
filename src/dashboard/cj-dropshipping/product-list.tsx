import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { DokanBadge } from '@dokan/components';

type CJFlags = { removed?: boolean; off_sale_reason?: string };

// Mark CJ products CJ stopped selling, or that sync took off sale, in the vendor product list.
addFilter(
    'dokan_product_list_table_fields',
    'dokan-lite/cj-dropshipping',
    ( fields: any[] ) =>
        fields.map( ( field ) => {
            if ( 'name' !== field.id || typeof field.render !== 'function' ) {
                return field;
            }

            return {
                ...field,
                render: ( props: { item: { dokan_cj?: CJFlags } } ) => {
                    const flags = props.item?.dokan_cj;

                    return (
                        <div className="flex flex-col gap-1">
                            { field.render( props ) }
                            { flags?.removed && (
                                <span data-testid="cj-removed-badge">
                                    <DokanBadge
                                        variant="danger"
                                        label={ __(
                                            'Removed by CJ',
                                            'dokan-lite'
                                        ) }
                                    />
                                </span>
                            ) }
                            { 'loss' === flags?.off_sale_reason && (
                                <DokanBadge
                                    variant="warning"
                                    label={ __(
                                        'Off sale: price below CJ cost',
                                        'dokan-lite'
                                    ) }
                                />
                            ) }
                        </div>
                    );
                },
            };
        } )
);

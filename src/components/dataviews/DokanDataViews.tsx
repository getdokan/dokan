import { DataViews as PluginUIDataViews } from '@wedevs/plugin-ui';
import type { DataViewsProps } from '@wedevs/plugin-ui';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// TS cannot forward DataViewsProps<Item> into plugin-ui's own generic because that type defers a
// conditional on Item, so the generic is erased at this boundary alone; runtime props are unchanged.
const ForwardedDataViews = PluginUIDataViews as (
    props: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => JSX.Element;

// plugin-ui labels its own chrome with core's `default` domain, which only translates the wording core
// happens to ship; the rest is unreachable from Dokan's language files, so re-declare it under ours.
// Wording core does own — "Search", "Reset", "Cancel" — is deliberately left alone.
function DokanDataViews< Item >( props: DataViewsProps< Item > ) {
    const { actions, filter } = props;

    const localizedActions = useMemo(
        () =>
            actions?.map( ( action ) => ( {
                ...action,
                confirmMessage:
                    action.confirmMessage ??
                    __(
                        'Are you sure? This action cannot be undone.',
                        'dokan-lite'
                    ),
            } ) ),
        [ actions ]
    );

    const localizedFilter = useMemo(
        () =>
            filter && {
                ...filter,
                labels: {
                    removeFilter: __( 'Remove filter', 'dokan-lite' ),
                    addFilter: __( 'Add Filter', 'dokan-lite' ),
                    ...filter.labels,
                },
            },
        [ filter ]
    );

    return (
        <ForwardedDataViews
            { ...props }
            actions={ localizedActions }
            filter={ localizedFilter }
            emptyTitle={
                props.emptyTitle ?? __( 'No data found', 'dokan-lite' )
            }
        />
    );
}

// Keep plugin-ui's compound sub-components reachable through the Dokan export.
export default Object.assign( DokanDataViews, {
    Pagination: PluginUIDataViews.Pagination,
    Layout: PluginUIDataViews.Layout,
    Search: PluginUIDataViews.Search,
    Filters: PluginUIDataViews.Filters,
    BulkActionToolbar: PluginUIDataViews.BulkActionToolbar,
} );

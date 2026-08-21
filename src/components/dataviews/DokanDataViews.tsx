import { DataViews as PluginUIDataViews } from '@wedevs/plugin-ui';
import type { DataViewsProps } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';

// plugin-ui's generic defers a conditional on Item that TS cannot forward; runtime props are unchanged.
const ForwardedDataViews = PluginUIDataViews as (
    props: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => JSX.Element;

// plugin-ui labels its chrome with core's `default` domain, which Dokan's language files can never reach.
function DokanDataViews< Item >( props: DataViewsProps< Item > ) {
    const { actions, filter, emptyTitle } = props;

    // Only a destructive action reaches the confirm dialog, so leave every other action object untouched.
    const localizedActions = actions?.map( ( action ) =>
        action.isDestructive && ! action.confirmMessage
            ? {
                  ...action,
                  confirmMessage: __(
                      'Are you sure? This action cannot be undone.',
                      'dokan-lite'
                  ),
              }
            : action
    );

    // "Reset" stays on core, which already translates it for locales Dokan has not.
    const localizedFilter = filter && {
        ...filter,
        labels: {
            removeFilter: __( 'Remove filter', 'dokan-lite' ),
            addFilter: __( 'Add Filter', 'dokan-lite' ),
            ...filter.labels,
        },
    };

    // The tab-scroll aria-labels and the skeleton "Actions" header take no prop, so they stay on core.
    return (
        <ForwardedDataViews
            { ...props }
            actions={ localizedActions }
            filter={ localizedFilter }
            emptyTitle={ emptyTitle ?? __( 'No data found', 'dokan-lite' ) }
        />
    );
}

// Callers render these directly, so they must survive the wrap.
export default Object.assign( DokanDataViews, {
    Pagination: PluginUIDataViews.Pagination,
    Layout: PluginUIDataViews.Layout,
    Search: PluginUIDataViews.Search,
    Filters: PluginUIDataViews.Filters,
    BulkActionToolbar: PluginUIDataViews.BulkActionToolbar,
} );

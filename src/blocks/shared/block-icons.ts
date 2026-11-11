import {
    box,
    category,
    commentAuthorAvatar,
    cover,
    envelope,
    funnel,
    grid,
    header,
    heading,
    info,
    mapMarker,
    navigation,
    page,
    scheduled,
    share,
    sidebar,
} from '@wordpress/icons';

/**
 * Icon colour shared by every Dokan block (the lighter Dokan purple).
 */
export const DOKAN_BLOCK_ICON_COLOR = '#A287F2';

const icons: Record< string, JSX.Element > = {
    'dokan/store-list': grid,
    'dokan/store-filter-bar': funnel,
    'dokan/store-header': header,
    'dokan/store-banner': cover,
    'dokan/store-avatar': commentAuthorAvatar,
    'dokan/store-name': heading,
    'dokan/store-info': info,
    'dokan/store-social': share,
    'dokan/store-tabs': navigation,
    'dokan/store-tab-content': page,
    'dokan/store-product-section': box,
    'dokan/store-sidebar': sidebar,
    'dokan/store-category-menu': category,
    'dokan/store-contact-form': envelope,
    'dokan/store-location-map': mapMarker,
    'dokan/store-open-close-hours': scheduled,
};

/**
 * Returns the inserter icon for a store block, or undefined so WordPress
 * falls back to its default icon for an unknown block name.
 *
 * @param {string} name Block name, e.g. `dokan/store-list`.
 */
export const storeBlockIcon = ( name: string ) =>
    icons[ name ]
        ? { src: icons[ name ], foreground: DOKAN_BLOCK_ICON_COLOR }
        : undefined;

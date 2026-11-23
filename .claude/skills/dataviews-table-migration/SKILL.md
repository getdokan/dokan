---
name: dataviews-table-migration
description: Build new vendor dashboard DataViews list pages from scratch OR migrate legacy Filter/StatusFilter/DataViewTable components to the unified @wedevs/plugin-ui DataViews component. Covers fresh builds (types, hook, list, route, PHP nav) and legacy migration (Scenario A status tabs, Scenario B multi-list merge).
---

# DataViews List — Build from Scratch

Build vendor dashboard list pages using `<DataViews>` from `@wedevs/plugin-ui` (exported via `@dokan/components`). This skill covers the full workflow: types, custom data hook, list component, module entry point, route, and PHP navigation.

## When to Use

- Creating a **new** vendor dashboard list/table page
- The component will live under `src/dashboard/<feature>/`
- Uses the `@wedevs/plugin-ui` `DataViews` component (NOT `AdminDataViews`)

## When NOT to Use

- **Admin panel tables** — those use `AdminDataViews` from `@dokan/components` (different component, different API). Quick check: if the import is `AdminDataViews`, this skill does not apply.

## Two Paths

| Goal | Jump to |
|---|---|
| Build a **new** list page from scratch | [Step 1: Define Types](#step-1-define-types-typests) |
| **Migrate** a legacy `<Filter>` / `<StatusFilter>` / multi-list page | [Legacy Migration Guide](#legacy-migration-guide) |

## Reference Implementation

**ProductList** on branch `feat/product-list-table-migration` (commit `13247bcb5`):

```
src/dashboard/products/
├── ProductList.tsx          # Main list component (DataViews)
├── index.tsx                # Module entry point
├── types.ts                 # TypeScript interfaces
└── hooks/useProducts.ts     # Data-fetching hook
```

Supporting changes:
- `src/routing/routes.tsx` — React route registration
- `includes/functions-dashboard-navigation.php` — PHP `react_route` key

---

## File Structure

Every new list module follows this layout:

```
src/dashboard/<feature>/
├── <Feature>List.tsx        # Main DataViews list component
├── index.tsx                # Module entry point (wrapper div)
├── types.ts                 # Item type, status union, filter state, status count
└── hooks/use<Feature>.ts   # Custom hook: fetch, delete, status counts
```

---

## Step 1: Define Types (`types.ts`)

Define four things: the item shape, the status union, the filter state, and the status count shape.

```tsx
// src/dashboard/<feature>/types.ts

export interface <Feature>Image {
    id: number;
    src: string;
    name: string;
    alt: string;
}

export interface <Feature>Item {
    id: number;
    name: string;
    status: string;
    // ... domain-specific fields
    date_created: string;
    permalink?: string;
}

export type <Feature>Status = 'all' | 'active' | 'inactive';
// Use the actual API statuses. Examples:
//   Products: 'all' | 'publish' | 'draft' | 'pending'
//   Orders:   'all' | 'processing' | 'completed' | 'on-hold'

export interface <Feature>FilterState {
    page: number;
    per_page: number;
    status: <Feature>Status;
    search: string;
    // Add more filters as the API supports them
}

export interface <Feature>StatusCount {
    value: string;
    label: string;
    count: number;
}
```

### Key rules
- `<Feature>StatusCount` must have `value`, `label`, `count` — this is the shape `tabs.items` expects.
- `<Feature>FilterState` mirrors the API query parameters exactly.
- Keep types in a dedicated file — the hook and list component both import from here.

---

## Step 2: Create the Data Hook (`hooks/use<Feature>.ts`)

Encapsulate all API interactions in a single custom hook. The hook returns: data, loading state, pagination, status counts, and mutation functions.

```tsx
// src/dashboard/<feature>/hooks/use<Feature>.ts

import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import type {
    <Feature>Item,
    <Feature>FilterState,
    <Feature>StatusCount,
} from '../types';

interface Use<Feature>Return {
    data: <Feature>Item[];
    isLoading: boolean;
    totalItems: number;
    totalPages: number;
    statusCounts: <Feature>StatusCount[];
    fetch<Feature>s: () => void;
    fetchStatusCounts: () => void;
    delete<Feature>: ( id: number ) => Promise< void >;
    delete<Feature>s: ( ids: number[] ) => Promise< void >;
}

export const use<Feature> = (
    filterArgs: <Feature>FilterState
): Use<Feature>Return => {
    const [ data, setData ] = useState< <Feature>Item[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );

    // Initialize with default counts so tabs render immediately (never empty)
    const [ statusCounts, setStatusCounts ] = useState< <Feature>StatusCount[] >( [
        { value: 'all', label: 'All', count: 0 },
        { value: 'active', label: 'Active', count: 0 },
        { value: 'inactive', label: 'Inactive', count: 0 },
    ] );

    // ── Fetch list data ────────────────────────────────────────
    // NOTE: If the API returns status counts as response headers
    // (Pattern B), extract them here too — see "Status Count Patterns".
    const fetchItems = useCallback( async () => {
        setIsLoading( true );
        try {
            const queryArgs: Record< string, any > = {
                per_page: filterArgs.per_page,
                page: filterArgs.page,
            };

            if ( filterArgs.status !== 'all' ) {
                queryArgs.status = filterArgs.status;
            }

            if ( filterArgs.search ) {
                queryArgs.search = filterArgs.search;
            }

            const response = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/<endpoint>', queryArgs ),
                parse: false,   // parse: false to access response headers
            } ) ) as Response;

            const responseData: <Feature>Item[] = await response.json();

            setData( responseData );
            setTotalItems( parseInt( response.headers.get( 'X-WP-Total' ) ?? '0', 10 ) );
            setTotalPages( parseInt( response.headers.get( 'X-WP-TotalPages' ) ?? '0', 10 ) );

            // ── Pattern B only: extract status counts from same response ──
            // Uncomment if the API returns X-Status-* headers on the list endpoint.
            // const all = parseInt( response.headers.get( 'X-Status-All' ) ?? '0', 10 );
            // const active = parseInt( response.headers.get( 'X-Status-Active' ) ?? '0', 10 );
            // const inactive = parseInt( response.headers.get( 'X-Status-Inactive' ) ?? '0', 10 );
            // setStatusCounts( [
            //     { value: 'all', label: 'All', count: all },
            //     { value: 'active', label: 'Active', count: active },
            //     { value: 'inactive', label: 'Inactive', count: inactive },
            // ] );
        } catch ( error ) {
            console.error( 'Error fetching items:', error );
            setData( [] );
        } finally {
            setIsLoading( false );
        }
    }, [
        filterArgs.page,
        filterArgs.per_page,
        filterArgs.status,
        filterArgs.search,
    ] );

    // ── Fetch status counts (Pattern A only) ──────────────────
    // Only needed when using a dedicated /summary endpoint.
    // For Pattern B (header-based), counts are already set inside fetchItems above.
    // For Pattern C (no counts), remove this entirely.
    // See "Status Count Patterns" section after the hook code.
    const fetchStatusCounts = useCallback( async () => {
        // ... Pattern A implementation (see below)
    }, [] );

    // ── Delete single item ─────────────────────────────────────
    const deleteItem = useCallback( async ( id: number ) => {
        await apiFetch( {
            path: `/dokan/v1/<endpoint>/${ id }`,
            method: 'DELETE',
            data: { force: true },
        } );
    }, [] );

    // ── Bulk delete ────────────────────────────────────────────
    const deleteItems = useCallback( async ( ids: number[] ) => {
        await Promise.all(
            ids.map( ( id ) =>
                apiFetch( {
                    path: `/dokan/v1/<endpoint>/${ id }`,
                    method: 'DELETE',
                    data: { force: true },
                } )
            )
        );
    }, [] );

    // ── Auto-fetch on filter changes ───────────────────────────
    useEffect( () => {
        void fetchItems();
    }, [ fetchItems ] );

    // Pattern A only — separate status count fetch on mount.
    // For Pattern B, remove this effect (counts come from fetchItems).
    useEffect( () => {
        void fetchStatusCounts();
    }, [ fetchStatusCounts ] );

    return {
        data,
        isLoading,
        totalItems,
        totalPages,
        statusCounts,
        fetch<Feature>s: fetchItems,
        fetchStatusCounts,   // Pattern A: exposed for re-fetch after mutations
                             // Pattern B: can be omitted (just re-call fetchItems)
                             // Pattern C: remove entirely
        delete<Feature>: deleteItem,
        delete<Feature>s: deleteItems,
    };
};
```

### Key rules
- **`parse: false`** on list fetch to read `X-WP-Total` and `X-WP-TotalPages` headers.
- **Default status counts** — initialize with zeroes so tabs render on first paint.
- **`useCallback`** on every async function — prevents unnecessary re-renders and infinite loops when passed as effect dependencies.
- Only include `filterArgs` fields that the API actually supports in `queryArgs`.

### Status Count Patterns

Choose the pattern that matches how the REST API provides counts. Check the REST controller to determine which one applies.

#### Pattern A: Dedicated `/summary` Endpoint

Use when the API has a separate summary/stats endpoint (e.g., `/dokan/v1/products/summary`). Status counts are fetched independently from the list data.

**When to use:** The REST controller has a dedicated route like `/<resource>/summary` that returns counts in the response body.

```tsx
// Separate fetchStatusCounts function — called independently
const fetchStatusCounts = useCallback( async () => {
    try {
        const response = ( await apiFetch( {
            path: '/dokan/v1/<endpoint>/summary',
        } ) ) as { post_counts: Record< string, number > };

        const counts = response.post_counts ?? {};
        const allCount = Object.values( counts ).reduce( ( sum, c ) => sum + c, 0 );

        setStatusCounts( [
            { value: 'all', label: 'All', count: allCount },
            { value: 'active', label: 'Active', count: counts.active ?? 0 },
            { value: 'inactive', label: 'Inactive', count: counts.inactive ?? 0 },
        ] );
    } catch ( error ) {
        console.error( 'Error fetching summary:', error );
    }
}, [] );

// Auto-fetch on mount
useEffect( () => {
    void fetchStatusCounts();
}, [ fetchStatusCounts ] );
```

**Key:** Expose `fetchStatusCounts` from the hook so the list component can re-fetch counts after mutations (delete, status change).

**Examples:** `ProductController::get_product_summary`, `OrderController::get_order_summary`

#### Pattern B: Status Counts in List Response Headers

Use when the list endpoint returns status counts as **custom HTTP headers alongside `X-WP-Total` / `X-WP-TotalPages`** on the same response. No separate API call needed — counts are extracted from the same `parse: false` response you already use for pagination.

**When to use:** The REST controller sets headers like `X-Status-All`, `X-Status-Pending`, etc. on the list response. Check the PHP controller for lines like `$response->header( 'X-Status-All', ... )`.

```tsx
// Inside fetchItems — extract counts from the SAME response as data + pagination
const fetchItems = useCallback( async () => {
    setIsLoading( true );
    try {
        const queryArgs: Record< string, any > = { /* ... */ };

        const response = ( await apiFetch( {
            path: addQueryArgs( '/dokan/v1/<endpoint>', queryArgs ),
            parse: false,
        } ) ) as Response;

        const responseData = await response.json();

        // Standard pagination headers (always present)
        setData( responseData );
        setTotalItems( parseInt( response.headers.get( 'X-WP-Total' ) ?? '0', 10 ) );
        setTotalPages( parseInt( response.headers.get( 'X-WP-TotalPages' ) ?? '0', 10 ) );

        // Status counts from custom headers (same response, same call)
        const all = parseInt( response.headers.get( 'X-Status-All' ) ?? '0', 10 );
        const approved = parseInt( response.headers.get( 'X-Status-Approved' ) ?? '0', 10 );
        const pending = parseInt( response.headers.get( 'X-Status-Pending' ) ?? '0', 10 );

        setStatusCounts( [
            { value: 'all', label: 'All', count: all },
            { value: 'approved', label: 'Approved', count: approved },
            { value: 'pending', label: 'Pending', count: pending },
        ] );
    } catch ( error ) { /* ... */ }
    finally { setIsLoading( false ); }
}, [ /* filterArgs deps */ ] );
```

**Key differences from Pattern A:**
- **No separate `fetchStatusCounts` function** — remove it from the hook entirely.
- **No separate `useEffect` for counts** — remove the `fetchStatusCounts` effect.
- **No `fetchStatusCounts` in the return** — the list component doesn't need it.
- Counts update automatically on **every list fetch** (paginate, search, filter, tab switch).
- After mutations (delete, status change), just re-call `fetchItems` — counts come along for free.

**Hook return for Pattern B:**
```tsx
return {
    data,
    isLoading,
    totalItems,
    totalPages,
    statusCounts,          // still exposed — updated inside fetchItems
    fetch<Feature>s: fetchItems,
    // no fetchStatusCounts here
    delete<Feature>: deleteItem,
    delete<Feature>s: deleteItems,
};
```

**Examples:** `StoreController` (`X-Status-All`, `X-Status-Approved`, `X-Status-Pending`), `WithdrawController` (`X-Status-Pending`, `X-Status-Completed`, `X-Status-Cancelled`)

#### Pattern C: No Status Counts (Pagination Only)

Use when the API has no count support at all — only standard `X-WP-Total` / `X-WP-TotalPages` headers.

**When to use:** The REST controller doesn't provide any status-specific counts. Tabs are either static (no counts shown) or not used.

```tsx
// No statusCounts state needed
// No fetchStatusCounts function needed
// Tabs can still exist — just without count badges:

const tabs = {
    items: [
        { value: 'all', label: __( 'All', 'dokan-lite' ) },
        { value: 'active', label: __( 'Active', 'dokan-lite' ) },
        { value: 'inactive', label: __( 'Inactive', 'dokan-lite' ) },
    ],
    onSelect: ( status ) => { /* ... */ },
};
```

**Key:** Tab items omit the `count` property entirely. The component renders tabs without count badges.

### Which Pattern to Choose — Decision Flow

1. Check the REST controller for the endpoint you're consuming.
2. **Does it have a `/summary` route?** → Use Pattern A.
3. **Does the list response set `X-Status-*` headers?** → Use Pattern B.
4. **Neither?** → Use Pattern C (no counts), or add a summary endpoint to the backend first.

---

## Step 3: Build the List Component (`<Feature>List.tsx`)

This is the main component. It wires up state, fields, tabs, actions, and the `<DataViews>` component.

```tsx
// src/dashboard/<feature>/<Feature>List.tsx

import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import { DataViews, DokanBadge, DokanModal } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { use<Feature> } from './hooks/use<Feature>';
import type { <Feature>Item, <Feature>Status, <Feature>FilterState } from './types';
```

### 3a. Helper Functions

Define status badge mapping and label helpers at the top of the file, outside the component:

```tsx
const getStatusBadgeVariant = ( status: string ) => {
    switch ( status ) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'secondary';
        default:
            return 'info';
    }
};

const getStatusLabel = ( status: string ) => {
    switch ( status ) {
        case 'active':
            return __( 'Active', 'dokan-lite' );
        case 'inactive':
            return __( 'Inactive', 'dokan-lite' );
        default:
            return status;
    }
};
```

### 3b. Component State

```tsx
function <Feature>List() {
    const toast = useToast();
    const [ deleteItems, setDeleteItems ] = useState< <Feature>Item[] >( [] );
    const [ isDeleting, setIsDeleting ] = useState( false );
    const [ selection, setSelection ] = useState< string[] >( [] );

    const [ filterArgs, setFilterArgs ] = useState< <Feature>FilterState >( {
        page: 1,
        per_page: 10,
        status: 'all',
        search: '',
    } );

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        status: 'all',        // tabs sync to this key by default (viewKey = 'status')
    } );

    const {
        data,
        isLoading,
        totalItems,
        totalPages,
        statusCounts,
        fetch<Feature>s,
        fetchStatusCounts,
        delete<Feature>,
        delete<Feature>s,
    } = use<Feature>( filterArgs );
```

### Dual-state pattern (`view` + `filterArgs`)

| State | Purpose | Consumed by |
|---|---|---|
| `view` | Controls DataViews UI: pagination, search, layout type, active tab | `<DataViews>` component |
| `filterArgs` | Drives the API request: `page`, `per_page`, `status`, `search` | `use<Feature>` hook |

Both are kept in sync via `onViewChange` and `tabs.onSelect`. This separation is intentional — the view object may contain UI-only keys (like `type: 'table'`) that the API doesn't need.

### 3c. Define Fields (Columns)

Each field needs `id`, `label`, `enableSorting: false`, and a `render` function.

```tsx
    const fields = [
        {
            id: 'name',
            label: __( 'Name', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: <Feature>Item } ) => (
                <div className="flex items-center gap-3">
                    { /* Optional: image thumbnail */ }
                    <span className="font-medium text-gray-900">
                        { item.name }
                    </span>
                </div>
            ),
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: <Feature>Item } ) => (
                <DokanBadge
                    variant={ getStatusBadgeVariant( item.status ) }
                    label={ getStatusLabel( item.status ) }
                />
            ),
        },
        {
            id: 'price',
            label: __( 'Price', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: <Feature>Item } ) => (
                <div>
                    { item.price ? (
                        <PriceHtml price={ item.price } />
                    ) : (
                        <span>{ '\u2013' }</span>
                    ) }
                </div>
            ),
        },
        {
            id: 'date_created',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: <Feature>Item } ) => (
                <DateTimeHtml.Date date={ item.date_created } />
            ),
        },
    ];
```

### Field rules
- Always set `enableSorting: false` unless the REST API supports `orderby` for that field.
- `render` receives `{ item }` typed to your item interface.
- Use `DokanBadge` for status columns with `variant` mapped from status string.
- Use `PriceHtml` for formatted currency display (see "Rendering Prices" below).
- Use `DateTimeHtml.Date` for date-only or `DateTimeHtml` for date + time.
- Use `'\u2013'` (en-dash) for empty/null values.

### Rendering Prices

Two approaches exist in the codebase. Use the one that fits the context:

**`<PriceHtml>` component** — preferred for vendor dashboard DataViews fields. Import from `@dokan/components`. Renders a formatted price using WooCommerce currency settings. Just pass the raw numeric value.

```tsx
import { PriceHtml } from '@dokan/components';

// In a field render:
render: ( { item } ) => (
    <div>
        { item.price ? <PriceHtml price={ item.price } /> : <span>{ '\u2013' }</span> }
    </div>
),

// Props (all optional except price):
<PriceHtml
    price={ 49.99 }            // string | number — required
    precision={ null }          // decimal places
    thousand=""                 // thousands separator
    decimal=""                  // decimal separator
    format=""                   // e.g. '%s%v' for $10, '%v%s' for 10$
/>
```

**`formatPrice()` utility** — use when you need the formatted string directly (e.g., in tooltips, concatenated strings, non-JSX contexts). Import from `@dokan/utilities`. Returns a formatted string, wrap in `<RawHTML>` for rendering.

```tsx
import { formatPrice } from '@dokan/utilities';
import { RawHTML } from '@wordpress/element';

// Inline helper pattern (used in admin pages):
const price = ( amount ) => <RawHTML>{ formatPrice( amount ) }</RawHTML>;

// In a field render:
render: ( { item } ) => price( item.amount ),

// In non-JSX contexts (tooltips, labels):
const label = `Total: ${ formatPrice( item.total ) }`;
```

**When to use which:**

| Context | Use |
|---|---|
| DataViews field `render` (vendor dashboard) | `<PriceHtml price={value} />` |
| DataViews field `render` (admin dashboard) | `<RawHTML>{ formatPrice(value) }</RawHTML>` or `<PriceHtml>` |
| String concatenation, tooltips, labels | `formatPrice(value)` |

### 3d. Define Tabs

```tsx
    const tabs = {
        items: statusCounts,       // Array of { value, label, count }
        onSelect: ( status: string ) => {
            setFilterArgs( ( prev ) => ( {
                ...prev,
                status: status as <Feature>Status,
                page: 1,
                search: '',
            } ) );
            setView( ( prev ) => ( { ...prev, page: 1, search: '' } ) );
        },
    };
```

### Tab rules
- `items` must be `{ value: string; label: string; count?: number }[]`.
- `onSelect` resets `page` to 1 and clears `search` — prevents stale paginated results.
- The component auto-syncs `tabs.items[n].value` to `view.status` (default `viewKey`).
- For non-status tabs (e.g., view-type switcher), add `viewKey: 'myCustomKey'` and add matching key to view state.

### 3e. Define Actions

```tsx
    const actions = useMemo( () => [
        {
            id: 'view',
            label: () => __( 'View', 'dokan-lite' ),
            callback: ( [ item ]: <Feature>Item[] ) => {
                if ( item.permalink ) {
                    window.open( item.permalink, '_blank' );
                }
            },
        },
        {
            id: 'delete',
            label: () => __( 'Delete Permanently', 'dokan-lite' ),
            isDestructive: true,
            supportsBulk: true,
            callback: ( items: <Feature>Item[] ) => {
                setDeleteItems( items );   // triggers confirmation modal
            },
        },
    ], [] );
```

### Action rules
- **`label`** must be a string or `() => string` — never JSX.
- **`isDestructive: true`** — the `@wedevs/plugin-ui` DataViews component automatically wraps these in an `AlertDialog` confirmation. You do NOT need to build your own confirmation modal for destructive actions.
- **`supportsBulk: true`** — enables bulk selection checkbox column. Requires `selection` and `onChangeSelection` props on DataViews.
- **`useMemo`** to prevent unnecessary re-renders. Only include dependencies that actually affect the actions array.
- **`isEligible?: (item) => boolean`** — use to conditionally show actions per-row (e.g., only show "Approve" for pending items).

### 3f. View Change Handler

```tsx
    const onViewChange = ( newView: typeof view ) => {
        setView( newView );
        setFilterArgs( ( prev ) => ( {
            ...prev,
            page: newView.page,
            per_page: newView.perPage,
            search: newView.search,
        } ) );
    };
```

This is the bridge between `view` (UI state) and `filterArgs` (API state). Every time the user paginates, searches, or changes per-page, both states update.

### 3g. Delete Confirmation Handler

```tsx
    const handleDeleteConfirm = async () => {
        if ( deleteItems.length === 0 ) return;

        setIsDeleting( true );
        try {
            if ( deleteItems.length === 1 ) {
                await delete<Feature>( deleteItems[ 0 ].id );
            } else {
                await delete<Feature>s( deleteItems.map( ( item ) => item.id ) );
            }
            toast( {
                type: 'success',
                title: deleteItems.length === 1
                    ? __( 'Item deleted successfully', 'dokan-lite' )
                    : __( 'Items deleted successfully', 'dokan-lite' ),
            } );
            setSelection( [] );
            fetch<Feature>s();
            fetchStatusCounts();
        } catch ( error ) {
            toast( {
                type: 'error',
                title: __( 'Failed to delete', 'dokan-lite' ),
            } );
        } finally {
            setIsDeleting( false );
            setDeleteItems( [] );
        }
    };
```

### Post-mutation rules
- Clear `selection` after bulk delete.
- Re-fetch **both** list data and status counts — counts change after mutations.
- Use `useToast` from `@getdokan/dokan-ui` for success/error notifications.

### 3h. Render

```tsx
    return (
        <>
            <DataViews
                namespace="dokan-<feature>-data-view"
                data={ data }
                fields={ fields }
                view={ view }
                onChangeView={ onViewChange }
                getItemId={ ( item: <Feature>Item ) => item.id }
                isLoading={ isLoading }
                paginationInfo={ {
                    totalItems,
                    totalPages,
                } }
                tabs={ tabs }
                search={ true }
                actions={ actions }
                selection={ selection }
                onChangeSelection={ ( ids: string[] ) => setSelection( ids ) }
            />
        </>
    );
}

export default <Feature>List;
```

### DataViews props reference

| Prop | Type | Required | Notes |
|---|---|---|---|
| `namespace` | `string` | Yes | Enables WordPress filter hooks: `{snake_namespace}_dataviews_{element}` |
| `data` | `Item[]` | Yes | Current page of items |
| `fields` | `Field[]` | Yes | Column definitions |
| `view` | `View` | Yes | Current view state (page, search, type, status) |
| `onChangeView` | `(view) => void` | Yes | Called on paginate, search, tab change |
| `getItemId` | `(item) => string` | Yes* | Required if item doesn't have `id: string` |
| `isLoading` | `boolean` | No | Shows skeleton loader when true |
| `paginationInfo` | `{ totalItems, totalPages }` | Yes | Drives pagination controls |
| `tabs` | `TabsProps` | No | Status/view-type tabs |
| `search` | `boolean` | No | Enables built-in debounced search input |
| `searchPlaceholder` | `string` | No | Custom placeholder for search input |
| `actions` | `Action[]` | No | Row/bulk actions dropdown |
| `selection` | `string[]` | No | Currently selected item IDs (for bulk actions) |
| `onChangeSelection` | `(ids) => void` | No | Selection change handler |
| `filter` | `DataViewFilterProps` | No | Inline filter fields (funnel button) |
| `onClickItem` | `(item) => void` | No | Row click handler |
| `isItemClickable` | `(item) => boolean` | No | Per-row click eligibility |
| `empty` | `JSX.Element` | No | Custom empty state |
| `emptyTitle` | `string` | No | Empty state heading |
| `emptyDescription` | `string` | No | Empty state description |
| `header` | `JSX.Element` | No | Content above tabs |

### When to include optional props
- **`tabs`** — only if the list has meaningful status/view-type groupings.
- **`search`** — only if the REST endpoint supports a `search` parameter.
- **`filter`** — only if the list needs controls beyond tabs + search (date range, vendor picker, etc.).
- **`actions`** — only if rows have operations (view, edit, delete, status toggle).
- **`selection` + `onChangeSelection`** — only if at least one action has `supportsBulk: true`.

---

## Step 4: Module Entry Point (`index.tsx`)

Minimal wrapper that provides the outer container div:

```tsx
// src/dashboard/<feature>/index.tsx

import <Feature>List from './<Feature>List';

const Index = () => {
    return (
        <div className="dokan-<feature>-wrapper dokan-react-<feature> space-y-6">
            <<Feature>List />
        </div>
    );
};

export default Index;
```

### Naming convention
- Wrapper class: `dokan-<feature>-wrapper dokan-react-<feature>`
- Use `space-y-6` for vertical spacing if the page may have multiple sections later.

---

## Step 5: Register the React Route (`src/routing/routes.tsx`)

Add the route to the routes array:

```tsx
import <Feature> from '@src/dashboard/<feature>';

// Inside the exported array:
{
    id: 'dokan-<feature>',
    title: __( '<Feature Title>', 'dokan-lite' ),
    element: <<Feature> />,
    path: '/<feature>',
    exact: true,
    order: <number>,                           // determines sidebar ordering
    capabilities: [ 'dokan_view_<feature>_menu' ],  // PHP capability check
},
```

### DokanRoute shape

```tsx
type DokanRoute = {
    id: string;            // unique identifier, prefix with 'dokan-'
    title?: string;        // page title shown in header
    element: JSX.Element;  // the component to render
    path: string;          // URL path (relative to dashboard root)
    exact?: boolean;       // exact path match
    order?: number;        // sidebar menu ordering
    capabilities?: string[];  // required WordPress capabilities
    backUrl?: string;      // if set, shows a back arrow linking to this URL
    icon?: JSX.Element;    // optional icon for header
    header?: JSX.Element;  // custom header component override
    footer?: JSX.Element;  // custom footer component override
    parent?: string;       // parent route ID for nesting
};
```

---

## Step 6: Register PHP Navigation (`includes/functions-dashboard-navigation.php`)

Add `'react_route' => '<feature>'` to the menu item in `dokan_get_dashboard_nav()`:

```php
'<feature>' => [
    'title'       => __( '<Feature Title>', 'dokan-lite' ),
    'icon'        => '<i class="fas fa-<icon>"></i>',
    'url'         => dokan_get_navigation_url( '<feature>' ),
    'pos'         => <number>,
    'icon_name'   => '<LucideIconName>',       // Lucide icon component name
    'permission'  => 'dokan_view_<feature>_menu',
    'react_route' => '<feature>',              // ← THIS is what enables the React SPA route
],
```

The `react_route` key tells the PHP-rendered sidebar menu to trigger the React router instead of a full page navigation. The value must match the `path` in `routes.tsx` (without the leading `/`).

---

## Adding Inline Filters (Optional)

If the list needs additional filter controls beyond tabs and search (e.g., date range, vendor picker, customer select), add the `filter` prop:

```tsx
const [ dateRange, setDateRange ] = useState< { startDate: string | null; endDate: string | null } | null >( null );

const filter = {
    fields: [
        {
            id: 'date-range',
            label: __( 'Date Range', 'dokan-lite' ),
            field: (
                <DateRangePicker
                    startDate={ dateRange?.startDate ?? null }
                    endDate={ dateRange?.endDate ?? null }
                    onChange={ ( start, end ) => setDateRange( { startDate: start, endDate: end } ) }
                />
            ),
        },
        {
            id: 'customer',
            label: __( 'Customer', 'dokan-lite' ),
            field: (
                <CustomerFilter
                    value={ selectedCustomer }
                    onChange={ setSelectedCustomer }
                />
            ),
        },
    ],
    onReset: () => {
        setDateRange( null );
        setSelectedCustomer( null );
    },
    onFilterRemove: ( filterId: string ) => {
        if ( filterId === 'date-range' ) setDateRange( null );
        if ( filterId === 'customer' ) setSelectedCustomer( null );
    },
};

// Then add to DataViews:
<DataViews
    filter={ filter }
    // ... other props
/>
```

### Filter field shape

```tsx
interface DataViewFilterField {
    id: string;               // unique identifier, used in onFilterRemove
    label: string;            // shown in the "Add Filter" popover
    field: React.ReactNode;   // the filter control (any React element)
}
```

When `filter.fields` is provided alongside `tabs`, the DataViews component automatically injects a funnel button into the tab header. Clicking it opens the filter panel. The funnel button shows a badge count of active filters.

---

## View-Type Tabs (Non-Status Tabs)

When tabs represent different view types rather than statuses (e.g., "Coupons" vs "Marketing"), use a custom `viewKey`:

```tsx
type ViewType = 'coupons' | 'marketing';

const [ view, setView ] = useState( {
    perPage: 10,
    page: 1,
    search: '',
    type: 'table',
    viewType: 'coupons' as ViewType,   // custom key — NOT 'status'
    fields: couponFields.map( ( f ) => f.id ),
} );

const tabs = {
    items: [
        { label: __( 'Coupons', 'dokan-lite' ), value: 'coupons' },
        { label: __( 'Marketing', 'dokan-lite' ), value: 'marketing' },
    ],
    viewKey: 'viewType',   // syncs to view.viewType instead of view.status
    onSelect: ( viewType: ViewType ) => {
        setData( [] );     // clear stale data from previous tab
        setView( ( prev ) => ( {
            ...prev,
            page: 1,
            search: '',
            viewType,
            fields: ( viewType === 'coupons' ? couponFields : marketingFields )
                .map( ( f ) => f.id ),
        } ) );
    },
};
```

### View-type tab rules
- `viewKey` must match a key in the `view` object.
- **Clear `data`** on tab switch to prevent stale row flash.
- **Update `view.fields`** when tabs have different columns.
- Switch `fields`, `actions`, and fetch logic based on the active tab value.

---

## Shared Components Reference

Import from `@dokan/components`:

| Component | Usage |
|---|---|
| `DataViews` | Main table component (`@wedevs/plugin-ui`) |
| `DokanBadge` | Status badges with variants: `primary`, `secondary`, `info`, `warning`, `success`, `danger` |
| `DokanModal` | Confirmation dialogs |
| `PriceHtml` | Formatted currency display — `<PriceHtml price={value} />`. Reads WooCommerce currency settings automatically. See "Rendering Prices" section for full props |
| `DateTimeHtml` | Full date + time. `.Date` for date only. `.Time` for time only |
| `CustomerFilter` | Async customer select filter |
| `DateRangePicker` | Date range filter control |
| `Filter` | Legacy filter component (do NOT use in new code) |

Import from `@dokan/utilities`:

| Export | Usage |
|---|---|
| `formatPrice` | Returns formatted price string — use for non-JSX contexts or wrap in `<RawHTML>`. See "Rendering Prices" |
| `formatNumber` | Format number with WooCommerce precision/separators |
| `unformatNumber` | Parse a formatted number string back to raw number |

Import from `@getdokan/dokan-ui`:

| Component | Usage |
|---|---|
| `useToast` | Toast notification hook — `toast({ type: 'success' | 'error', title: string })` |

Import from `@wordpress/*`:

| Package | Exports |
|---|---|
| `@wordpress/element` | `useState`, `useMemo`, `useCallback`, `useEffect`, `RawHTML` |
| `@wordpress/i18n` | `__`, `sprintf` |
| `@wordpress/api-fetch` | `apiFetch` — WordPress REST API fetch wrapper |
| `@wordpress/url` | `addQueryArgs` — appends query params to URL path |

---

## Checklist

Before considering the implementation complete:

- [ ] **Types** — `types.ts` with item interface, status union, filter state, status count
- [ ] **Hook** — `hooks/use<Feature>.ts` with `parse: false`, header-based pagination, default status counts
- [ ] **Fields** — every field has `id`, `label`, `enableSorting: false`, `render`
- [ ] **Tabs** — `items` array from `statusCounts`, `onSelect` resets page + search
- [ ] **Actions** — plain text labels, `isDestructive: true` on destructive, `supportsBulk` if needed
- [ ] **View state** — `perPage`, `page`, `search`, `type: 'table'`, `status: 'all'`
- [ ] **`onChangeView`** — syncs `view` to `filterArgs`
- [ ] **Selection** — `selection` + `onChangeSelection` if any action has `supportsBulk`
- [ ] **Post-mutation** — re-fetch list + status counts, clear selection, show toast
- [ ] **Entry point** — `index.tsx` with wrapper div
- [ ] **Route** — registered in `src/routing/routes.tsx` with correct `capabilities`
- [ ] **PHP nav** — `react_route` key added in `includes/functions-dashboard-navigation.php`
- [ ] **Namespace** — `namespace="dokan-<feature>-data-view"` for WordPress filter hooks
- [ ] **Search** — only `search={true}` if the API endpoint supports `search` parameter
- [ ] **i18n** — all user-facing strings wrapped in `__( '...', 'dokan-lite' )`

---

# Legacy Migration Guide

Migrate existing Dokan Pro list/table views from **old patterns** (separate `<Filter>`, `<StatusFilter>`, `<DataViewTable>`) to the new unified `<DataViews>` component from `@wedevs/plugin-ui`.

## Trigger Patterns

Use this section when you see any of these old patterns:
- Separate `<Filter>` component from `@dokan/components`
- Custom `<StatusFilter>` component alongside DataViews
- `<DataViews>` with `defaultLayouts` prop but no `tabs`/`filter` props
- `search={false}` on DataViews (search handled externally via `<SimpleInput>`)
- Filter state managed in a separate `<Filter>` wrapper
- Separate tab/header components that switch between different list views via URL params or state
- Multiple list components for related data, conditionally rendered by a wrapper

## Migration Scenarios

Identify which scenario applies before starting:

### Scenario A: Status Tabs + Filters
A single list with status filtering (All / Open / Closed) and/or additional filters (customer, date range, search) managed by separate `<Filter>` and `<StatusFilter>` components.

**Migrate to:** One `<DataViews>` with `tabs` (status counts from API), `filter` (inline filter fields), and `search` (only if the old component had search).

### Scenario B: View-Type Tabs (Merging Multiple Lists)
Multiple separate list components toggled by an external tab/header component. Each list may have different columns, actions, and API endpoints.

**Migrate to:** One unified `<DataViews>` with `tabs` using a custom `viewKey`. Fields, actions, and fetch logic switch dynamically based on the active tab. Delete old separate components and the external tab switcher.

## Component Locations Needing Migration

### High Priority (uses separate `<Filter>` + `<StatusFilter>`)
- `modules/rma/src/js/vendor-dashboard/components/RequestsList.tsx`

### Medium Priority (uses `defaultLayouts`, no `tabs`/`filter`)
- `src/features/reviews/ReviewTable.tsx` (has separate `ReviewStatusTabs`)
- `src/features/shipping/ZoneList.tsx`
- `src/features/shipping/ShippingMethods.tsx`
- `modules/vendor-staff/src/js/components/StaffList.tsx`
- `modules/subscription/src/js/frontend/components/SubscriptionOrders.tsx`

### Already Migrated (reference examples)
- **Scenario A:** `modules/store-support/src/js/vendor-dashboard/components/TicketsList.tsx` (branch: `refactor/support-tickets-vendor-table`)
- **Scenario B:** `src/frontend/coupons/components/CouponList.tsx` (branch: `refactor/coupons-dataviews-migration`)

## Base Branch

All migration work should be branched from and PR'd against: `refactor/coupons-dataviews-migration` in dokan-pro repository. PR: https://github.com/getdokan/dokan-pro/pull/5507

---

## Architecture Overview

### Old Patterns

**Scenario A — Separate Filter + StatusFilter:**
```
+-------------------------------------------+
|  <Filter fields={[...]} />                |
+-------------------------------------------+
|  <StatusFilter />                         |
|    All (10) | Open (5) | Closed (5)       |
+-------------------------------------------+
|  <DataViews defaultLayouts={...}          |
|    search={false} ... />                  |
+-------------------------------------------+
```

**Scenario B — External Tab Switcher + Multiple Lists:**
```
+-------------------------------------------+
|  <TabHeader />                            |
|    [Tab A] | [Tab B]  (URL param toggle)  |
+-------------------------------------------+
|  { isTabA ? <ListA /> : <ListB /> }      |
|  Each has its own <DataViews>             |
+-------------------------------------------+
```

### New Pattern (both scenarios)

```
+-------------------------------------------+
|  <DataViews                               |
|    tabs={...}    filter={...}             |
|    search={true/false} ... />             |
|                                           |
|  [Tab1] [Tab2]  [funnel] [search?]       |
|  | Filter1 | Filter2 | Reset |           |
|  | Table rows...                |         |
|  | Pagination                   |         |
+-------------------------------------------+
```

---

## Migration Steps (Scenario A: Status Tabs + Filters)

### Step 1: Update Imports

**Remove:**
```tsx
import { Filter } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import StatusFilter from './Navigation/StatusFilter';
```

**Keep/Add:**
```tsx
import { DataViews, CustomerFilter /* if needed */ } from '@dokan/components';
```

### Step 2: Move Status into View State

**Remove** separate status state:
```tsx
const [selectedStatus, setSelectedStatus] = useState('all');
```

**Add** `status` to the view object:
```tsx
const [view, setView] = useState({
    perPage: 10,
    page: 1,
    search: '',
    type: 'table',
    status: 'all',   // <-- tabs sync to this via viewKey (default: 'status')
});
```

### Step 3: Migrate Status Tabs to `tabs` Prop

**Old:** Separate `<StatusFilter>` component.

**New:** `tabs` prop on DataViews using a status hook:

```tsx
const { statusCounts, fetchStatusCounts } = useStatusFilters();

const tabs = {
    items: statusCounts.map((s) => ({ ...s, value: s.key })),
    onSelect: onStatusClick,
};
```

Tab item shape:
```tsx
interface Tab {
    label: string;
    value: string;
    count?: number;
    className?: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
}
```

Initialize status counts with defaults so tabs render immediately (not empty):
```tsx
const defaultStatuses = [
    { key: 'all', label: __('All', 'dokan'), count: 0 },
    { key: 'open', label: __('Open', 'dokan'), count: 0 },
    { key: 'closed', label: __('Closed', 'dokan'), count: 0 },
];
const [statusCounts, setStatusCounts] = useState(defaultStatuses);
```

### Step 4: Migrate Filters to `filter` Prop

**Old:** `<Filter fields={[...]} showFilter showReset onFilter onReset />`

**New:** `filter` prop with structured field definitions:
```tsx
const filter = {
    fields: [
        {
            id: 'some-filter',
            label: __('Filter Label', 'dokan'),
            field: <SomeFilterComponent value={value} onChange={setValue} />,
        },
    ],
    onReset: () => { /* clear all filter state */ },
    onFilterRemove: (filterId: string) => { /* clear specific filter */ },
};
```

Each filter field requires `id`, `label`, and `field` (React element).

### Step 5: Enable Built-in Search (only if previously supported)

Only set `search={true}` if the old component had a search feature (e.g., a `<SimpleInput>` for keyword search inside `<Filter>`, or `search={false}` with external search state). If the old component had **no search at all**, keep `search={false}` or omit the prop.

**Old:** External `<SimpleInput>` + `search={false}` on DataViews.

**New:** `search={true}` — value comes through `view.search` via `onChangeView`:
```tsx
const onViewChange = (newView) => {
    setView(newView);
    setFilterArgs((prev) => ({
        ...prev,
        page: newView.page,
        per_page: newView.perPage,
        search: newView.search,
    }));
};
```

Remove the separate search state entirely.

**If no search existed before**, simply omit `search` or set `search={false}`, and do not add `search` to the view object or `onChangeView` handler.

### Step 6: Simplify Status Click Handler

Remove `setSelectedStatus` — status now lives in `view.status`:
```tsx
const onStatusClick = (status) => {
    setFilterArgs((prev) => ({
        ...prev, status, page: 1, search: '',
        /* reset other filters as appropriate */
    }));
    setView((prev) => ({ ...prev, page: 1 }));
};
```

### Step 7: Clean Up Actions

Remove `isPrimary` and JSX from labels. Use `isDestructive` for destructive actions:

**Old:**
```tsx
{ id: 'delete', isPrimary: true, label: () => <span className="text-danger">{__('Delete', 'dokan')}</span> }
```
**New:**
```tsx
{ id: 'delete', isDestructive: true, label: () => __('Delete', 'dokan') }
```

### Step 8: Fetch Status Counts in Effect

Move count fetching from the StatusFilter component into the list's effect:
```tsx
useEffect(() => {
    void fetchData();
    void fetchStatusCounts();
}, [filterArgs]);
```

### Step 9: Update JSX

Remove `<Filter>`, `<StatusFilter>`, `defaultLayouts`. Add `tabs`, `filter`, and `search` (only if previously supported):
```tsx
<DataViews
    namespace="..."
    data={items}
    tabs={tabs}
    filter={filter}
    fields={fields}
    search={true}       // only if old component had search — otherwise omit or set false
    view={view}
    actions={actions}
    isLoading={isLoading}
    paginationInfo={{ totalItems, totalPages }}
    getItemId={(item) => item.id}
    onChangeView={onViewChange}
/>
```

### Step 10: Delete Dead Files

- Status filter components (`StatusFilter.tsx`, `StatusFilterSkeleton.tsx`)
- Unused imports (`Filter`, `SimpleInput`, related types)

---

## Migration Steps (Scenario B: Merging Multiple Lists into Tabs)

### Step 1: Identify Components to Merge

Look for:
- A **wrapper** that conditionally renders different list components based on URL param or state
- A **tab/header component** that navigates between views
- **Two or more list components** each with their own `<DataViews>`, fields, and fetch logic

### Step 2: Create the Unified Component

A single component that switches behavior based on the active tab:

**1. Define field arrays per tab:**
```tsx
const fieldsForTabA = [ /* columns for tab A */ ];
const fieldsForTabB = [ /* columns for tab B */ ];
```

**2. Add a custom key to view state:**
```tsx
type ViewType = 'tab_a' | 'tab_b';

const [view, setView] = useState({
    perPage: 10,
    page: 1,
    search: '',
    type: 'table',
    viewType: 'tab_a' as ViewType,   // <-- custom view key
    fields: fieldsForTabA.map((f) => f.id !== 'title' ? f.id : ''),
});
```

**3. Switch fields/actions based on active tab:**
```tsx
const isTabA = view.viewType !== 'tab_b';
const fields = isTabA ? fieldsForTabA : fieldsForTabB;
```

**4. Configure tabs with custom `viewKey`:**
```tsx
const tabs = {
    items: [
        { label: __('Tab A', 'dokan'), value: 'tab_a' },
        { label: __('Tab B', 'dokan'), value: 'tab_b' },
    ],
    viewKey: 'viewType',  // <-- syncs to view.viewType instead of default view.status
    onSelect: (viewType: ViewType) => {
        setData([]);      // clear stale data
        setView((prev) => ({
            ...prev,
            page: 1,
            search: '',
            viewType,
            fields: (viewType === 'tab_a' ? fieldsForTabA : fieldsForTabB)
                .map((f) => f.id !== 'title' ? f.id : ''),
        }));
    },
};
```

**5. Conditionally build actions** (some tabs may have none):
```tsx
const actions = useMemo(() => {
    if (!isTabA) return [];
    const itemActions = [ /* edit, delete, etc. */ ];
    return itemActions.some((a) => a.isEligible()) ? itemActions : [];
}, [isTabA, /* capabilities */]);
```

**6. Branch fetch logic by active tab:**
```tsx
const fetchData = async () => {
    setIsLoading(true);
    try {
        if (isTabA) {
            // Endpoint A — may support pagination, search, etc.
        } else {
            // Endpoint B — may have different response shape
        }
    } catch (error) { /* ... */ }
    finally { setIsLoading(false); }
};
```

**7. Conditionally provide pagination** (some endpoints may not support it):
```tsx
const paginationInfo = isTabA
    ? { totalItems, totalPages: Math.ceil(totalItems / view.perPage) }
    : {};
```

### Step 3: Simplify the Wrapper

Remove the tab/header component and URL-based conditional rendering. The wrapper just renders the unified component:

```tsx
const Wrapper = ({ navigate }) => (
    <div>
        <UnifiedList navigate={navigate} />
    </div>
);
```

### Step 4: Delete Old Files

- Old individual list components
- Old tab/header component
- Verify no external imports exist before deleting

---

## Common Patterns (Legacy Migration)

### Status Hook Shape
```tsx
interface StatusItem { key: string; label: string; count: number; }
```
Map to tab items: `statusCounts.map(s => ({ ...s, value: s.key }))`

### Custom `viewKey` for Non-Status Tabs
When tabs represent a view type (not status), set `viewKey` on tabs and add a matching key to the view object:
```tsx
tabs = { items: [...], viewKey: 'myKey' };
view = { ..., myKey: 'defaultTab' };
```

### Dynamic Fields per Tab
Switch the `fields` array based on active tab. Also update `view.fields` in `onSelect` so DataViews renders the correct columns.

### Conditional Actions per Tab
Use `useMemo` to return different (or empty) action sets based on the active tab.

### Clear Data on Tab Switch
Always `setData([])` in `onSelect` to avoid flashing stale rows from the previous tab.

### URL Sync
DataViews automatically syncs pagination, search, and tab state to URL query parameters. No manual `navigate()` calls needed.

---

## Reference Migrations

- **Scenario A:** `modules/store-support/src/js/vendor-dashboard/components/TicketsList.tsx` (branch: `refactor/support-tickets-vendor-table`) in dokan-pro repository. PR: https://github.com/getdokan/dokan-pro
- **Scenario B:** `src/frontend/coupons/components/CouponList.tsx` (branch: `refactor/coupons-dataviews-migration`) in dokan-pro repository. PR: https://github.com/getdokan/dokan-pro

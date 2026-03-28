---
name: dataviews-table-migration
description: Migrate Dokan Pro list/table views from the old Filter + StatusFilter + DataViews pattern to the new unified DataViews component with integrated tabs, filters, and search. Also covers building new DataViews lists from scratch. Use when refactoring any list page that uses the legacy pattern or creating a new list page.
---

# DataViews Table Guide

Migrate Dokan Pro list/table views from **old patterns** to a single `<DataViews>` with integrated `tabs`, `filter`, and `search` props — or build a new list from scratch.

## Base Branch

All migration work should be branched from and PR'd against: `refactor/coupons-dataviews-migration`

## When to Use

Trigger this skill when you see any of these old patterns:
- Separate `<Filter>` component from `@dokan/components`
- Custom `<StatusFilter>` component alongside DataViews
- `<DataViews>` with `defaultLayouts` prop but no `tabs`/`filter` props
- `search={false}` on DataViews (search handled externally via `<SimpleInput>`)
- Filter state managed in a separate `<Filter>` wrapper
- Separate tab/header components that switch between different list views via URL params or state
- Multiple list components for related data, conditionally rendered by a wrapper

## When NOT to Use

**Do not use this skill for `AdminDataViews` (admin panel tables).** Components importing `AdminDataViews as DataViews` from `@dokan/components` use a different component (`AdminDataViewTable`) with its own tab/filter API (`AdminTab`, `AdminFilter`). This skill only covers the vendor/frontend `DataViews` component (`DataViewTable`). Admin tables have a separate migration path.

Quick check: if the import is `AdminDataViews`, skip this skill.

## Migration Scenarios

Identify which scenario applies before starting:

### Scenario A: Status Tabs + Filters
A single list with status filtering (All / Open / Closed) and/or additional filters (customer, date range, search) managed by separate `<Filter>` and `<StatusFilter>` components.

**Migrate to:** One `<DataViews>` with `tabs` (status counts from API), `filter` (inline filter fields), and `search` (only if the old component had search).

### Scenario B: View-Type Tabs (Merging Multiple Lists)
Multiple separate list components toggled by an external tab/header component. Each list may have different columns, actions, and API endpoints.

**Migrate to:** One unified `<DataViews>` with `tabs` using a custom `viewKey`. Fields, actions, and fetch logic switch dynamically based on the active tab. Delete old separate components and the external tab switcher.

### Scenario C: New DataViews List (from scratch)
Building a brand-new list page that has no legacy code. Use the DataViews component directly with whichever props apply (tabs, filter, search, actions).

**Build:** A single `<DataViews>` component with the appropriate props. Follow the patterns in this skill for consistency across the codebase.

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
- **Scenario A:** `modules/store-support/src/js/vendor-dashboard/components/TicketsList.tsx`
- **Scenario B:** `src/frontend/coupons/components/CouponList.tsx`

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

## Building a New DataViews List (Scenario C)

Use this when creating a list page from scratch with no legacy code to migrate.

### Step 1: Define Types

Define the item type and any filter/status types:
```tsx
interface MyItem {
    id: number;
    title: string;
    status: string;
    created_at: string;
    // ...
}

type MyItemStatus = 'all' | 'active' | 'inactive';

interface FilterState {
    page: number;
    per_page: number;
    status: MyItemStatus;
    search: string;
    // add more as needed
}
```

### Step 2: Set Up View State

```tsx
const [data, setData] = useState<MyItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [totalItems, setTotalItems] = useState(0);
const [filterArgs, setFilterArgs] = useState<FilterState>({
    page: 1,
    per_page: 10,
    status: 'all',
    search: '',
});

const [view, setView] = useState({
    perPage: 10,
    page: 1,
    search: '',
    type: 'table',
    status: 'all',
});
```

### Step 3: Define Fields (Columns)

Each field needs `id`, `label`, and a `render` function. Set `enableSorting: false` unless the API supports sorting by that field.

```tsx
const fields = [
    {
        id: 'title',
        label: __('Title', 'dokan'),
        enableSorting: false,
        render: ({ item }: { item: MyItem }) => (
            <span className="text-dokan-link cursor-pointer">
                {item.title}
            </span>
        ),
    },
    {
        id: 'status',
        label: __('Status', 'dokan'),
        enableSorting: false,
        render: ({ item }: { item: MyItem }) => (
            <DokanBadge
                variant={item.status === 'active' ? 'success' : 'default'}
                label={capitalCase(item.status)}
            />
        ),
    },
    {
        id: 'created_at',
        label: __('Date', 'dokan'),
        enableSorting: false,
        render: ({ item }: { item: MyItem }) => (
            <DateTimeHtml.Date date={item.created_at} />
        ),
    },
];
```

### Step 4: Define Actions (optional)

```tsx
const actions = [
    {
        id: 'edit',
        label: () => __('Edit', 'dokan'),
        callback: ([item]: MyItem[]) => navigate(`/my-page/edit/${item.id}`),
    },
    {
        id: 'delete',
        label: () => __('Delete', 'dokan'),
        isDestructive: true,
        callback: ([item]: MyItem[]) => handleDelete(item.id),
    },
];
```

### Step 5: Define Tabs (optional)

**Status tabs** (with counts from API):
```tsx
const { statusCounts, fetchStatusCounts } = useStatusFilters();

const tabs = {
    items: statusCounts.map((s) => ({ ...s, value: s.key })),
    onSelect: (status: MyItemStatus) => {
        setFilterArgs((prev) => ({ ...prev, status, page: 1, search: '' }));
        setView((prev) => ({ ...prev, page: 1 }));
    },
};
```

**Static tabs** (no counts, custom viewKey):
```tsx
const tabs = {
    items: [
        { label: __('Tab A', 'dokan'), value: 'tab_a' },
        { label: __('Tab B', 'dokan'), value: 'tab_b' },
    ],
    viewKey: 'viewType',
    onSelect: (viewType) => {
        setData([]);
        setView((prev) => ({ ...prev, page: 1, search: '', viewType }));
    },
};
```

### Step 6: Define Filters (optional)

Only add if the list needs filter controls beyond tabs and search:
```tsx
const filter = {
    fields: [
        {
            id: 'date-range',
            label: __('Date Range', 'dokan'),
            field: (
                <DateRangeFilter
                    startDate={dateRange?.startDate ?? null}
                    endDate={dateRange?.endDate ?? null}
                    onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
                />
            ),
        },
    ],
    onReset: () => setDateRange(null),
    onFilterRemove: (id: string) => {
        if (id === 'date-range') setDateRange(null);
    },
};
```

### Step 7: Fetch Data

```tsx
const fetchData = async () => {
    setIsLoading(true);
    try {
        const queryArgs: Record<string, any> = {
            per_page: view.perPage,
            page: view.page,
        };
        if (filterArgs.status !== 'all') queryArgs.status = filterArgs.status;
        if (view.search) queryArgs.search = view.search;

        const response = await apiFetch({
            path: addQueryArgs('/dokan/v1/my-endpoint', queryArgs),
            parse: false,
        }) as Response;

        setData(await response.json());
        setTotalItems(parseInt(response.headers.get('X-WP-Total') ?? '0'));
    } catch (error) {
        toast({ type: 'error', title: error.message || __('Failed to fetch data', 'dokan') });
    } finally {
        setIsLoading(false);
    }
};

useEffect(() => {
    void fetchData();
    // void fetchStatusCounts();  // if using status tabs
}, [filterArgs, view.page, view.perPage, view.search]);
```

### Step 8: Handle View Changes

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

### Step 9: Render

```tsx
return (
    <DataViews
        namespace="my-list-data-view"
        data={data}
        fields={fields}
        view={view}
        onChangeView={onViewChange}
        getItemId={(item) => item.id}
        isLoading={isLoading}
        paginationInfo={{
            totalItems,
            totalPages: Math.ceil(totalItems / view.perPage),
        }}
        tabs={tabs}             // omit if no tabs needed
        filter={filter}         // omit if no filters needed
        search={true}           // omit or false if no search needed
        actions={actions}       // omit if no row actions needed
        onClickItem={(item) => navigate(`/my-page/${item.id}`)}  // optional
        isItemClickable={() => true}                              // optional
    />
);
```

### Checklist for New Lists

- [ ] Item type defined
- [ ] Fields array with `id`, `label`, `render`, `enableSorting: false`
- [ ] View state with `perPage`, `page`, `search`, `type: 'table'`
- [ ] Fetch function using `apiFetch` + `addQueryArgs`, reading `X-WP-Total` header
- [ ] `onChangeView` syncs view state to filter args
- [ ] `getItemId` returns unique identifier
- [ ] `paginationInfo` with `totalItems` and `totalPages`
- [ ] Tabs only if the list has meaningful groupings (status, type, etc.)
- [ ] Filters only if the list needs controls beyond tabs + search
- [ ] Search only if the API endpoint supports a `search` parameter
- [ ] Actions only if rows have operations (edit, delete, status toggle, etc.)
- [ ] Use `isDestructive: true` on destructive actions, plain text labels (no JSX)

---

## DataViews Props Reference

### `tabs`

```tsx
interface TabsProps {
    items: Tab[];
    onSelect?: (value: string) => void;
    defaultValue?: string;
    viewKey?: string;                  // default: 'status'
    headerContent?: React.ReactNode[];
}
```

`viewKey` controls which `view` property tabs sync to. Default is `'status'`. Use a custom value (e.g., `'viewType'`) when tabs don't represent status.

### `filter`

```tsx
interface DataViewFilterProps {
    fields: { id: string; label: string; field: React.ReactNode }[];
    onFilterRemove?: (filterId: string) => void;
    onReset?: () => void;
    className?: string;
    labels?: { removeFilter?: string; addFilter?: string; reset?: string };
}
```

### View Object

```tsx
{
    perPage: 10,
    page: 1,
    search: '',
    type: 'table',
    status: 'all',         // default tab key (Scenario A)
    viewType: 'tab_a',     // custom tab key (Scenario B) — name must match tabs.viewKey
    fields: ['col1', ...], // visible field IDs
}
```

### Actions

```tsx
interface Action<Item> {
    id: string;
    label: string | (() => string);  // plain text, not JSX
    disabled?: boolean;
    isEligible?: (item: Item) => boolean;
    isDestructive?: boolean;         // renders in danger style
    supportsBulk?: boolean;
    callback: (items: Item[]) => void;
}
```

---

## Common Patterns

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

- **Scenario A:** `modules/store-support/src/js/vendor-dashboard/components/TicketsList.tsx` (branch: `refactor/support-tickets-vendor-table`)
- **Scenario B:** `src/frontend/coupons/components/CouponList.tsx` (branch: `refactor/coupons-dataviews-migration`)

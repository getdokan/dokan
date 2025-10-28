# AdminDataViewTable (with Tabs and Filter)

This guide shows how to use the AdminDataViewTable component together with AdminTab-based Tabs and the AdminFilter system. It focuses on the admin-style DataViews experience where the Tabs bar and Filter UX are integrated.

Related docs:
- DataViews fundamentals: docs/frontend/dataviews.md
- DokanTab (vendor-facing tabs): docs/frontend/tab.md
- Filter (generic): docs/frontend/filter.md

## What is AdminDataViewTable?

AdminDataViewTable is a wrapper around the core DataViews that adds:
- Tab bar (using AdminTab) with an optional, auto-injected Filter button
- AdminFilter panel that supports dynamic “Add Filter” popover and Reset
- WordPress filter hooks to customize data, fields, actions, and tab appearance
- Responsive behavior (auto-switches to list view on small screens)

It is exported as AdminDataViews from the @dokan/components package.

```ts
import { AdminDataViews } from '@dokan/components';
```

## When to use this
- You are building an admin-style listing screen (e.g., Withdraw Requests, Vendors, Orders) and need Tabs + Filters + a paginated/sortable table.
- You want a compact Filter control that lives beside the Tabs and opens a popover to choose active filters.

## Key Props (AdminDataViews)

These are the most commonly used props. For full DataViews options, see docs/frontend/dataviews.md.

- namespace: string (required) – Unique key for hooks and DOM IDs
- view: View – Current view state for DataViews
- onChangeView: (view: View) => void – Update view state (sorting, layout, etc.)
- fields: Field<Item>[] – Column/field definitions for DataViews rows
- data: Item[] – Data to render
- actions?: Action<Item>[] – Row actions
- paginationInfo: { totalItems: number; totalPages: number }
- defaultLayouts: SupportedLayouts – Available DataViews layouts
- responsive?: boolean (default true) – If true, switches to list layout on narrow screens
- filter?: Omit<AdminFilterProps, 'namespace'> – AdminFilter configuration (see below)
- tabs?: Omit<AdminTabProps, 'variant' | 'namespace' | 'orientation'> – AdminTab configuration

Important: namespace is required. If Item doesn’t have an id field, supply getItemId(item) to return a unique string ID.

## Tabs + Filter Integration

If you pass both tabs and filter (with at least one filter field), AdminDataViews will:
- Inject a “Funnel” Filter button to the right side of the Tabs (unless you already add the same keyed button)
- Open a filter selection popover when no filters are active, or toggle the filter panel when filters are active
- Auto-hide the filter panel if all filters are removed

You can still pass your own additionalComponents to the Tabs; the Funnel button will be appended automatically when needed.

## AdminFilter fields shape

AdminFilter expects fields: Array<{ id: string; label: string; field: React.ReactNode }>
- id: Unique key for the filter
- label: Shown in the popover list when adding a filter
- field: The actual input UI (e.g., Select, DateRangePicker, SearchInput) that you render

AdminFilter wires its own “Remove” control per active filter and a global “Reset” button. You only need to update your external query state whenever these controls are used.

## Example: Putting it all together

Below is a minimal, self-contained example showing AdminDataViews with Tabs and Filter:

```tsx
import { useState, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
  AdminDataViews,
  AdminTab,        // only needed for types
  AdminFilter,     // only needed for types
  Select,
  DateRangePicker,
} from '@dokan/components';
import type {
  View,
  Field as DVField,
  Action as DVAction,
  SupportedLayouts,
} from '@wordpress/dataviews/src/types';

// Example item
type Row = { id: string; title: string; status: string; date: string };

export default function ExampleScreen() {
  const [view, setView] = useState<View>({ type: 'table', perPage: 20, page: 1 });
  const [status, setStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // DataViews fields (columns)
  const fields: DVField<Row>[] = useMemo(() => [
    { id: 'title', label: __('Title', 'dokan-lite'), getValue: (r) => r.title, enableHiding: false },
    { id: 'status', label: __('Status', 'dokan-lite'), getValue: (r) => r.status },
    { id: 'date', label: __('Date', 'dokan-lite'), getValue: (r) => r.date },
  ], []);

  // Example data & pagination (replace with your API state)
  const data: Row[] = useMemo(() => [
    { id: '1', title: 'Row A', status: 'pending', date: '2025-10-01' },
    { id: '2', title: 'Row B', status: 'approved', date: '2025-10-02' },
  ], []);

  const paginationInfo = { totalItems: 2, totalPages: 1 };
  const defaultLayouts: SupportedLayouts = { table: true, list: true, grid: false };

  // Tabs
  const tabs = [
    { name: 'all', title: __('All', 'dokan-lite') },
    { name: 'pending', title: __('Pending', 'dokan-lite') },
    { name: 'approved', title: __('Approved', 'dokan-lite') },
  ];

  const onSelectTab = useCallback((tabName: string) => {
    // Update your query state based on tab
    setStatus(tabName === 'all' ? '' : tabName);
  }, []);

  // AdminFilter config
  const filter = {
    fields: [
      {
        id: 'status',
        label: __('Status', 'dokan-lite'),
        field: (
          <Select
            value={status}
            options={[
              { label: __('All', 'dokan-lite'), value: '' },
              { label: __('Pending', 'dokan-lite'), value: 'pending' },
              { label: __('Approved', 'dokan-lite'), value: 'approved' },
            ]}
            onChange={(val: string) => setStatus(val)}
          />
        ),
      },
      {
        id: 'date',
        label: __('Date', 'dokan-lite'),
        field: (
          <DateRangePicker
            value={dateRange}
            onChange={(next) => setDateRange(next)}
          />
        ),
      },
    ],
    onReset: () => {
      setStatus('');
      setDateRange({});
    },
    onFilterRemove: (id: string) => {
      if (id === 'status') setStatus('');
      if (id === 'date') setDateRange({});
    },
  } satisfies Omit<React.ComponentProps<typeof AdminFilter>, 'namespace'>;

  // Optional: row click/navigation
  const onClickItem = (row: Row) => {
    // Navigate to row details if desired
  };

  return (
    <AdminDataViews<Row>
      namespace="withdraw_requests"
      view={view}
      onChangeView={setView}
      fields={fields}
      data={data}
      actions={[] as DVAction<Row>[]}
      paginationInfo={paginationInfo}
      defaultLayouts={defaultLayouts}
      tabs={{
        tabs,
        onSelect: onSelectTab,
        initialTabName: 'all',
        additionalComponents: [
          // Any extra buttons you want on the right of tabs
        ],
      }}
      filter={filter}
      getItemId={(r) => r.id}
      onClickItem={onClickItem}
      responsive
    />
  );
}
```

Notes:
- The Funnel button will show next to the tabs automatically because both tabs and filter.fields are provided.
- When no filters are active, clicking the Funnel button opens the “Add Filter” popover. When some filters are active, it toggles the filter panel.
- The filter panel auto-hides when all active filters are removed.

## Responsive behavior
When responsive is true (default), AdminDataViews forces the layout to list on narrow screens (<= 768px) and table otherwise.

## Available Hooks and Filters

AdminDataViewTable applies several WordPress filters so you can alter UI and behavior without changing code:

DataViews level (namespace is converted to snake_case):
- dokan_{namespace}_dataviews_data – filter the data array
- dokan_{namespace}_dataviews_view – filter the view object
- dokan_{namespace}_dataviews_fields – filter the DataViews column definitions
- dokan_{namespace}_dataviews_actions – filter the row actions

AdminFilter fields:
- dokan_admin_{namespace}_filters – modify the available filter field list

AdminTab styling and content:
- dokan_admin_{namespace}_tab_tabs – modify the tab items
- dokan_admin_{namespace}_tab_active_class – override the active tab class
- dokan_admin_{namespace}_tab_panel_class – override the TabPanel wrapper class

## Best Practices
- Always provide a unique namespace to isolate hooks and DOM IDs.
- Keep filter field components controlled by your screen’s state. Use onReset and onFilterRemove to clear those states.
- Use tabs.initialTabName and onSelect to sync tabs with your query.
- Use getItemId when your item doesn’t expose an id: string property.
- If you want your own control next to Tabs, add it via tabs.additionalComponents; the Funnel button will still be inserted when applicable.

## Troubleshooting
- Funnel button not showing: Ensure tabs is provided and filter.fields has at least one entry.
- Filter popover anchors incorrectly: AdminDataViews passes the Tabs Funnel button as the popover anchor initially; once filters exist, the anchor switches to the “Add Filter” button inside the filter panel.
- View stuck in list/table: If you override responsive={false}, manage the view.type yourself via onChangeView.

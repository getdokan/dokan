# Dokan DataView Table Documentation

- [Introduction](#introduction)
- [Quick Overview](#quick-overview)
- [1. Features](#1-role-specifix-controllers)
    - [Data Search](#data-search)
    - [Data Sort](#data-sort)
    - [Data Filter](#data-filter)
    - [Data Pagination](#data-pagination)
    - [Data Bulk Action](#data-bulk-action)
- [2. Data Properties](#2-data-properties)
    - [data](#data)
    - [namespace](#namespace)
    - [fields](#fields)
    - [actions](#actions)
    - [view](#view)
    - [paginationInfo](#pagination-info)
    - [onChangeView](#on-change-view)
    - [selection](#selection)
    - [onChangeSelection](#on-change-selection)
    - [defaultLayouts](#default-layouts)
    - [getItemId](#get-item-id)
    - [header](#header)

## Introduction
This documentation describes the usage of the dokan `DataViewTable` components in vendor dashboard.
Also, an example component are designed to interact with WordPress REST APIs and provide a data management interface for vendor dashboard.

## Quick Overview

### Step 1: Initiate a route for the DataViewTable component

To use the `DataViewTable` component, we need to register the necessary assets for handling route in `Dokan`. Make sure to include the necessary dependencies while registering the component.

**Important:** For Dokan, you must add dependencies name **dokan-react-components** to your scripts where needed.  

**Example:**

```js
$script_assets = 'add your script assets path here';

if ( file_exists( $script_assets ) ) {
    $vendor_asset = require $script_assets;
    $version      = $vendor_asset['version'] ?? '';

    // Add dokan-react-components as a dependency for the vendor script.
    $component_handle = 'dokan-react-components';
    $dependencies     = $vendor_asset['dependencies'] ?? [];
    $dependencies[]   = $component_handle;

    wp_register_script(
        'handler-name',
        'path to your script file',
        $dependencies,
        $version,
        true
    );

    wp_register_style(
        'handler-name',
        'path to your style file',
        [ $component_handle ],
        $version
);
}
```

### Step 2: Initiate a route for the DataViewTable component.

```js
import domReady from '@wordpress/dom-ready';

domReady(() => {
    wp.hooks.addFilter(
        'dokan-dashboard-routes',
        'dokan-data-view-table',
        ( routes ) => {
            routes.push( {
                id: 'dokan-data-view-table',
                title: __( 'Dokan Data Views', 'dokan' ),
                element: WPostsDataView,
                path: '/dataviews',
                exact: true,
                order: 10,
                parent: '',
            } );
    
            return routes;
        }
    );
});
```

### Step 3: Create a DataViewTable component.

In `Dokan Pro`, we can use the `DataViews` component from the `@dokan/components` package. For the free version, we can import `DataViews` from the `src/components` (`lite`) directory.  

All the (free version) global components are available in `@dokan/components` package.

```js
import { addQueryArgs } from "@wordpress/url";
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from "@wordpress/element";
import {
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack, Button
} from "@wordpress/components";

// For dokan-pro, we will import the `DataViews` component from the @dokan/components package. Otherwise, in free version we will import from the `src/components` directory.
import { DataViews, useWindowDimensions } from '@dokan/components';

const WPostsDataView = ({ navigate }) => {
    const [ data, setData ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ totalPosts, setTotalPosts ] = useState(0);
    const { width: windowWidth } = useWindowDimensions();

    // Define the available post statuses which will be use for filter.
    const POST_STATUSES = [
        { value: 'publish', label: __( 'Published', 'dokan' ) },
        { value: 'draft', label: __( 'Draft', 'dokan' ) },
        { value: 'pending', label: __( 'Pending Review', 'dokan' ) },
        { value: 'private', label: __( 'Private', 'dokan' ) },
        { value: 'trash', label: __( 'Trash', 'dokan' ) }
    ];

    // Define fields for handle the table columns.
    const fields = [
        {
            id: 'post_id',
            label: __( 'Post ID', 'dokan' ),
            render: ({ item }) => (
                <div>
                    <span
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/posts/${item.id}`)}
                    >{ item.title.rendered }</span>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'title',
            label: __( 'Title', 'dokan' ),
            enableGlobalSearch: true,
            enableSorting: true,
            render: ({ item }) => item.title.rendered,
        },
        {
            id: 'post_status',
            label: __( 'Status', 'dokan' ),
            enableGlobalSearch: true,
            getValue: ({ item }) => // modify value if needed when filter or sorting applied
                POST_STATUSES.find(({ value }) => value === item.status)?.value ??
                item.status,
            elements: POST_STATUSES,
            filterBy: {
                operators: [ 'isAny', 'isNone', 'isAll', 'isNotAll' ],
            },
            render: ({ item }) => capitalizeFirstLetter( item.status ),
        },
        {
            id: 'author',
            label: 'Author',
            enableGlobalSearch: true,
            render: ({ item }) => item.author_name,
        },
        {
            id: 'date',
            label: 'Date',
            enableGlobalSearch: true,
            render: ({ item }) => new Date(item.date).toLocaleDateString(),
        },
    ];

    // Define necessary actions for the table rows.
    const actions = [
        {
            id: 'post-edit',
            label: 'Edit',
            icon: 'edit',
            isPrimary: true,
            callback: (posts) => {
                const post = posts[0];
                navigate(`/posts/${post.id}/edit`);
            },
        },
        {
            id: 'post-delete',
            label: 'Delete',
            icon: 'trash',
            isPrimary: true,
            supportsBulk: true,
            RenderModal: ({ items: [item], closeModal }) => (
                <VStack spacing="5">
                    <Text>
                        { sprintf( __( 'Are you sure you want to delete "%s"?', 'dokan' ), item.title.rendered ) }
                    </Text>
                    <HStack justify="right">
                        <Button
                            variant="outline"
                            onClick={closeModal}
                        >{ __( 'Cancel', 'dokan' ) }</Button>
                        <Button
                            __next40pxDefaultSize
                            variant="primary"
                            onClick={ async () => {
                                try {
                                    const response = await fetch(`/wp-json/wp/v2/posts/${item.id}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'X-WP-Nonce': wpApiSettings.nonce,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    if (!response.ok) throw new Error('Failed to delete post');

                                    fetchPosts();
                                    closeModal();
                                } catch (error) {
                                    console.error('Error deleting post:', error);
                                }
                            } }
                        >{ __( 'Delete', 'dokan' ) }</Button>
                    </HStack>
                </VStack>
            ),
        },
    ];

    // Set for handle bulk selection.
    const [selection, setSelection] = useState([]);

    // Use for capitalize the first letter of a word, you can user as per feature requirement.
    const capitalizeFirstLetter = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    // Set data view default layout. We can hide priew by not passing the layout prop.
    const defaultLayouts = {
        table: {},
        grid: {},
        list: {},
        density: 'comfortable', // Use density pre-defined values: comfortable, compact, cozy
    };

    // Set view state for handle the table view, we can take decision based on the view state.
    // We can handle the pagination, search, sort, layout, fields etc.
    const [view, setView] = useState({
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'post_id',
        status: 'publish,pending,draft',
        layout: { ...defaultLayouts },
        fields: fields.map(field => field.id !== 'post_id' ? field.id : ''), // we can ignore the representing title field
    });

    // Handle data fetching from the server.
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            // Set query arguments for the post fetching.
            const queryArgs = {
                per_page: view?.perPage ?? 10,
                page: view?.page ?? 1,
                search: view?.search ?? '',
                status: view?.status ?? 'publish,pending,draft',
                _embed: true,
            }

            // Set sorting arguments for the post order by. Like: title, date, author etc.
            if ( !! view?.sort?.field ) {
                queryArgs.orderby = view?.sort?.field ?? 'title';
            }

            // Set sorting arguments for the post order. Like: asc, desc
            if ( !! view?.sort?.direction ) {
                queryArgs.order = view?.sort?.direction ?? 'desc';
            }

            // Set filter arguments for the post status. Like: publish, draft, pending etc.
            if ( !! view?.filters ) {
                view?.filters?.forEach( filter => {
                    if ( filter.field === 'post_status' && filter.operator === 'isAny' ) {
                        queryArgs.status = filter?.value?.join(',');
                    }
                } )
            }

            // Fetch data from the REST API using the query arguments.
            const response = await fetch(
                addQueryArgs('/wp-json/wp/v2/posts', { ...queryArgs }),
                {
                    headers: {
                        'X-WP-Nonce': wpApiSettings.nonce,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                }
            );

            const posts = await response.json();
            const totalPosts = parseInt(response.headers.get('X-WP-Total')); // Get total posts count from the header.

            const enhancedPosts = posts.map(post => ({
                ...post,
                author_name: post._embedded?.author?.[0]?.name ?? 'Unknown'
            }));

            setTotalPosts(totalPosts); // Set total posts count.
            setData(enhancedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch posts when view changes
    useEffect(() => {
        fetchPosts();
    }, [view]);

    // Set view type `list` for mobile device.
    useEffect(() => setView({
        ...view,
        type: windowWidth <= 768 ? 'list' : 'table',
    }), [windowWidth]);

    return (
        <DataViews
            data={data}
            namespace='dokan-post-data-view'
            defaultLayouts={{ ...defaultLayouts }}
            fields={fields}
            getItemId={(item) => item.id}
            onChangeView={setView}
            paginationInfo={{
                // Set pagination information for the table.
                totalItems: totalPosts,
                totalPages: Math.ceil( totalPosts / view.perPage ),
            }}
            view={view}
            selection={selection}
            onChangeSelection={setSelection}
            actions={actions}
            isLoading={isLoading}
            // Set header for the DataViewTable component.
            header={
                <Button
                    isPrimary
                    className={'!bg-dokan-btn'}
                    onClick={() => navigate('/posts/new')}
                >
                    { __( 'Add New Post', 'dokan' ) }
                </Button>
            }
        />
    );
};

export default WPostsDataView;
```

### Output:

<a href="https://ibb.co.com/cQxf7Hn"><img src="https://i.ibb.co.com/JHC6M4J/test-imbb.png" alt="test-imbb" border="0"></a>

## Features of DataViewTable

### Data Search
To enable search filtering, set the `enableGlobalSearch` property to `true` for the desired fields.
Set an initial `search` property in the `view` state to manage the search query.
In the `data fetching` method, include the `search` property in the query arguments.

**N:B:-** Need to handle the search query in the server-side REST API.

#### ~ Set `enableGlobalSearch` property to `true` for the desired fields.
```js
const fields = [
    {
        id: 'title',
        label: __( 'Title', 'dokan' ),
        enableGlobalSearch: true, // Enable search for this field
        render: ({ item }) => item.title.rendered,
    },
    // Add additional fields as needed
];
```

#### ~ Set search initial state to `view`.
```js
const [ view, setView ] = useState({
    search: '', // Initialize search query
    ... // Add additional view properties
});
```

#### ~ Set search to `queryArgs` for fetching searchable data.
```js
// Set query arguments for the post fetching.
const queryArgs = {
    search: view.search,
    ... // Add additional view properties
};

// apifetch data from the REST API using the prepared queryArgs.
```

### Output:

<a href="https://ibb.co.com/tPs6RGX"><img src="https://i.ibb.co.com/Fqw1prV/Screenshot-2024-12-26-at-11-22-02-AM.png" alt="Screenshot-2024-12-26-at-11-22-02-AM" border="0"></a>

### Data Sort
To enable `sorting` functionality for specific columns in the `DataViewTable`, you need to configure both the field definitions and handle the sorting parameters in your data fetching logic.

`Enable sorting for fields:` by setting the `enableSorting` property to `true` for the desired fields.  
`Handle sort in data fetching:` The DataViewTable component manages sorting state through the `view` object. Include the sorting parameters in your API query. When sorting is triggered, `view` updates the following properties:  
`getValue (optional):` It returns the value of a field. It can be used to modify the value when filter or sorting is applied.

`view.sort.field:` The field ID being sorted  
`view.sort.direction:` The sort direction ('asc' or 'desc')

**N:B:-** Need to handle the sort query in the server-side REST API.

#### ~ Set `enableSorting` property to `true` for the desired fields.
```js
const fields = [
    {
        id: 'title',
        label: __( 'Title', 'dokan' ),
        enableSorting: true, // Enable sorting for this field. As default sorting is enabled. We can make it false if we don't want to sort.
        render: ({ item }) => item.title.rendered,
    },
    // Add additional fields as needed
];
```

#### ~ Set sort initial state to `view`.
```js
// We can set the initial sort field and direction in the view state if needed.
const [ view, setView ] = useState({
    sort: {
        field: 'title', // Initial sort field
        direction: 'desc', // Initial sort direction
    },
    ... // Add additional view properties
});
```

#### ~ Set sortable queries to `queryArgs` for fetching sortable data.
```js
// Set query arguments for the post fetching.
const queryArgs = { ...args }

// Set sorting arguments for the post order by. Like: title, date, author etc.
if ( !! view?.sort?.field ) {
    queryArgs.orderby = view?.sort?.field ?? 'title';
}

// Set sorting arguments for the post order. Like: asc, desc
if ( !! view?.sort?.direction ) {
    queryArgs.order = view?.sort?.direction ?? 'desc';
}

// apifetch data from the REST API using the prepared queryArgs.
```

### Output:

<a href="https://ibb.co.com/YfyLf6N"><img src="https://i.ibb.co.com/Dw8RwN1/Screenshot-2024-12-26-at-11-25-33-AM.png" alt="Screenshot-2024-12-26-at-11-25-33-AM" border="0"></a>

### Data Filter
To enable `filtering` functionality for specific columns in the `DataViewTable`, configure filter options in your field definitions and handle filter parameters in the data fetching logic.

`Enable filter for fields:` by setting the `elements` & `filterBy` property for the desired fields.

**elements:** List of valid values for filtering field. If provided, it creates a DataView's filter for the field.  
**filterBy:** Configuration of the filters. Setup conditions for filtering the field. Like: `isAny`, `isNone`, `isAll`, `isNotAll` etc.  
[Get More Details](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#filterby)  
**getValue (optional):** It returns the value of a field. It can be used to modify the value when filter or sorting is applied.

`Handle filter in data fetching:` The DataViewTable component manages filtering state through the `view` object. Include the filtering parameters in your API query. When filter is triggered, `view` updates the following properties:  
`view.filters:` It returns the array of filter object. Each filter object contains the `field` & `operator` property. We can handle the data filtering based on the filter object.

**N:B:-** Need to handle the filter query in the server-side REST API.

#### ~ Configure filter options for fields.
```js
// Define the available options which will be use for filter.
const POST_STATUSES = [
    { value: 'publish', label: __( 'Published', 'dokan' ) },
    // ... rest of the option list.
];

const fields = [
    {
        id: 'post_status',
        label: __( 'Status', 'dokan' ),
        getValue: ({ item }) => // modify value if needed when filter applied
            POST_STATUSES.find(({ value }) => value === item.status )?.value ??
            item.status,
        elements: POST_STATUSES, // Define available filter options
        filterBy: {
            operators: [ 'isAny', 'isNone', 'isAll', 'isNotAll' ], // Define filter operators
        },
        render: ({ item }) => item.status,
    },
    // Add additional fields as needed
];
```

#### ~ Initiate filtering state to `view`.
```js
// We can set the initial sort field and direction in the view state if needed.
const [ view, setView ] = useState({
    status: 'publish,pending,draft', // Initial filter status
    ... // Add additional view properties
});
```

#### ~ Set queries to `queryArgs` for fetching filtered data.
```js
// Set query arguments for the post fetching.
const queryArgs = { ...args }

// Set filter arguments for the post status.
if ( !! view?.filters ) {
    view?.filters?.forEach( filter => {
        if ( filter.field === 'post_status' && filter.operator === 'isAny' ) { // here the filter.field value will be the field id what we assigned in the fields element.
            queryArgs.status = filter?.value?.join( ',' );
        }
    })
}

// Fetch data using the prepared queryArgs.
```

### Output:

<a href="https://ibb.co.com/hc3PxqF"><img src="https://i.ibb.co.com/qCTtLZY/Screenshot-2024-12-26-at-12-10-09-PM.png" alt="Screenshot-2024-12-26-at-12-10-09-PM" border="0"></a>

### Data Pagination
The `DataViewTable` component includes built-in pagination functionality. Configure pagination parameters and handle them in your data fetching logic.  

We need to control `paginationInfo` props for calculate `total pagination item & pages`. Also, we need to set `perPage` & `page` in the `view` state for manage the pagination.

#### ~ Set pagination state in view.
```js
const [ view, setView ] = useState({
    perPage: 10, // Items per page
    page: 1,    // Current page
    // ... other view properties
});
```

#### ~ Configure pagination info in dataviews
```js
<DataViews
    // ... other props
    paginationInfo={{
        totalItems: totalPosts,
        totalPages: Math.ceil( totalPosts / view.perPage ),
    }}
/>
```

#### ~ Set paginated query to `queryArgs` for fetching data.
```js
// Set query arguments for the post fetching.
const queryArgs = {
    per_page: view?.perPage ?? 10,
    page: view?.page ?? 1,
    // ... other query args
}

// apifetch data from the REST API using the prepared queryArgs.
```

### Output:

<a href="https://ibb.co.com/7vX8YPy"><img src="https://i.ibb.co.com/XXbN21J/Screenshot-2024-12-26-at-12-35-47-PM.png" alt="Screenshot-2024-12-26-at-12-35-47-PM" border="0"></a>

### Data Bulk Action
Enable bulk actions on selected items in the `DataViewTable`. We need to configure action definitions and handle bulk operations.

We need to enable `supportsBulk` props in table `actions` for handle the bulk actions. Also, we need to set `selection` & `onChangeSelection` in the `view` state for manage the bulk selection. We can set `isPrimary` for handling action shortly in `actions` column. 

#### ~ Define actions with bulk support
```js
const actions = [
    {
        id: 'post-delete',
        label: 'Delete',
        icon: 'trash',
        isPrimary: true,
        supportsBulk: true, // Enable bulk action support
        RenderModal: ({ items: [item], closeModal }) => {
            // render modal or popup for bulk action confirmation & handle the action
            // re-fetch data after action completion for update the table
        },
    }
];
```

#### ~ Handle selection state for bulk selections.
```js
// Set up selection state.
const [ selection, setSelection ] = useState( [] );

// Pass selection props to DataViews.
<DataViews
    // ... other props
    selection={selection}
    onChangeSelection={setSelection}
    actions={actions}
/>
```

#### ~ Set paginated query to `queryArgs` for fetching data.
```js
// Set query arguments for the post fetching.
const queryArgs = {
    per_page: view?.perPage ?? 10,
    page: view?.page ?? 1,
    // ... other query args
}

// apifetch data from the REST API using the prepared queryArgs.
```

### Output:

<a href="https://ibb.co.com/WvYF97S"><img src="https://i.ibb.co.com/B2SjDv8/Screenshot-2024-12-26-at-12-54-30-PM.png" alt="Screenshot-2024-12-26-at-12-54-30-PM" border="0"></a>

## Data Properties

### data

The data storage of the `DataViewTable` component. It should be `one-dimensional` array of objects.  
Each record should have an `id` that identifies them uniquely. If they don’t, the consumer should provide the `getItemId` property to `DataViews`: a function that returns an unique identifier for the record.

### namespace

The `namespace` is a unique identifier for the `DataViewTable` table component. We introduce filtering options using that identifier.  
If we can want to modify a table from the outside of module or feature, we can use it.

    const applyFiltersToTableElements = (namespace: string, elementName: string, element) => {
        return wp.hooks.applyFilters( `${namespace}.${elementName}`, element );
    };

    const filteredProps = {
        ...props,
        data: applyFiltersToTableElements( props?.namespace, 'data', props.data ),
        view: applyFiltersToTableElements( props?.namespace, 'view', props.view ),
        fields: applyFiltersToTableElements( props?.namespace, 'fields', props.fields ),
        actions: applyFiltersToTableElements( props?.namespace, 'actions', props.actions ),
    };

    <div id="dokan-dashboard-datatable">
        {/* Before dokan data table rendered slot */}
        <Slot name={ `dokan-before-vendor-data-table-${ props?.namespace }` } fillProps={{ ...filteredProps }} />
        <DataViews { ...filteredProps } />
        {/* After dokan data table rendered slot */}
        <Slot name={ `dokan-before-vendor-data-table-${ props?.namespace }` } fillProps={{ ...filteredProps }} />
    </div>

### fields

The `fields` describe the visible items for each record in the dataset and how they behave (how to sort them, display them, etc.).

**id (string) :** The unique identifier of the field. We can use this identifier to handle the field in the `DataViewTable`.  

**label (string) :** The field’s name. This will be used across the UI.  

**enableGlobalSearch (bool) :** Enable searching for each field. Defaults to `false`.

**enableSorting (bool) :** Enable sorting (`asc/desc`) options for each field. Defaults to `true`.  

**elements (array) :** Enable filtering for current field. The value should be an array. There have another property `filterBy` for handle the filter condition.

**filterBy (bool) :** We can configure the filter condition for the field. It should be an array. The available operators are: `isAny`, `isNone`, `isAll`, `isNotAll`. [More Details](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#filterby)  

**getValue (ReactNode):** It returns the value of a field. This property can be used to modify the value when sorting or filtering is applied.

**render (ReactNode):** The function that renders the field. It receives the item as a parameter and should return a ReactNode. If need to handle the field value before render, we can use this property.

### actions

The `actions` define the available operations that can be performed on records in the dataset. Each action can be configured for individual or bulk operations.

**id (string) :** The unique identifier for the action. Used to handle and identify specific `actions` in the `DataViewTable`.  

**label (string) :** The action's display name. This text appears in the UI, typically in the tooltip of action button.  

**icon (string) :** The icon identifier to be displayed alongside the action. We can use `dashicon` classes for icons. Also, we can use ReactNode.  

**isPrimary (bool) :** When set to `true`, the action appears directly in the actions column of the table. If false, the action is placed in a dropdown menu. Defaults to `false`.

**supportsBulk (bool) :** Enable bulk operation support for this action. When `true`, the action can be performed on multiple items. Defaults to `false`.  

**callback (function) :** The function to be executed when the action is triggered. Receives the selected item(s) as a parameter.  
When we need to click & redirect action to another page, we can use this property. When we need to click \& redirect action to another page, we can use this property. However, if we use the `RenderModal` property, then the `callback` property will not work.

**RenderModal (ReactNode) :** A React component that renders a confirmation modal or custom UI for the action. Receives props:

    items: Array of selected items
    closeModal: Function to close the modal

### view

The `view` object controls the current state of the `DataViewTable` component. It manages various aspects like `pagination`, `search`, `sorting`, `filtering`, `layout` settings & more.  

**perPage (number) :** Number of items to display per page. Used for pagination control.  

**page (number) :** Current active page number. Used in conjunction with `perPage` for `pagination`.  

**search (string) :** Current search query string for global search functionality.

**type (string) :** The current `view` type. Available options: `table` | `grid` | `list`. Defaults to `table`.

    'table': Display data in tabular format
    'grid': Display data in grid layout
    'list': Display data in list format

**titleField (string) :** Specifies which field should be used as the main `title` in different view types.  

**descriptionField (string) :** Specifies which field should be used as the main `description` in different view types.

**showMedia (string) :** Specifies which field should be used as the main `description` in different view types.  

**layout (object) :** Configuration for the layout options:

    'table': Display data in tabular format
    'grid': Display data in grid layout
    'list': Display data in list format

**fields (array) :** List of visible field IDs. Can be used to control which columns are displayed.  
We can take decision before the field rendered. Specially, we can ignore the representing field/fields.

**sort (object) :** Handle sorting configuration:
    
    sort: {
        field: 'title',    // Field ID to sort by
        direction: 'desc'  // Sort direction ('asc' or 'desc')
    }

**filters (array) :** Array of active filters:

    filters: [
        {
            field: 'post_status', // Field ID to filter by
            operator: 'isAny',     // Filter operator
            value: ['publish']     // Filter value
        }
    ]

### paginationInfo

The `paginationInfo` object provides essential `pagination metadata` for the `DataViewTable` component. It helps manage and display `pagination controls` by defining the total number of items and pages.

**totalItems (number) :** The total number of items in the dataset across all pages. Used to:

    1. Calculate total number of pages
    2. Display item count information (e.g., "Showing 1-10 of 100")
    3. Enable/disable pagination controls

**totalPages (number) :** Total number of available pages based on `totalItems` and items per page. Used to:

    1. Control pagination navigation limits
    2. Enable/disable next/previous buttons
    3. Display page number controls

**Example Usage :**

    <DataViews
        // ... other props
        paginationInfo={{
            totalItems: totalPosts,  // Total number of items in dataset
            totalPages: Math.ceil(totalPosts / view.perPage),  // Calculate total pages
        }}
    />


### onChangeView

The `onChangeView` is a `callback function` that handles changes to the `view` state of the `DataViewTable` component. This function is triggered whenever there's a change in `view` settings like `pagination`, `sorting`, `filtering`, `layout` changes, etc.

### selection

The selection property maintains the state of `selected items` in the `DataViewTable`. It's an array, which is containing the bulk selected items.

### onChangeSelection

A `callback function` triggered when `item selection changes` in the table. Receives an array of `selected item IDs`.

### defaultLayouts

Configures the default layout options for the `DataViewTable`. Defines available view types and their settings. Properties: `table`, `grid`, `list`. Also, we can set the `density` for the table view. 

### getItemId

A `callback function` that returns the unique identifier for a record. It's used when the record doesn't have an `id` field. Receives the record as a parameter and should return a unique identifier.

### header

The `header` property allows you to add a custom header to the `DataViewTable` component. It can be a ReactNode or a custom component. Used to display additional content or actions above the table.

#### Output:

<a href="https://ibb.co.com/g4hRMYc"><img src="https://i.ibb.co.com/8Yt7DkQ/Screenshot-2024-12-26-at-11-07-10-PM.png" alt="Screenshot-2024-12-26-at-11-07-10-PM" border="0"></a><br /><a target='_blank' href='https://imgbb.com/'></a><br />

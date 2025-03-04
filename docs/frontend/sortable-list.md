# Dokan Sortable List Component Documentation

- [Introduction](#introduction)
- [Data Structures](#data-structures)
- [Important Dependencies](#important-dependencies)
- [Quick Overview](#quick-overview)
- [Key Features](#key-features)
- [Component Properties](#component-properties)

## Introduction
The Dokan `SortableList` component provide a `flexible` and `reusable` `drag-and-drop` interface for managing `sortable lists`, `grids`, and `horizontal` layouts. Built on top of `@dnd-kit`, these components offer seamless integration with `Dokan's` existing component ecosystem.

## Data Structures
The `SortableList` component accommodates an `array` data type for its `items` property, which can follow `three primary array data structure patterns`:

### 1. Simple Array
Basic array of `primitive` values without additional `properties`.

```tsx
const [ simpleItems, setSimpleItems ] = useState([
    __( 'Item 1', 'dokan-lite' ),
    __( 'Item 2', 'dokan-lite' ),
    __( 'Item 3', 'dokan-lite' )
]);

const handleOrderUpdate = ( updatedItems ) => {
    setSimpleItems( [ ...updatedItems ] ); // Update items array.
    console.log( updatedItems ); // Get updated items array.
    // Handle any additional logic after order update
};

<SortableList
    items={ simpleItems }
    onChange={ handleOrderUpdate }
    namespace={ 'dokan-sortable-list' } // Unique namespace
    renderItem={ ( item ) => (
        <div className='p-4 bg-white shadow rounded'>
            { item }
        </div>
    )}
    ...
/>
```

### 2. Array of Objects (Without Order)
`Array of objects` with basic properties but `no explicit order tracking`.

```tsx
const [ objectItems, setObjectItems ] = useState([
    { id: 1, name: __( 'Item 1', 'dokan-lite' ) },
    { id: 2, name: __( 'Item 2', 'dokan-lite' ) },
    { id: 3, name: __( 'Item 3', 'dokan-lite' ) }
]);

const handleOrderUpdate = ( updatedItems ) => {
    setObjectItems( [ ...updatedItems ] ); // Update items array.
    console.log( updatedItems ); // Get updated items array.
    // Handle any additional logic after order update
};

<SortableList
    items={ objectItems }
    onChange={ handleOrderUpdate }
    namespace={ 'dokan-sortable-list' } // Unique namespace
    renderItem={ ( item ) => (
        <div className='p-4 bg-white shadow rounded'>
            { item.name }
        </div>
    )}
    ...
/>
```

### 3. Array of Objects (With Order)
`Array of objects` that include an order property for `explicit order tracking`.

```tsx
const [ orderedItems, setOrderedItems ] = useState([
    { id: 1, title: 'First Task', content: __( 'Do something', 'dokan-lite' ), sort_order: 1 },
    { id: 2, title: 'Second Task', content: __( 'Do something else', 'dokan-lite' ), sort_order: 2 },
    { id: 3, title: 'Third Task', content: __( 'Another task', 'dokan-lite' ), sort_order: 3 }
]);

const handleOrderUpdate = ( updatedItems ) => {
    setOrderedItems( [ ...updatedItems ] ); // Update items array.
    console.log( updatedItems ); // Get updated items array.
    // Handle any additional logic after order update
};

<SortableList
    items={ orderedItems }
    orderProperty='sort_order'
    onChange={ handleOrderUpdate }
    namespace={ 'dokan-sortable-list' } // Unique namespace
    renderItem={ ( item ) => (
        <div className='p-4 bg-white shadow rounded'>
            <h3>{ item.title }</h3>
            <p>{ item.content }</p>
            <span>{ item.sort_order }</span>
        </div>
    )}
    ...
/>
```

## Important Dependencies
For both `Dokan Free and Pro` versions, we must register the `dokan-react-components` dependency when using `global` components.

## Quick Overview

#### Step 1: Import the Required Components

```tsx
import { useState } from '@wordpress/element';
import SortableList from '@dokan/components/sortable-list';
```

#### Step 2: Set Up Your State Management

```tsx
// DS-1: Example for single array
// const [ items, setItems ] = useState( [ 1, 2, 3, 4, 5 ] ); // Example for single array

// DS-2: Example for single array of objects without ordering.
// const [ items, setItems ] = useState([
//     { id: 1, name: 'Item 1' },
//     { id: 2, name: 'Item 2' },
//     { id: 3, name: 'Item 3' },
// ]);

// DS-3: Example for single array of objects with ordering.
const [ items, setItems ] = useState([
    { id: 1, title: 'First Task', content: 'Do something', sort_order: 1 },
    { id: 2, title: 'Second Task', content: 'Do something else', sort_order: 2 },
]);

const handleOrderUpdate = ( updatedItems ) => {
    setItems( updatedItems );
    // Handle any additional logic after order update
};
```

#### Step 3: Implement the Render Function

```tsx
const renderItem = ( item ) => (
    <div className="p-4 bg-white shadow rounded border">
        <h3 className="font-bold">{ item.title }</h3>
        <p className="text-gray-600">{ item.content }</p>
    </div>
);
```

#### Step 4: Use the SortableList Component

```tsx
<SortableList
    items={ items }
    namespace="your-unique-namespace"
    onChange={ handleOrderUpdate }
    renderItem={ renderItem }
    strategy="horizontal" // default is "vertical", other options are "grid".
    className="w-full max-w-md mx-auto"
    orderProperty="sort_order"
/>
```

### Key Features

- **Drag and Drop Interface**
- **Multiple Layouts (Vertical List, Horizontal List, Grid Layout)**
- **Sorting Order Management**
- **Customizable Items**

### Component Properties

#### SortableList Props

**items (array):** The data array to be `rendered` in the `sortable` list. Can be an array of `single items`, array of `objects` with or without `ordering`.

**namespace (string):** Unique identifier for the `sortable container`. Used for filtering and slots.

**onChange (function):** Callback function triggered when `item order changes`. Receives the `updated items array` as an argument.

**renderItem (function):** Function to `render individual items`. Receives the `item` as an argument.

**orderProperty (string):** Property name used to track item `order` in `array of objects`.

**strategy (string):** `Layout strategy` for the `list`. Options are `vertical`, `horizontal`, and `grid`.

**className (string):** `Additional CSS classes` for the `container`.

**gridColumns (string):** `Number of columns` for `grid layout`. Default is `4`.

**id (string | number):** `Unique identifier` for the `sortable item`. Optional property.

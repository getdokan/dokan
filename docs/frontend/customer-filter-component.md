# CustomerFilter Component

The CustomerFilter component provides a standardized way to filter content by customer across your application. It allows users to search and select customers from a dropdown interface.

## Features

- Customer search with autocomplete
- Selected customer display and management
- Consistent interface across different views

## Installation

```jsx
import { CustomerFilter } from '@dokan/components';
```

#### Usage

```jsx
const [selectedCustomer, setSelectedCustomer] = useState({});

<CustomerFilter
  id="dokan-filter-by-customer"
  value={selectedCustomer}
  onChange={(selected) => {
    setSelectedCustomer(selected);
  }}
/>
```

#### Props

| Prop                  | Type       | Required | Description                                                                |
|-----------------------|------------|----------|----------------------------------------------------------------------------|
| `id`                  | `string`   | Yes      | Unique identifier for the filter group                                     |
| `value`               | `object`   | Yes      | Currently selected customer object with `label` and `value` properties     |
| `onChange` | `function` | Yes      | Callback function to update the selected customer                          |
| `placeholder`         | `string`   | no       | Custom placeholder text for the search input |
| `label`         | `string`   | no       | Custom label text for the search input  |

#### Selected Customer Object Structure

```jsx
interface SelectedCustomer {
  label: string;  // Display name of the customer
  value: string;  // Customer ID
}
```

#### Example Implementation

```jsx
import { useState } from '@wordpress/element';
import { CustomerFilter } from '@dokan/components';
const OrdersList = () => {
  const [selectedCustomer, setSelectedCustomer] = useState({});

  return (
    <div>
      <CustomerFilter
        id="dokan-filter-by-customer"
        value={selectedCustomer}
        onChange={(selected) => {
          setSelectedCustomer(selected);
        }}
        placeholder={ __( 'Search', 'dokan' ) }
        label={ __( 'Filter By Registered Customer', 'dokan' ) }
      />
    </div>
  );
};
```

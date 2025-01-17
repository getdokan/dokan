# Filter Component

The Filter component provides a standardized way to implement filtering functionality across your application. It creates a consistent user experience by managing filter fields, filter triggers, and reset functionality.

## Features

- Unified interface for multiple filter fields
- Configurable filter and reset buttons
- Namespace support for unique identification
- Flexible field composition

## Installation

#### Dokan lite

```jsx
import Filter from '../components';
```

#### Dokan pro or external plugins

```jsx
import { Filter } from '@dokan/components';
```

## Usage

```jsx
<Filter
    fields={[
        <CustomerFilter key="customer_filter" {...props} />,
        <DateFilter key="date_filter" {...props} />
    ]}
    onFilter={handleFilter}
    onReset={clearFilter}
    showFilter={true}
    showReset={true}
    namespace="product_table_filters"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `string` | Yes | Unique identifier for the filter group |
| `fields` | `ReactNode[]` | No | Array of filter field components to be rendered |
| `onFilter` | `() => void` | No | Handler function called when the filter button is clicked |
| `onReset` | `() => void` | No | Handler function called when the reset button is clicked |
| `showFilter` | `boolean` | No | Controls visibility of the filter button (default: true) |
| `showReset` | `boolean` | No | Controls visibility of the reset button (default: true) |

## Example Implementation

```jsx
import { Filter, CustomerFilter, DateFilter } from '@your-package/components';

const MyTableComponent = () => {
    const [filterArgs, setFilterArgs] = useState({});
    const [searchedCustomer, setSearchedCustomer] = useState(null);

    const handleFilter = () => {
        // Implement your filter logic here
        fetchFilteredData(filterArgs);
    };

    const clearFilter = () => {
        setFilterArgs({});
        setSearchedCustomer(null);
    };

    const handleCustomerSearch = (customer) => {
        setSearchedCustomer(customer);
    };

    return (
        <div>
            <Filter
                fields={[
                    <CustomerFilter
                        key="customer_filter"
                        filterArgs={filterArgs}
                        setFilterArgs={setFilterArgs}
                        searchedCustomer={searchedCustomer}
                        handleCustomerSearch={handleCustomerSearch}
                    />,
                    <DateFilter
                        key="date_filter"
                        filterArgs={filterArgs}
                        setFilterArgs={setFilterArgs}
                    />
                ]}
                onFilter={handleFilter}
                onReset={clearFilter}
                showFilter={true}
                showReset={true}
                namespace="my_table_filters"
            />
            {/* Table component */}
        </div>
    );
};
```

## Creating Custom Filter Fields

When creating custom filter field components to use with the Filter component:

1. Each field component should manage its own state
2. Field components should update the parent's filterArgs through props
3. Include a unique key prop for each field
4. Handle reset functionality through props

Example custom filter field:

```jsx
const CustomFilter = ({ filterArgs, setFilterArgs }) => {
    const handleChange = (value) => {
        setFilterArgs({
            ...filterArgs,
            customField: value
        });
    };

    return (
        <input
            type="text"
            value={filterArgs.customField || ''}
            onChange={(e) => handleChange(e.target.value)}
        />
    );
};
```

## Best Practices

1. Always provide unique keys for field components
2. Implement proper type checking for filter arguments
3. Handle edge cases in reset functionality
4. Use consistent naming conventions for filter arguments
5. Include error handling in filter and reset handlers

## Notes

- The Filter component is designed to work with table components but can be used in other contexts
- All filter fields should be controlled components
- The namespace prop is used internally for generating unique identifiers
- Filter and reset functionality should be implemented in the parent component

# Dokan Utilities

## Dependencies

### Script Dependencies

When using `utility functions` in `scripts`, we must add `dokan-utilities` as a dependency.

**Exception:** If we're already using `dokan-react-components` as a dependency, then we don't need to add `dokan-utilities` separately, as it's already included in the `free version`.

## Adding New Utility Functions

### File Structure

```
|____ src/
|        |___ utilities/
|        |      |___ index.ts        # Main export file
|        |      |___ ChangeCase.ts   # Existing utilities
|        |      |___ Accounting.ts   # Number formatting utilities
|        |      |___ YourUtility.ts  # Your new utility file
|        |
|        |___ Other Files
|
|____ Other Files
```

**Finally,** export the new `utility function` from the `src/utilities/index.ts` file.

```ts
export * from './ChangeCase';
export * from './Accounting';
export * from './YourUtility';
```

## Change Case Utilities

In `Dokan` and `Dokan Pro`, we recommend using the `change-case` utility methods from the `Dokan utilities package`. These utilities are accessible through the `@dokan/utilities` package.

## Why Use Change Case from Dokan Utilities?

We strongly `discourage` adding the `change-case` package directly to your projects for several reasons:

**Compatibility:** The latest versions of change-case (`v5+`) are not compatible with `WordPress`. In `Dokan utilities`, we maintain a compatible version that works seamlessly with `WordPress`.

**Consistency:** Using the `utilities` from `@dokan/utilities` ensures consistent string transformations across the entire `Dokan ecosystem`.

**Maintenance:** We handle version compatibility and updates, reducing the maintenance burden on external end.

### Available Case Transformations
The following case transformation utilities are available:

**camelCase:** Transforms **foo-bar** → **fooBar**  
**capitalCase:** Transforms **foo-bar** → **Foo Bar**  
**constantCase:** Transforms **foo-bar** → **FOO_BAR**  
**dotCase:** Transforms **foo-bar** → **foo.bar**  
**headerCase:** Transforms **foo-bar** → **Foo-Bar**  
**noCase:** Transforms **foo-bar** → **foo-bar**  
**kebabCase:** Transforms **fooBar** → **foo-bar** (alias for paramCase)  
**pascalCase:** Transforms **foo-bar** → **FooBar**  
**pathCase:** Transforms **foo-bar** → **foo/bar**  
**sentenceCase:** Transforms **foo-bar** → **Foo bar**  
**snakeCase:** Transforms **foo-bar** → **foo_bar**

## Accounting Utilities

Dokan provides a set of accounting utilities for handling price and number formatting consistently across the application. These utilities leverage the WordPress/WooCommerce accounting library to ensure proper formatting according to site currency settings.

### Available Accounting Functions

#### formatPrice
Formats a numeric value as a currency string with the appropriate symbol and formatting.

```ts
formatPrice(
    price: number | string = '',
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = ''
): string | number
```

**Parameters:**
- `price`: The numeric value to format
- `currencySymbol`: The currency symbol (optional, defaults to site currency symbol)
- `precision`: Number of decimal places (optional, defaults to site currency precision)
- `thousand`: Thousand separator (optional, defaults to site currency setting)
- `decimal`: Decimal separator (optional, defaults to site currency setting)
- `format`: The format string (optional, defaults to site currency format)

**Example:**
```js
import { formatPrice } from '@dokan/utilities';

// Basic usage - uses site currency settings
const formattedPrice = formatPrice(42.99); // "$42.99" (if site currency is USD)

// Custom formatting
const customPrice = formatPrice(42.99, '€', 2, '.', ',', '%v %s'); // "42,99 €"
```

#### formatNumber
Formats a numeric value according to the site's number formatting settings without adding a currency symbol.

```ts
formatNumber(value: number | string): string
```

**Parameters:**
- `value`: The numeric value to format

**Example:**
```js
import { formatNumber } from '@dokan/utilities';

// Uses site number formatting settings
const formattedNumber = formatNumber(1234.56); // "1,234.56" (with US settings)
```

#### unformatNumber
Converts a formatted number string back to a numeric value.

```ts
unformatNumber(value: string): number
```

**Parameters:**
- `value`: The formatted number string to convert

**Example:**
```js
import { unformatNumber } from '@dokan/utilities';

// Convert formatted string back to number
const numericValue = unformatNumber("1,234.56"); // 1234.56
```

### Typical Usage Pattern

When working with numeric inputs in forms:

1. **Load data from API and format for display:**
   ```js
   import { formatNumber } from '@dokan/utilities';
   
   useEffect(() => {
     if (data) {
       // Format API value for display in form
       setFormattedValue(formatNumber(data.amount));
     }
   }, [data]);
   ```

2. **Display in a masked input:**
   ```jsx
   import { DokanMaskInput } from '@dokan/components';
   
   <DokanMaskInput
     namespace="price-input"
     value={formattedValue}
     onChange={(e) => setFormattedValue(e.target.value)}
     // other props...
   />
   ```

3. **Convert back for API submission:**
   ```js
   import { unformatNumber } from '@dokan/utilities';
   
   const handleSubmit = () => {
     // Convert back to numeric value for API
     const numericValue = unformatNumber(formattedValue);
     
     // Submit to API with numeric value
     submitToAPI({ amount: numericValue });
   };
   ```

### Key Points

- These functions automatically use the site's currency and number formatting settings
- Always convert formatted strings back to numbers before performing calculations
- When sending data to APIs, ensure you're using the numeric value (unformatted)
- Display formatted values to users for better readability

## Utilities Access

For `Dokan free & premium version`, we can import the `utilities` via `@dokan/utilities`:

```js
import { snakeCase, camelCase, kebabCase, formatNumber, unformatNumber, formatPrice } from '@dokan/utilities';
```

For external `plugins`, we must include the `dokan-utilities` or `dokan-react-components` as scripts dependency and the `@dokan/utilities` should be introduced as an external resource configuration to resolve the path via `webpack`:

```js
externals: {
    '@dokan/utilities': 'dokan.utilities',
    ...
},
```

## Usage Example

```js
import { snakeCase, formatNumber, unformatNumber } from '@dokan/utilities';

// Case conversion examples
snakeCase('fooBar');     // → "foo_bar"

// Accounting examples
const formattedNumber = formatNumber(1234.56); // → "1,234.56" (with US settings)
const numericValue = unformatNumber("1,234.56"); // → 1234.56

// Real-world example: Form with numeric input
const OrderForm = () => {
  const [formattedTotal, setFormattedTotal] = useState('');
  
  // Load initial data
  useEffect(() => {
    // API response with numeric value
    const order = { total: 42.99 };
    
    // Format for display
    setFormattedTotal(formatNumber(order.total));
  }, []);
  
  // Handle form submission
  const handleSubmit = () => {
    // Convert back to numeric for calculations and API
    const numericTotal = unformatNumber(formattedTotal);
    
    // Now safe to perform calculations
    const tax = numericTotal * 0.1;
    
    // Submit to API with numeric values
    submitOrder({
      total: numericTotal,
      tax: tax
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DokanMaskInput
        namespace="order-total"
        value={formattedTotal}
        onChange={(e) => setFormattedTotal(e.target.value)}
      />
      <button type="submit">Submit Order</button>
    </form>
  );
};
```

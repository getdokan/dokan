# Commission Components

This directory contains pure, reusable components for commission management functionality.

## Components

### Pure Components

#### CategoryBasedCommissionPure
A pure, reusable component for managing category-based commission settings.

**Features:**
- Hierarchical category display
- Percentage and flat rate commission management
- Debounced updates for performance
- Currency formatting support
- Sub-category inheritance

**Usage:**
```typescript
import { CategoryBasedCommissionPure } from '@dokan/components/commission';

<CategoryBasedCommissionPure
    categories={categories}
    commissionValues={commissionValues}
    currency={currency}
    onCommissionChange={handleChange}
    resetSubCategoryValue={true}
/>
```

#### CombineInputPure
A pure, reusable component for combined percentage and fixed amount inputs.

**Features:**
- Percentage validation (0-100)
- Currency formatting
- Debounced updates
- HTML content support in title/description

**Usage:**
```typescript
import { CombineInputPure } from '@dokan/components/commission';

<CombineInputPure
    values={{ admin_percentage: 10, additional_fee: 500 }}
    currency={currency}
    title="Commission Settings"
    onValueChange={handleChange}
/>
```

### Sub-components

#### CommissionHeader
Header component for the commission table with column labels.

#### CategoryRow
Individual row component for displaying category information and commission inputs.

#### CategoryTree
Tree structure component for displaying hierarchical categories.

#### CommissionInputs
Input component for percentage and flat rate commission values.

## Types

All TypeScript interfaces are exported from the `types.ts` file:

- `Category` - Category data structure
- `CommissionValues` - Commission data structure
- `CommissionInputsProps` - Props for commission inputs
- `CategoryRowProps` - Props for category rows
- `CategoryBasedCommissionProps` - Props for the main component
- `CombineInputProps` - Props for combine input component
- `CombineInputValues` - Values for combine input component

## Utils

Utility functions are exported from the `utils.ts` file:

- `buildCategoriesTree` - Build hierarchical category structure
- `getAllNestedChildren` - Get all nested children of a category
- `formatValue` - Format currency values
- `unFormatValue` - Unformat currency values
- `validatePercentage` - Validate percentage values
- `getCommissionValue` - Get commission value for a category
- `isEqual` - Deep equality comparison
- `defaultCommission` - Default commission values

## Migration

The components have been moved from:
```
src/admin/dashboard/pages/settings/Elements/Fields/Commission/
```

To:
```
src/components/commission/
```

### Updated Imports

**Before:**
```typescript
import CategoryBasedCommissionPure from './CategoryBasedCommissionPure';
import CombineInputPure from './CombineInputPure';
```

**After:**
```typescript
import { CategoryBasedCommissionPure, CombineInputPure } from '@dokan/components/commission';
```

## Benefits

1. **Reusability** - Components can be used in any context
2. **Testability** - Pure components are easier to test
3. **Maintainability** - Centralized commission functionality
4. **Type Safety** - Full TypeScript support
5. **Performance** - Optimized with proper memoization and debouncing

## File Structure

```
src/components/commission/
├── CategoryBasedCommissionPure.tsx
├── CombineInputPure.tsx
├── CommissionHeader.tsx
├── CategoryRow.tsx
├── CategoryTree.tsx
├── CommissionInputs.tsx
├── types.ts
├── utils.ts
├── index.ts
└── README.md
```

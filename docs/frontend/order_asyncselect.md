# OrderAsyncSelect Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. Customize Mapping](#2-customize-mapping)
  - [3. Custom Query Params](#3-custom-query-params)

## Introduction

`OrderAsyncSelect` provides an async order search/select input backed by the Dokan REST API, wrapping `AsyncSelect` with reasonable defaults for orders.

## Component Dependency

- WordPress environment with REST API access
- Uses `@wordpress/api-fetch` and `@wordpress/url`
- Ensure `@dokan/components` is registered

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { OrderAsyncSelect } from '@dokan/components';

const Example = () => {
  const [order, setOrder] = useState(null);
  return (
    <OrderAsyncSelect
      value={ order }
      onChange={ setOrder }
      placeholder="Search orders"
      isClearable
      defaultOptions
    />
  );
};
```

## Features

- Async search over orders
- Optional prefetch of options before opening the menu; will also refetch when `endpoint`, `perPage`, `buildQuery`, or `extraQuery` change
- When refetched, if current `value` is not present in the new dataset it can automatically clear via `onChange(null)`
- Customizable endpoint, query and mapping
- Works with single-select or multi-select

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint` | `string` | No | `'/dokan/v2/orders'` | REST route to fetch orders. |
| `perPage` | `number` | No | `20` | Items per page. |
| `mapOption` | `(order:any)=>{ value:number; label:string; raw?:any }` | No | Built-in | Convert order to option. |
| `extraQuery` | `Record<string, any>` | No | `{}` | Additional query args. |
| `buildQuery` | `(term:string)=>Record<string, any>` | No | - | Override query builder. |
| `loadOptions` | `(term:string)=>Promise<Option[]>` | No | - | Override loader entirely. |
| `prefetch` | `boolean` | No | `false` | If true, fetch orders immediately (and on dependency changes) instead of waiting for menu open. |
| `strictPrefetchValidation` | `boolean` | No | `false` | If true, when `prefetch` runs and the current `value` is not found in the prefetched/refetched list, `onChange(null)` is triggered. |
| `...rest` | `any` | No | - | Any `AsyncSelect` prop. |

## Usage Examples

### 1. Basic Usage

```jsx
<OrderAsyncSelect defaultOptions isClearable onChange={ setOrder } />
```

### 2. Customize Mapping

```jsx
<OrderAsyncSelect
  mapOption={ (o) => ({ value: o.id, label: `Order #${o.number || o.id}`, raw: o }) }
/>
```

### 3. Custom Query Params

```jsx
<OrderAsyncSelect
  buildQuery={(term) => ({ search: term, status: 'completed', per_page: 50 })}
  extraQuery={{ vendor_id: 5 }}
/>
```

### 4. Prefetch and strict validation

```jsx
// Will fetch once on mount and when dependency props change.
// If the current value isn't found in the prefetched data, it will clear it.
<OrderAsyncSelect
  prefetch
  strictPrefetchValidation
  value={ order }
  onChange={ setOrder }
/>
```

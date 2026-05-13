# CustomerAsyncSelect Component

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

`CustomerAsyncSelect` provides an async customer search/select input backed by the Dokan REST API. It wraps `AsyncSelect` with convenient defaults for fetching and displaying customers.

## Component Dependency

- WordPress environment with REST API access
- Uses `@wordpress/api-fetch` and `@wordpress/url`
- Ensure `@dokan/components` is registered

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { CustomerAsyncSelect } from '@dokan/components';

const Example = () => {
  const [customer, setCustomer] = useState(null);
  return (
    <CustomerAsyncSelect
      value={ customer }
      onChange={ setCustomer }
      placeholder="Search customers"
      isClearable
      defaultOptions
    />
  );
};
```

## Features

- Async search over customers by name, email, or username
- Optional prefetch of options before opening the menu; will also refetch when `endpoint`, `perPage`, `buildQuery`, or `extraQuery` change
- When refetched, if current `value` is not present in the new dataset it can automatically clear via `onChange(null)`
- Configurable endpoint, query and mapping
- Works with single-select or multi-select

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint` | `string` | No | `'/dokan/v1/customers'` | REST route to fetch customers. |
| `perPage` | `number` | No | `20` | Items per page. |
| `mapOption` | `(customer:any)=>{ value:number; label:string; raw?:any }` | No | Built-in | Convert customer to option. |
| `extraQuery` | `Record<string, any>` | No | `{}` | Additional query args. |
| `buildQuery` | `(term:string)=>Record<string, any>` | No | - | Override query builder. |
| `loadOptions` | `(term:string)=>Promise<Option[]>` | No | - | Override loader entirely. |
| `prefetch` | `boolean` | No | `false` | If true, fetch customers immediately (and on dependency changes) instead of waiting for menu open. |
| `strictPrefetchValidation` | `boolean` | No | `false` | If true, when `prefetch` runs and the current `value` is not found in the prefetched/refetched list, `onChange(null)` is triggered. |
| `...rest` | `any` | No | - | Any `AsyncSelect` prop. |

## Usage Examples

### 1. Basic Usage

```jsx
<CustomerAsyncSelect defaultOptions isClearable onChange={ setCustomer } />
```

### 2. Customize Mapping

```jsx
<CustomerAsyncSelect
  mapOption={ (c) => ({ value: c.id, label: `${c.name || c.email} (#${c.id})`, raw: c }) }
/>
```

### 3. Custom Query Params

```jsx
<CustomerAsyncSelect
  buildQuery={(term) => ({ search: term, per_page: 50 })}
  extraQuery={{ role: 'customer' }}
/>
```

### 4. Prefetch and strict validation

```jsx
// Will fetch once on mount and when dependency props change.
// If the current value isn't found in the prefetched data, it will clear it.
<CustomerAsyncSelect
  prefetch
  strictPrefetchValidation
  value={ customer }
  onChange={ setCustomer }
/>
```

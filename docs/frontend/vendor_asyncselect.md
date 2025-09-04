# VendorAsyncSelect Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. Multi Select Vendors](#2-multi-select-vendors)
  - [3. Customize Query](#3-customize-query)

## Introduction

`VendorAsyncSelect` provides an async vendors/store search/select input backed by the Dokan REST API. It wraps `AsyncSelect` with defaults for fetching stores.

## Component Dependency

- WordPress environment with REST API access
- Uses `@wordpress/api-fetch` and `@wordpress/url`
- Ensure `@dokan/components` is registered

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { VendorAsyncSelect } from '@dokan/components';

const Example = () => {
  const [vendor, setVendor] = useState(null);
  return (
    <VendorAsyncSelect
      value={ vendor }
      onChange={ setVendor }
      placeholder="Search vendors"
      isClearable
      defaultOptions
    />
  );
};
```

## Features

- Async search over vendors/stores
- Configurable endpoint, query, and mapping
- Works in single or multi-select mode

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint` | `string` | No | `'/dokan/v1/stores'` | REST route to fetch stores. |
| `perPage` | `number` | No | `20` | Items per page. |
| `mapOption` | `(store:any)=>{ value:number; label:string; raw?:any }` | No | Built-in | Convert store to option. |
| `extraQuery` | `Record<string, any>` | No | `{}` | Additional query args. |
| `buildQuery` | `(term:string)=>Record<string, any>` | No | - | Override query builder. |
| `loadOptions` | `(term:string)=>Promise<Option[]>` | No | - | Override loader entirely. |
| `...rest` | `any` | No | - | Any `AsyncSelect` prop (e.g. `isMulti`, `leftIcon`). |

## Usage Examples

### 1. Basic Usage

```jsx
<VendorAsyncSelect defaultOptions isClearable onChange={ setVendor } />
```

### 2. Multi Select Vendors

```jsx
<VendorAsyncSelect isMulti defaultOptions onChange={ setVendor } />
```

### 3. Customize Query

```jsx
<VendorAsyncSelect
  buildQuery={(term) => ({ search: term, per_page: 50, status: 'approved' })}
/>
```

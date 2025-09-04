# CouponAsyncSelect Component

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

`CouponAsyncSelect` provides an async coupon search/select input backed by a Dokan/WooCommerce coupon REST route. It wraps `AsyncSelect` with convenient defaults.

## Component Dependency

- WordPress environment with REST API access
- Uses `@wordpress/api-fetch` and `@wordpress/url`
- Ensure `@dokan/components` is registered

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { CouponAsyncSelect } from '@dokan/components';

const Example = () => {
  const [coupon, setCoupon] = useState(null);
  return (
    <CouponAsyncSelect
      value={ coupon }
      onChange={ setCoupon }
      placeholder="Search coupons"
      isClearable
      defaultOptions
    />
  );
};
```

## Features

- Async search over coupons by code/name
- Configurable endpoint, query and mapping
- Works with single-select or multi-select

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint` | `string` | No | `'/dokan/v1/coupons'` | REST route to fetch coupons. |
| `perPage` | `number` | No | `20` | Items per page. |
| `mapOption` | `(coupon:any)=>{ value:number; label:string; raw?:any }` | No | Built-in | Convert coupon to option. |
| `extraQuery` | `Record<string, any>` | No | `{}` | Additional query args. |
| `buildQuery` | `(term:string)=>Record<string, any>` | No | - | Override query builder. |
| `loadOptions` | `(term:string)=>Promise<Option[]>` | No | - | Override loader entirely. |
| `...rest` | `any` | No | - | Any `AsyncSelect` prop. |

## Usage Examples

### 1. Basic Usage

```jsx
<CouponAsyncSelect defaultOptions isClearable onChange={ setCoupon } />
```

### 2. Customize Mapping

```jsx
<CouponAsyncSelect
  mapOption={ (c) => ({ value: c.id, label: `${c.code || c.name} (#${c.id})`, raw: c }) }
/>
```

### 3. Custom Query Params

```jsx
<CouponAsyncSelect
  buildQuery={(term) => ({ search: term, per_page: 50, status: 'publish' })}
/>
```

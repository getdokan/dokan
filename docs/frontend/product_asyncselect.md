# ProductAsyncSelect Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. Customize Mapping](#2-customize-mapping)
  - [3. Customize Query](#3-customize-query)

## Introduction

`ProductAsyncSelect` provides an async product search/select input backed by the Dokan REST API. It wraps `AsyncSelect` and ships with sensible defaults to fetch products and map them to options.

## Component Dependency

- WordPress environment with REST API access
- `@wordpress/api-fetch` and `@wordpress/url` are used under the hood (bundled in Dokan)
- Ensure `@dokan/components` is registered

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { ProductAsyncSelect } from '@dokan/components';

const Example = () => {
  const [product, setProduct] = useState(null);
  return (
    <ProductAsyncSelect
      value={ product }
      onChange={ setProduct }
      placeholder="Search products"
      isClearable
      defaultOptions
    />
  );
};
```

## Features

- Async search over products with caching and default options
- Customizable REST endpoint, query, and option mapping
- Pass-through props to underlying `AsyncSelect`

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint` | `string` | No | `'/dokan/v2/products'` | REST route to fetch products. |
| `perPage` | `number` | No | `20` | Items per page in API request. |
| `mapOption` | `(product: any) => { value:number; label:string; raw?:any }` | No | Built-in | Convert API item to select option. |
| `extraQuery` | `Record<string, any>` | No | `{}` | Additional query params merged in each request. |
| `buildQuery` | `(term: string) => Record<string, any>` | No | - | Build query for a given search term. Overrides default. |
| `loadOptions` | `(inputValue: string) => Promise<Option[]>` | No | - | Provide your own loader to completely override API fetching. |
| `...rest` | `any` | No | - | Any `AsyncSelect` prop (e.g., `isClearable`, `leftIcon`, etc.). |

## Usage Examples

### 1. Basic Usage

```jsx
<ProductAsyncSelect defaultOptions isClearable onChange={ setProduct } />
```

### 2. Customize Mapping

```jsx
<ProductAsyncSelect
  mapOption={ (p) => ({ value: p.id, label: `${p.name} (#${p.id})`, raw: p }) }
/>
```

### 3. Customize Query

```jsx
<ProductAsyncSelect
  buildQuery={ (term) => ({ search: term, status: 'publish', per_page: 50 }) }
  extraQuery={{ vendor_id: 10 }}
/>
```

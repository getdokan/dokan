# AsyncSelect Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Async Loading](#1-basic-async-loading)
  - [2. With Left Icon](#2-with-left-icon)
  - [3. Custom Components](#3-custom-components)

## Introduction

`AsyncSelect` is a Dokan-styled wrapper around an async searchable select from `@getdokan/dokan-ui`, which is powered by `react-select/async`. It lets you load options on demand via a `loadOptions` function while keeping the familiar Dokan UI look and feel.

## Component Dependency

- Register `dokan-react-components` (or your bundle that exposes `@dokan/components`) and ensure `@getdokan/dokan-ui` is available in your build.

## Quick Overview

```jsx
import { AsyncSelect } from '@dokan/components';

const loadVendors = async (inputValue) => {
  // return array of { value, label }
  const res = await fetch(`/wp-json/dokan/v1/stores?search=${encodeURIComponent(inputValue)}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map( s => ({ value: s.id, label: s.store_name || s.name }) ) : [];
};

<AsyncSelect
  cacheOptions
  defaultOptions
  loadOptions={ loadVendors }
  placeholder="Search vendors"
/>
```

## Features

- Async loading with caching and default options support
- Left icon support via `leftIcon`
- React-select styling tuned for Dokan UI
- Full pass-through of underlying async select props

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `loadOptions` | `(inputValue: string) => Promise<Option[]>` | Yes | - | Async loader that returns options. |
| `defaultOptions` | `boolean | Option[]` | No | `false` | Preload options. |
| `cacheOptions` | `boolean` | No | `false` | Cache loaded options. |
| `value` | `Option|Option[]|null` | No | `null` | Selected option(s). |
| `onChange` | `(option) => void` | No | - | Called when selection changes. |
| `isClearable` | `boolean` | No | `false` | Allow clearing the selection. |
| `isMulti` | `boolean` | No | `false` | Enable multi-select. |
| `placeholder` | `string` | No | `''` | Placeholder text. |
| `leftIcon` | `ReactNode` | No | - | Icon area inside the control. |
| `classNamePrefix` | `string` | No | `'react-select'` | Class prefix for react-select. |
| `blurInputOnSelect` | `boolean` | No | `true` | Passed through. |
| `closeMenuOnSelect` | `boolean` | No | `true` | Passed through. |
| `hideSelectedOptions` | `boolean` | No | `false` | Passed through. |
| `components` | `object` | No | - | react-select components override. |
| `...rest` | `any` | No | - | Any other async react-select props are forwarded. |

## Usage Examples

### 1. Basic Async Loading

```jsx
<AsyncSelect cacheOptions defaultOptions loadOptions={ loadVendors } />
```

### 2. With Left Icon

```jsx
import { Home } from 'lucide-react';

<AsyncSelect
  cacheOptions
  defaultOptions
  loadOptions={ loadVendors }
  leftIcon={ <Home size={16} /> }
/>
```

### 3. Custom Components

```jsx
const CustomOption = (props) => (
  <div {...props.innerProps} className="px-2 py-1">
    {props.data.label}
  </div>
);

<AsyncSelect
  loadOptions={ loadVendors }
  components={{ Option: CustomOption }}
/>
```

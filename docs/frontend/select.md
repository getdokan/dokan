# Select Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. With Left Icon](#2-with-left-icon)
  - [3. Multi Select](#3-multi-select)

## Introduction

`Select` is a styled wrapper around the searchable select from `@getdokan/dokan-ui` (React Select under the hood). It provides sensible defaults for styling within the Dokan admin/dashboard UI and a convenient `leftIcon` slot inside the control.

It behaves as a controlled input via `value` and `onChange`.

## Component Dependency

- Register `dokan-react-components` (or your bundle that exposes `@dokan/components`) and ensure `@getdokan/dokan-ui` assets are available.

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { Select } from '@dokan/components';

const options = [
  { value: 'all', label: 'All Vendor' },
  { value: 'store-king', label: 'Store King' },
];

const Example = () => {
  const [value, setValue] = useState(options[0]);
  return (
    <Select
      options={ options }
      value={ value }
      onChange={ setValue }
      placeholder="Select vendor"
    />
  );
};
```

## Features

- Searchable select with Dokan styling
- Left icon support via `leftIcon` prop
- Sensible defaults for menu, focus, and layout
- Full access to underlying react-select props via pass-through

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `options` | `Array<{ value: string|number, label: string }>` | No | `[]` | Available options. |
| `value` | `object|null` | No | `null` | Selected option. |
| `onChange` | `(option) => void` | No | - | Called when selection changes. |
| `isClearable` | `boolean` | No | `false` | Allow clearing the selection. |
| `isMulti` | `boolean` | No | `false` | Enable multi-select mode. |
| `placeholder` | `string` | No | `''` | Placeholder text. |
| `leftIcon` | `ReactNode` | No | - | Renders an icon left inside the control. |
| `classNamePrefix` | `string` | No | `'react-select'` | Class prefix for react-select. |
| `blurInputOnSelect` | `boolean` | No | `true` | Passed to react-select. |
| `closeMenuOnSelect` | `boolean` | No | `true` | Passed to react-select. |
| `hideSelectedOptions` | `boolean` | No | `false` | Passed to react-select. |
| `components` | `object` | No | - | react-select components override. |
| `...rest` | `any` | No | - | Any other react-select props are forwarded. |

## Usage Examples

### 1. Basic Usage

```jsx
<Select options={ options } value={ value } onChange={ setValue } />
```

### 2. With Left Icon

```jsx
import { Home } from 'lucide-react';

<Select
  options={ options }
  value={ value }
  onChange={ setValue }
  placeholder="Select vendor"
  leftIcon={ <Home size={16} /> }
/>
```

### 3. Multi Select

```jsx
<Select
  options={ options }
  value={ value }
  onChange={ setValue }
  isMulti
/>
```

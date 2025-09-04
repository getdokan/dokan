# SearchInput Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. With Custom Left Icon](#2-with-custom-left-icon)
  - [3. Debounced Search (delay)](#3-debounced-search-delay)
  - [4. Controlled From Outside](#4-controlled-from-outside)
  - [5. Disable Clear Button](#5-disable-clear-button)

## Introduction

`SearchInput` is a lightweight, debounced text input designed for search fields in Dokan UIs. It builds on `SimpleInput` from `@getdokan/dokan-ui`, adds a left search icon, an optional clear button, and debounced `onChange` calls using WordPress' `useDebounce`.

It supports both internal state for smooth typing and external control via the `value` prop. When the user types, the component updates its internal value immediately and calls `onChange` after the specified `delay`.

## Component Dependency

- WordPress React runtime (`@wordpress/element`)
- WordPress compose utilities (`@wordpress/compose`) for `useDebounce`
- Dokan UI input component (`@getdokan/dokan-ui` -> `SimpleInput`)
- Optional icons from `lucide-react` (a default search icon is included)
- Ensure your script/bundle exposes `@dokan/components`

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { SearchInput } from '@dokan/components';

const Example = () => {
  const [query, setQuery] = useState('');

  return (
    <SearchInput
      value={ query }
      onChange={ setQuery }
      input={{ placeholder: 'Search vendors' }}
    />
  );
};
```

## Features

- Built-in debouncing via `useDebounce` to limit rapid `onChange` calls
- Left icon slot with sensible default (search icon)
- Optional clear button appears when there is text
- Works as a controlled component while preserving typing responsiveness
- Full access to underlying `SimpleInput` props via pass-through

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `value` | `string` | No | `''` | Current search text (controlled). The component mirrors this into its internal state. |
| `onChange` | `(val: string) => void` | No | - | Called (debounced) when the user types or when cleared. |
| `delay` | `number` | No | `300` | Debounce delay in milliseconds for `onChange`. |
| `input` | `ComponentProps<typeof SimpleInput>['input']` | No | - | Props for the inner HTML input (id, name, type, placeholder, etc.). Defaults placeholder to `__('Search', 'dokan-lite')`. |
| `leftIcon` | `ReactNode` | No | `<Search size={16} />` | Custom icon rendered inside the left side of the field. |
| `clearable` | `boolean` | No | `true` | If true and there is a value, shows a clear (X) button. |
| `...props` | `Omit<ComponentProps<typeof SimpleInput>, 'onChange' | 'value'>` | No | - | Any other `SimpleInput` props are forwarded. |

## Usage Examples

### 1. Basic Usage

```jsx
<SearchInput onChange={ (val) => console.log('Search term:', val) } />
```

### 2. With Custom Left Icon

```jsx
import { Package } from 'lucide-react';

<SearchInput
  input={{ placeholder: 'Search products' }}
  leftIcon={<Package size={16} />}
  onChange={ (val) => console.log('Product search:', val) }
/>
```

### 3. Debounced Search (delay)

```jsx
// Fire onChange less frequently (e.g., after 600ms of inactivity)
<SearchInput delay={600} onChange={ (val) => fetchResults(val) } />
```

### 4. Controlled From Outside

```jsx
import { useState } from '@wordpress/element';

const Controlled = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <button type="button" onClick={() => setQuery('')}>Reset</button>
    </div>
  );
};
```

### 5. Disable Clear Button

```jsx
<SearchInput clearable={false} onChange={ (val) => console.log(val) } />
```

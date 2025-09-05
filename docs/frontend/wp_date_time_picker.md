# WpDateTimePicker Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
  - [1. Basic Usage](#1-basic-usage)
  - [2. Custom Trigger Content](#2-custom-trigger-content)
  - [3. Handling Clear and Ok](#3-handling-clear-and-ok)

## Introduction

`WpDateTimePicker` is a lightweight wrapper around the WordPress `DateTimePicker` component presented inside a WordPress `Popover`. It follows similar UX to the `WcDateRangePicker` but for a single date/time value.

The component optionally renders a built-in `SimpleInput` as the trigger that displays the currently selected date in the site's localized format.

## Component Dependency

- WordPress environment (requires `@wordpress/components`, `@wordpress/date`, `wp.i18n`)
- Dokan UI components (`@getdokan/dokan-ui`) for the default input
- Ensure your script declares `dokan-react-components` dependencies

## Quick Overview

```jsx
import { useState } from '@wordpress/element';
import { WpDateTimePicker } from '@dokan/components';

const Example = () => {
  const [date, setDate] = useState('');

  return (
    <div style={{ width: 320 }}>
      <WpDateTimePicker
        currentDate={ date }
        onChange={ (val) => setDate(val) }
      />
    </div>
  );
};
```

## Features

- Popover-based date/time picker using WordPress components
- Localized display via `dateI18n` and site formats/timezone
- Built-in Clear and (optional) Ok buttons
- Fully controlled via `currentDate` and `onChange`
- Pass-through of any `DateTimePicker` props

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `currentDate` | `string|Date|null` | No | `''` | Current date/time value passed to WP `DateTimePicker` as `currentDate`. |
| `onChange` | `(value:any)=>void` | Yes | - | Called when a date is selected; also closes popover. |
| `onClear` | `() => void` | No | Clears value | Called when Clear is pressed. If not provided, empties the value. |
| `onOk` | `() => void` | No | - | Called when Ok is pressed; also closes popover. |
| `children` | `ReactNode` | No | - | Custom trigger content. If omitted, a `SimpleInput` is rendered. |
| `wrapperClassName` | `string` | No | `''` | Class for outer wrapper. |
| `pickerToggleClassName` | `string` | No | `''` | Class for the trigger element. |
| `wpPopoverClassName` | `string` | No | `''` | Additional popover class. Merged with `dokan-layout`. |
| `popoverBodyClassName` | `string` | No | `''` | Class for the popover body container. |
| `inputId` | `string` | No | `'dokan-date-time-picker-input'` | Id for default input trigger. |
| `inputName` | `string` | No | `'dokan_date_time_picker_input'` | Name for default input trigger. |
| `...rest` | `any` | No | - | Any other props are forwarded to `DateTimePicker`. |

## Usage Examples

### 1. Basic Usage

```jsx
<WpDateTimePicker currentDate={date} onChange={setDate} />
```

### 2. Custom Trigger Content

```jsx
<WpDateTimePicker currentDate={date} onChange={setDate}>
  <button type="button" className="button">Pick Date</button>
</WpDateTimePicker>
```

### 3. Handling Clear and Ok

```jsx
<WpDateTimePicker
  currentDate={date}
  onChange={setDate}
  onClear={() => setDate('')}
  onOk={() => console.log('Date confirmed:', date)}
/>
```

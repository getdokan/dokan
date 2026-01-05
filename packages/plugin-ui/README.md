# @wedevs/plugin-ui

Reusable UI components for WordPress plugins. Built with React and designed to work seamlessly with the WordPress admin environment.

## Installation

```bash
npm install @wedevs/plugin-ui
```

## Usage

```tsx
import { TextField, Select, Switch, FileUpload } from '@wedevs/plugin-ui';

// Basic text field
<TextField
    value={value}
    onChange={setValue}
    placeholder="Enter text..."
/>

// Select dropdown
<Select
    value={selected}
    onChange={setSelected}
    options={[
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
    ]}
/>

// Toggle switch
<Switch
    checked={isEnabled}
    onChange={setIsEnabled}
    label="Enable feature"
/>

// File upload with WordPress media library
<FileUpload
    value={fileUrl}
    onChange={setFileUrl}
    allowedTypes={['image']}
/>
```

## Components

### Basic Inputs
- `TextField` - Text input with various types (text, email, tel, url)
- `NumberField` - Numeric input with min/max/step
- `TextArea` - Multi-line text input
- `PasswordField` - Password input with visibility toggle
- `Select` - Dropdown select
- `MultiSelect` - Multiple selection dropdown
- `Checkbox` - Single checkbox
- `CheckboxGroup` - Multiple checkboxes
- `Radio` - Radio button group
- `RadioCapsule` - Styled pill/capsule radio buttons
- `Switch` - Toggle switch

### Advanced Inputs
- `ColorPicker` - Color selection
- `TimePicker` - Time selection
- `DatePicker` - Date selection
- `FileUpload` - WordPress media library integration
- `RichText` - WYSIWYG editor
- `Repeater` - Drag-and-drop repeatable fields
- `CopyField` - Text with copy button

### Display
- `FieldLabel` - Label with description and tooltip
- `InfoBox` - Informational message box
- `Badge` - Status badges
- `Tooltip` - Hover tooltips

### Layout
- `Modal` - Dialog/modal windows
- `Popover` - Floating content
- `SortableList` - Drag-and-drop sortable list

## Peer Dependencies

This package requires the following WordPress packages:
- `@wordpress/components`
- `@wordpress/element`
- `@wordpress/i18n`
- `@wordpress/hooks`

## License

GPL-2.0-or-later


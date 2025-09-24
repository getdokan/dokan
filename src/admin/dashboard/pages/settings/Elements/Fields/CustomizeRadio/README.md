# CustomizeRadio Component Structure

This directory contains the modular components for the CustomizeRadio field, which provides enhanced radio button functionality with multiple display variants and rich content options.

## Directory Structure

```
CustomizeRadio/
├── README.md                 # This documentation
├── index.tsx                 # Main component (settings integration)
├── types.ts                  # TypeScript interfaces and types
├── RadioButton.tsx           # Reusable radio button component
├── SimpleRadioOption.tsx     # Simple variant option component
├── CardRadioOption.tsx       # Card variant option component
├── RadioBoxOption.tsx        # Radio box variant option component
└── CustomizeRadioCore.tsx    # Core component with variant logic
```

## Components Overview

### `index.tsx` - Main Component
- Integrates with the Dokan settings system
- Handles state management and value updates
- Transforms settings data to component format
- Renders the field label and core component

### `types.ts` - Type Definitions
- `RadioOption`: Interface for radio option data
- `CustomizeRadioProps`: Props for the core component
- `RadioOptionProps`: Props for individual option components
- `RadioButtonProps`: Props for the radio button component

### `RadioButton.tsx` - Reusable Radio Button
- Custom styled radio button with SVG graphics
- Supports checked, unchecked, and disabled states
- Used by all option variants

### `SimpleRadioOption.tsx` - Simple Variant
- Basic radio option with title and description
- 2-column grid layout
- Minimal styling with hover effects

### `CardRadioOption.tsx` - Card Variant
- Card-style layout with images
- Responsive grid layout
- Header with title and radio button
- Image display area

### `RadioBoxOption.tsx` - Radio Box Variant
- Icon-based radio boxes
- Flex layout that wraps
- Fixed width cards (w-40)
- Icon display with fallback

### `CustomizeRadioCore.tsx` - Core Logic
- Handles variant selection and rendering
- Manages layout classes based on variant
- Coordinates between different option components

## Available Variants

1. **`simple`** - Basic radio buttons in 2-column grid
2. **`card`** - Card-style layout with images
3. **`template`** - Template-style layout (similar to card)
4. **`radio_box`** - Icon-based radio boxes in flex layout

## Usage

### Basic Usage
```tsx
import CustomizeRadio from './CustomizeRadio';

<CustomizeRadio element={settingsElement} />
```

### Direct Component Usage
```tsx
import CustomizeRadioCore from './CustomizeRadio/CustomizeRadioCore';

<CustomizeRadioCore
    options={options}
    selectedValue={selectedValue}
    onChange={handleChange}
    radioVariant="radio_box"
/>
```

### Individual Components
```tsx
import RadioBoxOption from './CustomizeRadio/RadioBoxOption';
import RadioButton from './CustomizeRadio/RadioButton';

<RadioBoxOption
    option={option}
    isSelected={isSelected}
    onSelect={handleSelect}
/>
```

## Features

### Icon Support
- HTML strings: `<i class="fas fa-user"></i>`
- SVG elements: Custom SVG graphics
- React components: JSX elements
- Fallback icons: Default circular icon

### Accessibility
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Responsive Design
- Adaptive layouts for different screen sizes
- Flexible grid systems
- Mobile-friendly interactions

### State Management
- Selected state handling
- Disabled state support
- Hover and focus states
- Visual feedback

## Styling

The components use Tailwind CSS classes and follow the Dokan design system:
- Primary color: `#7047EB` (purple)
- Border colors: `#E9E9E9` (light gray)
- Text colors: `#25252D` (dark), `#788383` (medium gray)
- Hover effects and transitions

## Best Practices

1. **Component Reusability**: Each component is self-contained and reusable
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Accessibility**: WCAG compliant with proper ARIA attributes
4. **Performance**: Optimized rendering with proper key props
5. **Maintainability**: Clear separation of concerns and modular structure

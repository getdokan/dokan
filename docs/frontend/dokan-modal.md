# DokanModal Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features of DokanModal Component](#features-of-DokanModal-component)
    - [Dynamic Content Elements](#dynamic-content-elements)
    - [Custom Styling Support](#custom-styling-support)
    - [Unique Namespace](#unique-namespace)
- [Properties](#properties)

## Introduction
The `DokanModal` component provides a flexible modal dialog system for `Dokan`. It supports `confirmation dialogs`, `custom content`, and `customizable headers and footers`.
Each modal instance requires a unique `namespace` for proper identification and styling.

## Component Dependency
For both `Dokan Free and Pro` versions, we must register the `dokan-react-components` dependency when using `global` components.

## Quick Overview

```tsx
import { __ } from '@wordpress/i18n';
import { DokanModal } from '@dokan/components';

const [ isOpen, setIsOpen ] = useState( false );

<DokanModal
    isOpen={ isOpen }
    namespace='quick-confirm'
    onConfirm={ () => handleConfirm() }
    onClose={ () => setIsOpen( false ) }
    confirmationTitle={ __( 'Quick Confirmation', 'dokan-lite' ) } // Optional title for confirmation modals, modify as needed
    confirmationDescription={ __( 'Are you sure?', 'dokan-lite' ) } // Optional description for confirmation modals, modify as needed
/>
```

## Features of DokanModal Component
The `DokanModal` component offers several features for customization and flexibility:

### Dynamic Content Elements

#### 1. Dynamic Content Elements
  - Flexible content structure through dynamic props:
    - `dialogTitle`: Custom title for the modal dialog.
    - `dialogIcon`: Custom icon element besides the modal contents.
    - `dialogHeader`: Customizable header for the modal component.
    - `dialogContent`: Custom content for the modal component.
    - `dialogFooter`: Custom button/footer contents for the modal component.

  - Custom Styling Support:
    - UI customizable modal using className props.

  - Unique Namespace:
    - Required unique namespace for each modal instance
    - Namespace is used for proper identification of the modal component.

## Component Properties

| Property                  | Type          | Required  | Default                | Description                                                     |
|---------------------------|---------------|-----------|------------------------|-----------------------------------------------------------------|
| `isOpen`                  | `boolean`     | Yes       | -                      | Controls modal visibility                                       |
| `onClose`                 | `() => void`  | Yes       | -                      | Callback function when modal closes                             |
| `namespace`               | `string`      | Yes       | -                      | Unique identifier for the modal (used for modal identification) |
| `className`               | `string`      | No        | -                      | Additional CSS classes for modal customization                  |
| `onConfirm`               | `() => void`  | Yes       | -                      | Callback function when confirm button is clicked                |
| `dialogTitle`             | `string`      | No        | `Confirmation Dialog`  | Title text for the modal                                        |
| `cancelButtonText`        | `string`      | No        | `Cancel`               | Text for the cancel button                                      |
| `confirmButtonText`       | `string`      | No        | `Confirm`              | Text for the confirm button                                     |
| `confirmationTitle`       | `string`      | No        | `Delete Confirmation`  | Title for confirmation modals                                   |
| `confirmationDescription` | `string`      | No        | -                      | Description text for confirmation modals                        |
| `dialogIcon`              | `JSX.Element` | No        | -                      | Custom icon element for the modal header                        |
| `dialogHeader`            | `JSX.Element` | No        | -                      | Custom header component                                         |
| `dialogContent`           | `JSX.Element` | No        | -                      | Custom content component                                        |
| `dialogFooter`            | `JSX.Element` | No        | -                      | Custom footer component                                         |
| `loading`                 | `boolean`     | No        | false                  | Controls loading state of the modal                             |

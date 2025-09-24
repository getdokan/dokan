# RichText Component

- [Introduction](#introduction)
- [Component Dependency](#component-dependency)
- [Quick Overview](#quick-overview)
- [Features](#features)
- [Props API](#props-api)
- [Usage Examples](#usage-examples)
    - [1. Basic Usage](#1-basic-usage)
    - [2. Read-Only Mode](#2-read-only-mode)
    - [3. Customizing the Toolbar](#3-customizing-the-toolbar)
    - [4. Adding a Placeholder](#4-adding-a-placeholder)
    - [5. Advanced Usage: Accessing the Quill Instance](#5-advanced-usage-accessing-the-quill-instance)

## Introduction

The `RichText` component is a flexible and controlled rich text editor for React, built as a wrapper around the popular Quill.js library. It is designed to integrate seamlessly within the WordPress environment, featuring built-in support for the WordPress Media Uploader for images and videos.

It behaves like a standard React controlled input, managed via `value` and `onChange` props. For advanced customization, it also provides direct access to the underlying Quill instance via a `ref`.

## Component Dependency

To use this component, you must register `dokan-react-components` as a dependency for your script. Additionally, for the default media upload functionality to work, the component must be used within a WordPress environment where the global `wp.media` object is available.

## Quick Overview

Here is a basic implementation of the `RichText` component. It uses a state variable to hold the content and an `onChange` handler to update it.

```jsx
import { useState } from '@wordpress/element';
import { RichText } from '@dokan/components';

const MyEditor = () => {
    const [ content, setContent ] = useState( '<p>Hello, <strong>World</strong>!</p>' );

    return (
        <div>
            <h2>My Editor</h2>
            <RichText
                value={ content }
                onChange={ ( newContent ) => setContent( newContent ) }
            />
        </div>
    );
};

export default MyEditor;
```

## Features

-   **Controlled Component:** Behaves like a standard React controlled input, managed via `value` and `onChange` props.
-   **WordPress Media Integration:** Default toolbar buttons for 'image' and 'video' launch the native WordPress Media Uploader.
-   **Customizable Toolbar:** The Quill toolbar is easily customizable through the `modules` prop. The component intelligently deep-merges custom modules with the default configuration.
-   **Themable:** Supports Quill's built-in themes (e.g., `snow`, `bubble`).
-   **Read-Only Mode:** Can be easily toggled to a non-editable state.
-   **Direct Quill Instance Access:** For advanced use cases, you can get a direct reference to the Quill editor instance using a React `ref`, allowing you to call any Quill API method.

## Props API

| Prop | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `value` | `string` | Yes | `''` | The HTML string content to be displayed in the editor. |
| `onChange` | `(newValue: string) => void` | Yes | - | A callback function that is invoked when the editor's content changes. It receives the new HTML content as its only argument. |
| `readOnly` | `boolean` | No | `false` | If `true`, the editor will be in a non-editable, read-only state. |
| `theme` | `string` | No | `'snow'` | The name of the Quill theme to use (e.g., `'snow'`, `'bubble'`). |
| `modules` | `object` | No | `{...}` | A Quill modules configuration object. This will be deep-merged with the default modules, allowing for customization of the toolbar and other features. |
| `...rest` | `object` | No | `{}` | Any other props are passed directly to the Quill constructor, allowing for advanced configuration (e.g., `placeholder`, `formats`). |
| `ref` | `React.Ref<Quill>` | No | - | A ref that will be populated with the Quill instance upon initialization. |

---

## Usage Examples

### 1. Basic Usage

This example shows the standard implementation of the `RichText` component.

```jsx
import { useState } from '@wordpress/element';
import { RichText } from '@dokan/components';

const BasicEditor = () => {
    const [ content, setContent ] = useState( '' );

    return (
        <RichText
            value={ content }
            onChange={ setContent }
        />
    );
};
```

### 2. Read-Only Mode

To display content without allowing edits, set the `readOnly` prop to `true`.

```jsx
import { RichText } from '@dokan/components';

const ReadOnlyViewer = () => {
    const savedContent = '<h1>Final Report</h1><p>This content cannot be edited.</p>';

    return (
        <RichText
            value={ savedContent }
            readOnly={ true }
            onChange={ () => {} } // onChange is still required
        />
    );
};
```

### 3. Customizing the Toolbar

You can customize the toolbar by passing a `modules` object. The component performs a deep merge, so you only need to specify the parts you want to change. This example configures a simpler toolbar.

```jsx
import { useState } from '@wordpress/element';
import { RichText } from '@dokan/components';

const SimpleEditor = () => {
    const [ content, setContent ] = useState( '' );

    const simpleToolbarModules = {
        toolbar: [
            [ 'bold', 'italic', 'underline' ],
            [ 'link' ],
            [ { list: 'ordered' }, { list: 'bullet' } ],
        ],
    };

    return (
        <RichText
            value={ content }
            onChange={ setContent }
            modules={ simpleToolbarModules }
        />
    );
};
```

### 4. Adding a Placeholder

You can pass any additional Quill options (like `placeholder`) directly as props to the component.

```jsx
<RichText
    value={ content }
    onChange={ setContent }
    placeholder={ 'Start writing your masterpiece...' }
/>
```

### 5. Advanced Usage: Accessing the Quill Instance

For advanced customization, such as adding custom event listeners or calling Quill API methods, you can get a reference to the Quill instance using `useRef` and passing it to the component's `ref` prop.

This example shows how to listen for selection changes and log the selected text to the console.

```jsx
import { useState, useRef, useEffect } from '@wordpress/element';
import { RichText } from '@dokan/components';
import Quill from 'quill'; // Import Quill type for type safety

const AdvancedEditor = () => {
    const [ content, setContent ] = useState( '' );
    const quillRef = useRef<Quill>( null );

    useEffect( () => {
        const quill = quillRef.current;

        if ( quill ) {
            // Now you can use the full Quill API
            const onSelectionChange = ( range ) => {
                if ( range ) {
                    console.log( 'User selected text:', quill.getText( range.index, range.length ) );
                }
            };

            quill.on( 'selection-change', onSelectionChange );

            return () => {
                quill.off( 'selection-change', onSelectionChange );
            };
        }
    }, [] );

    return (
        <RichText
            ref={ quillRef }
            value={ content }
            onChange={ setContent }
            placeholder={ 'Interact with the editor...' }
        />
    );
};

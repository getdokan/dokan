# Dokan Utilities

## Dependencies

### Script Dependencies

When using `utility functions` in `scripts`, we must add `dokan-utilities` as a dependency.

**Exception:** If we're already using `dokan-react-components` as a dependency, then we don't need to add `dokan-utilities` separately, as it's already included in the `free version`.

## Adding New Utility Functions

### File Structure

```
|____ src/
|        |___ utilities/
|        |      |___ index.ts        # Main export file
|        |      |___ ChangeCase.ts   # Existing utilities
|        |      |___ YourUtility.ts  # Your new utility file
|        |
|        |___ Other Files
|
|____ Other Files
```

**Finally,** export the new `utility function` from the `src/utilities/index.ts` file.

```ts
export * from './ChangeCase';
export * from './YourUtility';
```

## Change Case Utilities

In `Dokan` and `Dokan Pro`, we recommend using the `change-case` utility methods from the `Dokan utilities package`. These utilities are accessible through the `@dokan/utilities` package.

## Why Use Change Case from Dokan Utilities?

We strongly `discourage` adding the `change-case` package directly to your projects for several reasons:

**Compatibility:** The latest versions of change-case (`v5+`) are not compatible with `WordPress`. In `Dokan utilities`, we maintain a compatible version that works seamlessly with `WordPress`.

**Consistency:** Using the `utilities` from `@dokan/utilities` ensures consistent string transformations across the entire `Dokan ecosystem`.

**Maintenance:** We handle version compatibility and updates, reducing the maintenance burden on external end.

### Available Case Transformations
The following case transformation utilities are available:

**camelCase:** Transforms **foo-bar** → **fooBar**  
**capitalCase:** Transforms **foo-bar** → **Foo Bar**  
**constantCase:** Transforms **foo-bar** → **FOO_BAR**  
**dotCase:** Transforms **foo-bar** → **foo.bar**  
**headerCase:** Transforms **foo-bar** → **Foo-Bar**  
**noCase:** Transforms **foo-bar** → **foo-bar**  
**kebabCase:** Transforms **fooBar** → **foo-bar** (alias for paramCase)  
**pascalCase:** Transforms **foo-bar** → **FooBar**  
**pathCase:** Transforms **foo-bar** → **foo/bar**  
**sentenceCase:** Transforms **foo-bar** → **Foo bar**  
**snakeCase:** Transforms **foo-bar** → **foo_bar**  

## Utilities Access

For `Dokan free & premium version`, we can import the `utilities` via `@dokan/utilities`:

```js
import { snakeCase, camelCase, kebabCase } from '@dokan/utilities';
```

For external `plugins`, we must include the `dokan-utilities` or `dokan-react-components` as scripts dependency and the `@dokan/utilities` should be introduced as an external resource configuration to resolve the path via `webpack`:

```js
externals: {
    '@dokan/utilities': 'dokan.utilities',
    ...
},
```

## Usage Example

```js
import { snakeCase, camelCase, kebabCase } from '@dokan/utilities';

// Examples
snakeCase( 'fooBar' );     // → "foo_bar"
camelCase( 'foo-bar' );    // → "fooBar"
kebabCase( 'fooBar' );     // → "foo-bar"
...
```

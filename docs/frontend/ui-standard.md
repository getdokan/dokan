# Dokan UI Standard Guide

- [Introduction](#introduction)
- [Color Standards](#color-standards)
- [Button Standards](#button-ui-standards)
- [Table Standards](#dashboard-table-standards)
- [Modal Standards](#modal-button-standards)
- [Icon Standards](#icon-standards)
- [Vendor Settings Standards](#vendor-settings-standards)
- [Date/Time Info Standards](#wordpress-datetime-settings-compatibility)
- [Currency Input Standards](#currency-input-standards)
- [Template Override Support](#template-override-support)

## Introduction

The `Dashboard` serves as the main entry point for vendors in the `Dokan` ecosystem. It follows a clean, structured layout that provides quick access to essential information and features.

## Color Standards

All Dokan frontend components including `buttons`, `links`, `alerts`, `warnings`, and `action text` must be compatible with the `Dokan color customizer module` to maintain consistency and respect user customization preferences.

#### Color System Implementation

`Dokan` uses `CSS variables` to ensure all components respond to `color customizer module settings`:

```css
/* Primary Colors */
--dokan-button-background-color: #7047EB;
--dokan-button-text-color: #ffffff;
--dokan-button-hover-background-color: #502BBF;

/* Status Colors */
--dokan-info-background-color: #E9F9FF;
--dokan-info-text-color: #0B76B7;
--dokan-success-background-color: #DAF8E6;
--dokan-success-text-color: #004434;
--dokan-warning-background-color: #FFFBEB;
--dokan-warning-text-color: #9D5425;
--dokan-danger-background-color: #FEF3F3;
--dokan-danger-text-color: #BC1C21;
```

**For details:** [Dokan color guidelines](https://github.com/getdokan/dokan/blob/develop/docs/frontend/color-guidelines.md#dokan-color-guidelines)

## Button UI Standards

All buttons in `Dokan` should use the `DokanButton` component from `@dokan/components` to ensure consistency across the interface.

### Available Button Variants

```jsx
import { DokanButton } from '@dokan/components';

// Action Variants
<DokanButton>Primary Button</DokanButton>                   // Default
<DokanButton variant="secondary">Secondary Button</DokanButton>
<DokanButton variant="tertiary">Tertiary Button</DokanButton>

// Status Variants
<DokanButton variant="info">Info Button</DokanButton>
<DokanButton variant="success">Success Button</DokanButton>
<DokanButton variant="warning">Warning Button</DokanButton>
<DokanButton variant="danger">Danger Button</DokanButton>
```

**For details:** [Dokan button component usage](https://github.com/getdokan/dokan/blob/develop/docs/frontend/components.md#button-component)

### Back Button Navigation Standards

Dokan follow a standardized pattern to ensure consistent `Back` button UI across all vendor dashboard views.

When registering a `route`, include the `backUrl` property to specify where the `Back` button should navigate.

**For details:** [Dokan back button standard](https://github.com/getdokan/dokan/blob/develop/docs/frontend/back-button.md#back-button-navigation-documentation)

## Dashboard Table Standards

Dokan dashboard uses the `DataViews` component for all tabular data displays to ensure consistency and provide a unified user experience.

Dokan vendors all dashboard tables should be implemented using the `DataViews` component from `@dokan/components`.

**For details:** [Dokan DataView table documentation](https://github.com/getdokan/dokan/blob/develop/docs/frontend/dataviews.md#dokan-dataview-table-documentation)

#### Table Actions Standard

Table row actions should be displayed as `text` links format instead of `icon`.

#### Delete Confirmation Modal

All destructive actions `(like Delete)` must include a `Confirmation Modal`.

## Dokan Modal Standards

The `DokanModal` component provides a standardized approach to modal dialogs across the `Dokan dashboard`, ensuring consistency in user interactions and visual presentation.

All modals in `Dokan` should use the `DokanModal` component from `@dokan/components`.

#### Modal Button Standards:
- Modal buttons must follow left alignment.
- `Cancel` button should be `secondary`.
- `Action` button should be `primary` (as per feature requirements).

**For details:** [DokanModal component documentation](https://github.com/getdokan/dokan/blob/develop/docs/frontend/dokan-modal.md#dokanmodal-component)

## Icon Standards

All icons in the Dokan vendor dashboard re-engineering must be implemented using the `lucide-react` library to ensure consistency and maintainability across the interface.

**Library Link:** [lucide-react](https://lucide.dev/guide/packages/lucide-react)

```jsx
import { Edit, Trash, Plus, ChevronRight, ArrowLeft } from 'lucide-react';

const MyComponent = () => {
    return (
        <div>
            <Edit size={ 24 } className="text-gray-600" />
            <Trash size={ 24 } className="text-danger" />
            <Plus size={ 24 } className="text-primary" />
        </div>
    );
};
```

## Vendor Settings Standards

#### Visit Store Icon

All vendor settings pages with `Visit Store` functionality must use the `ExternalLink` icon from the `lucide-react` library to maintain consistency across the dashboard.

For handling `Visit Store` implementation we can use `VisitStore` components from `@dokan/components`.
We can check the updated re-engineering pages. `e.g: Shipping, Store SEO`

## WordPress Date/Time Settings Compatibility

All `date` and `time` displays in `Dokan` features must be compatible with `WordPress admin settings` to ensure consistency across the platform and respect user preferences.

`Dokan` vendor dashboard must respect the following `WordPress` settings:

- **Date Format:** WP Settings > General > Date Format
- **Time Format:** WP Settings > General > Time Format
- **Week Starts On:** WP Settings > General > Week Starts On

### DateTime Component Usage Example

```jsx
import { DateTimeHtml } from '@dokan/components';

const MyComponent = () => {
    return (
        <div>
            {/* Display the formated date time only */}
            <DateTimeHtml
                date='2024-03-20 14:30:00'
            />

            {/* Your rest of the implementation goes here */}
        </div>
    );
};
```

**Follow:** [DateTimeHtml component](https://github.com/getdokan/dokan/blob/develop/src/components/DateTimeHtml.tsx)

## Currency Input Standards

All currency inputs in Dokan must use the `DokanPriceInput` component to ensure proper formatting and consistency with `WooCommerce currency settings`.

The `DokanPriceInput` component automatically applies currency formatting based on `WooCommerce settings`. We can use this components from `@dokan/components`.

### Currency Input Usage Example

```jsx
import { __, sprintf } from '@wordpress/i18n';
import { DokanPriceInput } from '@dokan/components';

const MyComponent = () => {
    const [ price, setPrice ] = useState( 0 );

    return (
        <div>
            {/* Basic price input */}
            <DokanPriceInput
                value={ price }
                namespace='product-pricing'
                label={ __( 'Product Price', 'dokan-lite' ) }
                onChange={ ( e ) => setPrice( e.target.value ) }
            />

            {/* Price input with custom styling */}
            <DokanPriceInput
                value={ price }
                className='max-w-16'
                namespace='shipping-cost'
                label={ __( 'Shipping Cost', 'dokan-lite' ) }
                onChange={ ( e ) => setPrice( e.target.value ) }
                input={ {
                    min: 0,
                    step: 1,
                    placeholder: __( 'Enter amount', 'dokan-lite' )
                } }
            />

            {/* Price input with validation */}
            <DokanPriceInput
                required
                value={ price }
                namespace='offer-price'
                label={ __( 'Offer Price', 'dokan-lite' ) }
                onChange={ ( e ) => setPrice( e.target.value ) }
                error={ __( 'Please enter a valid price', 'dokan-lite' ) }
            />
        </div>
    );
};
```

**For more information visit:** [DokanPriceInput component documentation](https://github.com/getdokan/dokan/blob/develop/docs/frontend/components.md#dokanpriceinput-component)

## Template Override Support

Dokan vendor dashbaord supports `template overrides` from `themes` and `external plugins` to ensure `backward compatibility` while migrating features to React frontend. Before implementing any React-based vendor dashboard page we must add template override support from `dokan` or `dokan-pro`.

**For details:** [Dokan React & PHP override information](https://github.com/getdokan/dokan/blob/develop/docs/feature-override/readme.md#how-to-define-a-menu-is-available-in-react-and-its-php-override-information)

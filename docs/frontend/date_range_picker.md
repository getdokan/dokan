# Date range picker
This is a lightweight wrapper around WooCommerce's DateRange component.
You can explore the WooCommerce DateRange storybook and related components here: https://woocommerce.github.io/woocommerce/?path=/docs/woocommerce-admin-components-calendar-daterange--docs

You can also explore the WooCommerce components source here: https://github.com/woocommerce/woocommerce/tree/trunk/packages/js/components/src/calendar

In Dokan, the date range picker component is named `WcDateRangePicker`.

WcDateRangePicker renders its children as the clickable trigger. When you click the child element, a Popover opens containing the WooCommerce DateRange. All props supported by DateRange are passed through via props spread.

Additional convenience props provided by WcDateRangePicker:
- wrapperClassName: class applied to the outer wrapper div
- pickerToggleClassName: class applied to the clickable trigger wrapper (around children)
- wpPopoverClassName: class merged into the WordPress Popover container
- popoverBodyClassName: class applied to the content container inside the popover
- onClear: callback fired when the Clear button is clicked
- onOk: callback fired when the Ok button is clicked

### Usage example
```jsx
import WcDateRangePicker from '../../../../src/components/WcDateRangePicker';
import { useState } from '@wordpress/element';

function SimpleDateRange() {
    const [ after, setAfter ] = useState( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState( 'startDate' );

    return (
        <div>
            <WcDateRangePicker
                after={ after }
                afterText={ afterText }
                before={ before }
                beforeText={ beforeText }
                onUpdate={ ( update ) => {
                    if ( update.after ) {
                        setAfter( update.after );
                    }

                    if ( update.afterText ) {
                        setAfterText( update.afterText );
                    }

                    if ( update.before ) {
                        setBefore( update.before );
                    }

                    if ( update.beforeText ) {
                        setBeforeText( update.beforeText );
                    }

                    if ( update.focusedInput ) {
                        setFocusInput( update.focusedInput );

                        if ( update.focusedInput === 'endDate' && after ) {
                            setBefore( '' );
                            setBeforeText( '' );
                        }
                    }
                } }
                shortDateFormat="MM/DD/YYYY"
                focusedInput={ focusInput }
                isInvalidDate={ () => false }
                wrapperClassName="w-full"
                pickerToggleClassName="block"
                wpPopoverClassName="dokan-layout"
                popoverBodyClassName="p-4 w-auto text-sm/6"
                onClear={ () => {
                    setAfter( '' );
                    setAfterText( '' );
                    setBefore( '' );
                    setBeforeText( '' );
                } }
                onOk={ () => {
                    // Handle apply action here if you need to
                } }
            >
                <input
                    type="text"
                    value={ `${ after } - ${ before }` }
                    className="border rounded px-3 py-1.5 w-full"
                    onChange={ () => {} }
                    placeholder="Select date range"
                    readOnly
                />
            </WcDateRangePicker>
        </div>
    );
}

export default SimpleDateRange;
```

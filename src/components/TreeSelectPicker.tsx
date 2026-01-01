/**
 * External dependencies
 */
import { useEffect, useState } from '@wordpress/element';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { TreeSelectControl } from '@woocommerce/components';
import { __ } from '@wordpress/i18n';

// Ref: https://github.com/woocommerce/woocommerce/blob/trunk/packages/js/components/src/tree-select-control/README.md
// Ref: https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/client/admin/client/wp-admin-scripts/shipping-settings-region-picker/region-picker.js

type Option = {
    label: string;
    value: string;
    children?: Option[];
};

type TreeSelectPickerProps = {
    options: Option[];
    initialValues: string[];
    multiple?: boolean;
    onChange: ( value: any ) => void;
    placeholder?: string;
};

export const TreeSelectPicker = ( {
    options,
    initialValues,
    multiple = false,
    onChange: onChangeProp,
    placeholder = __( 'Select product categories', 'dokan' ),
}: TreeSelectPickerProps ) => {
    const [ selected, setSelected ] = useState( initialValues );

    useEffect( () => {
        document.body.dispatchEvent(
            new CustomEvent( 'dokan_product_category_picker_ready' )
        );
    }, [] );

    const onChange = ( value: any ) => {
        if ( multiple ) {
            setSelected( value );
            onChangeProp( value );
            return;
        }
        const lastValue = [ value.pop() ];
        document.body.dispatchEvent(
            new CustomEvent( 'dokan_product_category_picker_update', {
                detail: lastValue,
            } )
        );

        setSelected( lastValue );
        onChangeProp( lastValue );
    };

    return (
        <>
            <TreeSelectControl
                value={ selected }
                onChange={ onChange }
                options={ options }
                placeholder={ placeholder }
                selectAllLabel={ false }
                individuallySelectParent
                maxVisibleTags={ 5 }
                multiple={ multiple }
            />

            <input type="hidden" name="product_cat" value={ selected } />
        </>
    );
};

export default TreeSelectPicker;

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import { MaskedInput } from '@getdokan/dokan-ui';
import type { MaskedInputProps } from '@getdokan/dokan-ui/dist/components/MaskedInput';
import type { SimpleInputProps } from '@getdokan/dokan-ui/dist/components/SimpleInput';

import { kebabCase, snakeCase, unformatNumber } from '@dokan/utilities';

interface DokanPriceInputProps extends Omit< SimpleInputProps, 'onChange' > {
    namespace: string;
    onChange: ( formatedValue: string, unformattedValue: number ) => void;
    maskRule?: MaskedInputProps[ 'maskRule' ];
}

export const DokanPriceInput = ( props: DokanPriceInputProps ) => {
    if ( ! props.namespace ) {
        throw new Error(
            'Namespace is required for the DokanMaskedInput component'
        );
    }

    const currencySymbol = window?.dokanFrontend?.currency?.symbol ?? '';

    const InputProps: DokanPriceInputProps = {
        label: __( 'Amount', 'dokan-lite' ),
        className: 'focus:border-none',
        addOnLeft: currencySymbol,
        maskRule: {
            numeral: true,
            numeralDecimalMark: window?.dokanFrontend?.currency?.decimal ?? '.',
            delimiter: window?.dokanFrontend?.currency?.thousand ?? ',',
            numeralDecimalScale:
                window?.dokanFrontend?.currency?.precision ?? 2,
            ...props.maskRule,
        },
        input: {
            id: 'amount',
            name: 'amount',
            type: 'text',
            placeholder: __( 'Enter amount', 'dokan-lite' ),
            required: true,
            disabled: false,
            ...props.input,
        },
        ...props,
    };

    // Apply filter for mask input props.
    const snakeCaseNamespace = snakeCase( props.namespace );
    const filteredProps = applyFilters(
        `dokan_${ snakeCaseNamespace }_price_input_props`,
        InputProps,
        currencySymbol
    ) as unknown as DokanPriceInputProps;

    // Price field id.
    const maskInputNameSpace = kebabCase( props.namespace );

    return (
        <div
            id={ `dokan-${ maskInputNameSpace }-price-input` }
            className={ `dokan-price-input` }
        >
            <MaskedInput
                { ...filteredProps }
                onChange={ ( e: any ) => {
                    const formattedValue = e.target.value;
                    const unformattedValue = unformatNumber( formattedValue );

                    filteredProps.onChange( formattedValue, unformattedValue );
                } }
            />
        </div>
    );
};

export default DokanPriceInput;

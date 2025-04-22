import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import { MaskedInput } from '@getdokan/dokan-ui';
import type { MaskedInputProps } from '@getdokan/dokan-ui/dist/components/MaskedInput';

import { kebabCase, snakeCase } from '@dokan/utilities';

type DokanMaskInputProps = MaskedInputProps & { namespace: string };

const currencySymbol = window?.dokanFrontend?.currency?.symbol ?? '';

export const DokanMaskedInput = ( props: DokanMaskInputProps ) => {
    if ( ! props.namespace ) {
        throw new Error(
            'Namespace is required for the DokanMaskedInput component'
        );
    }

    const InputProps: DokanMaskInputProps = {
        label: __( 'Amount', 'dokan-lite' ),
        className: 'focus:border-none',
        addOnLeft: currencySymbol,
        value: '',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange: ( e: any ) => {},
        maskRule: {
            numeral: true,
            numeralDecimalMark: window?.dokanFrontend?.currency?.decimal ?? '.',
            delimiter: window?.dokanFrontend?.currency?.thousand ?? ',',
            numeralDecimalScale:
                window?.dokanFrontend?.currency?.precision ?? 2,
        },
        input: {
            id: 'amount',
            name: 'amount',
            type: 'text',
            placeholder: __( 'Enter amount', 'dokan' ),
            required: true,
            disabled: false,
        },
        ...props,
    };

    console.log('InputProps', InputProps);

    // apply filter for mask input props.
    const snakeCaseNamespace = snakeCase( props.namespace );
    const filteredProps = applyFilters(
        `dokan_${ snakeCaseNamespace }_mask_input_props`,
        InputProps,
        currencySymbol
    ) as unknown as DokanMaskInputProps;

    // field id.
    const maskInputNameSpace = kebabCase( props.namespace );

    return <MaskedInput id={ maskInputNameSpace } { ...filteredProps } />;
};

export default DokanMaskedInput;

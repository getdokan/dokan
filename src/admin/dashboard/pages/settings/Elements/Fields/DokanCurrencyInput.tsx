import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { MaskedInput } from '@getdokan/dokan-ui';
import type { MaskedInputProps } from '@getdokan/dokan-ui/dist/components/MaskedInput';
import type { SimpleInputProps } from '@getdokan/dokan-ui/dist/components/SimpleInput';
import { kebabCase, snakeCase } from '../../../../../../utilities';

interface DokanCurrencyInputProps extends Omit< SimpleInputProps, 'onChange' > {
    namespace: string;
    onChange: ( formattedValue: string, unformattedValue: number ) => void;
    maskRule?: MaskedInputProps[ 'maskRule' ];
    value?: string;
}

export const formatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.dokanWithdrawDashboard?.currency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.dokanWithdrawDashboard?.currency.precision,
        window?.dokanWithdrawDashboard?.currency.thousand,
        window?.dokanWithdrawDashboard?.currency.decimal
    );
};

const unformatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.dokanWithdrawDashboard?.currency ) {
        console.warn( 'Dokan Currency Data Not Found' );
        return value;
    }

    return window.accounting.unformat(
        value,
        window?.dokanWithdrawDashboard?.currency.decimal
    );
};
export const DokanCurrencyInput = ( props: DokanCurrencyInputProps ) => {
    if ( ! props.namespace ) {
        throw new Error(
            'Namespace is required for the DokanCurrencyInput component'
        );
    }

    const currencySymbol =
        window?.dokanWithdrawDashboard?.currency?.symbol ?? '';

    const InputProps: DokanCurrencyInputProps = {
        label: __( 'Currency', 'dokan-lite' ),
        maskRule: {
            numeral: true,
            numeralDecimalMark:
                window?.dokanWithdrawDashboard?.currency?.decimal ?? '.',
            delimiter:
                window?.dokanWithdrawDashboard?.currency?.thousand ?? ',',
            numeralDecimalScale:
                window?.dokanWithdrawDashboard?.currency?.precision ?? 2,
            ...props.maskRule,
        },
        input: {
            id: props.input?.id || 'currency',
            name: props.input?.name || 'currency',
            type: 'text',
            placeholder: __( 'Enter currency amount', 'dokan-lite' ),
            required: true,
            disabled: false,
            ...props.input,
        },
        ...props,
    };

    const position =
        window?.dokanWithdrawDashboard?.currency?.position ?? 'left';
    switch ( position ) {
        case 'left':
        case 'left_space':
            InputProps.addOnLeft = currencySymbol;

            break;
        case 'right':
        case 'right_space':
            InputProps.addOnRight = currencySymbol;
            break;
        default:
            break;
    }

    // Apply filter for mask input props.
    const snakeCaseNamespace = snakeCase( props.namespace );
    const filteredProps = applyFilters(
        `dokan_${ snakeCaseNamespace }_currency_input_props`,
        InputProps,
        currencySymbol
    ) as unknown as DokanCurrencyInputProps;

    // Currency field id.
    const maskInputNameSpace = kebabCase( props.namespace );

    return (
        <div
            id={ `dokan-${ maskInputNameSpace }-currency-input` }
            className={ `dokan-currency-input` }
        >
            <MaskedInput
                errors={ filteredProps.errors }
                className={ `dokan-currency-input__input ${ filteredProps.className }` }
                label={ filteredProps.label }
                maskRule={ filteredProps.maskRule }
                addOnLeft={ filteredProps.addOnLeft }
                addOnRight={ filteredProps.addOnRight }
                value={ formatNumber( props.value ) }
                onChange={ ( e: any ) => {
                    const formattedValue = e.target.value;
                    const unformattedValue = unformatNumber( formattedValue );

                    filteredProps.onChange( formattedValue, unformattedValue );
                } }
            />
        </div>
    );
};

export default DokanCurrencyInput;

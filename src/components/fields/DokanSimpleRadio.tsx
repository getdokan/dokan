import { SimpleRadio } from '@getdokan/dokan-ui';

export interface DokanSimpleRadioProps {
    name: string;
    label?: string;
    helpText?: string;
    options: Array< {
        value: string | number;
        label: string;
    } >;
    defaultValue?: string | number;
    value?: string | number;
    errors?: string[];
    input?: {
        [ key: string ]: any;
    };
    optionClass?: string;
    selectedOptionClass?: string;
    onChange?: ChangeEventHandler< HTMLInputElement >;
    onBlur?: FocusEventHandler< HTMLInputElement >;
}

const DokanSimpleRadio = ( props: DokanSimpleRadioProps ) => {
    return <SimpleRadio { ...props } />;
};

export default DokanSimpleRadio;

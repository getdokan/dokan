export interface RadioOption {
    value: string | number;
    title: string;
    description?: string;
    icon?: JSX.Element;
    image?: string;
    preview?: JSX.Element;
}

export interface CustomizeRadioProps {
    options: RadioOption[];
    selectedValue: string | number;
    onChange: ( value: string | number ) => void;
    radio_variant?: 'simple' | 'card' | 'template' | 'radio_box';
    name?: string;
    className?: string;
    disabled?: boolean;
    radioVariant?: 'simple' | 'card' | 'template' | 'radio_box';
}

export interface RadioOptionProps {
    option: RadioOption;
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
    name?: string;
}

export interface RadioButtonProps {
    checked: boolean;
    disabled?: boolean;
}

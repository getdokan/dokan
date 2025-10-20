import { AsyncSearchableSelect, ReactSelect } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

// Local utility to extract props type of a component without relying on React/WordPress types
type PropsOf< T > = T extends ( props: infer P ) => any ? P : never;

export type DefaultOption = {
    value: string | number;
    label: string;
    [ key: string ]: unknown;
};

export interface BaseSelectProps< Option = DefaultOption >
    extends Omit<
        PropsOf< typeof AsyncSearchableSelect< Option > >,
        'components'
    > {
    /**
     * Icon element to render inside the control.
     */
    icon?: React.ReactNode;
    /**
     * Position of the icon within the control. Defaults to 'left'.
     */
    iconPosition?: 'left' | 'right';
    components?: PropsOf<
        typeof AsyncSearchableSelect< Option >
    >[ 'components' ];
}

function AsyncSelect< Option = DefaultOption >(
    props: BaseSelectProps< Option >
) {
    const Control = ( controlProps: any ) => {
        const { children, selectProps } = controlProps as {
            children: React.ReactNode;
            selectProps: {
                icon?: React.ReactNode;
                iconPosition?: 'left' | 'right';
            };
        };
        const { components } = ReactSelect;

        const icon = selectProps.icon;
        const iconPosition = selectProps.iconPosition ?? 'left';

        return (
            <components.Control { ...controlProps }>
                { icon && iconPosition === 'left' ? (
                    <span className="!flex !items-center !ml-[15px]">
                        { icon }
                    </span>
                ) : null }
                <div
                    className={ twMerge(
                        'flex flex-1',
                        icon && iconPosition === 'left' ? 'ml-1.5' : 'ml-0',
                        icon && iconPosition === 'right' ? 'mr-1.5' : 'mr-0'
                    ) }
                >
                    { children }
                </div>
                { icon && iconPosition === 'right' ? (
                    <span className="!flex !items-center !mr-[15px]">
                        { icon }
                    </span>
                ) : null }
            </components.Control>
        );
    };
    const DropdownIndicator = ( props: any ) => {
        const { components } = ReactSelect;

        return (
            <components.DropdownIndicator { ...props }>
                <div className="text-gray-400">
                    <ChevronDown size={ 16 } />
                </div>
            </components.DropdownIndicator>
        );
    };

    const styles = {
        control: ( base: any ) => ( {
            ...base,
            borderRadius: '0.40rem',
            minHeight: '2.5rem',
            boxShadow: 'none',
            marginTop: -1,
            outline: 'none',
            ':focus': { outline: 'none' },
            ':focus-within': { outline: 'none' },
            borderColor: base.borderColor,
        } ),
        placeholder: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        singleValue: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        input: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
            marginTop: 1,
            marginBottom: 1,
        } ),
        valueContainer: ( base: any ) => ( { ...base, paddingLeft: 4 } ),
        indicatorsContainer: ( base: any ) => ( {
            ...base,
            cursor: 'pointer',
        } ),
        menuList: ( base: any ) => ( {
            ...base,
            cursor: 'default',
        } ),
        option: ( base: any, state: any ) => {
            return {
                ...base,
                cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            };
        },
    } as const;

    return (
        <AsyncSearchableSelect
            // @ts-ignore
            components={ {
                Control,
                DropdownIndicator,
                // @ts-ignore
                ...( props?.components ? props.components : {} ),
            } }
            styles={ styles }
            className="shadow-none"
            classNamePrefix={ props.classNamePrefix ?? 'react-select' }
            blurInputOnSelect={ props.blurInputOnSelect ?? true }
            closeMenuOnSelect={ props.closeMenuOnSelect ?? true }
            hideSelectedOptions={ props.hideSelectedOptions ?? false }
            { ...props }
        />
    );
}

export default AsyncSelect;

import { AsyncSearchableSelect, ReactSelect } from '@getdokan/dokan-ui';
import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type DefaultOption = {
    value: string | number;
    label: string;
    [ key: string ]: unknown;
};

export interface BaseSelectProps< Option = DefaultOption >
    extends Omit<
        ComponentProps< typeof AsyncSearchableSelect< Option > >,
        'components'
    > {
    leftIcon?: React.ReactNode;
    components?: ComponentProps<
        typeof AsyncSearchableSelect< Option >
    >[ 'components' ];
}

function AsyncSelect< Option = DefaultOption >(
    props: BaseSelectProps< Option >
) {
    const Control = ( controlProps: any ) => {
        const { children, selectProps } = controlProps as {
            children: React.ReactNode;
            selectProps: { leftIcon?: React.ReactNode };
        };
        const { components } = ReactSelect;
        return (
            <components.Control { ...controlProps }>
                { selectProps.leftIcon ? (
                    <span className="!flex !items-center !ml-[15px]">
                        { selectProps.leftIcon }
                    </span>
                ) : null }
                <div
                    className={ twMerge(
                        'flex flex-1',
                        selectProps.leftIcon ? 'ml-1.5' : 'ml-0'
                    ) }
                >
                    { children }
                </div>
            </components.Control>
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

import { SearchableSelect, ReactSelect } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

// Local utility to extract props type of a component without relying on React/WordPress types
type PropsOf< T > = T extends ( props: infer P ) => any ? P : never;

export type DefaultOption = {
    value: string | number;
    label: string;
    [ key: string ]: unknown;
};

export interface SelectProps< Option = DefaultOption >
    extends Omit< PropsOf< typeof SearchableSelect< Option > >, 'components' > {
    leftIcon?: React.ReactNode;
    /**
     * When provided and the select is NOT multi, the selected value will be rendered
     * with this title as a prefix, e.g. "Vendor: Store 1".
     * You can also pass a function to compute the title from the selected option.
     */
    selectedTitle?: string | ( ( option: Option ) => string );
    components?: PropsOf< typeof SearchableSelect< Option > >[ 'components' ];
}

function Select< Option = DefaultOption >( props: SelectProps< Option > ) {
    // Default portal target for the dropdown menu so it isn't clipped by parent containers
    const defaultMenuPortalTarget =
        typeof document !== 'undefined' ? document.body : undefined;

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

    const DropdownIndicator = ( indicatorProps: any ) => {
        const { components } = ReactSelect;

        return (
            <components.DropdownIndicator { ...indicatorProps }>
                <div className="text-gray-400">
                    <ChevronDown size={ 16 } />
                </div>
            </components.DropdownIndicator>
        );
    };

    // Render a single-line summary for multi-select instead of chips
    const ValueContainer = ( valueProps: any ) => {
        const { components } = ReactSelect;
        const { selectProps, hasValue } = valueProps as any;
        const isMulti = Boolean( selectProps?.isMulti );
        if ( ! isMulti ) {
            return <components.ValueContainer { ...valueProps } />;
        }
        const values: any[] = ( selectProps?.getValue?.() as any[] ) || [];
        const labels = values.map( ( v ) => v?.label ?? v ).filter( Boolean );
        const titlePrefix = selectProps?.selectedTitle;
        const prefix =
            typeof titlePrefix === 'function' && labels.length
                ? titlePrefix( values[ 0 ] )
                : titlePrefix;
        const summary = labels.join( ', ' );
        return (
            <components.ValueContainer { ...valueProps }>
                { hasValue ? (
                    <div className="truncate text-[14px] leading-[22px] text-gray-700">
                        { prefix ? (
                            <span className="font-normal">
                                { String( prefix ) }:
                            </span>
                        ) : null }
                        <span
                            className="truncate align-middle"
                            title={ summary }
                        >
                            { summary }
                        </span>
                    </div>
                ) : null }
                { valueProps.children }
            </components.ValueContainer>
        );
    };

    // Hide chips when isMulti to match summary UI
    const MultiValue = ( multiProps: any ) => {
        const { components } = ReactSelect;
        const isMulti = Boolean( multiProps?.selectProps?.isMulti );
        if ( isMulti ) {
            return null;
        }
        return <components.MultiValue { ...multiProps } />;
    };

    // Checkbox-style options
    const Option = ( optionProps: any ) => {
        const { components } = ReactSelect;
        const { isSelected, isDisabled } = optionProps;
        return (
            <components.Option { ...optionProps }>
                <div className="flex items-center gap-2">
                    <span
                        className={
                            'inline-flex h-4 w-4 items-center justify-center rounded border ' +
                            ( isSelected
                                ? 'bg-purple-600 border-purple-600'
                                : 'bg-white border-gray-300' ) +
                            ( isDisabled ? ' opacity-50' : '' )
                        }
                    >
                        { isSelected ? (
                            <svg
                                viewBox="0 0 20 20"
                                className="h-3 w-3 text-white"
                            >
                                <path
                                    d="M7.629 13.233L4.4 10.004l1.2-1.2 2.029 2.03 6.17-6.17 1.2 1.2-7.37 7.37z"
                                    fill="currentColor"
                                />
                            </svg>
                        ) : null }
                    </span>
                    <span>{ optionProps.label }</span>
                </div>
            </components.Option>
        );
    };

    const SingleValue = ( singleValueProps: any ) => {
        const { components } = ReactSelect;
        const { selectProps, data } = singleValueProps as {
            selectProps: {
                selectedTitle?: string | ( ( option: Option ) => string );
                isMulti?: boolean;
            };
            data: Option & { label?: string };
        };

        const isMulti = Boolean( selectProps?.isMulti );
        const selectedTitle = selectProps?.selectedTitle;
        let content = singleValueProps.children as React.ReactNode;

        if ( ! isMulti && selectedTitle && data ) {
            const prefix =
                typeof selectedTitle === 'function'
                    ? selectedTitle( data as Option )
                    : selectedTitle;
            const label: any = ( data as any )?.label ?? content;
            content = (
                <span title={ `${ prefix }: ${ label }` }>
                    { prefix }: { label }
                </span>
            );
        }

        return (
            <components.SingleValue { ...singleValueProps }>
                { content }
            </components.SingleValue>
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
        container: ( base: any ) => ( { ...base, outline: 'none' } ),
        menuPortal: ( base: any ) => ( {
            ...base,
            zIndex: 9999,
            wordBreak: 'break-all',
            width: '18.75rem !important',
        } ),
        menu: ( base: any ) => ( {
            ...base,
            zIndex: 9999,
            wordBreak: 'break-all',
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
        <SearchableSelect
            // @ts-ignore
            components={ {
                Control,
                DropdownIndicator,
                SingleValue,
                ValueContainer,
                MultiValue,
                Option,
                ...( props?.components ? props.components : {} ),
            } }
            styles={ styles }
            className="shadow-none"
            classNamePrefix={ props.classNamePrefix ?? 'react-select' }
            blurInputOnSelect={ props.blurInputOnSelect ?? true }
            closeMenuOnSelect={ props.closeMenuOnSelect ?? true }
            hideSelectedOptions={ props.hideSelectedOptions ?? false }
            // Render menu in a portal to avoid clipping and position it correctly
            menuPortalTarget={
                props.menuPortalTarget ?? defaultMenuPortalTarget
            }
            { ...props }
        />
    );
}

export default Select;

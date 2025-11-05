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
    /**
     * When provided and the select is NOT multi, the selected value will be rendered
     * with this title as a prefix, e.g. "Vendor: Store 1".
     * You can also pass a function to compute the title from the selected option.
     */
    selectedTitle?: string | ( ( option: Option ) => string );
    components?: PropsOf<
        typeof AsyncSearchableSelect< Option >
    >[ 'components' ];
}

function AsyncSelect< Option = DefaultOption >(
    props: BaseSelectProps< Option >
) {
    // Default portal target for the dropdown menu so it isn't clipped by parent containers
    const defaultMenuPortalTarget =
        typeof document !== 'undefined' ? document.body : undefined;

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
        <AsyncSearchableSelect
            // @ts-ignore
            components={ {
                Control,
                DropdownIndicator,
                SingleValue,
                // @ts-ignore
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
            menuPosition={ props.menuPosition ?? 'fixed' }
            { ...props }
        />
    );
}

export default AsyncSelect;

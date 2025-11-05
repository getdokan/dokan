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
        container: ( base: any ) => ( { ...base, outline: 'none' } ),
        menuPortal: ( base: any ) => ( {
            ...base,
            zIndex: 9999,
            wordBreak: 'break-all',
            minWidth: '18.75rem !important',
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

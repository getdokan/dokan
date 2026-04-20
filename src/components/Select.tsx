import { SearchableSelect } from '@getdokan/dokan-ui';
import ValueContainer from "@src/components/select/ValueContainer";
import Option from "@src/components/select/Option";
import MultiValue from "@src/components/select/MultiValue";
import SingleValue from "@src/components/select/SingleValue";
import Control from "@src/components/select/Control";
import DropdownIndicator from "@src/components/select/DropdownIndicator";
import styles from "@src/components/select/styles";

// Local utility to extract props type of a component without relying on React/WordPress types
type PropsOf< T > = T extends ( props: infer P ) => any ? P : never;

export type DefaultOption = {
    value: string | number;
    label: string;
    [ key: string ]: unknown;
};

export interface SelectProps<
    Option = DefaultOption,
    IsMulti extends boolean = false,
> extends Omit<
        PropsOf< typeof SearchableSelect< Option, IsMulti > >,
        'components' | 'isMulti'
    > {
    isMulti?: IsMulti;
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
    components?:
        | PropsOf< typeof SearchableSelect< Option, IsMulti > >[ 'components' ]
        | Record< string, any >;
}

function Select< Option = DefaultOption, IsMulti extends boolean = false >(
    props: SelectProps< Option, IsMulti >
) {
    // Default portal target wrapped with 'dokan-layout' so Tailwind scoped styles apply
    const defaultMenuPortalTarget = (() => {
        if ( typeof document === 'undefined' ) {
            return undefined;
        }
        const id = 'dokan-select-menu-portal';
        let el = document.getElementById( id );
        if ( ! el ) {
            el = document.createElement( 'div' );
            el.id = id;
            el.className = 'dokan-layout';
            document.body.appendChild( el );
        }
        return el;
    })();

    return (
        <SearchableSelect
            // @ts-ignore
            components={ {
                Control,
                DropdownIndicator,
                SingleValue,
                ValueContainer,
                MultiValue: MultiValue as any,
                Option,
                ...( props?.components ? ( props.components as any ) : {} ),
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

export default Select;

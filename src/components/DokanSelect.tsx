import Select, { components, Props as RSProps, GroupBase } from 'react-select';

export type DokanSelectProps<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase< Option > = GroupBase< Option >,
> = RSProps< Option, IsMulti, Group > & {
    leftIcon?: React.ReactNode;
    hideIndicator?: boolean; // hide the right dropdown indicator entirely
    customIndicator?: React.ReactNode; // allow passing a custom indicator component
};

const purple = '#7C3AED';
const gray300 = '#E9E9E9';
const gray400 = '#828282';
const gray700 = '#374151';

const Control = ( props: any ) => {
    const { children, selectProps } = props;
    return (
        <components.Control { ...props }>
            { selectProps.leftIcon ? (
                <span
                    style={ {
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 8,
                        color: gray400,
                    } }
                >
                    { selectProps.leftIcon }
                </span>
            ) : null }
            <div
                style={ {
                    marginLeft: selectProps.leftIcon ? 6 : 0,
                    flex: 1,
                    display: 'flex',
                } }
            >
                { children }
            </div>
        </components.Control>
    );
};

export default function DokanSelect<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase< Option > = GroupBase< Option >,
>( props: DokanSelectProps< Option, IsMulti, Group > ) {
    const hideIndicator = Object.keys( props ).includes( 'hideIndicator' )
        ? props.hideIndicator
        : false;
    const isMulti = Object.keys( props ).includes( 'isMulti' )
        ? props.isMulti
        : false;
    const styles = {
        control: ( base: any, state: any ) => ( {
            ...base,
            borderRadius: '0.40rem',
            minHeight: '2.5rem',
            // height: '2.65rem',
            borderColor: gray300,
            boxShadow: 'none',
            outline: state.isFocused ? `2px solid ${ purple }` : 'none',
            '&:hover': { borderColor: gray300, cursor: 'text' },
            paddingLeft: props.leftIcon ? 4 : base.paddingLeft,
            marginTop: -1,
        } ),
        placeholder: ( base: any ) => ( {
            ...base,
            color: gray400,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        singleValue: ( base: any ) => ( {
            ...base,
            color: gray700,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        input: ( base: any ) => ( {
            ...base,
            color: gray700,
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
        indicatorSeparator: ( base: any ) => ( {
            ...base,
            display: isMulti || props.isClearable ? 'block' : 'none',
        } ),
        menu: ( base: any ) => ( {
            ...base,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            marginTop: 6,
            borderColor: gray300,
            borderWidth: 1,
        } ),
        menuList: ( base: any ) => ( {
            ...base,
            paddingTop: 8,
            paddingBottom: 8,
            cursor: 'default',
        } ),
        option: ( base: any, state: any ) => {
            let bg = 'transparent';
            if ( state.isSelected ) {
                bg = 'rgba(124,58,237,0.08)';
            } else if ( state.isFocused ) {
                bg = 'rgba(124,58,237,0.06)';
            }
            return {
                ...base,
                paddingTop: 10,
                paddingBottom: 10,
                color: state.isSelected ? purple : gray700,
                backgroundColor: bg,
                cursor: 'pointer',
                '&:active': { backgroundColor: 'rgba(124,58,237,0.12)' },
            };
        },
    } as const;

    // Compose components: optionally remove or replace IndicatorSeparator and DropdownIndicator
    // Start with our internal defaults; consumer components will be spread last to take precedence
    const composedComponents: any = { Control };
    if ( hideIndicator ) {
        composedComponents.IndicatorSeparator = () => null;
        composedComponents.DropdownIndicator = () => null;
    } else if ( props.customIndicator ) {
        composedComponents.DropdownIndicator = () => (
            <div
                style={ {
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: 8,
                } }
            >
                { props.customIndicator }
            </div>
        );
        // keep (but thin) separator for custom indicator case
        composedComponents.IndicatorSeparator = ( sepProps: any ) => (
            <components.IndicatorSeparator
                { ...sepProps }
                style={ {
                    ...sepProps.innerProps?.style,
                    width: 1,
                    backgroundColor: gray300,
                    cursor: 'pointer',
                } }
            />
        );
    } else {
        // default: make separator subtle like in screenshot
        composedComponents.IndicatorSeparator = ( sepProps: any ) => (
            <components.IndicatorSeparator
                { ...sepProps }
                style={ {
                    ...sepProps.innerProps?.style,
                    width: 1,
                    backgroundColor: gray300,
                    cursor: 'pointer',
                } }
            />
        );
    }

    return (
        <Select
            { ...( props as any ) }
            // Consumer styles take precedence over Dokan defaults
            styles={ { ...styles, ...( ( props.styles as any ) || {} ) } }
            // Consumer components take precedence; spread them last
            components={ {
                ...composedComponents,
                ...( ( props.components as any ) || {} ),
            } }
        />
    );
}
